import { useState, useCallback, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { FirebaseProvider, useFirebase } from './contexts/FirebaseContext'
import Scene3D from './components/Scene3D'
import Navigation from './components/Navigation'
import UserProfile from './components/UserProfile'
import Chat from './components/Chat/Chat'
import Home from './pages/Home'
import Gallery from './pages/Gallery'
import About from './pages/About'
import Community from './pages/Community'
import Admin from './pages/Admin'
import * as THREE from 'three'
import './App.css'

function AppContent({ userProfile, handleProfileChange }) {
  const location = useLocation()
  const isHomePage = location.pathname === '/'
  const { gallery } = useFirebase()
  const [drawingTexture, setDrawingTexture] = useState(null)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const textureLoader = useRef(new THREE.TextureLoader())

  // Load drawing texture for Camera.002 paper view
  useEffect(() => {
    if (location.pathname !== '/gallery' || gallery.length === 0) {
      setDrawingTexture(null)
      return
    }
    const drawing = gallery[galleryIndex % gallery.length]
    if (drawing?.image) {
      textureLoader.current.load(drawing.image, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace
        setDrawingTexture(tex)
      })
    }
  }, [location.pathname, gallery, galleryIndex])

  // Auto-cycle drawings on gallery page
  useEffect(() => {
    if (location.pathname !== '/gallery' || gallery.length <= 1) return
    const interval = setInterval(() => {
      setGalleryIndex(prev => (prev + 1) % gallery.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [location.pathname, gallery.length])

  return (
    <div className="app-container">

      {/* Fullscreen 3D Background - ALL pages */}
      <div className="scene-background">
        <Scene3D
          activeCamera={location.pathname}
          drawingTexture={location.pathname === '/gallery' ? drawingTexture : null}
        />
      </div>

      {/* Title - Top left */}
      <h1 className="app-title">Sam Universe</h1>

      {/* Profile - Top right */}
      <div className="profile-button">
        <UserProfile onProfileChange={handleProfileChange} />
      </div>

      {/* Navigation - Center top */}
      <nav className="navigation-bar">
        <Navigation />
      </nav>

      {/* Page content overlay */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={
            <Gallery
              galleryIndex={galleryIndex}
              totalDrawings={gallery.length}
              onSelectDrawing={(i) => setGalleryIndex(i)}
            />
          } />
          <Route path="/about" element={<About />} />
          <Route path="/community" element={<Community />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>

      {/* Chat - Bottom left - Home only */}
      {isHomePage && (
        <div className="chat-box">
          <Chat userProfile={userProfile} />
        </div>
      )}

    </div>
  )
}

export default function App() {
  const [userProfile, setUserProfile] = useState({ username: '', avatar: null })

  const handleProfileChange = useCallback((profile) => {
    setUserProfile(profile)
  }, [])

  return (
    <FirebaseProvider>
      <BrowserRouter>
        <AppContent userProfile={userProfile} handleProfileChange={handleProfileChange} />
      </BrowserRouter>
    </FirebaseProvider>
  )
}
