import React, { useState, useEffect } from 'react';
import StatCard from '../shared/components/StatCard';
import { FaUsers, FaChartLine, FaClipboardList, FaProjectDiagram } from 'react-icons/fa';
import handleApiCall from '../shared/services/apiService';
import { apiMethods, endPoints } from '../shared/constants/api';
import '../shared/styles/layout.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: null,
    revenue: null,
    openPOs: null,
    activeProjects: 12, // static until project API is built
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);

    // Fetch all independently — one failure won't break others
    const [employeesRes, posRes, accountsRes] = await Promise.allSettled([
      handleApiCall(endPoints.employees, apiMethods.get, null, true),
      handleApiCall(endPoints.purchaseOrders, apiMethods.get, null, true),
      handleApiCall("gl/accounts", apiMethods.get, null, true),
    ]);

    // Total employees
    const totalEmployees =
      employeesRes.status === "fulfilled"
        ? (employeesRes.value?.data || []).length
        : null;

    // Open POs (pending or approved)
    const openPOs =
      posRes.status === "fulfilled"
        ? (posRes.value?.data || []).filter(
            (po) => po.status === "pending" || po.status === "approved"
          ).length
        : null;

    // Revenue — sum of all revenue type account balances
    const revenue =
      accountsRes.status === "fulfilled"
        ? (accountsRes.value?.data || [])
            .filter((acc) => acc.type === "revenue")
            .reduce((sum, acc) => sum + (acc.balance || 0), 0)
        : null;

    setStats((prev) => ({ ...prev, totalEmployees, openPOs, revenue }));
    setLoading(false);
  };

  const formatRevenue = (val) => {
    if (val === null) return "—";
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
    return `$${val.toLocaleString()}`;
  };

  const statCards = [
    {
      title: "Total Employees",
      value: loading ? "..." : stats.totalEmployees === null ? "—" : stats.totalEmployees.toLocaleString(),
      icon: <FaUsers />,
    },
    {
      title: "Revenue",
      value: loading ? "..." : formatRevenue(stats.revenue),
      icon: <FaChartLine />,
    },
    {
      title: "Open POs",
      value: loading ? "..." : stats.openPOs === null ? "—" : stats.openPOs.toString(),
      icon: <FaClipboardList />,
    },
    {
      title: "Active Projects",
      value: stats.activeProjects.toString(),
      icon: <FaProjectDiagram />,
    },
  ];

  const dashboardStyles = {
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem',
    },
    section: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '1.5rem',
    },
    card: {
      background: '#fff',
      padding: '1.5rem',
      borderRadius: '12px',
      minHeight: '300px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    list: { listStyle: 'none', padding: 0 },
    listItem: {
      padding: '12px 0',
      borderBottom: '1px solid #f3f4f6',
      fontSize: '0.9rem',
    },
  };

  return (
    <div className="dashboard-wrapper">
      <header style={{ marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, color: '#111827' }}>Business Overview</h2>
        <p style={{ color: '#6b7280', margin: '5px 0 0' }}>
          Welcome back to your ERP management portal.
        </p>
      </header>

      <div style={dashboardStyles.grid}>
        {statCards.map((stat, index) => (
          <StatCard key={index} title={stat.title} value={stat.value} icon={stat.icon} />
        ))}
      </div>

      <div style={dashboardStyles.section}>
        <div style={dashboardStyles.card}>
          <h3 style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '1rem' }}>
            Revenue Overview
          </h3>
          <div
            style={{
              height: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9ca3af',
            }}
          >
            [ Chart Placeholder ]
          </div>
        </div>
        <div style={dashboardStyles.card}>
          <h3 style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '1rem' }}>
            Recent Activity
          </h3>
          <ul style={dashboardStyles.list}>
            <li style={dashboardStyles.listItem}>✅ New Employee Onboarded - HR</li>
            <li style={dashboardStyles.listItem}>💰 Invoice #402 Paid - Finance</li>
            <li style={dashboardStyles.listItem}>📦 PO #99 Shipped - Supply Chain</li>
            <li style={dashboardStyles.listItem}>🚀 Project Alpha Milestone reached</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
