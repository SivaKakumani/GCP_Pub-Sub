import React, { useEffect, useState } from "react";
import SigninHeader from "../components/SigninHeader"; 
import "../styles/HomePage.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const HomePage = () => {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Check if user is authenticated by making a request to the protected route
    axios.get('http://localhost:5000/protected', {
      headers: {
        'Authorization': localStorage.getItem('token') // Get the JWT token from localStorage
      }
    })
    .then((response) => {
      console.log(response.data);
      setAuthenticated(true); // User is authenticated
    })
    .catch((error) => {
      console.log('Authentication failed', error);
      setErrorMessage('Authentication failed. Please sign in again.');
      setAuthenticated(false);
      navigate('/signin'); // Redirect to sign-in page if not authenticated
    });
  }, [navigate]);

  if (!authenticated) {
    return <div>{errorMessage}</div>; // Show an error message if not authenticated
  }

  const handleCreateNewBot = () => {
    navigate("/bottype");
  };

  return (
    <div className="homepage">
      <SigninHeader />
      <div className="main-container-HP">
        <div className="button-container-HP">
          <button className="btn-HP btn1-HP">Manage Existing Bot</button>
          <button className="btn-HP btn2-HP" onClick={handleCreateNewBot}> 
            Create New Bot
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
