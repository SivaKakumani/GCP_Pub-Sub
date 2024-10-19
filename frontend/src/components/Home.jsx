// src/components/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import Header from "../components/Header";
import '../styles//Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <header className="header">
        {/* <div className="logo">Event Invitation</div> */}
        <Header /> {/* Using Header directly here */}
        <nav className="navbar">
          <Link to="/signup" className="nav-link">Create Account</Link>
          <Link to="/signin" className="nav-link">Sign In</Link>
        </nav>
      </header>

      <section className="description">
        <h1>Welcome to BOTABLE!</h1>
        <p>
          Our platform provides an easy way to manage your .
        </p>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <p>Contact Us: 1234 Event Lane, Party City, PC 56789</p>
          <p>Email: contact@eventinvitation.com | Phone: (123) 456-7890</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
