import './Community.css'

export default function Community() {
  return (
    <div className="community-page">
      <h1 className="community-title">Join Our Community!</h1>

      <div className="community-card">
        <div className="social-buttons">
          <a
            href="https://x.com/Noahdrawing"
            className="social-btn x-btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            Follow on X
          </a>
          <a
            href="https://x.com/i/communities/2014849784603980233"
            className="social-btn community-btn"
            target="_blank"
            rel="noopener noreferrer"
          >
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
