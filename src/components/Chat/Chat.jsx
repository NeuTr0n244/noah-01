import { useState, useEffect, useRef, useCallback } from 'react'
import { initSocket, onStateInit, onChatMessage, sendChatMessage } from '../../services/socket'
import './Chat.css'

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

// Get initial from username
const getInitial = (username) => {
  if (!username) return '?'
  return username.charAt(0).toUpperCase()
}

// Format timestamp
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const STORAGE_KEY_USERNAME = 'noah_chat_username'
const MAX_MESSAGE_LENGTH = 200

export default function Chat({ userProfile }) {
  const [username, setUsername] = useState('')
  const [avatar, setAvatar] = useState(null)
  const [isJoined, setIsJoined] = useState(false)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [usernameInput, setUsernameInput] = useState('')

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Sync with user profile
  useEffect(() => {
    if (userProfile?.username) {
      setUsername(userProfile.username)
      setAvatar(userProfile.avatar || null)
      setIsJoined(true)
    }
  }, [userProfile])

  // Load username from localStorage on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem(STORAGE_KEY_USERNAME)
    if (savedUsername && !userProfile?.username) {
      setUsername(savedUsername)
      setIsJoined(true)
    }
  }, [])

  // Initialize socket and subscribe to chat
  useEffect(() => {
    initSocket()

    // Get initial chat messages
    const unsubInit = onStateInit((state) => {
      if (state.chat) {
        setMessages(state.chat)
      }
    })

    // Subscribe to new chat messages
    const unsubChat = onChatMessage((message) => {
      setMessages(prev => [...prev, message].slice(-50))
    })

    return () => {
      unsubInit()
      unsubChat()
    }
  }, [])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle joining chat
  const handleJoin = useCallback((e) => {
    e.preventDefault()
    const trimmedName = usernameInput.trim()
    if (trimmedName.length >= 2 && trimmedName.length <= 20) {
      setUsername(trimmedName)
      setIsJoined(true)
      localStorage.setItem(STORAGE_KEY_USERNAME, trimmedName)
    }
  }, [usernameInput])

  // Handle sending message
  const handleSend = useCallback((e) => {
    e.preventDefault()
    const trimmedMessage = newMessage.trim()
    if (trimmedMessage.length === 0 || trimmedMessage.length > MAX_MESSAGE_LENGTH) return

    sendChatMessage({
      username,
      text: trimmedMessage,
      color: getAvatarColor(username),
      avatar: avatar // Include avatar in message
    })
    setNewMessage('')
    inputRef.current?.focus()
  }, [newMessage, username, avatar])

  // Handle input change with character limit
  const handleMessageChange = (e) => {
    const value = e.target.value
    if (value.length <= MAX_MESSAGE_LENGTH) {
      setNewMessage(value)
    }
  }

  // Render avatar (image or colored initial)
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

  // Username entry form
  if (!isJoined) {
    return (
      <div className="chat-container">
        <div className="chat-header">
          <h3 className="chat-title">Chat Room</h3>
          <p className="chat-subtitle">Suggest what Noah should draw next!</p>
        </div>
        <form className="join-form" onSubmit={handleJoin}>
          <p className="join-hint">Set your profile in the top right corner, or enter a name below:</p>
          <input
            type="text"
            className="join-input"
            placeholder="Enter your name..."
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            maxLength={20}
            minLength={2}
            required
          />
          <button
            type="submit"
            className="join-button"
            disabled={usernameInput.trim().length < 2}
          >
            Join Chat
          </button>
        </form>
      </div>
    )
  }

  // Chat interface
  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3 className="chat-title">Chat Room</h3>
        <p className="chat-subtitle">Suggest what Noah should draw next!</p>
        <div className="chat-user-info">
          {renderAvatar(avatar, username, getAvatarColor(username), 'user-avatar')}
          <span className="user-name">{username}</span>
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet!</p>
            <p>Be the first to suggest a drawing!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
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
