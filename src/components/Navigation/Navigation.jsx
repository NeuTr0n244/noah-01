import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import './Navigation.css'

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/community', label: 'Community' }
]

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className="navigation">
      {/* Mobile hamburger button */}
      <button
        className={`mobile-menu-btn ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      {/* Navigation tabs */}
      <div className={`nav-tabs ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
            end={item.path === '/'}
          >
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={closeMobileMenu} />
      )}
    </nav>
  )
}
