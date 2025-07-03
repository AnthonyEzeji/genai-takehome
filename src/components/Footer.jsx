import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="landing-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-brand">GenAI Notes</h3>
            <p>Empowering your note-taking with AI technology that makes your content more intelligent.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/notes">Get Started</Link></li>
              <li><Link to="/notes">Login</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Features</h4>
            <ul>
              <li>AI Search</li>
              <li>Smart Tags</li>
              <li>Analytics</li>
              <li>Related Notes</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact Us</h4>
            <p>123 Innovation Way<br />San Francisco, CA 94107</p>
            <p>+1 (555) 123-4567<br />support@genainotes.com</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 GenAI Notes. All rights reserved.</p>
          <div className="footer-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 