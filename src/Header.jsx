import React, { useState, useEffect, useRef, useContext } from 'react';
import './Header.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faThreads } from '@fortawesome/free-brands-svg-icons';
import { faShareNodes } from '@fortawesome/free-solid-svg-icons';
import { ShoppingCart } from "@phosphor-icons/react";
import { CartContext } from './CartContext';

const logo = '/Images/logo.png';

const gradientStyle = {
  color: '#7bbf00',
  display: 'inline-block'
};

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSocialDropdownOpen, setIsSocialDropdownOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { getCartItemCount } = useContext(CartContext);

  // Create refs for the dropdown and mobile menu
  const socialDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleSocialDropdown = () => {
    setIsSocialDropdownOpen(!isSocialDropdownOpen);
  };

  // Handle clicks outside of menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close social dropdown if click is outside of it
      if (socialDropdownRef.current && !socialDropdownRef.current.contains(event.target)) {
        setIsSocialDropdownOpen(false);
      }

      // Close mobile menu if click is outside of the entire nav
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    // Add event listener when either menu is open
    if (isMenuOpen || isSocialDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside); // For mobile devices
    }

    // Cleanup event listeners
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMenuOpen, isSocialDropdownOpen]);

  // Close menus when pressing Escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        setIsSocialDropdownOpen(false);
      }
    };

    if (isMenuOpen || isSocialDropdownOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isMenuOpen, isSocialDropdownOpen]);

  // Close mobile menu when location changes (page navigation)
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSocialDropdownOpen(false);
  }, [location.pathname]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Fixed scrollToSection function
  const scrollToSection = (sectionId, path) => {
    if (window.location.pathname === path) {
      // If already on the target page, just scroll to the section
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If on a different page, navigate to the target page first
      navigate(path);
      // Use setTimeout to allow the page to load before scrolling
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleNavClick = (sectionId) => {
    setIsMenuOpen(false);  // Close menu when link is clicked
    setIsSocialDropdownOpen(false);  // Also close social dropdown
    scrollToSection(sectionId, '/');
  };

  const handleLogoClick = () => {
    setIsMenuOpen(false);  // Close menu when logo is clicked
    setIsSpinning(true);
    navigate('/');
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    setTimeout(() => setIsSpinning(false), 1000);
  };

  return (
    <header className="header">
      <nav className="floating-nav" ref={navRef}>
        <Link to="/" className="nav-brand" onClick={handleLogoClick}>
          <img 
            className={`logo ${isSpinning ? 'spin' : ''}`} 
            src={logo} 
            alt="Logo" 
          />
        </Link>
        
        <button 
          className={`mobile-menu-button ${isMenuOpen ? 'open' : ''}`} 
          onClick={toggleMenu}
        >
          ☰
        </button>

        <div className={`nav-links ${isMenuOpen ? 'mobile-open' : ''}`}>
          <Link 
            to="/Shop" 
            onClick={() => {
              setIsMenuOpen(false);
              setIsSocialDropdownOpen(false);
            }}
          >
            Shop
          </Link>
          <Link 
            to="/about" 
            className="nav-link"
            onClick={() => {
              setIsMenuOpen(false);
              setIsSocialDropdownOpen(false);
            }}
          >
            About
          </Link>
          <Link 
            to="/contact" 
            className="nav-link"
            onClick={() => {
              setIsMenuOpen(false);
              setIsSocialDropdownOpen(false);
            }}
          >
            Contact
          </Link>
          
          {/* Social Dropdown */}
          <div className="social-dropdown" ref={socialDropdownRef}>
            <button 
              className="dropdown-trigger"
              onClick={toggleSocialDropdown}
              aria-label="Social Media Links"
            >
              <FontAwesomeIcon icon={faShareNodes} />
            </button>
            
            {isSocialDropdownOpen && (
              <div className="dropdown-menu">
                <a 
                  href="https://instagram.com/paradox_labs" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="dropdown-item"
                  onClick={() => setIsSocialDropdownOpen(false)}
                >
                  <FontAwesomeIcon icon={faInstagram} /> Instagram
                </a>
                <a 
                  href="https://threads.com/@paradox_labs" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="dropdown-item"
                  onClick={() => setIsSocialDropdownOpen(false)}
                >
                  <FontAwesomeIcon icon={faThreads} /> Threads
                </a>
              </div>
            )}
          </div>
          <Link 
            to="/cart" 
            className="cart-link"
            onClick={() => {
              setIsMenuOpen(false);
              setIsSocialDropdownOpen(false);
            }}
          >
            <ShoppingCart size={24} />
            {getCartItemCount() > 0 && (
              <span className="cart-count">{getCartItemCount()}</span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default Header;