import { useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { SocketProvider } from './contexts/SocketContext'
import Scene3D from './components/Scene3D'
import Navigation from './components/Navigation'
import UserProfile from './components/UserProfile'
import Timer from './components/Timer/Timer'
import Chat from './components/Chat/Chat'
import Home from './pages/Home'
import Gallery from './pages/Gallery'
import About from './pages/About'
import Community from './pages/Community'
import './App.css'

function AppContent({ userProfile, handleProfileChange }) {
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  return (
    <div className="app-container">

      {/* Fullscreen 3D Background - Home only */}
      {isHomePage && (
        <div className="scene-background">
          <Scene3D />
        </div>
      )}

      {/* Título - Topo esquerdo */}
      <h1 className="app-title">Sam Universe</h1>

      {/* Profile - Topo direito */}
      <div className="profile-button">
        <UserProfile onProfileChange={handleProfileChange} />
      </div>

      {/* Navegação - Centro topo */}
      <nav className="navigation-bar">
        <Navigation />
      </nav>

      {/* Conteúdo principal - Centro */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="about" element={<About />} />
          <Route path="community" element={<Community />} />
        </Routes>
      </main>

      {/* Chat - Canto inferior esquerdo - Home only */}
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
    <SocketProvider>
      <BrowserRouter>
        <AppContent userProfile={userProfile} handleProfileChange={handleProfileChange} />
      </BrowserRouter>
    </SocketProvider>
  )
}
