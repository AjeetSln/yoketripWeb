// src/components/Header.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import logo from '../asstes/safar-sathi2.png';

const Header = ({
  menuOpen,
  setMenuOpen,
  scrolled,
  isLoggedIn,
  handleNavClick,
  toggleDrawer,
  handleLogout,
  isChatRoute,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleNavItemClick = (path) => {
    handleNavClick(path);
    setMobileMenuOpen(false); // Close mobile menu after click
  };

  return (
    !isChatRoute && (
      <header
        className={`header ${scrolled ? 'scrolled' : ''} bg-black text-white py-4 z-50 fixed top-0 left-0 right-0 ${
          mobileMenuOpen ? 'menu-open' : ''
        }`}
      >
        <div className="header-container container mx-auto flex items-center justify-between px-4">
          {/* Logo */}
          <div className="logo-container flex items-center">
            <img src={logo} alt="YokeTrip Logo" className="h-10 w-auto" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/#home"
              className="nav-link text-white hover:text-orange-300 transition-colors duration-200"
              onClick={() => handleNavClick('/#home')}
            >
              Home
            </Link>
            <Link
              to="/#trips"
              className="nav-link text-white hover:text-orange-300 transition-colors duration-200"
              onClick={() => handleNavClick('/#trips')}
            >
              Trips
            </Link>
            
            {/* Subscription Link - Always Visible */}
            <Link
              to="/subscription"
              className="nav-link text-white hover:text-orange-300 transition-colors duration-200"
              onClick={() => handleNavClick('/subscription')}
            >
              Subscription
            </Link>

            {/* Your Trips - Only visible when logged in */}
            {isLoggedIn && (
              <Link
                to="/your-trips"
                className="nav-link text-white hover:text-orange-300 transition-colors duration-200"
                onClick={() => handleNavClick('/your-trips')}
              >
                Your Trips
              </Link>
            )}

            <Link
              to="/#contact"
              className="nav-link text-white hover:text-orange-300 transition-colors duration-200"
              onClick={() => handleNavClick('/#contact')}
            >
              Contact
            </Link>
            
            {isLoggedIn ? (
              <>
                <span
                  className="nav-link text-white hover:text-orange-300 cursor-pointer transition-colors duration-200"
                  onClick={toggleDrawer}
                >
                  Menu
                </span>
                <button
                  className="nav-link text-white hover:text-orange-300 transition-colors duration-200"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="nav-link text-white hover:text-orange-300 transition-colors duration-200"
                  onClick={() => handleNavClick('/login')}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="nav-link text-white hover:text-orange-300 transition-colors duration-200"
                  onClick={() => handleNavClick('/register')}
                >
                  Register
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="menu-toggle text-white text-2xl md:hidden focus:outline-none"
            onClick={handleMobileMenuToggle}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black border-t border-gray-700 absolute top-full left-0 right-0 z-50">
            <nav className="flex flex-col p-4 space-y-4">
              <Link
                to="/#home"
                className="nav-link text-white hover:text-orange-300 py-2 transition-colors duration-200"
                onClick={() => handleNavItemClick('/#home')}
              >
                Home
              </Link>
              <Link
                to="/#trips"
                className="nav-link text-white hover:text-orange-300 py-2 transition-colors duration-200"
                onClick={() => handleNavItemClick('/#trips')}
              >
                Trips
              </Link>
              
              {/* Subscription Link - Always Visible */}
              <Link
                to="/subscription"
                className="nav-link text-white hover:text-orange-300 py-2 transition-colors duration-200"
                onClick={() => handleNavItemClick('/subscription')}
              >
                Subscription
              </Link>

              {/* Your Trips - Only visible when logged in */}
              {isLoggedIn && (
                <Link
                  to="/your-trips"
                  className="nav-link text-white hover:text-orange-300 py-2 transition-colors duration-200"
                  onClick={() => handleNavItemClick('/your-trips')}
                >
                  Your Trips
                </Link>
              )}

              <Link
                to="/#contact"
                className="nav-link text-white hover:text-orange-300 py-2 transition-colors duration-200"
                onClick={() => handleNavItemClick('/#contact')}
              >
                Contact
              </Link>
              
              {isLoggedIn ? (
                <>
                  <span
                    className="nav-link text-white hover:text-orange-300 py-2 cursor-pointer transition-colors duration-200"
                    onClick={() => {
                      toggleDrawer();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Menu
                  </span>
                  <button
                    className="nav-link text-white hover:text-orange-300 py-2 text-left transition-colors duration-200"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="nav-link text-white hover:text-orange-300 py-2 transition-colors duration-200"
                    onClick={() => handleNavItemClick('/login')}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="nav-link text-white hover:text-orange-300 py-2 transition-colors duration-200"
                    onClick={() => handleNavItemClick('/register')}
                  >
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>
    )
  );
};

export default Header;