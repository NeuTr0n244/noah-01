import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set, get, push, onValue, serverTimestamp, runTransaction } from 'firebase/database'

// Firebase configuration
// IMPORTANTE: Substitua com suas credenciais do Firebase Console
// 1. Acesse https://console.firebase.google.com/
// 2. Crie um novo projeto ou use um existente
// 3. Vá em "Configurações do projeto" > "Seus aplicativos" > "Adicionar app web"
// 4. Copie as credenciais aqui
const firebaseConfig = {
  apiKey: "AIzaSyDemoKeyReplaceMeWithYourActualKey",
  authDomain: "noah-universe.firebaseapp.com",
  databaseURL: "https://noah-universe-default-rtdb.firebaseio.com",
  projectId: "noah-universe",
  storageBucket: "noah-universe.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const database = getDatabase(app)

// Database references
const timerRef = ref(database, 'timer')
const drawingRef = ref(database, 'currentDrawing')
const galleryRef = ref(database, 'gallery')
const chatRef = ref(database, 'chat')
const drawingQueueRef = ref(database, 'drawingQueue')
const stateRef = ref(database, 'state')

// Timer duration in seconds
const TIMER_DURATION = 60

// ============ TIMER FUNCTIONS ============

// Initialize or get timer state
export const initializeTimer = async () => {
  const snapshot = await get(timerRef)
  if (!snapshot.exists()) {
    // First time - set initial timer
    await set(timerRef, {
      startedAt: Date.now(),
      duration: TIMER_DURATION,
      isDrawing: false
    })
  }
  return snapshot.val()
}

// Get current time remaining
export const calculateTimeRemaining = (timerData) => {
  if (!timerData || timerData.isDrawing) return 0
  const elapsed = Math.floor((Date.now() - timerData.startedAt) / 1000)
  const remaining = timerData.duration - elapsed
  return Math.max(0, remaining)
}

// Reset timer after drawing completes
export const resetTimer = async () => {
  await set(timerRef, {
    startedAt: Date.now(),
    duration: TIMER_DURATION,
    isDrawing: false
  })
}

// Set drawing state
export const setDrawingState = async (isDrawing) => {
  const snapshot = await get(timerRef)
  const current = snapshot.val() || {}
  await set(timerRef, {
    ...current,
    isDrawing
  })
}

// Listen to timer changes
export const subscribeToTimer = (callback) => {
  return onValue(timerRef, (snapshot) => {
    callback(snapshot.val())
  })
}

// ============ DRAWING FUNCTIONS ============

// Set current drawing
export const setCurrentDrawing = async (drawingPath) => {
  await set(drawingRef, {
    path: drawingPath,
    timestamp: Date.now()
  })
}

// Get current drawing
export const getCurrentDrawing = async () => {
  const snapshot = await get(drawingRef)
  return snapshot.val()
}

// Listen to drawing changes
export const subscribeToDrawing = (callback) => {
  return onValue(drawingRef, (snapshot) => {
    callback(snapshot.val())
  })
}

// ============ GALLERY FUNCTIONS ============

// Add drawing to gallery
export const addToGallery = async (drawing) => {
  const newDrawingRef = push(galleryRef)
  await set(newDrawingRef, {
    ...drawing,
    id: newDrawingRef.key,
    timestamp: Date.now()
  })
}

// Get gallery
export const getGallery = async () => {
  const snapshot = await get(galleryRef)
  if (!snapshot.exists()) return []
  const data = snapshot.val()
  return Object.values(data).sort((a, b) => b.timestamp - a.timestamp).slice(0, 20)
}

// Listen to gallery changes
export const subscribeToGallery = (callback) => {
  return onValue(galleryRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([])
      return
    }
    const data = snapshot.val()
    const gallery = Object.values(data).sort((a, b) => b.timestamp - a.timestamp).slice(0, 20)
    callback(gallery)
  })
}

// ============ DRAWING QUEUE FUNCTIONS ============

// Get or create shuffled queue
export const getDrawingQueue = async (allDrawings) => {
  const snapshot = await get(drawingQueueRef)
  if (!snapshot.exists() || !snapshot.val().queue || snapshot.val().queue.length === 0) {
    // Create new shuffled queue
    const shuffled = shuffleArray([...allDrawings])
    await set(drawingQueueRef, { queue: shuffled })
    return shuffled
  }
  return snapshot.val().queue
}

// Pop from queue and update
export const popFromQueue = async (allDrawings) => {
  let result = null
  await runTransaction(drawingQueueRef, (current) => {
    if (!current || !current.queue || current.queue.length === 0) {
      // Create new shuffled queue
      const shuffled = shuffleArray([...allDrawings])
      result = shuffled.pop()
      return { queue: shuffled }
    }
    const queue = [...current.queue]
    result = queue.pop()
    return { queue }
  })
  return result
}

// Shuffle array (Fisher-Yates)
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

// ============ CHAT FUNCTIONS ============

// Send chat message
export const sendChatMessage = async (message) => {
  const newMessageRef = push(chatRef)
  await set(newMessageRef, {
    ...message,
    id: newMessageRef.key,
    timestamp: Date.now()
  })
}

// Get chat messages
export const getChatMessages = async () => {
  const snapshot = await get(chatRef)
  if (!snapshot.exists()) return []
  const data = snapshot.val()
  return Object.values(data).sort((a, b) => a.timestamp - b.timestamp).slice(-50)
}

// Listen to chat messages
export const subscribeToChatMessages = (callback) => {
  return onValue(chatRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([])
      return
    }
    const data = snapshot.val()
    const messages = Object.values(data).sort((a, b) => a.timestamp - b.timestamp).slice(-50)
    callback(messages)
  })
}

// ============ GLOBAL STATE ============

// Get global state (who is "master" controller)
export const getGlobalState = async () => {
  const snapshot = await get(stateRef)
  return snapshot.val()
}

// Try to become master (for timer control)
export const tryBecomeMaster = async (clientId) => {
  let becameMaster = false
  await runTransaction(stateRef, (current) => {
    const now = Date.now()
    // If no master or master is stale (>5 seconds), become master
    if (!current || !current.masterId || (now - current.lastHeartbeat > 5000)) {
      becameMaster = true
      return {
        masterId: clientId,
        lastHeartbeat: now
      }
    }
    // If we're already master, update heartbeat
    if (current.masterId === clientId) {
      becameMaster = true
      return {
        ...current,
        lastHeartbeat: now
      }
    }
    becameMaster = false
    return current
  })
  return becameMaster
}

// Subscribe to state changes
export const subscribeToState = (callback) => {
  return onValue(stateRef, (snapshot) => {
    callback(snapshot.val())
  })
}

export { database }
