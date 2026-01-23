import { useState, useEffect, useRef, useCallback } from 'react'
import { Scene } from '../Noah3D'
import Chat from '../Chat/Chat'
import UserProfile from '../UserProfile'
import {
  initSocket,
  onConnectionChange,
  onStateInit,
  onTimerUpdate,
  onDrawingUpdate,
  onDrawingStart,
  onDrawingComplete,
  onGalleryUpdate,
  calculateTimeRemaining
} from '../../services/socket'
import './Hero.css'

// Format time as MM:SS
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function Hero() {
  const [timeLeft, setTimeLeft] = useState(60)
  const [isDrawing, setIsDrawing] = useState(false)
  const [gallery, setGallery] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)
  const [currentDrawing, setCurrentDrawing] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [userProfile, setUserProfile] = useState({ username: '', avatar: null })

  const noahRef = useRef(null)
  const timerDataRef = useRef(null)

  // Handle profile changes
  const handleProfileChange = useCallback((profile) => {
    setUserProfile(profile)
  }, [])

  // Initialize Socket.io connection
  useEffect(() => {
    // Initialize socket
    initSocket()

    // Subscribe to connection status
    const unsubConnection = onConnectionChange((connected) => {
      setIsConnected(connected)
    })

    // Subscribe to initial state
    const unsubInit = onStateInit((state) => {
      if (state.timer) {
        timerDataRef.current = state.timer
        setTimeLeft(calculateTimeRemaining(state.timer))
        setIsDrawing(state.timer.isDrawing || false)
      }
      if (state.currentDrawing) {
        setCurrentDrawing(state.currentDrawing)
      }
      if (state.gallery) {
        setGallery(state.gallery)
      }
      setIsConnected(true)
    })

    // Subscribe to timer updates
    const unsubTimer = onTimerUpdate((timerData) => {
      timerDataRef.current = timerData
      setTimeLeft(calculateTimeRemaining(timerData))
      setIsDrawing(timerData.isDrawing || false)
    })

    // Subscribe to drawing updates
    const unsubDrawing = onDrawingUpdate((drawing) => {
      setCurrentDrawing(drawing)
    })

    // Subscribe to drawing start
    const unsubDrawingStart = onDrawingStart(() => {
      setIsDrawing(true)
      if (noahRef.current) {
        noahRef.current.startDrawing?.()
      }
    })

    // Subscribe to drawing complete
    const unsubDrawingComplete = onDrawingComplete(() => {
      if (noahRef.current) {
        noahRef.current.stopDrawing?.()
        noahRef.current.celebrate?.()
      }
    })

    // Subscribe to gallery updates
    const unsubGallery = onGalleryUpdate((galleryData) => {
      setGallery(galleryData)
    })

    // Timer tick interval
    const timerInterval = setInterval(() => {
      if (timerDataRef.current) {
        setTimeLeft(calculateTimeRemaining(timerDataRef.current))
      }
    }, 1000)

    return () => {
      unsubConnection()
      unsubInit()
      unsubTimer()
      unsubDrawing()
      unsubDrawingStart()
      unsubDrawingComplete()
      unsubGallery()
      clearInterval(timerInterval)
    }
  }, [])

  // Download image function
  const handleDownload = useCallback((image, name) => {
    const link = document.createElement('a')
    link.href = image
    link.download = `noah-drawing-${name.replace(/\s+/g, '-')}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])

  // Close modal
  const closeModal = useCallback(() => {
    setSelectedImage(null)
  }, [])

  return (
    <div className="noah-world">
      {/* User Profile */}
      <UserProfile onProfileChange={handleProfileChange} />

      {/* Background decorations */}
      <div className="background-decorations">
        <div className="cloud cloud-1" />
        <div className="cloud cloud-2" />
        <div className="cloud cloud-3" />
      </div>

      {/* Header */}
      <header className="header">
        <h1 className="title">Noah Universe</h1>
        <p className="subtitle">Watch me draw cool stuff!</p>
        {!isConnected && (
          <p className="connection-status">Connecting to server...</p>
        )}
      </header>

      {/* Main content */}
      <main className="main-content">
        {/* Noah section */}
        <section className="noah-section">
          <div className="noah-container">
            <Scene
              ref={noahRef}
              className="noah-canvas"
              style={{ width: '100%', height: '100%' }}
            />

            {/* Name tag */}
            <div className="name-tag">Noah</div>
          </div>

          {/* Timer */}
          <div className="timer-box">
            <span className="timer-label">Next drawing in</span>
            <span className="timer-value">{formatTime(timeLeft)}</span>
          </div>

        </section>

        {/* Drawing section */}
        <section className="drawing-section">
          <div className="drawing-header">
            <h2>My Drawing</h2>
            {isDrawing && <span className="drawing-indicator">Drawing in progress...</span>}
          </div>
          <div className="drawing-frame">
            {/* Display area for drawings */}
            <div className="drawing-display">
              {currentDrawing ? (
                <img
                  src={currentDrawing}
                  alt="Noah's drawing"
                  className={`current-drawing ${isDrawing ? 'hidden' : 'revealed'}`}
                />
              ) : (
                <div className="drawing-placeholder">
                  <span>Waiting for Noah to draw...</span>
                </div>
              )}
            </div>
            {/* Blur overlay with scribbles while drawing */}
            {isDrawing && (
              <div className="drawing-blur-overlay">
                <div className="scribble-animation">
                  <svg viewBox="0 0 200 150" className="scribble-svg">
                    <path className="scribble-line scribble-1" d="M20,30 Q50,10 80,35 T140,25" />
                    <path className="scribble-line scribble-2" d="M30,60 Q70,40 100,70 T160,50" />
                    <path className="scribble-line scribble-3" d="M25,90 Q60,70 90,95 T150,85" />
                    <path className="scribble-line scribble-4" d="M40,120 Q80,100 120,125 T180,110" />
                    <circle className="scribble-dot scribble-5" cx="50" cy="45" r="3" />
                    <circle className="scribble-dot scribble-6" cx="120" cy="75" r="4" />
                    <circle className="scribble-dot scribble-7" cx="80" cy="110" r="3" />
                  </svg>
                </div>
                <p className="drawing-secret-text">Shhh... Noah is drawing!</p>
              </div>
            )}
          </div>
        </section>

        {/* Chat section */}
        <section className="chat-section">
          <Chat userProfile={userProfile} />
        </section>
      </main>

      {/* About Noah Section */}
      <section className="about-section">
        <h2 className="about-title">Meet Noah</h2>
        <p className="about-text">
          Noah is a little artist who loves to draw! Every minute he creates a new masterpiece just for you.
          Watch him work his magic and collect his drawings. Who knows what he'll draw next?
        </p>
      </section>

      {/* Gallery */}
      <section className="gallery-section">
        <h2 className="gallery-title">My Gallery</h2>
        {gallery.length === 0 ? (
          <p className="gallery-empty">No drawings yet! Wait for the timer to see me draw!</p>
        ) : (
          <div className="gallery-grid">
            {gallery.map((item) => (
              <div
                key={item.id}
                className="gallery-item"
                onClick={() => setSelectedImage(item)}
              >
                <img src={item.image} alt={item.name} />
                <div className="gallery-item-info">
                  <span className="gallery-item-name">{item.name}</span>
                  <span className="gallery-item-time">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>Made with love by Noah</p>
        <p className="credit">
          3D Model "Kid Boy" by oLric (sketchfab.com/selimalsk) licensed under CC-BY-4.0
        </p>
      </footer>

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
                className="modal-download"
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
