import { useState, useEffect, useRef } from 'react'
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, doc, getDocs, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import './Admin.css'

export default function Admin() {
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [title, setTitle] = useState('')
  const [number, setNumber] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [drawings, setDrawings] = useState([])
  const [uploadMethod, setUploadMethod] = useState('url') // 'url' or 'file'

  // Bulk upload states
  const [isDragging, setIsDragging] = useState(false)
  const [uploadQueue, setUploadQueue] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  // Migration state
  const [isMigrating, setIsMigrating] = useState(false)
  const [migrationStatus, setMigrationStatus] = useState('')

  // Listen to all drawings (ordered by order for admin view)
  useEffect(() => {
    const drawingsQuery = query(
      collection(db, 'drawings'),
      orderBy('order', 'asc')
    )

    const unsubscribe = onSnapshot(drawingsQuery, (snapshot) => {
      const drawingsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().createdAt?.toMillis() || Date.now()
      }))
      setDrawings(drawingsList)
    })

    return () => unsubscribe()
  }, [])

  // Compress and resize image to max 800px width
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        const img = new Image()

        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          // Calculate new dimensions (max width 800px, maintain aspect ratio)
          let width = img.width
          let height = img.height
          const maxWidth = 800

          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }

          canvas.width = width
          canvas.height = height

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height)

          // Convert to base64 with quality compression
          const base64 = canvas.toDataURL('image/jpeg', 0.85)
          resolve(base64)
        }

        img.onerror = reject
        img.src = e.target.result
      }

      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Get next auto-generated title and order
  const getNextTitle = async () => {
    try {
      // Get highest order number
      const drawingsQuery = query(
        collection(db, 'drawings'),
        orderBy('order', 'desc')
      )
      const snapshot = await getDocs(drawingsQuery)

      let nextOrder = 1
      if (!snapshot.empty) {
        const highestOrder = snapshot.docs[0].data().order || 0
        nextOrder = highestOrder + 1
      }

      return {
        title: `Sam's Art #${nextOrder}`,
        number: `#${nextOrder}`,
        order: nextOrder
      }
    } catch (error) {
      console.error('Error getting next order:', error)
      // If orderBy fails (no index yet), fall back to counting
      const drawingsQuery = query(collection(db, 'drawings'))
      const snapshot = await getDocs(drawingsQuery)
      const count = snapshot.size + 1
      return {
        title: `Sam's Art #${count}`,
        number: `#${count}`,
        order: count
      }
    }
  }

  // Process and upload multiple files
  const processFiles = async (files) => {
    setIsUploading(true)
    const fileArray = Array.from(files)

    // Initialize upload queue with pending status
    const initialQueue = fileArray.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      name: file.name,
      status: 'pending', // pending, processing, success, error
      progress: 0,
      error: null
    }))
    setUploadQueue(initialQueue)

    // Process each file
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i]
      const queueId = initialQueue[i].id

      try {
        // Update status to processing
        setUploadQueue(prev => prev.map(item =>
          item.id === queueId ? { ...item, status: 'processing', progress: 25 } : item
        ))

        // Compress image
        const compressedBase64 = await compressImage(file)

        setUploadQueue(prev => prev.map(item =>
          item.id === queueId ? { ...item, progress: 50 } : item
        ))

        // Get auto-generated title and order
        const { title: autoTitle, number: autoNumber, order: autoOrder } = await getNextTitle()

        setUploadQueue(prev => prev.map(item =>
          item.id === queueId ? { ...item, progress: 75 } : item
        ))

        // Upload to Firestore
        await addDoc(collection(db, 'drawings'), {
          imageUrl: compressedBase64,
          title: autoTitle,
          number: autoNumber,
          order: autoOrder,
          revealed: false,
          createdAt: serverTimestamp()
        })

        // Mark as success
        setUploadQueue(prev => prev.map(item =>
          item.id === queueId ? { ...item, status: 'success', progress: 100 } : item
        ))

      } catch (error) {
        console.error('Error uploading file:', error)
        setUploadQueue(prev => prev.map(item =>
          item.id === queueId
            ? { ...item, status: 'error', progress: 0, error: error.message }
            : item
        ))
      }
    }

    setIsUploading(false)

    // Clear queue after 3 seconds
    setTimeout(() => {
      setUploadQueue([])
    }, 3000)
  }

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    )

    if (files.length > 0) {
      processFiles(files)
    }
  }

  // File input handler
  const handleBulkFileSelect = (e) => {
    const files = Array.from(e.target.files).filter(file =>
      file.type.startsWith('image/')
    )

    if (files.length > 0) {
      processFiles(files)
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Convert file to base64
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setMessage({ text: 'Please select an image file', type: 'error' })
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setImageFile(reader.result)
      setImageUrl('') // Clear URL input
      setMessage({ text: '', type: '' })
    }
    reader.onerror = () => {
      setMessage({ text: 'Error reading file', type: 'error' })
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const finalImageUrl = uploadMethod === 'file' ? imageFile : imageUrl
    if (!finalImageUrl?.trim() || !title.trim()) {
      setMessage({ text: 'Please fill in all required fields', type: 'error' })
      return
    }

    setIsSubmitting(true)
    setMessage({ text: '', type: '' })

    try {
      // Parse order from number field if provided
      let orderValue = null
      if (number.trim()) {
        const match = number.trim().match(/\d+/)
        if (match) {
          orderValue = parseInt(match[0], 10)
        }
      }

      // If no order specified, get next available order
      if (orderValue === null) {
        const { order: autoOrder } = await getNextTitle()
        orderValue = autoOrder
      }

      await addDoc(collection(db, 'drawings'), {
        imageUrl: finalImageUrl.trim(),
        title: title.trim(),
        number: number.trim() || null,
        order: orderValue,
        revealed: false,
        createdAt: serverTimestamp()
      })

      setMessage({ text: 'Drawing uploaded successfully!', type: 'success' })
      setImageUrl('')
      setImageFile(null)
      setTitle('')
      setNumber('')

      // Reset file input
      const fileInput = document.getElementById('imageFile')
      if (fileInput) fileInput.value = ''
    } catch (error) {
      console.error('Error uploading drawing:', error)
      setMessage({ text: `Error: ${error.message}`, type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (drawingId) => {
    if (!confirm('Are you sure you want to delete this drawing?')) return

    try {
      await deleteDoc(doc(db, 'drawings', drawingId))
      setMessage({ text: 'Drawing deleted successfully', type: 'success' })
    } catch (error) {
      console.error('Error deleting drawing:', error)
      setMessage({ text: `Error deleting: ${error.message}`, type: 'error' })
    }
  }

  // Migration function to set order field on existing drawings
  const runMigration = async () => {
    if (!confirm('Run migration to set "order" field and "revealed" status on existing drawings?\n\nThis will:\n- Extract numbers from titles/numbers and set as "order" integer field\n- Set revealed status based on timer position\n- Order drawings numerically')) {
      return
    }

    setIsMigrating(true)
    setMigrationStatus('Starting migration...')

    try {
      // Get timer settings
      const timerDoc = await getDoc(doc(db, 'settings', 'timer'))
      const currentDrawingIndex = timerDoc.exists() ? timerDoc.data().currentDrawingIndex : 0

      setMigrationStatus(`Current drawing index: ${currentDrawingIndex}`)

      // Get all drawings
      const drawingsQuery = query(collection(db, 'drawings'))
      const snapshot = await getDocs(drawingsQuery)

      setMigrationStatus(`Found ${snapshot.size} drawings. Extracting order numbers...`)

      // Extract order from each drawing and sort
      const drawingsWithOrder = snapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data()
        let orderValue = data.order

        // If no order field, try to extract from number or title
        if (orderValue === undefined || orderValue === null) {
          // Try number field first
          if (data.number) {
            const match = data.number.match(/\d+/)
            if (match) {
              orderValue = parseInt(match[0], 10)
            }
          }
          // Try title if number didn't work
          if (orderValue === undefined && data.title) {
            const match = data.title.match(/\d+/)
            if (match) {
              orderValue = parseInt(match[0], 10)
            }
          }
          // Default to 0 if still no order found
          if (orderValue === undefined) {
            orderValue = 0
          }
        }

        return {
          id: docSnapshot.id,
          order: orderValue,
          currentRevealed: data.revealed
        }
      })

      // Sort by order
      drawingsWithOrder.sort((a, b) => a.order - b.order)

      setMigrationStatus(`Updating ${drawingsWithOrder.length} drawings...`)

      let updated = 0
      const updatePromises = drawingsWithOrder.map(async (drawing, index) => {
        const shouldBeRevealed = index <= currentDrawingIndex
        const needsUpdate =
          drawing.currentRevealed === undefined ||
          drawing.currentRevealed !== shouldBeRevealed ||
          drawing.order === 0

        if (needsUpdate) {
          await updateDoc(doc(db, 'drawings', drawing.id), {
            order: drawing.order,
            revealed: shouldBeRevealed
          })
          updated++
        }
      })

      await Promise.all(updatePromises)

      setMigrationStatus(`✓ Migration complete! Updated ${updated} drawings. Drawings are now ordered by number.`)
      setTimeout(() => {
        setMigrationStatus('')
        setIsMigrating(false)
      }, 5000)

    } catch (error) {
      console.error('Migration error:', error)
      setMigrationStatus(`✗ Error: ${error.message}`)
      setIsMigrating(false)
    }
  }

  const previewImage = uploadMethod === 'file' ? imageFile : imageUrl

  return (
    <div className="admin-page">
      <div className="admin-container">
        <h1 className="admin-title">Admin - Manage Drawings</h1>

        {/* Migration Section */}
        <div className="migration-section">
          <h2 className="section-subtitle">Database Migration</h2>
          <p className="migration-hint">
            Run this to set "order" field (integer) and "revealed" status on existing drawings. Extracts numbers from titles like "Sam's Art #7" and orders drawings numerically.
          </p>
          <button
            className="migration-button"
            onClick={runMigration}
            disabled={isMigrating}
          >
            {isMigrating ? 'Running Migration...' : 'Run Migration'}
          </button>
          {migrationStatus && (
            <p className={`migration-status ${migrationStatus.startsWith('✓') ? 'success' : migrationStatus.startsWith('✗') ? 'error' : ''}`}>
              {migrationStatus}
            </p>
          )}
        </div>

        {/* Bulk Upload Zone */}
        <div className="bulk-upload-section">
          <h2 className="section-subtitle">Bulk Upload</h2>
          <div
            className={`drop-zone ${isDragging ? 'dragging' : ''}`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="drop-zone-content">
              <svg className="drop-zone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <h3 className="drop-zone-title">Drag & Drop Images Here</h3>
              <p className="drop-zone-subtitle">Upload 10, 20, 50+ images at once</p>
              <p className="drop-zone-hint">Images auto-titled as "Sam's Art #1", "Sam's Art #2", etc.</p>

              <button
                type="button"
                className="select-files-button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                Or Select Files
              </button>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleBulkFileSelect}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Upload Progress */}
          {uploadQueue.length > 0 && (
            <div className="upload-progress-container">
              <h3 className="progress-title">
                Uploading {uploadQueue.filter(q => q.status === 'processing').length > 0 ? `(${uploadQueue.filter(q => q.status !== 'pending').length}/${uploadQueue.length})` : 'Complete!'}
              </h3>
              <div className="upload-queue">
                {uploadQueue.map((item) => (
                  <div key={item.id} className={`queue-item ${item.status}`}>
                    <div className="queue-item-info">
                      <span className="queue-item-name">{item.name}</span>
                      {item.status === 'success' && (
                        <span className="queue-status success">✓ Uploaded</span>
                      )}
                      {item.status === 'error' && (
                        <span className="queue-status error">✗ Failed: {item.error}</span>
                      )}
                      {item.status === 'processing' && (
                        <span className="queue-status processing">Processing...</span>
                      )}
                    </div>
                    {(item.status === 'processing' || item.status === 'pending') && (
                      <div className="progress-bar">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Single Upload Form (Secondary Option) */}
        <div className="single-upload-section">
          <h2 className="section-subtitle">Single Upload (Custom)</h2>
          <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Upload Method</label>
            <div className="upload-method-tabs">
              <button
                type="button"
                className={`method-tab ${uploadMethod === 'url' ? 'active' : ''}`}
                onClick={() => setUploadMethod('url')}
              >
                URL / Base64
              </button>
              <button
                type="button"
                className={`method-tab ${uploadMethod === 'file' ? 'active' : ''}`}
                onClick={() => setUploadMethod('file')}
              >
                Upload File
              </button>
            </div>
          </div>

          {uploadMethod === 'url' ? (
            <div className="form-group">
              <label htmlFor="imageUrl">Image URL or Base64 *</label>
              <input
                id="imageUrl"
                type="text"
                className="form-input"
                placeholder="https://... or data:image/png;base64,..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                required
              />
              <small className="form-hint">
                Paste an external URL or base64-encoded image data
              </small>
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="imageFile">Upload Image File *</label>
              <input
                id="imageFile"
                type="file"
                className="form-input-file"
                accept="image/*"
                onChange={handleFileChange}
                required
              />
              <small className="form-hint">
                Select an image file (will be converted to base64)
              </small>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              className="form-input"
              placeholder="e.g., Sam's Drawing"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="number">Number (optional)</label>
            <input
              id="number"
              type="text"
              className="form-input"
              placeholder="e.g., #42"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
            />
          </div>

          {message.text && (
            <div className={`form-message ${message.type}`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Uploading...' : 'Upload Drawing'}
          </button>
          </form>

          {previewImage && (
          <div className="preview-section">
            <h3 className="preview-title">Preview:</h3>
            <div className="preview-paper">
              <img
                src={previewImage}
                alt="Preview"
                className="preview-image"
                onError={(e) => {
                  e.target.style.display = 'none'
                  setMessage({ text: 'Invalid image', type: 'error' })
                }}
              />
            </div>
          </div>
          )}
        </div>

        {/* Drawings List */}
        <div className="drawings-list-section">
          <h2 className="section-title">All Drawings ({drawings.length})</h2>
          {drawings.length === 0 ? (
            <p className="no-drawings">No drawings uploaded yet.</p>
          ) : (
            <div className="drawings-grid">
              {drawings.map((drawing) => (
                <div key={drawing.id} className="drawing-card">
                  <div className="drawing-card-image">
                    <img src={drawing.imageUrl} alt={drawing.title} />
                  </div>
                  <div className="drawing-card-info">
                    <h4 className="drawing-card-title">{drawing.title}</h4>
                    {drawing.number && (
                      <p className="drawing-card-number">{drawing.number}</p>
                    )}
                    <p className="drawing-card-date">
                      {new Date(drawing.timestamp).toLocaleDateString()}
                    </p>
                    <span className={`reveal-badge ${drawing.revealed ? 'revealed' : 'unrevealed'}`}>
                      {drawing.revealed ? '● Revealed' : '○ Unrevealed'}
                    </span>
                  </div>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(drawing.id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
