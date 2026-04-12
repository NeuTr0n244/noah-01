import { useState, useEffect } from 'react'
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

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2]
        if (r > 230 && g > 230 && b > 230) {
          data[i + 3] = 0
        } else if (r > 200 && g > 200 && b > 200) {
          const whiteness = Math.min(r, g, b)
          data[i + 3] = Math.max(0, 255 - (whiteness - 200) * (255 / 55))
        }
      }

      ctx.putImageData(imageData, 0, 0)
      setTransparentSrc(canvas.toDataURL('image/png'))
    }
    img.onerror = () => setTransparentSrc(src)
    img.src = src
  }, [src])

  return transparentSrc
}

const DRAW_DURATION = 30

export default function Gallery() {
  const { gallery } = useFirebase()
  const [index, setIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(DRAW_DURATION)

  const total = gallery.length
  const current = total > 0 ? gallery[index % total] : null
  const transparentImage = useTransparentImage(current?.image)

  // Timer: 30s per drawing
  useEffect(() => {
    if (total === 0) return

    setTimeLeft(DRAW_DURATION)
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIndex(i => (i + 1) % total)
          return DRAW_DURATION
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [total])

  if (total === 0) return null

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const timerText = `${minutes}:${seconds.toString().padStart(2, '0')}`

  return (
    <div className="gallery-page">
      {/* Drawing on the paper */}
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

      {/* Timer on the paper */}
      <div className="paper-timer">
        <span className="paper-timer-label">Next drawing in</span>
        <span className="paper-timer-time">{timerText}</span>
      </div>
    </div>
  )
}
