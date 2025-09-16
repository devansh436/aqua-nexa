import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__content">
          {/* Project Info */}
          <div className="footer__section">
            <h3 className="footer__title">AquaNexa</h3>
            <p className="footer__description">
              Smart India Hackathon 2025 Project
              <br />
              Water Quality Analysis & Visualization Platform
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer__section">
            <h4 className="footer__subtitle">Quick Links</h4>
            <nav className="footer__nav">
              <Link to="/" className="footer__link">Home</Link>
              <Link to="/upload" className="footer__link">Upload Data</Link>
              <Link to="/preview" className="footer__link">Analysis</Link>
              <Link to="/about" className="footer__link">About Team</Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="footer__section">
            <h4 className="footer__subtitle">Contact</h4>
            <div className="footer__contact">
              <a href="mailto:team@aquanexa.in" className="footer__link">
                team@aquanexa.in
              </a>
              <a href="https://github.com/devansh436/aqua-nexa" 
                 className="footer__link"
                 target="_blank" 
                 rel="noopener noreferrer">
                GitHub Repository
              </a>
            </div>
          </div>

          {/* SIH Info */}
          <div className="footer__section">
            <h4 className="footer__subtitle">About SIH</h4>
            <p className="footer__description">
              Smart India Hackathon is a nationwide initiative to provide students with a platform to solve some of the pressing problems we face in our daily lives.
            </p>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            © 2025 AquaNexa. All rights reserved.
          </p>
          <div className="footer__sih-logo">
            <span className="footer__badge">SIH 2025</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;