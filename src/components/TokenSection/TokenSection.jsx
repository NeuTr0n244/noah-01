import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './TokenSection.css'

gsap.registerPlugin(ScrollTrigger)

export default function TokenSection() {
  const cardRef = useRef(null)
  const featuresRef = useRef([])

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      }
    )

    featuresRef.current.forEach((feature, index) => {
      gsap.fromTo(
        feature,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          delay: 0.2 + index * 0.1,
          scrollTrigger: {
            trigger: feature,
            start: 'top 85%',
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
    <section className="token-section section" id="token">
      <div className="container">
        <div className="token-card" ref={cardRef}>
          <div className="token-content">
            <div className="token-badge">
              <span className="token-badge-dot" />
              Meme Token
            </div>

            <h2 className="token-title">
              Join the <span className="gradient-text">KAYA</span> Movement
            </h2>

            <p className="token-description">
              Be part of a community that celebrates creativity and innovation.
              The KAYA token is more than just a meme - it's a statement
              about the future of AI-generated art.
            </p>

            <ul className="token-features">
              {[
                'Community-driven development',
                'Transparent tokenomics',
                'Regular AI art drops',
                'Holder-exclusive benefits',
              ].map((feature, index) => (
                <li
                  key={index}
                  className="token-feature"
                  ref={(el) => (featuresRef.current[index] = el)}
                >
                  <span className="feature-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <div className="token-actions">
              <a href="#" className="btn btn-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                View Contract
              </a>
              <a href="#" className="btn btn-secondary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Join Community
              </a>
            </div>

            <p className="token-disclaimer">
              This is a meme token for entertainment purposes. Not financial advice.
              DYOR before investing.
            </p>
          </div>

          <div className="token-visual">
            <div className="token-graphic">
              <div className="token-ring outer" />
              <div className="token-ring middle" />
              <div className="token-ring inner" />
              <div className="token-center">
                <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="32" cy="32" r="28" />
                  <path d="M32 20v24M24 28l8-8 8 8M24 36l8 8 8-8" />
                </svg>
              </div>
            </div>

            <div className="token-particles">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="particle" style={{ '--delay': `${i * 0.5}s`, '--angle': `${i * 60}deg` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
