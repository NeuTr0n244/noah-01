import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

const app = express()
app.use(cors())

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://127.0.0.1:5173', 'http://127.0.0.1:5175'],
    methods: ['GET', 'POST']
  }
})

// Server state
const state = {
  timer: {
    startedAt: Date.now(),
    duration: 60,
    isDrawing: false
  },
  currentDrawing: null,
  gallery: [],
  chat: [],
  usedImages: new Set(),  // Track images already shown
  artCounter: 0           // Persistent counter for unique numbering
}

// All drawings
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
  '/drawings/431955144_420027017238472_7514857057984618265_n.jpg'
]

// Get next unique drawing (no repeats until all images shown)
const getNextDrawing = () => {
  // If all images have been used, reset the tracking
  if (state.usedImages.size >= NOAH_DRAWINGS.length) {
    console.log('All images shown, resetting used images tracker')
    state.usedImages.clear()
  }

  // Filter out already used images
  const availableImages = NOAH_DRAWINGS.filter(img => !state.usedImages.has(img))

  // Pick a random image from available ones
  const randomIndex = Math.floor(Math.random() * availableImages.length)
  const selectedImage = availableImages[randomIndex]

  // Mark as used
  state.usedImages.add(selectedImage)

  console.log(`Selected image: ${selectedImage} (${state.usedImages.size}/${NOAH_DRAWINGS.length} used)`)

  return selectedImage
}

// Timer interval
let timerInterval = null
let drawingInProgress = false

const startTimerLoop = () => {
  if (timerInterval) return

  timerInterval = setInterval(() => {
    if (state.timer.isDrawing || drawingInProgress) return

    const elapsed = Math.floor((Date.now() - state.timer.startedAt) / 1000)
    const remaining = state.timer.duration - elapsed

    if (remaining <= 0) {
      startDrawing()
    }

    // Broadcast timer state every second
    io.emit('timer:update', state.timer)
  }, 1000)
}

// Start drawing
const startDrawing = async () => {
  if (drawingInProgress) return
  drawingInProgress = true

  state.timer.isDrawing = true
  io.emit('timer:update', state.timer)
  io.emit('drawing:start')

  // Simulate drawing time
  const drawingTime = 3000 + Math.random() * 2000

  setTimeout(() => {
    // Get next unique drawing
    const newDrawing = getNextDrawing()
    state.currentDrawing = newDrawing

    // Increment the persistent counter for unique numbering
    state.artCounter++

    // Add to gallery with unique sequential number
    const galleryItem = {
      id: `art-${state.artCounter}-${Date.now()}`,
      image: newDrawing,
      name: `Noah's Art #${state.artCounter}`,
      timestamp: Date.now()
    }

    // Check if this exact item already exists (by artCounter number)
    const isDuplicate = state.gallery.some(item => item.name === galleryItem.name)
    if (!isDuplicate) {
      state.gallery.unshift(galleryItem)
      if (state.gallery.length > 20) {
        state.gallery = state.gallery.slice(0, 20)
      }
      console.log(`Added to gallery: ${galleryItem.name}`)
    } else {
      console.log(`Duplicate prevented: ${galleryItem.name}`)
    }

    io.emit('drawing:update', state.currentDrawing)
    io.emit('gallery:update', state.gallery)
    io.emit('drawing:complete')

    // Reset timer after a short delay
    setTimeout(() => {
      state.timer = {
        startedAt: Date.now(),
        duration: 60,
        isDrawing: false
      }
      drawingInProgress = false
      io.emit('timer:update', state.timer)
    }, 2000)
  }, drawingTime)
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  // Send current state to new client
  socket.emit('state:init', {
    timer: state.timer,
    currentDrawing: state.currentDrawing,
    gallery: state.gallery,
    chat: state.chat.slice(-50)
  })

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
    console.log('Client disconnected:', socket.id)
  })
})

const PORT = process.env.PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on http://localhost:${PORT}`)
  startTimerLoop()
})
