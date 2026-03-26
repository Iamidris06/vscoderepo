import { Link } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand">
          🎮 GAMERDATE
        </Link>
        <div className="navbar__links">
          <Link to="/discover" className="navbar__link">Discover</Link>
          <Link to="/profile"  className="navbar__link">Profile</Link>
        </div>
      </div>
    </nav>
  );
}
