import React from "react";
import "../styles/Header.css"; // Importing CSS specific to the header
import Logo from "../images/Botable-Logo.png"; // Import the logo image
// import UserImage from "../images/user.png"; // Import the user image
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  // Function to handle "Create New Bot" click
  const handleCreateNewBot = () => {
    // Navigate to the BotType page
    navigate("/");
  };

  return (
    <div className="header">
      <div className="top-box">
        <div className="logo">
          <img src={Logo} alt="Logo" className="logo-img" onClick={handleCreateNewBot} /> {/* Use imported logo image */}
        </div>
        {/* <div className="user-info">
          <span className="user-name">John Doe</span>
          <img src={UserImage} alt="User" className="user-img" />
        </div> */}
      </div>

      {/* Bottom Box */}
      <div className="bottom-box">
        {/* Add any content for the bottom box if needed */}
      </div>
    </div>
  );
};

export default Header;
