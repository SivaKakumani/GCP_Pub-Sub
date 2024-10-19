// src/components/Signup.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // To navigate to Signin after successful signup
import axios from 'axios';
import '../styles/Signup.css';
import Header from "../components/Header";


const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobilePhone: '',
    emailUpdates: false,
  });

  const navigate = useNavigate(); // To navigate after successful signup

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password, confirmPassword, mobilePhone, emailUpdates } = formData;

    // Ensure passwords match before submitting
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/signup', {
        username,
        email,
        password,
        mobilePhone,
        emailUpdates,
      });
      if (response.data.success) {
        // Navigate to Signin page if signup is successful
        navigate('/signin');
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

  return (
    <div className='signup-page'> 
    <Header />
    
    <div className="signup-container">
      
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username</label>
          <input type="text" name="username" value={formData.username} onChange={handleChange} required />
        </div>

        <div>
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>

        <div>
          <label>Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>

        <div>
          <label>Confirm Password</label>
          <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
        </div>

        <div>
          <label>Mobile Phone</label>
          <input type="text" name="mobilePhone" value={formData.mobilePhone} onChange={handleChange} required />
        </div>

        <div>
          <label>
            <input type="checkbox" name="emailUpdates" checked={formData.emailUpdates} onChange={handleChange} />
            I want to receive email updates
          </label>
        </div>

        <button type="submit">Sign Up</button>

        <p>
          Already have an account? <a href="/signin">Sign In</a>
        </p>
      </form>
    </div>
    
    </div>
  );
};

export default Signup;
