import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './HowItWorks.css'

gsap.registerPlugin(ScrollTrigger)

const phases = [
  {
    id: 1,
    title: 'Analysis Phase',
    description: 'The AI Agent analyzes patterns, styles, and creative elements from its vast neural network to conceptualize unique artwork.',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="32" cy="32" r="24" />
        <circle cx="32" cy="32" r="12" />
        <circle cx="32" cy="32" r="4" />
        <line x1="32" y1="4" x2="32" y2="8" />
        <line x1="32" y1="56" x2="32" y2="60" />
        <line x1="4" y1="32" x2="8" y2="32" />
        <line x1="56" y1="32" x2="60" y2="32" />
        <line x1="12" y1="12" x2="15" y2="15" />
        <line x1="49" y1="49" x2="52" y2="52" />
        <line x1="12" y1="52" x2="15" y2="49" />
        <line x1="49" y1="15" x2="52" y2="12" />
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Simulation Phase',
    description: 'Complex algorithms simulate thousands of brush strokes, colors, and compositions to find the perfect artistic expression.',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="8" y="8" width="48" height="48" rx="4" />
        <line x1="8" y1="20" x2="56" y2="20" />
        <circle cx="16" cy="14" r="2" fill="currentColor" />
        <circle cx="24" cy="14" r="2" fill="currentColor" />
        <circle cx="32" cy="14" r="2" fill="currentColor" />
        <path d="M16 32 L24 40 L32 32 L40 44 L48 36" />
        <rect x="16" y="48" width="8" height="4" rx="1" />
        <rect x="28" y="46" width="8" height="6" rx="1" />
        <rect x="40" y="44" width="8" height="8" rx="1" />
      </svg>
    ),
  },
  {
    id: 3,
    title: 'Artwork Reveal',
    description: 'Watch as the AI Agent brings the masterpiece to life, stroke by stroke, revealing a one-of-a-kind creation.',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="12" y="8" width="40" height="48" rx="2" />
        <rect x="16" y="16" width="32" height="24" rx="1" />
        <path d="M20 32 L28 24 L36 32 L44 20" />
        <circle cx="24" cy="22" r="3" />
        <line x1="16" y1="46" x2="48" y2="46" />
        <line x1="16" y1="52" x2="36" y2="52" />
        <path d="M4 56 L12 48" strokeLinecap="round" />
        <path d="M52 8 L60 16" strokeLinecap="round" />
      </svg>
    ),
  },
]

export default function HowItWorks() {
  const sectionRef = useRef(null)
  const cardsRef = useRef([])

  useEffect(() => {
    const cards = cardsRef.current

    cards.forEach((card, index) => {
      gsap.fromTo(
        card,
        {
          opacity: 0,
          y: 50,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: index * 0.2,
          scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      )
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  return (
    <section className="how-it-works section" ref={sectionRef} id="how-it-works">
      <div className="container">
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">
          Discover the magic behind our AI Agent's creative process
        </p>

        <div className="phases-grid">
          {phases.map((phase, index) => (
            <div
              key={phase.id}
              className="phase-card"
              ref={(el) => (cardsRef.current[index] = el)}
            >
              <div className="phase-number">{String(phase.id).padStart(2, '0')}</div>
              <div className="phase-icon">{phase.icon}</div>
              <h3 className="phase-title">{phase.title}</h3>
              <p className="phase-description">{phase.description}</p>

              {index < phases.length - 1 && (
                <div className="phase-connector">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
