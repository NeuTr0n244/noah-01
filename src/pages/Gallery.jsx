import { useState, useCallback, useEffect } from 'react'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import './Gallery.css'

export default function Gallery() {
  const [revealedDrawings, setRevealedDrawings] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)

  // Listen to revealed drawings only (ordered by number)
  useEffect(() => {
    const revealedQuery = query(
      collection(db, 'drawings'),
      where('revealed', '==', true),
      orderBy('order', 'asc')
    )

    const unsubscribe = onSnapshot(revealedQuery, (snapshot) => {
      const drawings = snapshot.docs.map(doc => ({
        id: doc.id,
        image: doc.data().imageUrl,
        name: doc.data().title,
        order: doc.data().order || 0,
        timestamp: doc.data().createdAt?.toMillis() || Date.now()
      }))
      setRevealedDrawings(drawings)
    })

    return () => unsubscribe()
  }, [])

  // Download image function
  const handleDownload = useCallback((image, name) => {
    const link = document.createElement('a')
    link.href = image
    link.download = `sam-drawing-${name.replace(/\s+/g, '-')}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])

  const closeModal = useCallback(() => {
    setSelectedImage(null)
  }, [])

  return (
    <div className="gallery-page">
      <div className="gallery-container">
        <h1 className="gallery-title">Sam's Drawings</h1>

        {revealedDrawings.length === 0 ? (
          <p className="gallery-empty">No drawings revealed yet! Check back soon.</p>
        ) : (
          <div className="gallery-grid">
            {revealedDrawings.map((item) => (
              <div
                key={item.id}
                className="gallery-item"
                onClick={() => setSelectedImage(item)}
              >
                <div className="gallery-paper">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="gallery-image"
                  />
                </div>
                <p className="gallery-item-name">{item.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <img src={selectedImage.image} alt={selectedImage.name} className="modal-image" />
            <div className="modal-info">
              <h3 className="modal-title">{selectedImage.name}</h3>
              <p className="modal-time">Created at {new Date(selectedImage.timestamp).toLocaleTimeString()}</p>
              <button
                className="modal-btn modal-download"
                onClick={() => handleDownload(selectedImage.image, selectedImage.name)}
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
