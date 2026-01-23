import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import './DrawingCanvas.css'

// Predefined childlike drawings - each is an array of strokes
// Each stroke is an array of points {x, y} normalized 0-1
const DRAWINGS = {
  sun: {
    name: 'a sun',
    strokes: [
      // Circle
      Array.from({ length: 36 }, (_, i) => ({
        x: 0.5 + Math.cos(i * Math.PI / 18) * 0.15,
        y: 0.4 + Math.sin(i * Math.PI / 18) * 0.15
      })),
      // Rays
      ...Array.from({ length: 8 }, (_, i) => {
        const angle = i * Math.PI / 4
        return [
          { x: 0.5 + Math.cos(angle) * 0.18, y: 0.4 + Math.sin(angle) * 0.18 },
          { x: 0.5 + Math.cos(angle) * 0.28, y: 0.4 + Math.sin(angle) * 0.28 }
        ]
      })
    ],
    color: '#FFD700'
  },
  house: {
    name: 'a house',
    strokes: [
      // Base square
      [{ x: 0.3, y: 0.9 }, { x: 0.3, y: 0.5 }, { x: 0.7, y: 0.5 }, { x: 0.7, y: 0.9 }, { x: 0.3, y: 0.9 }],
      // Roof
      [{ x: 0.25, y: 0.5 }, { x: 0.5, y: 0.25 }, { x: 0.75, y: 0.5 }],
      // Door
      [{ x: 0.45, y: 0.9 }, { x: 0.45, y: 0.65 }, { x: 0.55, y: 0.65 }, { x: 0.55, y: 0.9 }],
      // Window
      [{ x: 0.35, y: 0.55 }, { x: 0.35, y: 0.62 }, { x: 0.42, y: 0.62 }, { x: 0.42, y: 0.55 }, { x: 0.35, y: 0.55 }],
      // Window 2
      [{ x: 0.58, y: 0.55 }, { x: 0.58, y: 0.62 }, { x: 0.65, y: 0.62 }, { x: 0.65, y: 0.55 }, { x: 0.58, y: 0.55 }]
    ],
    color: '#8B4513'
  },
  tree: {
    name: 'a tree',
    strokes: [
      // Trunk
      [{ x: 0.48, y: 0.9 }, { x: 0.48, y: 0.55 }, { x: 0.52, y: 0.55 }, { x: 0.52, y: 0.9 }],
      // Leaves (cloud shapes)
      Array.from({ length: 20 }, (_, i) => ({
        x: 0.5 + Math.cos(i * Math.PI / 10) * 0.18,
        y: 0.4 + Math.sin(i * Math.PI / 10) * 0.15
      })),
      Array.from({ length: 16 }, (_, i) => ({
        x: 0.38 + Math.cos(i * Math.PI / 8) * 0.12,
        y: 0.48 + Math.sin(i * Math.PI / 8) * 0.1
      })),
      Array.from({ length: 16 }, (_, i) => ({
        x: 0.62 + Math.cos(i * Math.PI / 8) * 0.12,
        y: 0.48 + Math.sin(i * Math.PI / 8) * 0.1
      }))
    ],
    color: '#228B22'
  },
  flower: {
    name: 'a flower',
    strokes: [
      // Stem
      [{ x: 0.5, y: 0.9 }, { x: 0.5, y: 0.55 }],
      // Leaf
      [{ x: 0.5, y: 0.75 }, { x: 0.4, y: 0.7 }, { x: 0.5, y: 0.72 }],
      // Petals
      ...Array.from({ length: 6 }, (_, i) => {
        const angle = i * Math.PI / 3
        const cx = 0.5 + Math.cos(angle) * 0.12
        const cy = 0.45 + Math.sin(angle) * 0.12
        return Array.from({ length: 12 }, (_, j) => ({
          x: cx + Math.cos(j * Math.PI / 6) * 0.06,
          y: cy + Math.sin(j * Math.PI / 6) * 0.06
        }))
      }),
      // Center
      Array.from({ length: 16 }, (_, i) => ({
        x: 0.5 + Math.cos(i * Math.PI / 8) * 0.05,
        y: 0.45 + Math.sin(i * Math.PI / 8) * 0.05
      }))
    ],
    color: '#FF69B4'
  },
  stickFigure: {
    name: 'a person',
    strokes: [
      // Head
      Array.from({ length: 20 }, (_, i) => ({
        x: 0.5 + Math.cos(i * Math.PI / 10) * 0.08,
        y: 0.25 + Math.sin(i * Math.PI / 10) * 0.08
      })),
      // Body
      [{ x: 0.5, y: 0.33 }, { x: 0.5, y: 0.6 }],
      // Left arm
      [{ x: 0.5, y: 0.4 }, { x: 0.35, y: 0.5 }],
      // Right arm
      [{ x: 0.5, y: 0.4 }, { x: 0.65, y: 0.5 }],
      // Left leg
      [{ x: 0.5, y: 0.6 }, { x: 0.4, y: 0.85 }],
      // Right leg
      [{ x: 0.5, y: 0.6 }, { x: 0.6, y: 0.85 }],
      // Smile
      [{ x: 0.46, y: 0.27 }, { x: 0.5, y: 0.3 }, { x: 0.54, y: 0.27 }]
    ],
    color: '#4169E1'
  },
  cat: {
    name: 'a cat',
    strokes: [
      // Body (oval)
      Array.from({ length: 24 }, (_, i) => ({
        x: 0.5 + Math.cos(i * Math.PI / 12) * 0.2,
        y: 0.6 + Math.sin(i * Math.PI / 12) * 0.12
      })),
      // Head
      Array.from({ length: 20 }, (_, i) => ({
        x: 0.3 + Math.cos(i * Math.PI / 10) * 0.1,
        y: 0.45 + Math.sin(i * Math.PI / 10) * 0.1
      })),
      // Left ear
      [{ x: 0.22, y: 0.4 }, { x: 0.25, y: 0.3 }, { x: 0.3, y: 0.38 }],
      // Right ear
      [{ x: 0.3, y: 0.38 }, { x: 0.35, y: 0.3 }, { x: 0.38, y: 0.4 }],
      // Tail
      [{ x: 0.7, y: 0.55 }, { x: 0.8, y: 0.45 }, { x: 0.85, y: 0.5 }],
      // Eyes
      [{ x: 0.26, y: 0.43 }, { x: 0.27, y: 0.44 }],
      [{ x: 0.33, y: 0.43 }, { x: 0.34, y: 0.44 }],
      // Whiskers
      [{ x: 0.2, y: 0.48 }, { x: 0.28, y: 0.5 }],
      [{ x: 0.32, y: 0.5 }, { x: 0.4, y: 0.48 }]
    ],
    color: '#FFA500'
  },
  heart: {
    name: 'a heart',
    strokes: [
      Array.from({ length: 40 }, (_, i) => {
        const t = (i / 40) * Math.PI * 2
        const x = 0.5 + 0.15 * Math.pow(Math.sin(t), 3)
        const y = 0.5 - 0.12 * (Math.cos(t) - 0.5 * Math.cos(2 * t) - 0.25 * Math.cos(3 * t) - 0.125 * Math.cos(4 * t))
        return { x, y }
      })
    ],
    color: '#FF1493'
  },
  rainbow: {
    name: 'a rainbow',
    strokes: [
      // Red arc
      Array.from({ length: 30 }, (_, i) => ({
        x: 0.2 + (i / 30) * 0.6,
        y: 0.7 - Math.sin((i / 30) * Math.PI) * 0.35
      })),
      // Orange arc
      Array.from({ length: 30 }, (_, i) => ({
        x: 0.22 + (i / 30) * 0.56,
        y: 0.7 - Math.sin((i / 30) * Math.PI) * 0.3
      })),
      // Yellow arc
      Array.from({ length: 30 }, (_, i) => ({
        x: 0.24 + (i / 30) * 0.52,
        y: 0.7 - Math.sin((i / 30) * Math.PI) * 0.25
      })),
      // Green arc
      Array.from({ length: 30 }, (_, i) => ({
        x: 0.26 + (i / 30) * 0.48,
        y: 0.7 - Math.sin((i / 30) * Math.PI) * 0.2
      })),
      // Blue arc
      Array.from({ length: 30 }, (_, i) => ({
        x: 0.28 + (i / 30) * 0.44,
        y: 0.7 - Math.sin((i / 30) * Math.PI) * 0.15
      }))
    ],
    colors: ['#FF0000', '#FFA500', '#FFFF00', '#00FF00', '#0000FF']
  },
  star: {
    name: 'a star',
    strokes: [
      Array.from({ length: 11 }, (_, i) => {
        const angle = (i * Math.PI * 2) / 10 - Math.PI / 2
        const radius = i % 2 === 0 ? 0.2 : 0.1
        return {
          x: 0.5 + Math.cos(angle) * radius,
          y: 0.45 + Math.sin(angle) * radius
        }
      })
    ],
    color: '#FFD700'
  }
}

const DrawingCanvas = forwardRef(function DrawingCanvas({ onDrawingStart, onDrawingEnd }, ref) {
  const canvasRef = useRef(null)
  const contextRef = useRef(null)
  const animationRef = useRef(null)
  const currentDrawingRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      const ctx = canvas.getContext('2d')
      ctx.scale(dpr, dpr)
      contextRef.current = ctx
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)
    return () => window.removeEventListener('resize', updateCanvasSize)
  }, [])

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = contextRef.current
    if (!canvas || !ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.clearRect(0, 0, rect.width, rect.height)
  }, [])

  const drawStroke = useCallback((points, color, lineWidth = 3) => {
    const ctx = contextRef.current
    const canvas = canvasRef.current
    if (!ctx || !canvas || points.length < 2) return

    const rect = canvas.getBoundingClientRect()
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    ctx.beginPath()
    ctx.moveTo(points[0].x * rect.width, points[0].y * rect.height)
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x * rect.width, points[i].y * rect.height)
    }
    ctx.stroke()
  }, [])

  const animateDrawing = useCallback((drawingKey, onComplete) => {
    const drawing = DRAWINGS[drawingKey]
    if (!drawing) return

    clearCanvas()
    if (onDrawingStart) onDrawingStart()

    currentDrawingRef.current = {
      name: drawing.name,
      key: drawingKey
    }

    let strokeIndex = 0
    let pointIndex = 0
    const strokes = drawing.strokes
    const colors = drawing.colors || [drawing.color]

    const animate = () => {
      if (strokeIndex >= strokes.length) {
        if (onDrawingEnd) onDrawingEnd(drawing.name)
        if (onComplete) onComplete()
        return
      }

      const stroke = strokes[strokeIndex]
      const color = colors[strokeIndex % colors.length]

      if (pointIndex < stroke.length - 1) {
        // Draw segment
        const segment = stroke.slice(0, pointIndex + 2)

        // Redraw all previous strokes
        clearCanvas()
        for (let i = 0; i < strokeIndex; i++) {
          drawStroke(strokes[i], colors[i % colors.length])
        }
        // Draw current stroke progress
        drawStroke(segment, color)

        pointIndex++
        animationRef.current = requestAnimationFrame(animate)
      } else {
        // Finished this stroke, move to next
        strokeIndex++
        pointIndex = 0
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }, [clearCanvas, drawStroke, onDrawingStart, onDrawingEnd])

  const drawRandom = useCallback(() => {
    const keys = Object.keys(DRAWINGS)
    const randomKey = keys[Math.floor(Math.random() * keys.length)]
    return new Promise((resolve) => {
      animateDrawing(randomKey, resolve)
    })
  }, [animateDrawing])

  const getCanvasImage = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return null
    return canvas.toDataURL('image/png')
  }, [])

  useImperativeHandle(ref, () => ({
    drawRandom,
    clearCanvas,
    getCanvasImage,
    getCurrentDrawing: () => currentDrawingRef.current
  }), [drawRandom, clearCanvas, getCanvasImage])

  return (
    <div className="drawing-canvas-container">
      <canvas ref={canvasRef} className="drawing-canvas" />
      <div className="canvas-frame" />
    </div>
  )
})

export default DrawingCanvas
