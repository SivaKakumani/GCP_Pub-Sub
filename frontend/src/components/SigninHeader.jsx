// src/components/SigninHeader.js
import React, { useState, useEffect } from "react";
import "../styles/SigninHeader.css";
import Logo from "../images/Botable-Logo.png";
import UserImage from "../images/user.png";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [username, setUsername] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get token and username from localStorage
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    if (!token) {
      navigate('/signin'); // Redirect to signin if no token
    } else {
      setUsername(storedUsername || 'Guest');
    }
  }, [navigate]);

  const handleLogout = () => {
    // Clear localStorage and redirect to sign-in page
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/signin');
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="header">
      <div className="top-box">
        <div className="logo">
          <img src={Logo} alt="Logo" className="logo-img" onClick={() => navigate('/')} />
        </div>
        <div className="user-info">
          <span className="user-name" onClick={toggleDropdown}>
            {username || 'Guest'}
          </span>
          <img src={UserImage} alt="User" className="user-img" onClick={toggleDropdown} />
          {dropdownOpen && (
            <div className="dropdown-menu">
              <p onClick={handleLogout}>Logout</p>
            </div>
          )}
        </div>
      </div>
      {/* Bottom Box */}
      <div className="bottom-box">
        {/* Add any content for the bottom box if needed */}
      </div>
    </div>
  );
};

export default Header;
