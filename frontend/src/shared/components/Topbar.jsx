import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HiMenuAlt2 } from 'react-icons/hi'; // Install: npm install react-icons
import '../styles/topbar.css';

const Topbar = ({ title = "Dashboard", onMenuClick }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/', { replace: true });
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        {/* Hamburger Button: Hidden on desktop via CSS */}
        <button className="menu-btn" onClick={onMenuClick}>
          <HiMenuAlt2 size={24} />
        </button>
        <h1 className="topbar-title">{title}</h1>
      </div>
      
      <div className="topbar-user">
        <div className="user-info mobile-hide">
          <span className="user-name">Nithya</span>
          <span className="user-role">Admin</span>
        </div>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
};

export default Topbar;