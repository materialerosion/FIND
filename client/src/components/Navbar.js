import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SignInButton from './SignInButton';
import '../styles/Navbar.scss';

function Navbar() {
  const location = useLocation();
  const { isAuthenticated, login, logout } = useAuth();
  
  // Dynamic class based on authentication state
  const navbarClass = isAuthenticated ? 'navbar authenticated' : 'navbar';
  
  // Auto-login effect: try to login automatically if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      // Try silent login first, fallback to popup
      login('popup');
    }
  }, [isAuthenticated, login]);
  
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
              <Link 
                to="/database" 
                className={location.pathname === '/database' ? 'active' : ''}
              >
                Database
              </Link>
              <Link 
                to="/aliases" 
                className={location.pathname === '/aliases' ? 'active' : ''}
              >
                Aliases
              </Link>
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