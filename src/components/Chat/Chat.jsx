import { useState, useEffect, useRef, useCallback } from 'react'
import { useFirebase } from '../../contexts/FirebaseContext'
import './Chat.css'

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

const getInitial = (username) => {
  if (!username) return '?'
  return username.charAt(0).toUpperCase()
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const STORAGE_KEY_USERNAME = 'sam_chat_username'
const STORAGE_KEY_AVATAR = 'sam_chat_avatar'
const MAX_MESSAGE_LENGTH = 200

export default function Chat({ userProfile }) {
  const { messages, sendMessage } = useFirebase()
  const [username, setUsername] = useState('')
  const [avatar, setAvatar] = useState(null)
  const [isJoined, setIsJoined] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [usernameInput, setUsernameInput] = useState('')
  const [avatarPreview, setAvatarPreview] = useState(null)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)

  // Sync with user profile
  useEffect(() => {
    if (userProfile?.username) {
      setUsername(userProfile.username)
      setAvatar(userProfile.avatar || null)
      setIsJoined(true)
    }
  }, [userProfile])

  // Load from localStorage on mount (only if both username AND avatar exist)
  useEffect(() => {
    const savedUsername = localStorage.getItem(STORAGE_KEY_USERNAME)
    const savedAvatar = localStorage.getItem(STORAGE_KEY_AVATAR)
    if (savedUsername && savedAvatar && !userProfile?.username) {
      setUsername(savedUsername)
      setAvatar(savedAvatar)
      setIsJoined(true)
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle avatar file selection
  const handleAvatarSelect = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      // Resize to small thumbnail
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = 64
        canvas.height = 64
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, 64, 64)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
        setAvatarPreview(dataUrl)
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  }, [])

  const handleJoin = useCallback((e) => {
    e.preventDefault()
    const trimmedName = usernameInput.trim()
    // Require BOTH name and avatar
    if (trimmedName.length >= 2 && trimmedName.length <= 20 && avatarPreview) {
      setUsername(trimmedName)
      setAvatar(avatarPreview)
      setIsJoined(true)
      localStorage.setItem(STORAGE_KEY_USERNAME, trimmedName)
      localStorage.setItem(STORAGE_KEY_AVATAR, avatarPreview)
    }
  }, [usernameInput, avatarPreview])

  const handleSend = useCallback(async (e) => {
    e.preventDefault()
    const trimmedMessage = newMessage.trim()
    if (trimmedMessage.length === 0 || trimmedMessage.length > MAX_MESSAGE_LENGTH) return

    await sendMessage({
      text: trimmedMessage,
      username,
      color: getAvatarColor(username),
      avatar: avatar
    })

    setNewMessage('')
    inputRef.current?.focus()
  }, [newMessage, username, avatar, sendMessage])

  const handleMessageChange = (e) => {
    const value = e.target.value
    if (value.length <= MAX_MESSAGE_LENGTH) {
      setNewMessage(value)
    }
  }

  const renderAvatar = (avatarUrl, name, color, className = 'message-avatar') => {
    if (avatarUrl) {
      return (
        <span className={`${className} avatar-with-image`}>
          <img src={avatarUrl} alt={name} className="avatar-img" />
        </span>
      )
    }
    return (
      <span
        className={className}
        style={{ backgroundColor: color || getAvatarColor(name) }}
      >
        <span className="avatar-initial-small">{getInitial(name)}</span>
      </span>
    )
  }

  // Join form
  if (!isJoined) {
    return (
      <div className="chat-container">
        <div className="chat-header">
          <h3 className="chat-title">Chat Room</h3>
        </div>
        <form className="join-form" onSubmit={handleJoin}>
          {/* Avatar picker */}
          <div
            className="join-avatar-picker"
            onClick={() => fileInputRef.current?.click()}
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="join-avatar-img" />
            ) : (
              <span className="join-avatar-placeholder">+</span>
            )}
            <span className="join-avatar-label">
              {avatarPreview ? 'Change photo' : 'Add photo'}
            </span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatarSelect}
          />

          <input
            type="text"
            className="join-input"
            placeholder="Your name..."
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            maxLength={20}
            minLength={2}
            required
          />
          <button
            type="submit"
            className="join-button"
            disabled={usernameInput.trim().length < 2 || !avatarPreview}
          >
            {!avatarPreview ? 'Add a photo first' : usernameInput.trim().length < 2 ? 'Type your name' : 'Join Chat'}
          </button>
        </form>
      </div>
    )
  }

  const handleEditProfile = () => {
    setUsernameInput(username)
    setAvatarPreview(avatar)
    setIsJoined(false)
  }

  // Chat interface
  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3 className="chat-title">Chat Room</h3>
        <button
          className="edit-profile-btn"
          onClick={handleEditProfile}
          title="Edit name or photo"
        >
          ✎
        </button>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet!</p>
            <p>Suggest a drawing!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg.id || index}
              className={`message ${msg.username === username ? 'own-message' : ''}`}
            >
              {renderAvatar(
                msg.username === username ? avatar : msg.avatar,
                msg.username,
                msg.color
              )}
              <div className="message-content">
                <div className="message-header">
                  <span className="message-username">{msg.username}</span>
                  <span className="message-time">{formatTime(msg.timestamp)}</span>
                </div>
                <p className="message-text">{msg.text}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="message-form" onSubmit={handleSend}>
        <input
          ref={inputRef}
          type="text"
          className="message-input"
          placeholder="Type a suggestion..."
          value={newMessage}
          onChange={handleMessageChange}
          maxLength={MAX_MESSAGE_LENGTH}
        />
        <div className="message-actions">
          <span className="char-count">
            {newMessage.length}/{MAX_MESSAGE_LENGTH}
          </span>
          <button
            type="submit"
            className="send-button"
            disabled={newMessage.trim().length === 0}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}
