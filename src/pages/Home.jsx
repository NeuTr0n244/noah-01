import { useState } from 'react'
import { useFirebase } from '../contexts/FirebaseContext'
import { useNavigate } from 'react-router-dom'
import './Home.css'

const CONTRACT_ADDRESS = 'G1vE7Aum6fKpCFGZSnVAqS5tzuzn9XeybvN8tDNEpump'

export default function Home() {
  const { gallery, timeLeft, timerRunning } = useFirebase()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const totalDrawings = gallery.filter(d => d.revealed).length
  const isDrawing = timerRunning && timeLeft > 0

  const copyCA = () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="home-page">
      <div className="home-hero">
        <p className="home-tagline">Watch me draw. Tell me what.</p>

        <div className="home-status">
          {isDrawing ? (
            <span className="home-status-live">
              <span className="status-dot"></span>
              Ollie is drawing...
            </span>
          ) : (
            <span className="home-status-idle">Waiting for suggestions</span>
          )}
        </div>

        {totalDrawings > 0 && (
          <p className="home-count">{totalDrawings} drawings created</p>
        )}

        <button
          className="home-cta"
          onClick={() => navigate('/drawing')}
        >
          Suggest what Ollie should draw next
        </button>
      </div>

      <button className="home-ca" onClick={copyCA} title={CONTRACT_ADDRESS}>
        <span className="home-ca-label">CA:</span>
        <span className="home-ca-value">
          {CONTRACT_ADDRESS.slice(0, 4)}...{CONTRACT_ADDRESS.slice(-4)}
        </span>
        <span className="home-ca-icon">{copied ? '✓' : '📋'}</span>
      </button>
    </div>
  )
}
