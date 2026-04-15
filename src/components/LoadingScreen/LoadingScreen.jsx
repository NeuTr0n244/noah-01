import { useState, useEffect } from 'react'
import './LoadingScreen.css'

export default function LoadingScreen({ onFinish }) {
  const [done, setDone] = useState(false)

  useEffect(() => {
    // Auto-finish after animation completes
    const t = setTimeout(() => {
      setDone(true)
      setTimeout(() => onFinish?.(), 600)
    }, 3500)
    return () => clearTimeout(t)
  }, [onFinish])

  return (
    <div className={`loading-screen ${done ? 'fade-out' : ''}`}>
      <div className="loading-paper">
        <svg
          className="loading-svg"
          viewBox="0 0 600 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Path that the pencil follows - draws "Ollie Universe" */}
          <text
            className="loading-text"
            x="300"
            y="120"
            textAnchor="middle"
            fontFamily="Caveat, cursive"
            fontSize="80"
            fontWeight="700"
            fill="none"
            stroke="#2d2d2d"
            strokeWidth="2"
          >
            Ollie Universe
          </text>
        </svg>

        {/* Pencil that moves across */}
        <div className="loading-pencil">
          <svg viewBox="0 0 24 24" width="40" height="40">
            <path
              d="M3 21l3-3 12-12 3 3-12 12-3 3z"
              fill="#F5C842"
              stroke="#2d2d2d"
              strokeWidth="1.5"
            />
            <path d="M18 6l-12 12" stroke="#2d2d2d" strokeWidth="1" />
            <path d="M3 21l1-4" stroke="#2d2d2d" strokeWidth="1" />
          </svg>
        </div>
      </div>

      <p className="loading-subtitle">getting the crayons ready...</p>
    </div>
  )
}
