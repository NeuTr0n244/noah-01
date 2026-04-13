import { useState, useEffect } from 'react'
import { useFirebase } from '../contexts/FirebaseContext'
import './Drawing.css'

// Remove white background from image
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

export default function Drawing() {
  const { currentDrawing, timeLeft, timerRunning } = useFirebase()
  const transparentImage = useTransparentImage(currentDrawing)

  const isActive = timerRunning && timeLeft > 0
  const seconds = Math.max(0, timeLeft)
  const timerText = `0:${seconds.toString().padStart(2, '0')}`

  return (
    <div className="drawing-page">
      <div className="drawing-overlay">
        {transparentImage && (
          <img
            key={currentDrawing}
            src={transparentImage}
            alt="Current drawing"
            className="drawing-on-paper"
          />
        )}
      </div>

      <div className="paper-timer">
        {isActive ? (
          <>
            <span className="paper-timer-label">Next drawing in</span>
            <span className="paper-timer-time">{timerText}</span>
          </>
        ) : (
          <span className="paper-timer-label">Waiting...</span>
        )}
      </div>
    </div>
  )
}
