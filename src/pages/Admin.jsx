import { useState, useEffect } from 'react'
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore'
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

  // Listen to all drawings
  useEffect(() => {
    const drawingsQuery = query(
      collection(db, 'drawings'),
      orderBy('createdAt', 'desc')
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
      await addDoc(collection(db, 'drawings'), {
        imageUrl: finalImageUrl.trim(),
        title: title.trim(),
        number: number.trim() || null,
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

  const previewImage = uploadMethod === 'file' ? imageFile : imageUrl

  return (
    <div className="admin-page">
      <div className="admin-container">
        <h1 className="admin-title">Admin - Manage Drawings</h1>

        {/* Upload Form */}
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
