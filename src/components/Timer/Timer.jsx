import { useFirebase } from '../../contexts/FirebaseContext'
import './Timer.css'

// Format time as MM:SS
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function Timer() {
  const { timeLeft } = useFirebase()

  return (
    <div className="timer-container">
      <span className="timer-label">Next drawing in</span>
      <span className="timer-value">{formatTime(timeLeft)}</span>
    </div>
  )
}
