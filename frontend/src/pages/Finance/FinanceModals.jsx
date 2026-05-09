import React, { useState } from 'react';

const FinanceModals = ({ isOpen, onClose, type, onSubmit, accounts, externalError }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({});
  const [validationError, setValidationError] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError("");

    // Task Validation: Empty fields
    const requiredFields = type === 'account' ? ['name', 'code', 'type', 'currency'] : ['debitAccount', 'creditAccount', 'Asset', 'date'];
    const isMissing = requiredFields.some(field => !formData[field]);

    if (isMissing) {
      setValidationError("Please fill all required fields");
      return;
    }

    // Task Validation: Same Account Check
    if (type === 'journal' && formData.debitAccount === formData.creditAccount) {
      setValidationError("Debit and credit accounts must be different");
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <h3>{type === 'account' ? 'New GL Account' : 'New Journal Entry'}</h3>
        {(validationError || externalError) && (
          <p className="error-text">⚠️ {validationError || externalError}</p>
        )}
        <form onSubmit={handleSubmit}>
          {type === 'account' ? (
            <div className="form-grid">
              <input name="name" placeholder="Account Name" onChange={handleChange} />
              <input name="code" placeholder="Account Code" onChange={handleChange} />
              <select name="type" onChange={handleChange}>
                <option value="">Type</option>
                <option value="Asset">Asset</option>
                <option value="Liability">Liability</option>
                <option value="Equity">Equity</option>
                <option value="Revenue">Revenue</option>
                <option value="Expense">Expense</option>
              </select>
              <input name="currency" placeholder="Currency (USD)" onChange={handleChange} />
            </div>
          ) : (
            <div className="form-grid">
              {/* DEBIT SELECTION */}
              <select name="debitAccount" onChange={handleChange}>
                <option value="">Select Debit Account</option>
                {/* We use Array.isArray check to be 100% safe */}
                {(Array.isArray(accounts) ? accounts : []).map(a => (
                  <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                ))}
              </select>

              {/* CREDIT SELECTION */}
              <select name="creditAccount" onChange={handleChange}>
                <option value="">Select Credit Account</option>
                {(Array.isArray(accounts) ? accounts : []).map(a => (
                  <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                ))}
              </select>

              <input name="amount" type="number" placeholder="Amount" onChange={handleChange} />
              <input name="date" type="date" onChange={handleChange} />
              <textarea name="description" placeholder="Description" onChange={handleChange} style={{gridColumn: 'span 2'}}/>
            </div>
          )}
          <div className="modal-actions">
            <button type="submit" className="btn-save">Save</button>
            <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FinanceModals;