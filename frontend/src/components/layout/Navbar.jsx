import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, GraduationCap, Code } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname.startsWith(path) && path !== '/' 
      ? 'active' 
      : location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <img src="/csun_logo.svg" alt="CSUN Logo" className="navbar-logo csun-logo" />
          <span className="navbar-title">CSUN <span className="sose-accent">x SOSE</span></span>
        </Link>
        
        <div className="navbar-links">
          <Link to="/instructor" className={`nav-link ${isActive('/instructor')}`}>
            <BookOpen size={18} />
            <span>Instructor Tools</span>
          </Link>
          <Link to="/student" className={`nav-link ${isActive('/student')}`}>
            <GraduationCap size={18} />
            <span>Student Tools</span>
          </Link>
          <a 
            href="https://sose.dev" 
            target="_blank" 
            rel="noopener noreferrer"
            className="nav-link external"
          >
            <Code size={18} />
            <span>SOSE.dev</span>
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
