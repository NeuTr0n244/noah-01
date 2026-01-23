import { useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'

export default function useDrawingReveal(isActive, options = {}) {
  const {
    duration = 3,
    ease = 'power2.inOut',
    direction = 'left-to-right', // 'left-to-right', 'top-to-bottom', 'center-out', 'diagonal'
    onStart,
    onComplete,
  } = options

  const maskRef = useRef(null)
  const imageRef = useRef(null)
  const timelineRef = useRef(null)

  const getClipPathValues = useCallback(() => {
    switch (direction) {
      case 'top-to-bottom':
        return {
          from: 'inset(0% 0% 100% 0%)',
          to: 'inset(0% 0% 0% 0%)'
        }
      case 'center-out':
        return {
          from: 'inset(50% 50% 50% 50%)',
          to: 'inset(0% 0% 0% 0%)'
        }
      case 'diagonal':
        return {
          from: 'polygon(0% 0%, 0% 0%, 0% 0%)',
          to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
        }
      case 'left-to-right':
      default:
        return {
          from: 'inset(0% 100% 0% 0%)',
          to: 'inset(0% 0% 0% 0%)'
        }
    }
  }, [direction])

  const playReveal = useCallback(() => {
    if (!maskRef.current) return

    const { from, to } = getClipPathValues()

    // Kill any existing animation
    if (timelineRef.current) {
      timelineRef.current.kill()
    }

    // Create new timeline
    timelineRef.current = gsap.timeline({
      onStart,
      onComplete,
    })

    // Set initial state
    gsap.set(maskRef.current, { clipPath: from })

    // Animate reveal
    timelineRef.current.to(maskRef.current, {
      clipPath: to,
      duration,
      ease,
    })

    // Optional: Add a subtle scale effect
    if (imageRef.current) {
      timelineRef.current.from(
        imageRef.current,
        {
          scale: 1.1,
          duration: duration * 1.2,
          ease: 'power1.out',
        },
        0
      )
    }

    return timelineRef.current
  }, [duration, ease, getClipPathValues, onStart, onComplete])

  const resetReveal = useCallback(() => {
    if (!maskRef.current) return

    const { from } = getClipPathValues()

    if (timelineRef.current) {
      timelineRef.current.kill()
    }

    gsap.set(maskRef.current, { clipPath: from })

    if (imageRef.current) {
      gsap.set(imageRef.current, { scale: 1 })
    }
  }, [getClipPathValues])

  useEffect(() => {
    if (isActive) {
      playReveal()
    }

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill()
      }
    }
  }, [isActive, playReveal])

  return {
    maskRef,
    imageRef,
    playReveal,
    resetReveal,
    timeline: timelineRef.current,
  }
}
