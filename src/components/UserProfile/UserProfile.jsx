import { useState, useEffect, useRef } from 'react'
import './UserProfile.css'

const STORAGE_KEY_PROFILE = 'noah_user_profile'
const MAX_IMAGE_SIZE = 500 * 1024 // 500KB max for localStorage

// Generate a consistent color based on username
const getAvatarColor = (username) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8B500', '#FF8C94', '#91EAE4', '#FFD93D', '#C9B1FF'
  ]
  if (!username) return colors[0]
  let hash = 0
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

// Get user initial
const getInitial = (username) => {
  if (!username) return '?'
  return username.charAt(0).toUpperCase()
}

// Compress image to fit localStorage
const compressImage = (file, maxSize = MAX_IMAGE_SIZE) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Max dimensions
        const maxDim = 200
        if (width > height && width > maxDim) {
          height = (height * maxDim) / width
          width = maxDim
        } else if (height > maxDim) {
          width = (width * maxDim) / height
          height = maxDim
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        // Try different quality levels
        let quality = 0.8
        let result = canvas.toDataURL('image/jpeg', quality)

        while (result.length > maxSize && quality > 0.1) {
          quality -= 0.1
          result = canvas.toDataURL('image/jpeg', quality)
        }

        resolve(result)
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function UserProfile({ onProfileChange }) {
  const [profile, setProfile] = useState({
    username: '',
    avatar: null
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editUsername, setEditUsername] = useState('')
  const [editAvatar, setEditAvatar] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  const fileInputRef = useRef(null)

  // Load profile from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PROFILE)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setProfile(parsed)
        if (onProfileChange) {
          onProfileChange(parsed)
        }
      } catch (e) {
        console.error('Error loading profile:', e)
      }
    }
  }, [])

  // Open modal
  const openModal = () => {
    setEditUsername(profile.username)
    setEditAvatar(profile.avatar)
    setIsModalOpen(true)
  }

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false)
    setEditUsername('')
    setEditAvatar(null)
  }

  // Handle file upload
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|png|gif)$/)) {
      alert('Please select a valid image file (JPG, PNG, or GIF)')
      return
    }

    setIsUploading(true)
    try {
      const compressed = await compressImage(file)
      setEditAvatar(compressed)
    } catch (error) {
      console.error('Error processing image:', error)
      alert('Error processing image. Please try a different file.')
    } finally {
      setIsUploading(false)
    }
  }

  // Save profile
  const handleSave = () => {
    const trimmedUsername = editUsername.trim()
    if (trimmedUsername.length < 2) {
      alert('Username must be at least 2 characters')
      return
    }
    if (trimmedUsername.length > 20) {
      alert('Username must be 20 characters or less')
      return
    }

    const newProfile = {
      username: trimmedUsername,
      avatar: editAvatar
    }

    setProfile(newProfile)
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(newProfile))

    // Also update the chat username
    localStorage.setItem('noah_chat_username', trimmedUsername)

    if (onProfileChange) {
      onProfileChange(newProfile)
    }

    closeModal()
  }

  // Remove avatar
  const handleRemoveAvatar = () => {
    setEditAvatar(null)
  }

  const avatarColor = getAvatarColor(profile.username)
  const initial = getInitial(profile.username)
  const hasProfile = profile.username.length > 0

  return (
    <>
      {/* Avatar Button in Header */}
      <div className="user-profile-header" onClick={openModal}>
        <div
          className="user-avatar-button"
          style={{
            backgroundColor: profile.avatar ? 'transparent' : avatarColor
          }}
        >
          {profile.avatar ? (
            <img src={profile.avatar} alt="Avatar" className="avatar-image" />
          ) : (
            <span className="avatar-initial">{initial}</span>
          )}
        </div>
        <span className="user-profile-name">
          {hasProfile ? profile.username : 'Set Profile'}
        </span>
      </div>

      {/* Edit Profile Modal */}
      {isModalOpen && (
        <div className="profile-modal-overlay" onClick={closeModal}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <button className="profile-modal-close" onClick={closeModal}>×</button>

            <h2 className="profile-modal-title">Edit Profile</h2>

            {/* Avatar Preview */}
            <div className="profile-avatar-section">
              <div
                className="profile-avatar-preview"
                style={{
                  backgroundColor: editAvatar ? 'transparent' : getAvatarColor(editUsername || profile.username)
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                {editAvatar ? (
                  <img src={editAvatar} alt="Avatar Preview" className="avatar-preview-image" />
                ) : (
                  <span className="avatar-preview-initial">
                    {getInitial(editUsername || profile.username)}
                  </span>
                )}
                <div className="avatar-upload-overlay">
                  <span>{isUploading ? 'Uploading...' : 'Change Photo'}</span>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleFileChange}
                className="hidden-file-input"
              />

              {editAvatar && (
                <button className="remove-avatar-btn" onClick={handleRemoveAvatar}>
                  Remove Photo
                </button>
              )}
            </div>

            {/* Username Input */}
            <div className="profile-username-section">
              <label className="profile-label">Username</label>
              <input
                type="text"
                className="profile-username-input"
                placeholder="Enter your name..."
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                maxLength={20}
              />
              <span className="profile-char-count">{editUsername.length}/20</span>
            </div>

            {/* Action Buttons */}
            <div className="profile-modal-actions">
              <button className="profile-btn profile-btn-cancel" onClick={closeModal}>
                Cancel
              </button>
              <button
                className="profile-btn profile-btn-save"
                onClick={handleSave}
                disabled={editUsername.trim().length < 2 || isUploading}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Export helper functions for use in Chat
export { getAvatarColor, getInitial }
