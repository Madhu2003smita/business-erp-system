import React from 'react';

import { NavLink } from 'react-router-dom';

import {

  FaHome,

  FaUsers,

  FaMoneyBillWave,

  FaBoxes,

  FaProjectDiagram,

  FaCog

} from 'react-icons/fa';

import '../styles/sidebar.css';



const Sidebar = () => {

  const navItems = [

    { name: 'Dashboard', path: '/dashboard', icon: <FaHome /> },

    { name: 'HR', path: '/hr', icon: <FaUsers /> },

    { name: 'Finance', path: '/finance', icon: <FaMoneyBillWave /> },

    { name: 'Supply Chain', path: '/supply-chain', icon: <FaBoxes /> },

    { name: 'Projects', path: '/projects', icon: <FaProjectDiagram /> },

    { name: 'Settings', path: '/settings', icon: <FaCog /> },

  ];



  return (

    <aside className="sidebar">

      <div className="sidebar-header">ERP SYSTEM</div>

      <nav className="sidebar-nav">

        {navItems.map((item) => (

          <NavLink

            key={item.name}

            to={item.path}

            className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}

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