import React, { useState } from 'react';
import { Outlet } from 'react-router'; // v7 Import
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import '../styles/layout.css';

const Layout = () => {
  // State to manage sidebar visibility on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  return (
    <div className="layout">
      {/* Pass state and close function to Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      
      {/* Background overlay to close sidebar when clicking outside on mobile */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}

      <div className="layout-main">
        {/* Pass toggle function to Topbar */}
        <Topbar onMenuClick={toggleSidebar} />
        
        <main className="layout-content">
          {/* CRITICAL: Outlet replaces {children}. 
             It renders Dashboard, HR, Finance, etc. based on the URL.
          */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;