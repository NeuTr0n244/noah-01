import { useFirebase } from '../../contexts/FirebaseContext'
import './Timer.css'

// Format time as MM:SS
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function Timer() {
  const { timeLeft, timerRunning } = useFirebase()

  return (
    <div className="timer-container">
      <span className="timer-label">
        {timeLeft === -1 ? 'Status' : 'Next drawing in'}
      </span>
      <span className="timer-value">
        {timeLeft === -1 ? 'Coming soon...' : formatTime(timeLeft)}
      </span>
    </div>
  )
}
