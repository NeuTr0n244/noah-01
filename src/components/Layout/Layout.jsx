import { useState, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import Navigation from '../Navigation'
import UserProfile from '../UserProfile'
import './Layout.css'

export default function Layout() {
  const [userProfile, setUserProfile] = useState({ username: '', avatar: null })

  const handleProfileChange = useCallback((profile) => {
    setUserProfile(profile)
  }, [])

  return (
    <div className="layout">
      {/* Background decorations */}
      <div className="background-decorations">
        <div className="cloud cloud-1" />
        <div className="cloud cloud-2" />
        <div className="cloud cloud-3" />
      </div>

      {/* User Profile (top right) */}
      <UserProfile onProfileChange={handleProfileChange} />

      {/* Header */}
      <header className="site-header">
        <h1 className="site-title">Noah Universe</h1>
        <p className="site-subtitle">Watch me draw cool stuff!</p>
        <Navigation />
      </header>

      {/* Main content area */}
      <main className="site-main">
        <Outlet context={{ userProfile }} />
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <p>Made with love by Noah</p>
        <p className="credit">
          3D Model "Kid Boy" by oLric (sketchfab.com/selimalsk) licensed under CC-BY-4.0
        </p>
      </footer>
    </div>
  )
}
