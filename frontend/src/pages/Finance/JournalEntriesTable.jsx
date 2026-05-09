import React, { useState } from 'react';
import axios from 'axios';
import FinanceModals from './FinanceModals';

const JournalEntriesTable = ({ periods, accounts, refresh, config }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [apiError, setApiError] = useState("");
  const [entries, setEntries] = useState([]);

  const handleCreate = async (formData) => {
    try {
      await axios.post('/api/gl/journal-entries', formData, config);
      setModalOpen(false);
      refresh();
    } catch (err) {
      if (err.response?.data?.message?.includes("closed")) setApiError("Period is closed");
      else setApiError("Error posting journal entry");
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
        <button onClick={() => {setApiError(""); setModalOpen(true)}} className="btn-primary">
          + Add Journal Entry
        </button>
        <select className="period-select">
          <option value="">All Periods</option>
          {(periods || []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <table className="finance-table">
        <thead>
          <tr>
            <th>Entry #</th>
            <th>Debit Account</th>
            <th>Credit Account</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {/* Mapping entries from API would go here */}
          {entries || [].map(entry => (
            <tr key={entry.id}>
              <td>{entry.entryNumber}</td>
              <td>{entry.debitAccount?.name}</td>
              <td>{entry.creditAccount?.name}</td>
              <td>{entry.amount?.toLocaleString()}</td>
              <td>{entry.date}</td>
              <td>{entry.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <FinanceModals 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        type="journal" 
        accounts={accounts}
        onSubmit={handleCreate}
        externalError={apiError}
      />
    </div>
  );
};

export default JournalEntriesTable;