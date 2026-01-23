import { useState, useEffect, useRef } from 'react'
import { Scene } from '../Noah3D'
import './Hero.css'

// Wobbly letter component
function WobblyLetter({ children, seed = 0 }) {
  const rotation = (Math.sin(seed * 1.5) * 4)
  const yShift = (Math.cos(seed * 2) * 2)
  return (
    <span
      className="wobbly-letter"
      style={{
        transform: `rotate(${rotation}deg) translateY(${yShift}px)`,
      }}
    >
      {children}
    </span>
  )
}

// Convert text to wobbly letters
function WobblyText({ text, className = '' }) {
  return (
    <span className={`wobbly-text ${className}`}>
      {text.split('').map((char, i) => (
        <WobblyLetter key={i} seed={i}>
          {char === ' ' ? '\u00A0' : char}
        </WobblyLetter>
      ))}
    </span>
  )
}

// Timer display
function Timer({ seconds }) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`

  return (
    <div className="timer-container">
      <span className="timer-label">
        <WobblyText text="next drawing in" />
      </span>
      <div className="timer-display">
        {timeStr.split('').map((char, i) => (
          <span
            key={i}
            className="timer-char"
            style={{
              transform: `rotate(${(Math.sin(i * 2) * 3)}deg)`,
            }}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  )
}

// Doodles
function Doodles() {
  return (
    <div className="doodles" aria-hidden="true">
      <svg className="doodle sun" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="18" fill="#fff3b0" stroke="#e6c200" strokeWidth="3"/>
        {[...Array(8)].map((_, i) => (
          <line
            key={i}
            x1="50" y1="50"
            x2={50 + Math.cos(i * Math.PI / 4) * 35}
            y2={50 + Math.sin(i * Math.PI / 4) * 35}
            stroke="#e6c200"
            strokeWidth="2"
            strokeLinecap="round"
          />
        ))}
      </svg>

      <svg className="doodle cloud" viewBox="0 0 100 50">
        <ellipse cx="30" cy="35" rx="20" ry="14" fill="#d4e8ff" stroke="#a8d4ff" strokeWidth="2"/>
        <ellipse cx="50" cy="30" rx="24" ry="18" fill="#d4e8ff" stroke="#a8d4ff" strokeWidth="2"/>
        <ellipse cx="72" cy="36" rx="18" ry="13" fill="#d4e8ff" stroke="#a8d4ff" strokeWidth="2"/>
      </svg>

      <svg className="doodle star" viewBox="0 0 50 50">
        <path
          d="M25 8 L28 20 L40 20 L30 28 L34 40 L25 32 L16 40 L20 28 L10 20 L22 20 Z"
          fill="#fff3b0"
          stroke="#e6c200"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>

      <svg className="doodle heart" viewBox="0 0 50 50">
        <path
          d="M25 42 C12 30 6 22 12 14 C18 8 25 14 25 14 C25 14 32 8 38 14 C44 22 38 30 25 42"
          fill="#ffd4d4"
          stroke="#ffaaaa"
          strokeWidth="2"
        />
      </svg>

      <svg className="doodle squiggle" viewBox="0 0 100 30">
        <path
          d="M5 15 Q25 5 45 15 T85 15"
          fill="none"
          stroke="#d4ffd4"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

export default function Hero() {
  const [gallery, setGallery] = useState([])
  const [currentDrawing, setCurrentDrawing] = useState(null)
  const [timeLeft, setTimeLeft] = useState(300)
  const [isCreating, setIsCreating] = useState(false)
  const currentIndex = useRef(0)

  const artworks = [
    '/drawings/drawing-1.jpg',
    '/drawings/drawing-2.jpg',
    '/drawings/drawing-3.jpg',
  ]

  // Countdown timer with drawing flow
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsCreating(true)

          setTimeout(() => {
            const newDrawing = {
              src: artworks[currentIndex.current % artworks.length],
              id: Date.now(),
              number: currentIndex.current + 1,
            }
            setCurrentDrawing(newDrawing)
            currentIndex.current += 1
            setIsCreating(false)

            setTimeout(() => {
              setGallery(prev => [...prev, {
                ...newDrawing,
                rotation: (Math.random() - 0.5) * 5,
              }])
            }, 5000)

          }, 2000)

          return 300
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="noah-world">
      {/* Background */}
      <Doodles />
      <div className="paper-texture" />

      {/* Timer - Top Center */}
      <div className="timer-top">
        <Timer seconds={timeLeft} />
        {isCreating && (
          <div className="creating-note" style={{ transform: 'rotate(1deg)' }}>
            <WobblyText text="noah is drawing..." />
          </div>
        )}
      </div>

      {/* NOAH - 3D Character - RIGHT SIDE */}
      <div className="noah-stage">
        <Scene
          className="noah-canvas"
          style={{ width: '100%', height: '100%' }}
        />
        <div className="noah-name-tag">
          <WobblyText text="noah" />
        </div>
        <div className="noah-hint">
          <WobblyText text="click me!" />
        </div>
      </div>

      {/* Main Content - Left side */}
      <div className="main-content">
        {/* Small intro */}
        <div className="left-info">
          <div className="greeting" style={{ transform: 'rotate(-1.5deg)' }}>
            <WobblyText text="hi" className="big-text" />
          </div>
          <h1 className="title">
            <span style={{ transform: 'rotate(0.8deg)', display: 'block' }}>
              <WobblyText text="my name is" />
            </span>
            <span className="name-box">
              <WobblyText text="noah" className="name" />
            </span>
          </h1>
          <div className="about-lines">
            <p style={{ transform: 'rotate(-0.5deg)' }}>
              <WobblyText text="i like to draw" />
            </p>
            <p style={{ transform: 'rotate(0.3deg)', marginLeft: '10px' }}>
              <WobblyText text="watch me make art" />
            </p>
          </div>
        </div>

        {/* Drawing Area - CENTER, BIGGEST */}
        <div className="drawing-area">
          <div className="drawing-frame">
            <div className="drawing-title">
              <WobblyText text="my latest drawing" />
            </div>
            <div className="drawing-canvas">
              {!currentDrawing ? (
                <div className="empty-canvas">
                  <p style={{ transform: 'rotate(0.5deg)' }}>
                    <WobblyText text="nothing here yet" />
                  </p>
                  <p className="sub-note" style={{ transform: 'rotate(-0.3deg)' }}>
                    <WobblyText text="wait for the timer" />
                  </p>
                </div>
              ) : (
                <div className="current-drawing" key={currentDrawing.id}>
                  <img src={currentDrawing.src} alt={`drawing ${currentDrawing.number}`} />
                  <span className="drawing-number">
                    <WobblyText text={`#${currentDrawing.number}`} />
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Gallery - BOTTOM, FULL WIDTH */}
      <div className="gallery-section">
        <div className="gallery-header">
          <h2 style={{ transform: 'rotate(-0.8deg)' }}>
            <WobblyText text="all my drawings" />
          </h2>
          {gallery.length > 0 && (
            <span className="count">
              <WobblyText text={`(${gallery.length} so far)`} />
            </span>
          )}
        </div>

        <div className="gallery-floor">
          {gallery.length === 0 ? (
            <div className="gallery-empty">
              <p style={{ transform: 'rotate(0.5deg)' }}>
                <WobblyText text="drawings will appear here" />
              </p>
            </div>
          ) : (
            gallery.map((item, index) => (
              <div
                key={item.id}
                className="gallery-item"
                style={{
                  animationDelay: `${index * 0.05}s`,
                }}
              >
                <img src={item.src} alt={`drawing ${item.number}`} />
                <span className="item-number">
                  <WobblyText text={`${item.number}`} />
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="footer-message">
        <WobblyText text="thanks for watching me draw" />
      </div>
    </div>
  )
}
