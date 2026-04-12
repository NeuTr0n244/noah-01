import { useState, useCallback, useEffect } from 'react'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import './Gallery.css'

export default function Gallery({ galleryIndex = 0, onSelectDrawing }) {
  const [revealedDrawings, setRevealedDrawings] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)

  // Listen to revealed drawings only
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

  const currentDrawing = revealedDrawings[galleryIndex % Math.max(1, revealedDrawings.length)]

  return (
    <div className="gallery-page">
      {/* Bottom gallery strip */}
      <div className="gallery-strip">
        <div className="gallery-strip-inner">
          <h2 className="gallery-strip-title">Sam's Drawings</h2>

          {revealedDrawings.length === 0 ? (
            <p className="gallery-empty">No drawings yet...</p>
          ) : (
            <>
              {/* Current drawing info */}
              {currentDrawing && (
                <div className="gallery-current-info">
                  <span className="gallery-current-name">{currentDrawing.name}</span>
                  <span className="gallery-current-index">
                    {(galleryIndex % revealedDrawings.length) + 1} / {revealedDrawings.length}
                  </span>
                </div>
              )}

              {/* Thumbnail strip */}
              <div className="gallery-thumbs">
                {revealedDrawings.map((item, i) => (
                  <div
                    key={item.id}
                    className={`gallery-thumb ${i === galleryIndex % revealedDrawings.length ? 'active' : ''}`}
                    onClick={() => onSelectDrawing?.(i)}
                  >
                    <img src={item.image} alt={item.name} />
                  </div>
                ))}
              </div>

              {/* Navigation arrows */}
              <div className="gallery-nav">
                <button
                  className="gallery-nav-btn"
                  onClick={() => onSelectDrawing?.((galleryIndex - 1 + revealedDrawings.length) % revealedDrawings.length)}
                >
                  Prev
                </button>
                <button
                  className="gallery-nav-btn"
                  onClick={() => {
                    const drawing = revealedDrawings[galleryIndex % revealedDrawings.length]
                    if (drawing) setSelectedImage(drawing)
                  }}
                >
                  View Full
                </button>
                <button
                  className="gallery-nav-btn"
                  onClick={() => onSelectDrawing?.((galleryIndex + 1) % revealedDrawings.length)}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <img src={selectedImage.image} alt={selectedImage.name} className="modal-image" />
            <div className="modal-info">
              <h3 className="modal-title">{selectedImage.name}</h3>
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
