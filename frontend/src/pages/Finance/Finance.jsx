import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AccountsTable from './AccountsTable';
import JournalEntriesTable from './JournalEntriesTable';
import "../../shared/styles/finance.css";

const Finance = () => {
  const [activeTab, setActiveTab] = useState('accounts');
  const [accounts, setAccounts] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchData = async () => {
    try {
      const [accRes, perRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_BASE_URL}gl/accounts`, config),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}gl/periods`, config)
      ]);
   if (accRes.data && accRes.data.data) {
        setAccounts(accRes.data.data); 
    }
    
    if (perRes.data && perRes.data.data) {
        setPeriods(perRes.data.data);
    }

  } catch (err) {
    console.error("Error fetching data:", err);
    setAccounts([]); // Fallback so it doesn't crash
  } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="p-4">Loading Finance Modules...</div>;

  return (
    <div className="finance-page" style={{ padding: '24px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Finance Management</h2>
      </div>

      <div className="tabs" style={{ display: 'flex', gap: '30px', borderBottom: '1px solid #e5e7eb', marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTab('accounts')}
          style={{ padding: '10px 5px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: activeTab === 'accounts' ? '2px solid #3b82f6' : 'none', color: activeTab === 'accounts' ? '#3b82f6' : '#6b7280', fontWeight: '600' }}
        >
          GL Accounts
        </button>
        <button 
          onClick={() => setActiveTab('entries')}
          style={{ padding: '10px 5px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: activeTab === 'entries' ? '2px solid #3b82f6' : 'none', color: activeTab === 'entries' ? '#3b82f6' : '#6b7280', fontWeight: '600' }}
        >
          Journal Entries
        </button>
      </div>

      <div className="content">
        {activeTab === 'accounts' ? (
          <AccountsTable accounts={accounts} refresh={fetchData} config={config} />
        ) : (
          <JournalEntriesTable periods={periods} accounts={accounts} refresh={fetchData} config={config} />
        )}
      </div>
    </div>
  );
};

export default Finance;