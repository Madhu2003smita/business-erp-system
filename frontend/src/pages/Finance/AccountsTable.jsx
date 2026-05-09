import React, { useState } from 'react';
import axios from 'axios';
import FinanceModals from './FinanceModals';

const AccountsTable = ({ accounts, refresh, config }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleCreate = async (formData) => {
    try {
      await axios.post('/api/gl/accounts', formData, config);
      setModalOpen(false);
      refresh();
    } catch (err) {
      if (err.response?.status === 409) setApiError("Account code already exists");
      else setApiError("Failed to create account");
    }
  };

  return (
    <div>
      <button onClick={() => {setApiError(""); setModalOpen(true)}} className="btn-primary">
        + Add Account
      </button>

      <table className="finance-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Code</th>
            <th>Type</th>
            <th>Balance</th>
            <th>Currency</th>
          </tr>
        </thead>
        <tbody>
          {accounts|| [].map(acc => (
            <tr key={acc.id}>
              <td>{acc.name}</td>
              <td><strong>{acc.code}</strong></td>
              <td>{acc.type}</td>
              <td>{acc.balance?.toLocaleString()}</td>
              <td>{acc.currency}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <FinanceModals 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        type="account" 
        onSubmit={handleCreate}
        externalError={apiError}
      />
    </div>
  );
};

export default AccountsTable;