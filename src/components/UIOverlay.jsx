import { useState, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import Navigation from './Navigation'
import UserProfile from './UserProfile'
import './UIOverlay.css'

export default function UIOverlay() {
  const [userProfile, setUserProfile] = useState({ username: '', avatar: null })

  const handleProfileChange = useCallback((profile) => {
    setUserProfile(profile)
  }, [])

  return (
    <>
      {/* Profile button - acima do painel */}
      <div className="profile-button">
        <UserProfile onProfileChange={handleProfileChange} />
      </div>

      {/* Painel direito */}
      <div className="ui-overlay">
        <div className="ui-container">
          {/* Header */}
          <header className="ui-header">
            <h1 className="ui-logo">Noah Universe</h1>
            <Navigation />
          </header>

          {/* Main content area */}
          <main className="ui-main">
            <Outlet context={{ userProfile }} />
          </main>

          {/* Footer */}
          <footer className="ui-footer">
            <p className="ui-footer-text">Made with love by Noah</p>
            <p className="ui-footer-credit">
              3D Model "Kid Boy" by oLric licensed under CC-BY-4.0
            </p>
          </footer>
        </div>
      </div>
    </>
  )
}
