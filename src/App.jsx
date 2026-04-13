import { useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { FirebaseProvider } from './contexts/FirebaseContext'
import Scene3D from './components/Scene3D'
import Navigation from './components/Navigation'
import UserProfile from './components/UserProfile'
import Chat from './components/Chat/Chat'
import Home from './pages/Home'
import Drawing from './pages/Drawing'
import Gallery from './pages/Gallery'
import About from './pages/About'
import Admin from './pages/Admin'
import './App.css'

function AppContent({ userProfile, handleProfileChange }) {
  const location = useLocation()

  return (
    <div className="app-container">

      {/* Fullscreen 3D Background - ALL pages */}
      <div className="scene-background">
        <Scene3D activeCamera={location.pathname} />
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
          <Route path="/drawing" element={<Drawing />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>

      {/* Chat - ALL pages */}
      <div className="chat-box">
        <Chat userProfile={userProfile} />
      </div>

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
