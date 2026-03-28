import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import '../styles/navbar.css';

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close menu when navigating
  useEffect(() => setMenuOpen(false), [location]);

  return (
    <>
      <nav className="navbar">
        <div className="navbar__inner">
          <NavLink to="/" className="navbar__brand">
            <div className="navbar__logo">{'</>'}</div>
            <span>CCA Coding Club</span>
          </NavLink>

          {/* Desktop links */}
          <div className="navbar__links">
            <NavLink to="/" end className={({ isActive }) => `navbar__link ${isActive ? 'active' : ''}`}>
              Info
            </NavLink>
            <NavLink to="/challenges" className={({ isActive }) => `navbar__link ${isActive ? 'active' : ''}`}>
              Challenges
            </NavLink>
          </div>

          {/* Mobile hamburger */}
          <button className="navbar__toggle" onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`navbar__mobile ${menuOpen ? 'open' : ''}`}>
        <NavLink to="/" end className={({ isActive }) => `navbar__link ${isActive ? 'active' : ''}`}>
          Info
        </NavLink>
        <NavLink to="/challenges" className={({ isActive }) => `navbar__link ${isActive ? 'active' : ''}`}>
          Challenges
        </NavLink>
      </div>
    </>
  );
}
