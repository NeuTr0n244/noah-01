import { useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SocketProvider } from './contexts/SocketContext'
import Scene3D from './components/Scene3D'
import Navigation from './components/Navigation'
import UserProfile from './components/UserProfile'
import Chat from './components/Chat/Chat'
import Home from './pages/Home'
import About from './pages/About'
import Community from './pages/Community'
import './App.css'

export default function App() {
  const [userProfile, setUserProfile] = useState({ username: '', avatar: null })

  const handleProfileChange = useCallback((profile) => {
    setUserProfile(profile)
  }, [])

  return (
    <SocketProvider>
      <BrowserRouter>
        <div className="app-container">

          {/* Título - Topo esquerdo */}
          <h1 className="app-title">Noah Universe</h1>

          {/* Profile - Topo direito */}
          <div className="profile-button">
            <UserProfile onProfileChange={handleProfileChange} />
          </div>

          {/* Navegação - Centro topo */}
          <nav className="navigation-bar">
            <Navigation />
          </nav>

          {/* 3D do Noah - Quadrado direito */}
          <div className="scene-box">
            <Scene3D />
          </div>

          {/* Chat - Canto inferior direito */}
          <div className="chat-box">
            <Chat userProfile={userProfile} />
          </div>

          {/* Conteúdo principal - Centro */}
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="community" element={<Community />} />
            </Routes>
          </main>

        </div>
      </BrowserRouter>
    </SocketProvider>
  )
}
