import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/" className="navbar-logo">
        <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="logoGrad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#7c3aed"/>
              <stop offset="0.5" stopColor="#2563eb"/>
              <stop offset="1" stopColor="#06b6d4"/>
            </linearGradient>
          </defs>
          <path d="M14 2L26 8.5V19.5L14 26L2 19.5V8.5L14 2Z" stroke="url(#logoGrad)" strokeWidth="1.5" fill="none"/>
          <path d="M14 2L14 26M2 8.5L26 19.5M26 8.5L2 19.5" stroke="url(#logoGrad)" strokeWidth="1" strokeOpacity="0.5"/>
        </svg>
        Vertex3D
      </Link>

      {/* Nav Links */}
      <ul className="navbar-links">
        <li><NavLink to="/" end>Explore</NavLink></li>
        <li><NavLink to="/?sort=top">Top Models</NavLink></li>
        {user && <li><NavLink to="/upload">Upload</NavLink></li>}
      </ul>

      {/* Actions */}
      <div className="navbar-actions">
        {user ? (
          <>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              👤 {user.username}
            </span>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
}
