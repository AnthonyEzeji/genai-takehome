import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <h1 className="brand-text">GenAI Notes</h1>
          </div>
          <div className="nav-links">
            <Link to="/notes" className="btn btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Transform Your Notes with AI
            </h1>
            <p className="hero-subtitle">
              Our AI-powered note-taking app helps you create, organize, and discover insights from your notes with intelligent search and smart suggestions.
            </p>
            <div className="hero-buttons">
              <Link to="/notes" className="btn btn-primary btn-lg">
                Get Started Free
              </Link>
              <Link to="/notes" className="btn btn-secondary btn-lg">
                View Pricing
              </Link>
            </div>
          </div>
          <div className="hero-demo">
            <div className="demo-card">
              <div className="demo-header">
                <div className="demo-dots">
                  <span className="demo-dot"></span>
                  <span className="demo-dot"></span>
                  <span className="demo-dot"></span>
                </div>
              </div>
              <div className="demo-content">
                <div className="demo-input">
                  <h3>Create Your Note</h3>
                  <textarea 
                    placeholder="Enter your note content here..."
                    className="demo-textarea"
                    readOnly
                    value="Meeting notes from today's brainstorming session..."
                  ></textarea>
                  <button className="btn btn-primary demo-btn" disabled>AI Enhance</button>
                </div>
                <div className="demo-output">
                  <h3>Enhanced Note</h3>
                  <div className="demo-result">
                    <p>Your AI-enhanced note will appear here with improved structure, suggestions, and insights...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Powerful Features to Elevate Your Notes</h2>
            <p className="section-subtitle">
              Our AI-powered platform comes packed with features designed to make your note-taking more intelligent and productive.
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🧠</div>
              <h3>AI-Powered Search</h3>
              <p>Find notes instantly using natural language queries. Our semantic search understands context, not just keywords.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Instant Insights</h3>
              <p>Get AI-generated summaries, titles, and suggestions to help you organize and understand your notes better.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Smart Analytics</h3>
              <p>Track your note-taking patterns, tag usage, and productivity metrics with detailed analytics.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔗</div>
              <h3>Related Notes</h3>
              <p>Discover connections between your notes automatically. Never lose important context again.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">
              Our advanced AI technology makes note-taking simple and intelligent.
            </p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Create Your Note</h3>
              <p>Simply write your note content in our intuitive editor with AI assistance.</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>AI Enhancement</h3>
              <p>Our AI analyzes and enhances your content with suggestions and improvements.</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Smart Organization</h3>
              <p>Automatically tag and organize your notes for easy discovery and retrieval.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">What Our Users Say</h2>
            <p className="section-subtitle">
              Join thousands of satisfied users who have transformed their note-taking experience.
            </p>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"GenAI Notes has completely transformed my workflow. My notes are now more organized and I can find anything instantly with AI search."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">👩‍💼</div>
                <div className="author-info">
                  <h4>Sarah Johnson</h4>
                  <p>Content Manager at TechCorp</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"The AI suggestions are incredible. It helps me structure my thoughts better and never miss important details."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">👨‍💻</div>
                <div className="author-info">
                  <h4>Michael Chen</h4>
                  <p>Marketing Director</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"As a student, this tool helps me organize my research notes and find connections I would have missed. It's been a game-changer."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">👩‍🎓</div>
                <div className="author-info">
                  <h4>Elena Rodriguez</h4>
                  <p>Graduate Student</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Note-Taking?</h2>
            <p>Join thousands of students, professionals, and creators who are already using GenAI Notes.</p>
            <div className="cta-buttons">
              <Link to="/notes" className="btn btn-primary btn-lg">
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
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
    </div>
  );
} 