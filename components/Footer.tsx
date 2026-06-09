'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="footer-dark">
      <div className="footer-grid-dark">
        <div>
          <div className="footer-logo-dark">
            <span className="tamil">Tamil</span>CinemaHub
          </div>
          <p className="footer-tagline-dark">The ultimate destination for Tamil cinema lovers — reviews, news, and AI-powered recommendations.</p>
        </div>
        <div className="footer-col-dark">
          <div className="footer-col-label-dark">Explore</div>
          <Link href="/movies">Latest Movies</Link>
          <Link href="/movies">Top Rated</Link>
          <Link href="/blogs">Reviews</Link>
          <Link href="/blogs">News</Link>
        </div>
        <div className="footer-col-dark">
          <div className="footer-col-label-dark">Discover</div>
          <Link href="/analytics">📊 Dashboard</Link>
          <Link href="/recommendations">🎬 Recommendations</Link>
        </div>
        <div className="footer-col-dark">
          <div className="footer-col-label-dark">Get in Touch</div>
          <Link href="/contact">Contact Us</Link>
          <a href="#" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event('open-chatbot')) }}>Chat with AI</a>
        </div>
      </div>
      <div className="footer-divider-dark" />
      <div className="footer-bottom-dark">
        <span>© {new Date().getFullYear()} TamilCinemaHub. All rights reserved.</span>
        <span>Made with <span className="heart">❤️</span> for Tamil cinema fans</span>
      </div>
    </footer>
  )
}
