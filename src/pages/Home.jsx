import { useState, useEffect, useRef, useCallback } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Scene } from '../components/Noah3D'
import Chat from '../components/Chat/Chat'
import { useSocket } from '../contexts/SocketContext'
import './Home.css'

// Format time as MM:SS
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function Home() {
  const { userProfile } = useOutletContext()
  const {
    connectionStatus,
    showConnectedMessage,
    timeLeft,
    isDrawing,
    currentDrawing,
    gallery,
    registerNoahActions,
    retry
  } = useSocket()

  const [selectedImage, setSelectedImage] = useState(null)
  const noahRef = useRef(null)

  // Register Noah 3D model actions with the socket context
  useEffect(() => {
    if (noahRef.current) {
      registerNoahActions({
        startDrawing: () => noahRef.current?.startDrawing?.(),
        stopDrawing: () => noahRef.current?.stopDrawing?.(),
        celebrate: () => noahRef.current?.celebrate?.()
      })
    }
  }, [registerNoahActions])

  // Download image function
  const handleDownload = useCallback((image, name) => {
    const link = document.createElement('a')
    link.href = image
    link.download = `noah-drawing-${name.replace(/\s+/g, '-')}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])

  const closeModal = useCallback(() => {
    setSelectedImage(null)
  }, [])

  // Render connection status message
  const renderConnectionStatus = () => {
    if (showConnectedMessage) {
      return <p className="connection-status connected">Connected!</p>
    }

    if (connectionStatus === 'connecting') {
      return <p className="connection-status">Connecting to server...</p>
    }

    if (connectionStatus === 'failed') {
      return (
        <div className="connection-status failed">
          <p>Having trouble connecting. Please refresh the page.</p>
          <button className="retry-btn" onClick={retry}>Retry</button>
        </div>
      )
    }

    if (connectionStatus === 'offline') {
      return <p className="connection-status offline">Running in offline mode</p>
    }

    return null
  }

  return (
    <div className="home-page">
      {renderConnectionStatus()}

      {/* Main content */}
      <div className="home-content">
        {/* Noah section */}
        <section className="noah-section">
          <div className="noah-container">
            <Scene
              ref={noahRef}
              className="noah-canvas"
              style={{ width: '100%', height: '100%' }}
            />
            <div className="name-tag">Noah</div>
          </div>

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
      </div>

      {/* Gallery */}
      <section className="gallery-section">
        <h2 className="gallery-title">Recent Drawings</h2>
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

      {/* Image Modal */}
      {selectedImage && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>x</button>
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
