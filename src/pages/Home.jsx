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
    retry
  } = useSocket()

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
      </div>
    </div>
  )
}
