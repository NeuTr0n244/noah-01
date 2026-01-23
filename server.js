import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

const app = express()
app.use(cors())

// Health check endpoint for Railway
app.get('/', (req, res) => {
  res.json({ status: 'Noah Universe Server Running', drawings: 84 })
})

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: '*',  // Allow all origins (Vercel, localhost, etc.)
    methods: ['GET', 'POST']
  }
})

// All 84 drawings in SEQUENTIAL ORDER (1, 2, 3... 84)
const NOAH_DRAWINGS = [
  '/drawings/364183754_1317346842542997_5702108762867635901_n.jpg',
  '/drawings/364949346_957302068900963_5824655554871862488_n.jpg',
  '/drawings/367366632_2007934066222844_7947284210494358503_n.jpg',
  '/drawings/367402463_852076779582980_1267333438111828223_n.jpg',
  '/drawings/372948587_522064510109639_478844459910408958_n.jpg',
  '/drawings/375471716_993437268542223_2356930779863568285_n.jpg',
  '/drawings/394608124_348871510855609_1992177579794570735_n.jpg',
  '/drawings/399296558_885087486467542_8601047327234945538_n.jpg',
  '/drawings/399502768_319729967580697_3994306269288094739_n.jpg',
  '/drawings/420512380_389882920390571_1633079269174249461_n.jpg',
  '/drawings/420886450_917739009967369_9153685649559450829_n.jpg',
  '/drawings/426575603_809840924473863_8859073096897492192_n.jpg',
  '/drawings/429380384_1850952328676266_4612683722016969560_n.jpg',
  '/drawings/431946391_922832779389563_4118730796992917665_n.jpg',
  '/drawings/431955144_420027017238472_7514857057984618265_n.jpg',
  '/drawings/Captura de tela 2026-01-23 171042.png',
  '/drawings/Captura de tela 2026-01-23 171053.png',
  '/drawings/Captura de tela 2026-01-23 171058.png',
  '/drawings/Captura de tela 2026-01-23 171102.png',
  '/drawings/Captura de tela 2026-01-23 171113.png',
  '/drawings/Captura de tela 2026-01-23 171118.png',
  '/drawings/Captura de tela 2026-01-23 171123.png',
  '/drawings/Captura de tela 2026-01-23 171128.png',
  '/drawings/Captura de tela 2026-01-23 171131.png',
  '/drawings/Captura de tela 2026-01-23 171138.png',
  '/drawings/Captura de tela 2026-01-23 171142.png',
  '/drawings/Captura de tela 2026-01-23 171146.png',
  '/drawings/Captura de tela 2026-01-23 171150.png',
  '/drawings/Captura de tela 2026-01-23 171157.png',
  '/drawings/Captura de tela 2026-01-23 171201.png',
  '/drawings/Captura de tela 2026-01-23 171206.png',
  '/drawings/Captura de tela 2026-01-23 171210.png',
  '/drawings/Captura de tela 2026-01-23 171215.png',
  '/drawings/Captura de tela 2026-01-23 171220.png',
  '/drawings/Captura de tela 2026-01-23 171223.png',
  '/drawings/Captura de tela 2026-01-23 171246.png',
  '/drawings/Captura de tela 2026-01-23 171250.png',
  '/drawings/Captura de tela 2026-01-23 171254.png',
  '/drawings/Captura de tela 2026-01-23 171258.png',
  '/drawings/Captura de tela 2026-01-23 171303.png',
  '/drawings/Captura de tela 2026-01-23 171306.png',
  '/drawings/Captura de tela 2026-01-23 171312.png',
  '/drawings/Captura de tela 2026-01-23 171317.png',
  '/drawings/Captura de tela 2026-01-23 171321.png',
  '/drawings/Captura de tela 2026-01-23 171325.png',
  '/drawings/Captura de tela 2026-01-23 171335.png',
  '/drawings/Captura de tela 2026-01-23 171340.png',
  '/drawings/Captura de tela 2026-01-23 171343.png',
  '/drawings/Captura de tela 2026-01-23 171350.png',
  '/drawings/Captura de tela 2026-01-23 171354.png',
  '/drawings/Captura de tela 2026-01-23 171404.png',
  '/drawings/Captura de tela 2026-01-23 171407.png',
  '/drawings/Captura de tela 2026-01-23 171411.png',
  '/drawings/Captura de tela 2026-01-23 171415.png',
  '/drawings/Captura de tela 2026-01-23 171418.png',
  '/drawings/Captura de tela 2026-01-23 171422.png',
  '/drawings/Captura de tela 2026-01-23 171426.png',
  '/drawings/Captura de tela 2026-01-23 171430.png',
  '/drawings/Captura de tela 2026-01-23 171433.png',
  '/drawings/Captura de tela 2026-01-23 171441.png',
  '/drawings/Captura de tela 2026-01-23 171444.png',
  '/drawings/Captura de tela 2026-01-23 171448.png',
  '/drawings/Captura de tela 2026-01-23 171453.png',
  '/drawings/Captura de tela 2026-01-23 171456.png',
  '/drawings/Captura de tela 2026-01-23 171459.png',
  '/drawings/Captura de tela 2026-01-23 171503.png',
  '/drawings/Captura de tela 2026-01-23 171507.png',
  '/drawings/Captura de tela 2026-01-23 171511.png',
  '/drawings/Captura de tela 2026-01-23 171515.png',
  '/drawings/Captura de tela 2026-01-23 171519.png',
  '/drawings/Captura de tela 2026-01-23 171526.png',
  '/drawings/Captura de tela 2026-01-23 171529.png',
  '/drawings/Captura de tela 2026-01-23 171533.png',
  '/drawings/Captura de tela 2026-01-23 171537.png',
  '/drawings/Captura de tela 2026-01-23 171543.png',
  '/drawings/Captura de tela 2026-01-23 171546.png',
  '/drawings/Captura de tela 2026-01-23 171551.png',
  '/drawings/Captura de tela 2026-01-23 171555.png',
  '/drawings/Captura de tela 2026-01-23 171600.png',
  '/drawings/Captura de tela 2026-01-23 171611.png',
  '/drawings/Captura de tela 2026-01-23 171620.png',
  '/drawings/Captura de tela 2026-01-23 171623.png',
  '/drawings/Captura de tela 2026-01-23 171628.png',
  '/drawings/Captura de tela 2026-01-23 171635.png'
]

const TOTAL_DRAWINGS = NOAH_DRAWINGS.length // 84

// Server state - SIMPLE SEQUENTIAL COUNTER
const state = {
  currentImageIndex: 0,  // Goes 0, 1, 2, 3... 83, then back to 0
  timer: {
    startedAt: Date.now(),
    duration: 60,
    isDrawing: false
  },
  currentDrawing: null,      // Drawing currently shown in "My Drawing" frame
  previousDrawing: null,     // Previous drawing (will go to gallery when replaced)
  previousDrawingNumber: 0,  // Number of the previous drawing
  gallery: [],               // Only contains drawings that LEFT the main frame
  chat: []
}

console.log(`[Server] Total drawings: ${TOTAL_DRAWINGS}`)
console.log(`[Server] Starting at index: ${state.currentImageIndex}`)

// Timer interval
let timerInterval = null
let drawingInProgress = false

const startTimerLoop = () => {
  if (timerInterval) return

  console.log('[Server] Timer loop started')

  timerInterval = setInterval(() => {
    if (state.timer.isDrawing || drawingInProgress) return

    const elapsed = Math.floor((Date.now() - state.timer.startedAt) / 1000)
    const remaining = state.timer.duration - elapsed

    if (remaining <= 0) {
      startDrawing()
    }

    io.emit('timer:update', state.timer)
  }, 1000)
}

// Start drawing - SEQUENTIAL, NO RANDOM
const startDrawing = async () => {
  if (drawingInProgress) return
  drawingInProgress = true

  console.log(`[Drawing] Starting drawing process...`)
  console.log(`[Drawing] Current index: ${state.currentImageIndex}`)

  state.timer.isDrawing = true
  io.emit('timer:update', state.timer)
  io.emit('drawing:start')

  // Simulate drawing time (3-5 seconds)
  const drawingTime = 3000 + Math.random() * 2000

  setTimeout(() => {
    // FIRST: Move the PREVIOUS drawing to gallery (if exists)
    if (state.previousDrawing) {
      const galleryItem = {
        id: `drawing-${state.previousDrawingNumber}`,
        image: state.previousDrawing,
        name: `Noah's Art #${state.previousDrawingNumber}`,
        timestamp: Date.now()
      }

      // Check if this drawing is already in gallery (by ID)
      const alreadyExists = state.gallery.some(item => item.id === galleryItem.id)

      if (alreadyExists) {
        console.log(`[Gallery] Drawing #${state.previousDrawingNumber} already exists, NOT adding duplicate`)
      } else {
        // Add previous drawing to gallery (it's leaving the main frame)
        state.gallery.unshift(galleryItem)
        console.log(`[Gallery] Drawing #${state.previousDrawingNumber} moved to gallery (left main frame)`)
        console.log(`[Gallery] Total items: ${state.gallery.length}`)

        // Keep only last 20 items
        if (state.gallery.length > 20) {
          state.gallery = state.gallery.slice(0, 20)
        }
      }
    }

    // THEN: Get the NEW drawing by INDEX (sequential)
    const newDrawing = NOAH_DRAWINGS[state.currentImageIndex]
    const drawingNumber = state.currentImageIndex + 1  // Human-readable (1-84)

    console.log(`[Drawing] NEW drawing: #${drawingNumber} (index ${state.currentImageIndex})`)
    console.log(`[Drawing] Image: ${newDrawing}`)

    // Save current as previous (for next time)
    state.previousDrawing = newDrawing
    state.previousDrawingNumber = drawingNumber

    // Update current drawing (shown in "My Drawing" frame)
    state.currentDrawing = newDrawing

    // ADVANCE TO NEXT INDEX (sequential, wraps around)
    state.currentImageIndex = (state.currentImageIndex + 1) % TOTAL_DRAWINGS
    console.log(`[Drawing] Next index will be: ${state.currentImageIndex}`)

    // Emit updates
    io.emit('drawing:update', state.currentDrawing)
    io.emit('gallery:update', state.gallery)
    io.emit('drawing:complete')

    // Reset timer after short delay
    setTimeout(() => {
      state.timer = {
        startedAt: Date.now(),
        duration: 60,
        isDrawing: false
      }
      drawingInProgress = false
      io.emit('timer:update', state.timer)
      console.log(`[Timer] Reset. Waiting 60 seconds for next drawing...`)
    }, 2000)
  }, drawingTime)
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`)

  // Send current state to new client
  socket.emit('state:init', {
    timer: state.timer,
    currentDrawing: state.currentDrawing,
    gallery: state.gallery,
    chat: state.chat.slice(-50)
  })

  console.log(`[Socket] Sent state to ${socket.id}: index=${state.currentImageIndex}, gallery=${state.gallery.length} items`)

  // Handle chat messages
  socket.on('chat:send', (message) => {
    const chatMessage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...message,
      timestamp: Date.now()
    }
    state.chat.push(chatMessage)
    if (state.chat.length > 100) {
      state.chat = state.chat.slice(-50)
    }
    io.emit('chat:message', chatMessage)
  })

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`)
  })
})

const PORT = process.env.PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`[Server] Socket.io server running on http://localhost:${PORT}`)
  console.log(`[Server] Total drawings available: ${TOTAL_DRAWINGS}`)
  console.log(`[Server] Starting from index: ${state.currentImageIndex}`)
  startTimerLoop()
})
