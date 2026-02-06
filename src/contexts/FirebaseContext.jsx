import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from 'firebase/firestore'
import { db } from '../firebase'

const FirebaseContext = createContext(null)

const TIMER_DURATION = 60

export function FirebaseProvider({ children }) {
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentDrawing, setCurrentDrawing] = useState(null)
  const [gallery, setGallery] = useState([])
  const [messages, setMessages] = useState([])
  const [timerSettings, setTimerSettings] = useState(null)

  const timerRef = useRef(null)
  const galleryRef = useRef([])

  // Listen to global timer settings
  useEffect(() => {
    const timerDocRef = doc(db, 'settings', 'timer')

    const unsubscribe = onSnapshot(timerDocRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data()
        setTimerSettings(data)
      } else {
        // Initialize timer document if it doesn't exist
        const initialSettings = {
          currentDrawingIndex: 0,
          nextChangeAt: Date.now() + TIMER_DURATION * 1000,
          timerDuration: TIMER_DURATION
        }
        await setDoc(timerDocRef, initialSettings)
        setTimerSettings(initialSettings)

        // Mark the first drawing as revealed
        if (galleryRef.current.length > 0 && galleryRef.current[0]) {
          try {
            await updateDoc(doc(db, 'drawings', galleryRef.current[0].id), {
              revealed: true
            })
          } catch (error) {
            console.error('Error marking first drawing as revealed:', error)
          }
        }
      }
    })

    return () => unsubscribe()
  }, [])

  // Listen to all drawings for gallery in real-time (ordered by order ASC for cycling)
  useEffect(() => {
    const galleryQuery = query(
      collection(db, 'drawings'),
      orderBy('order', 'asc')
    )

    const unsubscribe = onSnapshot(galleryQuery, (snapshot) => {
      const drawings = snapshot.docs.map(doc => ({
        id: doc.id,
        image: doc.data().imageUrl,
        name: doc.data().title,
        order: doc.data().order || 0,
        timestamp: doc.data().createdAt?.toMillis() || Date.now()
      }))
      setGallery(drawings)
      galleryRef.current = drawings
    })

    return () => unsubscribe()
  }, [])

  // Set current drawing based on timer settings and gallery
  useEffect(() => {
    if (timerSettings && galleryRef.current.length > 0) {
      const index = timerSettings.currentDrawingIndex % galleryRef.current.length
      const drawing = galleryRef.current[index]
      if (drawing) {
        setCurrentDrawing(drawing.image)
      }
    }
  }, [timerSettings, gallery])

  // Listen to chat messages in real-time
  useEffect(() => {
    const messagesQuery = query(
      collection(db, 'messages'),
      orderBy('createdAt', 'asc')
    )

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().createdAt?.toMillis() || Date.now()
      }))
      setMessages(msgs)
    })

    return () => unsubscribe()
  }, [])

  // Send chat message to Firestore
  const sendMessage = useCallback(async (messageData) => {
    try {
      await addDoc(collection(db, 'messages'), {
        text: messageData.text,
        username: messageData.username,
        userColor: messageData.color,
        avatar: messageData.avatar || null,
        createdAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }, [])

  // Timer countdown logic (synced with Firestore)
  useEffect(() => {
    if (!timerSettings) return

    const updateTimer = () => {
      const now = Date.now()
      const remaining = Math.max(0, Math.ceil((timerSettings.nextChangeAt - now) / 1000))
      setTimeLeft(remaining)

      // If timer has expired, advance to next drawing
      if (remaining <= 0 && galleryRef.current.length > 0) {
        advanceToNextDrawing()
      }
    }

    // Update immediately
    updateTimer()

    // Update every second
    timerRef.current = setInterval(updateTimer, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [timerSettings])

  // Advance to next drawing (only one client will succeed due to Firestore transactions)
  const advanceToNextDrawing = async () => {
    try {
      const timerDocRef = doc(db, 'settings', 'timer')
      const docSnap = await getDoc(timerDocRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        const now = Date.now()

        // Only update if we're still past the deadline (prevents race conditions)
        if (now >= data.nextChangeAt) {
          const nextIndex = (data.currentDrawingIndex + 1) % Math.max(1, galleryRef.current.length)

          // Update timer
          await updateDoc(timerDocRef, {
            currentDrawingIndex: nextIndex,
            nextChangeAt: now + (data.timerDuration * 1000)
          })

          // Mark the NEW current drawing as revealed
          if (galleryRef.current[nextIndex]) {
            const drawingId = galleryRef.current[nextIndex].id
            await updateDoc(doc(db, 'drawings', drawingId), {
              revealed: true
            })
          }
        }
      }
    } catch (error) {
      console.error('Error advancing drawing:', error)
    }
  }

  const value = {
    timeLeft,
    isDrawing,
    currentDrawing,
    gallery,
    messages,
    sendMessage
  }

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  )
}

export function useFirebase() {
  const context = useContext(FirebaseContext)
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider')
  }
  return context
}
