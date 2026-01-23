import { io } from 'socket.io-client'

// Socket.io client
const SOCKET_URL = 'http://localhost:3001'

let socket = null
let isConnected = false
let connectionCallbacks = []

// Initialize socket connection
export const initSocket = () => {
  if (socket) return socket

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  })

  socket.on('connect', () => {
    console.log('Connected to server')
    isConnected = true
    connectionCallbacks.forEach(cb => cb(true))
  })

  socket.on('disconnect', () => {
    console.log('Disconnected from server')
    isConnected = false
    connectionCallbacks.forEach(cb => cb(false))
  })

  socket.on('connect_error', (error) => {
    console.log('Connection error:', error.message)
    isConnected = false
    connectionCallbacks.forEach(cb => cb(false))
  })

  return socket
}

// Get socket instance
export const getSocket = () => {
  if (!socket) {
    return initSocket()
  }
  return socket
}

// Check if connected
export const getIsConnected = () => isConnected

// Subscribe to connection status
export const onConnectionChange = (callback) => {
  connectionCallbacks.push(callback)
  // Return unsubscribe function
  return () => {
    connectionCallbacks = connectionCallbacks.filter(cb => cb !== callback)
  }
}

// Subscribe to initial state
export const onStateInit = (callback) => {
  const s = getSocket()
  s.on('state:init', callback)
  return () => s.off('state:init', callback)
}

// Subscribe to timer updates
export const onTimerUpdate = (callback) => {
  const s = getSocket()
  s.on('timer:update', callback)
  return () => s.off('timer:update', callback)
}

// Subscribe to drawing updates
export const onDrawingUpdate = (callback) => {
  const s = getSocket()
  s.on('drawing:update', callback)
  return () => s.off('drawing:update', callback)
}

// Subscribe to drawing start
export const onDrawingStart = (callback) => {
  const s = getSocket()
  s.on('drawing:start', callback)
  return () => s.off('drawing:start', callback)
}

// Subscribe to drawing complete
export const onDrawingComplete = (callback) => {
  const s = getSocket()
  s.on('drawing:complete', callback)
  return () => s.off('drawing:complete', callback)
}

// Subscribe to gallery updates
export const onGalleryUpdate = (callback) => {
  const s = getSocket()
  s.on('gallery:update', callback)
  return () => s.off('gallery:update', callback)
}

// Subscribe to chat messages
export const onChatMessage = (callback) => {
  const s = getSocket()
  s.on('chat:message', callback)
  return () => s.off('chat:message', callback)
}

// Send chat message
export const sendChatMessage = (message) => {
  const s = getSocket()
  s.emit('chat:send', message)
}

// Calculate time remaining
export const calculateTimeRemaining = (timerData) => {
  if (!timerData || timerData.isDrawing) return 0
  const elapsed = Math.floor((Date.now() - timerData.startedAt) / 1000)
  const remaining = timerData.duration - elapsed
  return Math.max(0, remaining)
}
