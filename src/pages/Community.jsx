import './Community.css'

export default function Community() {
  return (
    <div className="community-page">
      <h1 className="community-title">Join Our Community!</h1>

      <div className="community-card">
        <div className="social-buttons">
          <a href="#" className="social-btn x-btn" onClick={(e) => {
            e.preventDefault()
            alert('Coming soon!')
          }}>
            Follow on X
          </a>
          <a href="#" className="social-btn community-btn" onClick={(e) => {
            e.preventDefault()
            alert('Coming soon!')
          }}>
            Community
          </a>
        </div>

        <div className="contract-section">
          <span className="contract-label">Contract Address</span>
          <span className="contract-value">SOON</span>
        </div>
      </div>
    </div>
  )
}
