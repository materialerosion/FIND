import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Navbar.scss';

function Navbar() {
  const location = useLocation();
  
  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="logo">
          <h1>Formula DB</h1>
        </Link>
        
        <div className="nav-links">
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
        </div>
      </div>
    </nav>
  );
}

export default Navbar;