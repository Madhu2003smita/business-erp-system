import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router'; // Updated to v7 import
import { jwtDecode } from 'jwt-decode';
import { HiMenuAlt2 } from 'react-icons/hi'; // Useful for the mobile toggle
import '../styles/topbar.css';

const Topbar = ({ title = "Dashboard", onMenuClick }) => {
  const navigate = useNavigate();
  
  // State to hold decoded user info
  const [user, setUser] = useState({ name: 'User', role: 'Guest' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Map the JWT fields to your UI
        // Common JWT keys are 'name', 'display_name', 'role', or 'sub'
        setUser({
          name: decoded.name || decoded.sub || 'User',
          role: decoded.role || 'Admin' 
        });
      } catch (error) {
        console.error("Token decoding failed:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/', { replace: true });
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        {/* Hamburger Menu - only visible on mobile via CSS */}
        <button className="menu-btn" onClick={onMenuClick}>
          <HiMenuAlt2 size={24} />
        </button>
        <h1 className="topbar-title">{title}</h1>
      </div>
      
      <div className="topbar-user">
        <div className="user-info">
          {/* Now dynamic! */}
          <span className="user-name">{user.name}</span>
          <span className="user-role">{user.role}</span>
        </div>
        <button 
          className="logout-btn" 
          onClick={handleLogout}
          aria-label="Log out of system"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;