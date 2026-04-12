import { useState, useEffect, useRef, useCallback } from 'react'
import { useFirebase } from '../contexts/FirebaseContext'
import './Gallery.css'

// Remove white background from image using canvas
function useTransparentImage(src) {
  const [transparentSrc, setTransparentSrc] = useState(null)

  useEffect(() => {
    if (!src) { setTransparentSrc(null); return }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      // Make white/near-white pixels transparent
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2]
        // If pixel is white or near-white, make transparent
        if (r > 230 && g > 230 && b > 230) {
          data[i + 3] = 0 // fully transparent
        } else if (r > 200 && g > 200 && b > 200) {
          // Semi-transparent for near-white (smooth edges)
          const whiteness = Math.min(r, g, b)
          data[i + 3] = Math.max(0, 255 - (whiteness - 200) * (255 / 55))
        }
      }

      ctx.putImageData(imageData, 0, 0)
      setTransparentSrc(canvas.toDataURL('image/png'))
    }
    img.onerror = () => setTransparentSrc(src) // fallback to original
    img.src = src
  }, [src])

  return transparentSrc
}

export default function Gallery() {
  const { gallery } = useFirebase()
  const [index, setIndex] = useState(0)

  const total = gallery.length
  const current = total > 0 ? gallery[index % total] : null
  const transparentImage = useTransparentImage(current?.image)

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
      {/* Drawing overlay - no background, just the drawing */}
      <div className="drawing-overlay">
        {transparentImage && (
          <img
            key={current?.id || index}
            src={transparentImage}
            alt={current?.name || 'Drawing'}
            className="drawing-on-paper"
          />
        )}
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
