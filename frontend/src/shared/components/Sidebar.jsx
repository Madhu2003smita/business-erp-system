import React from 'react';
// Changed from 'react-router-dom' to 'react-router'
import { NavLink } from 'react-router'; 
import {
  FaHome,
  FaUsers,
  FaMoneyBillWave,
  FaBoxes,
  FaProjectDiagram,
  FaCog
} from 'react-icons/fa';
import '../styles/sidebar.css';

const Sidebar = ({ isOpen, onClose }) => { // Added props for mobile responsiveness
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <FaHome /> },
    { name: 'HR', path: '/hr', icon: <FaUsers /> },
    { name: 'Finance', path: '/finance', icon: <FaMoneyBillWave /> },
    { name: 'Supply Chain', path: '/supply-chain', icon: <FaBoxes /> },
    { name: 'Projects', path: '/projects', icon: <FaProjectDiagram /> },
    { name: 'Settings', path: '/settings', icon: <FaCog /> },
  ];

  return (
    /* We add a dynamic class 'open' so we can slide it in/out on mobile */
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        ERP SYSTEM
        {/* Optional: Add a close button for mobile inside the header */}
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
            onClick={onClose} // Closes sidebar automatically when a link is clicked on mobile
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;