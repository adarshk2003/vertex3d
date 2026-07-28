import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <h3>Vertex3D</h3>
          <p>The premier platform for discovering, sharing, and exploring stunning 3D models in real-time.</p>
        </div>

        <div className="footer-col">
          <h4>Explore</h4>
          <ul>
            <li><Link to="/">Latest Models</Link></li>
            <li><Link to="/?sort=top">Top Models</Link></li>
            <li><Link to="/upload">Upload Model</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Categories</h4>
          <ul>
            <li><Link to="/?category=Architecture">Architecture</Link></li>
            <li><Link to="/?category=Characters">Characters</Link></li>
            <li><Link to="/?category=Vehicles">Vehicles</Link></li>
            <li><Link to="/?category=Nature">Nature</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Account</h4>
          <ul>
            <li><Link to="/login">Sign In</Link></li>
            <li><Link to="/register">Register</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2024 Vertex3D. All rights reserved.</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          Built with{' '}
          <span style={{ color: '#7c3aed', fontWeight: 700 }}>Three.js</span>
          {' '}+{' '}
          <span style={{ color: '#2563eb', fontWeight: 700 }}>MERN</span>
        </span>
      </div>
    </footer>
  );
}
