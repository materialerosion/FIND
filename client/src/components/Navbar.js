import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useIsAuthenticated } from '@azure/msal-react';
import SignInButton from './SignInButton';
import SignOutButton from './SignOutButton';
import '../styles/Navbar.scss';

function Navbar() {
  const location = useLocation();
  const isAuthenticated = useIsAuthenticated();
  
  // Dynamic class based on authentication state
  const navbarClass = isAuthenticated ? 'navbar authenticated' : 'navbar';
  
  return (
    <nav className={navbarClass}>
      <div className="container">
        <Link to="/" className="logo">
          <h1>FIND - Formula Ingredient Navigator & Database</h1>
        </Link>
        
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
            {isAuthenticated ? <SignOutButton /> : <SignInButton />}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;