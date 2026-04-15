import { useFirebase } from '../contexts/FirebaseContext'
import { useNavigate } from 'react-router-dom'
import './Home.css'

export default function Home() {
  const { gallery, timeLeft, timerRunning } = useFirebase()
  const navigate = useNavigate()

  const totalDrawings = gallery.filter(d => d.revealed).length
  const isDrawing = timerRunning && timeLeft > 0

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
    </div>
  )
}
