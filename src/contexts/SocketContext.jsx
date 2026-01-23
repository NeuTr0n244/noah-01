import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'

const SocketContext = createContext(null)

const SOCKET_URL = 'http://localhost:3001'
const MAX_RETRY_ATTEMPTS = 5
const RETRY_DELAY = 3000
const TIMER_DURATION = 60
const CONNECTION_TIMEOUT = 15000

// Local drawings fallback
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
  // Connection state
  const [connectionStatus, setConnectionStatus] = useState('connecting') // 'connecting', 'connected', 'failed', 'offline'
  const [retryCount, setRetryCount] = useState(0)
  const [showConnectedMessage, setShowConnectedMessage] = useState(false)

  // App state
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentDrawing, setCurrentDrawing] = useState(null)
  const [gallery, setGallery] = useState([])

  // Refs
  const socketRef = useRef(null)
  const timerIntervalRef = useRef(null)
  const localTimerRef = useRef(null)
  const noahActionsRef = useRef(null)
  const usedImagesRef = useRef(new Set())
  const artCounterRef = useRef(0)
  const isOfflineMode = useRef(false)

  // Load saved state from localStorage
  useEffect(() => {
    try {
      const savedGallery = localStorage.getItem('noah_gallery')
      const savedCounter = localStorage.getItem('noah_art_counter')
      const savedUsedImages = localStorage.getItem('noah_used_images')

      if (savedGallery) {
        setGallery(JSON.parse(savedGallery))
      }
      if (savedCounter) {
        artCounterRef.current = parseInt(savedCounter, 10)
      }
      if (savedUsedImages) {
        usedImagesRef.current = new Set(JSON.parse(savedUsedImages))
      }
      console.log('[Socket] Loaded saved state from localStorage')
    } catch (e) {
      console.log('[Socket] No saved state found')
    }
  }, [])

  // Save state to localStorage
  const saveToLocalStorage = useCallback((newGallery) => {
    try {
      localStorage.setItem('noah_gallery', JSON.stringify(newGallery))
      localStorage.setItem('noah_art_counter', artCounterRef.current.toString())
      localStorage.setItem('noah_used_images', JSON.stringify([...usedImagesRef.current]))
    } catch (e) {
      console.error('[Socket] Failed to save to localStorage:', e)
    }
  }, [])

  // Get next local drawing (no repeats)
  const getNextLocalDrawing = useCallback(() => {
    if (usedImagesRef.current.size >= LOCAL_DRAWINGS.length) {
      console.log('[Local] All images shown, resetting')
      usedImagesRef.current.clear()
    }

    const available = LOCAL_DRAWINGS.filter(img => !usedImagesRef.current.has(img))
    const selected = available[Math.floor(Math.random() * available.length)]
    usedImagesRef.current.add(selected)

    return selected
  }, [])

  // Local drawing cycle (offline mode)
  const doLocalDrawing = useCallback(() => {
    console.log('[Local] Starting local drawing...')
    setIsDrawing(true)

    if (noahActionsRef.current?.startDrawing) {
      noahActionsRef.current.startDrawing()
    }

    // Simulate drawing time
    setTimeout(() => {
      const newDrawing = getNextLocalDrawing()
      artCounterRef.current++

      setCurrentDrawing(newDrawing)

      const galleryItem = {
        id: `local-${artCounterRef.current}-${Date.now()}`,
        image: newDrawing,
        name: `Noah's Art #${artCounterRef.current}`,
        timestamp: Date.now()
      }

      setGallery(prev => {
        const newGallery = [galleryItem, ...prev].slice(0, 20)
        saveToLocalStorage(newGallery)
        return newGallery
      })

      setIsDrawing(false)

      if (noahActionsRef.current?.stopDrawing) {
        noahActionsRef.current.stopDrawing()
      }
      if (noahActionsRef.current?.celebrate) {
        noahActionsRef.current.celebrate()
      }

      console.log('[Local] Drawing complete:', galleryItem.name)
    }, 3000 + Math.random() * 2000)
  }, [getNextLocalDrawing, saveToLocalStorage])

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

    // Clean up existing socket
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

      // Immediately update status
      setConnectionStatus('connected')
      setRetryCount(0)

      // Stop local timer if running
      stopLocalTimer()
      isOfflineMode.current = false

      // Show connected message briefly
      setShowConnectedMessage(true)
      setTimeout(() => {
        setShowConnectedMessage(false)
      }, 2000)
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

      if (state.gallery && state.gallery.length > 0) {
        setGallery(state.gallery)
        // Update local counter to match server
        const maxNum = state.gallery.reduce((max, item) => {
          const match = item.name.match(/#(\d+)/)
          return match ? Math.max(max, parseInt(match[1], 10)) : max
        }, 0)
        artCounterRef.current = maxNum
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
      // Update local counter
      const maxNum = galleryData.reduce((max, item) => {
        const match = item.name.match(/#(\d+)/)
        return match ? Math.max(max, parseInt(match[1], 10)) : max
      }, 0)
      artCounterRef.current = maxNum
      saveToLocalStorage(galleryData)
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
          return newCount
        }

        return newCount
      })
    })

    return socket
  }, [connectionStatus, stopLocalTimer, startLocalTimer, saveToLocalStorage])

  // Manual retry
  const retry = useCallback(() => {
    console.log('[Socket] Manual retry requested')
    setRetryCount(0)
    stopLocalTimer()
    connectToServer()
  }, [connectToServer, stopLocalTimer])

  // Initialize connection
  useEffect(() => {
    console.log('[Socket] Initializing connection...')
    const socket = connectToServer()

    // Fallback: if not connected after timeout, start local timer
    const fallbackTimeout = setTimeout(() => {
      // Check the actual socket connection state, not React state
      if (!socketRef.current?.connected && !localTimerRef.current) {
        console.log('[Socket] Connection timeout, starting local timer as fallback')
        setConnectionStatus('offline')
        startLocalTimer()
      }
    }, CONNECTION_TIMEOUT)

    return () => {
      clearTimeout(fallbackTimeout)
      if (socket) {
        socket.disconnect()
      }
      stopLocalTimer()
    }
  }, []) // Only run once on mount

  // Register Noah 3D actions
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
    retry,
    isOfflineMode: isOfflineMode.current
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
