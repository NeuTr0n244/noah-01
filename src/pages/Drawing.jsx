import { useState, useEffect, useRef } from 'react'
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

const INTRO_TEXT = "Hey there! My name is Ollie and I'm just a kid who loves to draw. Every 30 seconds I make a new drawing. You can tell me what to draw in the chat. Don't worry if it's silly... the sillier, the better!"

export default function Drawing() {
  const { currentDrawing, timeLeft, timerRunning } = useFirebase()
  const transparentImage = useTransparentImage(currentDrawing)
  const audioRef = useRef(null)
  const [muted, setMuted] = useState(false)
  const [caption, setCaption] = useState('')
  const [showCaption, setShowCaption] = useState(false)

  // Play intro audio when entering the page
  useEffect(() => {
    const audio = new Audio('/audio/ollie-intro.mp3')
    audio.volume = 0.8
    audioRef.current = audio
    setShowCaption(true)
    setCaption('')

    audio.play().catch(() => {})

    // Typewriter effect synced with audio duration
    let interval
    const startTypewriter = () => {
      const totalChars = INTRO_TEXT.length
      const duration = (audio.duration || 15) * 1000
      const charInterval = duration / totalChars
      let i = 0
      interval = setInterval(() => {
        if (i >= totalChars) {
          clearInterval(interval)
          return
        }
        setCaption(INTRO_TEXT.slice(0, i + 1))
        i++
      }, charInterval)
    }

    if (audio.readyState >= 1) {
      startTypewriter()
    } else {
      audio.addEventListener('loadedmetadata', startTypewriter, { once: true })
    }

    const hideTimer = () => setTimeout(() => setShowCaption(false), 1500)
    audio.addEventListener('ended', hideTimer, { once: true })

    return () => {
      audio.pause()
      audio.currentTime = 0
      if (interval) clearInterval(interval)
    }
  }, [])

  const toggleMute = () => {
    if (!audioRef.current) return
    const newMuted = !muted
    audioRef.current.muted = newMuted
    setMuted(newMuted)
  }

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

      <button className="audio-toggle" onClick={toggleMute} title={muted ? 'Unmute' : 'Mute'}>
        {muted ? '🔇' : '🔊'}
      </button>

      {showCaption && caption && (
        <div className="ollie-caption">
          <p className="ollie-caption-text">{caption}<span className="caption-cursor">|</span></p>
        </div>
      )}
    </div>
  )
}
