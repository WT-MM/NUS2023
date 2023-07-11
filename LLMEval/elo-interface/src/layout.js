import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import llmPic from './images/llmPic.png';
import './layout.css';

const Layout = () => {
    const [menuOpen, setMenuOpen] = useState(false);
  
    const toggleMenu = () => {
      setMenuOpen(!menuOpen);
    };
  
    const handleLinkClick = () => {
      setMenuOpen(false); // Hide the menu when a link is clicked
    };
  
    return (
      <div className="layout">
        <div className="hamburger-menu" onClick={toggleMenu}>
        <div className={`line ${menuOpen ? 'open' : ''}`}></div>
        <div className={`line ${menuOpen ? 'open' : ''}`}></div>
        <div className={`line ${menuOpen ? 'open' : ''}`}></div>
      </div>
        <div className={`side-menu ${menuOpen ? 'open' : ''}`}>
          <div className="menu-links">
            <Link to="/" onClick={handleLinkClick}>
              Home
            </Link>
            <Link to="/stats" onClick={handleLinkClick}>
              Stats
            </Link>
            <Link to="/mmm" onClick={handleLinkClick}>
              mmm
            </Link>
          </div>
        </div>
        <Outlet />

      </div>
    );
  };
  
  export default Layout;