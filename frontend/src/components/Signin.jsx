// src/components/Signin.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Signin.css';
import Header from "../components/Header";

const Signin = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = formData;

    try {
      const response = await axios.post('http://localhost:5000/signin', { username, password });
      
      if (response.data.success) {
        // Store JWT token in localStorage
        localStorage.setItem('token', response.data.token);
        
        // Store username in localStorage for display on Header
        localStorage.setItem('username', username);

        setSuccessMessage('Sign In Successful!');
        setErrorMessage('');

        // Redirect to homepage after a short delay
        setTimeout(() => {
          navigate('/homepage');
        }, 1500);
      } else {
        // If sign-in fails, display the error message
        setErrorMessage(response.data.message);
        setSuccessMessage('');
      }
    } catch (error) {
      console.error('Sign In error:', error);
      setErrorMessage('Something went wrong, please try again.');
      setSuccessMessage('');
    }
  };

  return (
    <div className='signin-page'>
      <Header />
    
      <div className="main-container">
      <div className="signin-container">
        <h2>Sign In</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Username</label>
            <input 
              type="text" 
              name="username" 
              value={formData.username} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div>
            <label>Password</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
            />
          </div>

          <button type="submit">Sign In</button>

          {/* Display error and success messages */}
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
          {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}

          <p>
            New user? <a href="/signup">Create an Account</a>
          </p>
        </form>
      </div>
      </div>
    </div>
  );
};

export default Signin;
