import { useState, useEffect } from 'react'
import { useFirebase } from '../contexts/FirebaseContext'
import './Gallery.css'

export default function Gallery() {
  const { gallery } = useFirebase()
  const [index, setIndex] = useState(0)

  const total = gallery.length
  const current = total > 0 ? gallery[index % total] : null

  // Auto-cycle
  useEffect(() => {
    if (total <= 1) return
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % total)
    }, 6000)
    return () => clearInterval(interval)
  }, [total])

  if (total === 0) {
    return (
      <div className="gallery-page">
        <p className="gallery-empty">No drawings yet...</p>
      </div>
    )
  }

  return (
    <div className="gallery-page">
      {/* Drawing overlay on the paper */}
      <div className="drawing-overlay">
        <img
          key={current?.id || index}
          src={current?.image}
          alt={current?.name || 'Drawing'}
          className="drawing-on-paper"
        />
      </div>

      {/* Navigation controls */}
      <div className="gallery-controls">
        <button
          className="gallery-arrow"
          onClick={() => setIndex((index - 1 + total) % total)}
        >
          &#8592;
        </button>
        <span className="gallery-counter">
          {(index % total) + 1} / {total}
        </span>
        <button
          className="gallery-arrow"
          onClick={() => setIndex((index + 1) % total)}
        >
          &#8594;
        </button>
      </div>
    </div>
  )
}
