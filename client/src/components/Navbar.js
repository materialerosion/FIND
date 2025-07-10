import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SignInButton from './SignInButton';
import '../styles/Navbar.scss';

function Navbar() {
  const location = useLocation();
  const { isAuthenticated, login, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Dynamic class based on authentication state
  const navbarClass = isAuthenticated ? 'navbar authenticated' : 'navbar';

  // Auto-login effect: try to login automatically if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      // Try silent login first, fallback to popup
      login('popup');
    }
  }, [isAuthenticated, login]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <nav className={navbarClass}>
      <div className="container" style={{ position: 'relative' }}>
        <Link to="/" className="logo">
          <h1>FIND - Formula Ingredient Navigator & Database</h1>
        </Link>
        
        {/* Hidden logout button in top right */}
        {isAuthenticated && (
          <button
            onClick={() => logout('popup')}
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              opacity: 0,
              pointerEvents: 'auto',
              width: 40,
              height: 40,
              zIndex: 1000,
            }}
            aria-label="Logout (hidden)"
            tabIndex={0}
          >
            Logout
          </button>
        )}
        
        <div className="nav-links">
          {isAuthenticated && (
            <>
              <Link 
                to="/" 
                className={location.pathname === '/' ? 'active' : ''}
              >
                Formulas
              </Link>
              <Link 
                to="/search" 
                className={location.pathname === '/search' ? 'active' : ''}
              >
                Search
              </Link>
              {/* Ellipsis Dropdown for Database and Aliases */}
              <div className="ellipsis-dropdown-wrapper" ref={dropdownRef}>
                <button
                  className="ellipsis-btn"
                  aria-label="More options"
                  onClick={() => setDropdownOpen((open) => !open)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 10px', display: 'flex', alignItems: 'center' }}
                >
                  {/* SVG Ellipsis Icon */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="5" cy="12" r="2" fill="currentColor" />
                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                    <circle cx="19" cy="12" r="2" fill="currentColor" />
                  </svg>
                </button>
                {dropdownOpen && (
                  <div className="ellipsis-dropdown-menu">
                    <Link
                      to="/database"
                      className={location.pathname === '/database' ? 'active' : ''}
                      onClick={() => setDropdownOpen(false)}
                    >
                      Database
                    </Link>
                    <Link
                      to="/aliases"
                      className={location.pathname === '/aliases' ? 'active' : ''}
                      onClick={() => setDropdownOpen(false)}
                    >
                      Aliases
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
          
          <div className="auth-buttons">
            {!isAuthenticated && <SignInButton />}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;