import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import DrawingCard from './DrawingCard'
import './Gallery.css'

gsap.registerPlugin(ScrollTrigger)

const drawings = [
  { id: 1, src: '/drawings/drawing-1.jpg' },
  { id: 2, src: '/drawings/drawing-2.jpg' },
  { id: 3, src: '/drawings/drawing-3.jpg' },
]

export default function Gallery() {
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)

  useEffect(() => {
    gsap.fromTo(
      titleRef.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        scrollTrigger: {
          trigger: titleRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      }
    )

    gsap.fromTo(
      subtitleRef.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        delay: 0.2,
        scrollTrigger: {
          trigger: subtitleRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      }
    )

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  return (
    <section className="gallery section" id="gallery">
      <div className="container">
        <h2 className="section-title" ref={titleRef}>
          KAYA Gallery
        </h2>
        <p className="section-subtitle" ref={subtitleRef}>
          Explore the masterpieces created by KAYA. Each piece is unique,
          generated through advanced neural networks.
        </p>

        <div className="gallery-grid">
          {drawings.map((drawing, index) => (
            <DrawingCard
              key={drawing.id}
              imageSrc={drawing.src}
              index={index}
            />
          ))}
        </div>

        <div className="gallery-cta">
          <p className="gallery-cta-text">
            Want to see KAYA create more artwork?
          </p>
          <button className="btn btn-primary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Watch Live Creation
          </button>
        </div>
      </div>
    </section>
  )
}
