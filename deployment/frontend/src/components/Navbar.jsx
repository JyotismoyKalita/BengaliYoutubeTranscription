import React from 'react';
import logo from '../assets/eictlogo.jpg';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo-img" />
          <span>Timestamped Transcription of Videos</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
