import { useState, useCallback } from 'react'
import { useSocket } from '../contexts/SocketContext'
import './Home.css'

// Format time as MM:SS
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function Home() {
  const {
    connectionStatus,
    showConnectedMessage,
    timeLeft,
    isDrawing,
    currentDrawing,
    gallery,
    retry
  } = useSocket()

  const [selectedImage, setSelectedImage] = useState(null)

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
    <div className="home-page-new">
      {/* Timer - acima do desenho */}
      <div className="timer-box-new">
        <span className="timer-label">Next drawing in</span>
        <span className="timer-value">{formatTime(timeLeft)}</span>
      </div>

      {/* Desenho principal centralizado */}
      <div className="drawing-box-new">
        {renderConnectionStatus()}

        <div className="drawing-frame-new">
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
      </div>

      {/* Gallery - embaixo do desenho */}
      {gallery.length > 0 && (
        <div className="gallery-compact">
          <h3>Recent Drawings</h3>
          <div className="gallery-scroll">
            {gallery.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="gallery-thumb"
                onClick={() => setSelectedImage(item)}
              >
                <img src={item.image} alt={item.name} />
              </div>
            ))}
          </div>
        </div>
      )}

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
