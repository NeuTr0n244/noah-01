import { useState, useCallback } from 'react'
import { useSocket } from '../contexts/SocketContext'
import Timer from '../components/Timer/Timer'
import './Home.css'

export default function Home() {
  const {
    connectionStatus,
    showConnectedMessage,
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
    link.download = `sam-drawing-${name.replace(/\s+/g, '-')}.png`
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
      return <p className="connection-status offline subtle">Offline</p>
    }

    return null
  }

  return (
    <div className="home-page-container">
      <div className="drawing-card-container">
        {/* Timer in card header */}
        <div className="drawing-card-header">
          <Timer />
        </div>

        {renderConnectionStatus()}

        {/* Drawing display */}
        <div className="drawing-frame">
          <div className="drawing-display">
            {currentDrawing ? (
              <img
                src={currentDrawing}
                alt="Sam's drawing"
                className={`current-drawing ${isDrawing ? 'hidden' : 'revealed'}`}
              />
            ) : (
              <div className="drawing-placeholder">
                <span>Waiting for Sam to draw...</span>
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
              <p className="drawing-secret-text">Shhh... Sam is drawing!</p>
            </div>
          )}
        </div>

        {/* Gallery inline at bottom of card */}
        {gallery.length > 0 && (
          <div className="gallery-inline">
            {gallery.slice(0, 5).map((item) => (
              <img
                key={item.id}
                src={item.image}
                alt={item.name}
                className="gallery-thumb-inline"
                onClick={() => setSelectedImage(item)}
              />
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
