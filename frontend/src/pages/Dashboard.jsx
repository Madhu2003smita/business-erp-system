import React from 'react';
import Layout from '../shared/components/Layout';
import StatCard from '../shared/components/StatCard';
import { FaUsers, FaChartLine, FaClipboardList, FaProjectDiagram } from 'react-icons/fa';
import '../shared/styles/layout.css'; // Reuse layout spacing or add specific dashboard styles

const Dashboard = () => {
  const stats = [
    { title: "Total Employees", value: "1,250", icon: <FaUsers /> },
    { title: "Revenue", value: "$45,200", icon: <FaChartLine /> },
    { title: "Open POs", value: "34", icon: <FaClipboardList /> },
    { title: "Active Projects", value: "12", icon: <FaProjectDiagram /> }
  ];

  const dashboardStyles = {
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    },
    section: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '1.5rem'
    },
    card: {
      background: '#fff',
      padding: '1.5rem',
      borderRadius: '12px',
      minHeight: '300px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    list: {
      listStyle: 'none',
      padding: 0
    },
    listItem: {
      padding: '12px 0',
      borderBottom: '1px solid #f3f4f6',
      fontSize: '0.9rem'
    }
  };

  return (
    <Layout>
      <header style={{ marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, color: '#111827' }}>Business Overview</h2>
        <p style={{ color: '#6b7280', margin: '5px 0 0' }}>Welcome back to your ERP management portal.</p>
      </header>

      <div style={dashboardStyles.grid}>
        {stats.map((stat, index) => (
          <StatCard 
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
          />
        ))}
      </div>

      <div style={dashboardStyles.section}>
        <div style={dashboardStyles.card}>
          <h3 style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '1rem' }}>Revenue Overview</h3>
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
            [ Chart Placeholder ]
          </div>
        </div>
        <div style={dashboardStyles.card}>
          <h3 style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '1rem' }}>Recent Activity</h3>
          <ul style={dashboardStyles.list}>
            <li style={dashboardStyles.listItem}>✅ New Employee Onboarded - HR</li>
            <li style={dashboardStyles.listItem}>💰 Invoice #402 Paid - Finance</li>
            <li style={dashboardStyles.listItem}>📦 PO #99 Shipped - Supply Chain</li>
            <li style={dashboardStyles.listItem}>🚀 Project Alpha Milestone reached</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;