import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="header">
      <div className="container">
        <div>
          <h1 className="header__title">🌊 AquaNexa </h1>
          <p className="header__subtitle">Research Data Platform</p>
        </div>

        <div className="links">
          <Link to="/" className="header__link">
            Home
          </Link>
          <Link to="/upload" className="header__link">
            Upload
          </Link>
        </div>
      </div>
    </header>
  );
}
