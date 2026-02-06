import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'

const SocketContext = createContext(null)

// Use environment variable or fallback to localhost for development
const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'
const MAX_RETRY_ATTEMPTS = 5
const TIMER_DURATION = 60
const CONNECTION_TIMEOUT = 15000
const TOTAL_DRAWINGS = 84

// Local drawings fallback - SEQUENTIAL ORDER (same as server)
const LOCAL_DRAWINGS = [
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

export function SocketProvider({ children }) {
  const [connectionStatus, setConnectionStatus] = useState('connecting')
  const [retryCount, setRetryCount] = useState(0)
  const [showConnectedMessage, setShowConnectedMessage] = useState(false)
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentDrawing, setCurrentDrawing] = useState(null)
  const [gallery, setGallery] = useState([])

  const socketRef = useRef(null)
  const localTimerRef = useRef(null)
  const noahActionsRef = useRef(null)
  const currentIndexRef = useRef(0)  // Sequential index (0-14 for local, 0-83 for server)
  const isOfflineMode = useRef(false)

  // Local drawing cycle (offline mode) - SEQUENTIAL
  const doLocalDrawing = useCallback(() => {
    console.log('[Local] Starting drawing...')
    console.log(`[Local] Current index: ${currentIndexRef.current}`)
    setIsDrawing(true)

    if (noahActionsRef.current?.startDrawing) {
      noahActionsRef.current.startDrawing()
    }

    setTimeout(() => {
      // Get drawing by INDEX (sequential)
      const newDrawing = LOCAL_DRAWINGS[currentIndexRef.current]
      const drawingNumber = currentIndexRef.current + 1

      console.log(`[Local] Selected: Drawing #${drawingNumber}`)
      setCurrentDrawing(newDrawing)

      const galleryItem = {
        id: `drawing-${drawingNumber}`,
        image: newDrawing,
        name: `Sam's Art #${drawingNumber}`,
        timestamp: Date.now()
      }

      setGallery(prev => {
        // Check for duplicate
        if (prev.some(item => item.id === galleryItem.id)) {
          console.log(`[Local] Drawing #${drawingNumber} already exists, skipping`)
          return prev
        }
        const newGallery = [galleryItem, ...prev]
        console.log(`[Local] Added Drawing #${drawingNumber} to gallery`)
        return newGallery
      })

      // Advance to next index (sequential, wraps around)
      currentIndexRef.current = (currentIndexRef.current + 1) % LOCAL_DRAWINGS.length
      console.log(`[Local] Next index: ${currentIndexRef.current}`)

      setIsDrawing(false)

      if (noahActionsRef.current?.stopDrawing) {
        noahActionsRef.current.stopDrawing()
      }
      if (noahActionsRef.current?.celebrate) {
        noahActionsRef.current.celebrate()
      }
    }, 3000 + Math.random() * 2000)
  }, [])

  // Start local timer (offline mode)
  const startLocalTimer = useCallback(() => {
    if (localTimerRef.current) return

    console.log('[Local] Starting local timer')
    isOfflineMode.current = true
    let timeRemaining = TIMER_DURATION
    setTimeLeft(timeRemaining)

    localTimerRef.current = setInterval(() => {
      timeRemaining--
      setTimeLeft(timeRemaining)

      if (timeRemaining <= 0) {
        doLocalDrawing()
        timeRemaining = TIMER_DURATION
        setTimeLeft(timeRemaining)
      }
    }, 1000)
  }, [doLocalDrawing])

  // Stop local timer
  const stopLocalTimer = useCallback(() => {
    if (localTimerRef.current) {
      clearInterval(localTimerRef.current)
      localTimerRef.current = null
      isOfflineMode.current = false
      console.log('[Local] Stopped local timer')
    }
  }, [])

  // Connect to server
  const connectToServer = useCallback(() => {
    console.log('[Socket] Attempting to connect...')
    setConnectionStatus('connecting')

    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      timeout: 10000
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('[Socket] Connected successfully!')
      setConnectionStatus('connected')
      setRetryCount(0)
      stopLocalTimer()
      isOfflineMode.current = false
      setShowConnectedMessage(true)
      setTimeout(() => setShowConnectedMessage(false), 2000)
    })

    socket.on('state:init', (state) => {
      console.log('[Socket] Received initial state:', state)

      if (state.timer) {
        const elapsed = Math.floor((Date.now() - state.timer.startedAt) / 1000)
        const remaining = Math.max(0, state.timer.duration - elapsed)
        setTimeLeft(remaining)
        setIsDrawing(state.timer.isDrawing || false)
      }

      if (state.currentDrawing) {
        setCurrentDrawing(state.currentDrawing)
      }

      if (state.gallery) {
        setGallery(state.gallery)
      }
    })

    socket.on('timer:update', (timerData) => {
      if (!isOfflineMode.current) {
        const elapsed = Math.floor((Date.now() - timerData.startedAt) / 1000)
        const remaining = Math.max(0, timerData.duration - elapsed)
        setTimeLeft(remaining)
        setIsDrawing(timerData.isDrawing || false)
      }
    })

    socket.on('drawing:update', (drawing) => {
      setCurrentDrawing(drawing)
    })

    socket.on('drawing:start', () => {
      setIsDrawing(true)
      if (noahActionsRef.current?.startDrawing) {
        noahActionsRef.current.startDrawing()
      }
    })

    socket.on('drawing:complete', () => {
      if (noahActionsRef.current?.stopDrawing) {
        noahActionsRef.current.stopDrawing()
      }
      if (noahActionsRef.current?.celebrate) {
        noahActionsRef.current.celebrate()
      }
    })

    socket.on('gallery:update', (galleryData) => {
      setGallery(galleryData)
    })

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected')
      if (connectionStatus === 'connected') {
        setConnectionStatus('connecting')
      }
    })

    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message)
      setRetryCount(prev => {
        const newCount = prev + 1
        console.log(`[Socket] Retry attempt ${newCount}/${MAX_RETRY_ATTEMPTS}`)
        if (newCount >= MAX_RETRY_ATTEMPTS) {
          console.log('[Socket] Max retries reached, switching to offline mode')
          setConnectionStatus('failed')
          startLocalTimer()
        }
        return newCount
      })
    })

    return socket
  }, [connectionStatus, stopLocalTimer, startLocalTimer])

  // Manual retry
  const retry = useCallback(() => {
    console.log('[Socket] Manual retry requested')
    setRetryCount(0)
    stopLocalTimer()
    connectToServer()
  }, [connectToServer, stopLocalTimer])

  // Initialize connection
  useEffect(() => {
    console.log('[Socket] Initializing...')
    const socket = connectToServer()

    const fallbackTimeout = setTimeout(() => {
      if (!socketRef.current?.connected && !localTimerRef.current) {
        console.log('[Socket] Connection timeout, starting local timer')
        setConnectionStatus('offline')
        startLocalTimer()
      }
    }, CONNECTION_TIMEOUT)

    return () => {
      clearTimeout(fallbackTimeout)
      if (socket) socket.disconnect()
      stopLocalTimer()
    }
  }, [])

  const registerNoahActions = useCallback((actions) => {
    noahActionsRef.current = actions
  }, [])

  const value = {
    connectionStatus,
    showConnectedMessage,
    retryCount,
    timeLeft,
    isDrawing,
    currentDrawing,
    gallery,
    registerNoahActions,
    retry
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}
