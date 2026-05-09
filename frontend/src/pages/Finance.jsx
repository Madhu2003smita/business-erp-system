import React, { useState, useEffect } from "react";
import handleApiCall from "../shared/services/apiService";
import { apiMethods } from "../shared/constants/api";
import Modal from "../shared/components/Modal";
import Badge from "../shared/components/Badge";
import { gooeyToast } from "goey-toast";
import "./styles/finance.styles.css";

const glEndpoints = {
  accounts: "gl/accounts",
  journalEntries: "gl/journal-entries",
  periods: "gl/periods",
};

const accountTypes = ["asset", "liability", "equity", "revenue", "expense"];
const currencyOptions = ["USD", "EUR", "GBP", "INR", "AED", "SGD"];

// ─── Account Form ────────────────────────────────────────────────────────────
const AccountForm = ({ onSuccess, onClose }) => {
  const [form, setForm] = useState({ name: "", code: "", type: "asset", currency: "USD" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.code.trim()) e.code = "Code is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await handleApiCall(glEndpoints.accounts, apiMethods.post, form, true);
      gooeyToast.success("Account created successfully");
      onSuccess();
    } catch (err) {
      gooeyToast.error(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="finance-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Account Name *</label>
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Cash" />
        {errors.name && <span className="form-error">{errors.name}</span>}
      </div>
      <div className="form-group">
        <label>Account Code *</label>
        <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="e.g. 1001" />
        {errors.code && <span className="form-error">{errors.code}</span>}
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Type</label>
          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            {accountTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Currency</label>
          <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
            {currencyOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-submit" disabled={loading}>{loading ? "Saving..." : "Create Account"}</button>
      </div>
    </form>
  );
};

// ─── Journal Entry Form ───────────────────────────────────────────────────────
const JournalEntryForm = ({ accounts, periods, onSuccess, onClose }) => {
  const [form, setForm] = useState({
    debitAccount: "", creditAccount: "", amount: "",
    currency: "USD", description: "", date: "", period: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.debitAccount) e.debitAccount = "Debit account is required";
    if (!form.creditAccount) e.creditAccount = "Credit account is required";
    if (form.debitAccount && form.creditAccount && form.debitAccount === form.creditAccount)
      e.creditAccount = "Debit and credit accounts must be different";
    if (!form.amount || Number(form.amount) <= 0) e.amount = "Amount must be greater than 0";
    if (!form.date) e.date = "Date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (!payload.period) delete payload.period;
      await handleApiCall(glEndpoints.journalEntries, apiMethods.post, payload, true);
      gooeyToast.success("Journal entry posted successfully");
      onSuccess();
    } catch (err) {
      gooeyToast.error(err.message || "Failed to post journal entry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="finance-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Debit Account *</label>
        <select value={form.debitAccount} onChange={e => setForm({ ...form, debitAccount: e.target.value })}>
          <option value="">Select account</option>
          {accounts.map(a => <option key={a._id} value={a._id}>{a.name} ({a.code})</option>)}
        </select>
        {errors.debitAccount && <span className="form-error">{errors.debitAccount}</span>}
      </div>
      <div className="form-group">
        <label>Credit Account *</label>
        <select value={form.creditAccount} onChange={e => setForm({ ...form, creditAccount: e.target.value })}>
          <option value="">Select account</option>
          {accounts.map(a => <option key={a._id} value={a._id}>{a.name} ({a.code})</option>)}
        </select>
        {errors.creditAccount && <span className="form-error">{errors.creditAccount}</span>}
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Amount *</label>
          <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="5000" />
          {errors.amount && <span className="form-error">{errors.amount}</span>}
        </div>
        <div className="form-group">
          <label>Currency</label>
          <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
            {currencyOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Date *</label>
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          {errors.date && <span className="form-error">{errors.date}</span>}
        </div>
        <div className="form-group">
          <label>Period</label>
          <select value={form.period} onChange={e => setForm({ ...form, period: e.target.value })}>
            <option value="">No period</option>
            {periods.map(p => <option key={p._id} value={p._id}>{p.name} {p.isClosed ? "(Closed)" : ""}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Description</label>
        <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="e.g. Cash sale" />
      </div>
      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-submit" disabled={loading}>{loading ? "Posting..." : "Post Entry"}</button>
      </div>
    </form>
  );
};

// ─── Main Finance Page ────────────────────────────────────────────────────────
const Finance = () => {
  const [activeTab, setActiveTab] = useState("accounts");
  const [accounts, setAccounts] = useState([]);
  const [entries, setEntries] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [accRes, entRes, perRes] = await Promise.all([
        handleApiCall(glEndpoints.accounts, apiMethods.get, null, true),
        handleApiCall(glEndpoints.journalEntries, apiMethods.get, null, true),
        handleApiCall(glEndpoints.periods, apiMethods.get, null, true),
      ]);
      setAccounts(accRes?.data || []);
      setEntries(entRes?.data || []);
      setPeriods(perRes?.data || []);
    } catch (err) {
      setError(err.message || "Failed to load finance data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="finance-page">
      <div className="finance-header">
        <div>
          <h2 className="finance-title">Finance & Accounts</h2>
          <p className="finance-subtitle">General Ledger — Accounts and Journal Entries</p>
        </div>
        <button
          className="btn-add-finance"
          onClick={() => activeTab === "accounts" ? setIsAccountModalOpen(true) : setIsEntryModalOpen(true)}
        >
          {activeTab === "accounts" ? "+ Add Account" : "+ Post Entry"}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Tabs */}
      <div className="finance-tabs">
        <button className={`tab-btn ${activeTab === "accounts" ? "active" : ""}`} onClick={() => setActiveTab("accounts")}>
          Accounts ({accounts.length})
        </button>
        <button className={`tab-btn ${activeTab === "entries" ? "active" : ""}`} onClick={() => setActiveTab("entries")}>
          Journal Entries ({entries.length})
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading...</div>
      ) : (
        <>
          {/* Accounts Tab */}
          {activeTab === "accounts" && (
            <div className="table-wrapper">
              <table className="finance-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Balance</th>
                    <th>Currency</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.length === 0 ? (
                    <tr><td colSpan={5} className="empty-cell">No accounts found. Add your first account.</td></tr>
                  ) : accounts.map(acc => (
                    <tr key={acc._id}>
                      <td><code>{acc.code}</code></td>
                      <td>{acc.name}</td>
                      <td><Badge status={acc.type} /></td>
                      <td className={acc.balance >= 0 ? "amount-positive" : "amount-negative"}>
                        {acc.currency} {acc.balance?.toLocaleString()}
                      </td>
                      <td>{acc.currency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Journal Entries Tab */}
          {activeTab === "entries" && (
            <div className="table-wrapper">
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
                  {entries.length === 0 ? (
                    <tr><td colSpan={6} className="empty-cell">No journal entries found.</td></tr>
                  ) : entries.map(entry => (
                    <tr key={entry._id}>
                      <td><code>{entry.entryNumber}</code></td>
                      <td>{entry.debitAccount?.name} <span className="account-code">({entry.debitAccount?.code})</span></td>
                      <td>{entry.creditAccount?.name} <span className="account-code">({entry.creditAccount?.code})</span></td>
                      <td className="amount-positive">{entry.currency} {entry.amount?.toLocaleString()}</td>
                      <td>{new Date(entry.date).toLocaleDateString()}</td>
                      <td><Badge status={entry.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Add Account Modal */}
      <Modal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} title="Add Account">
        <AccountForm onSuccess={() => { setIsAccountModalOpen(false); fetchAll(); }} onClose={() => setIsAccountModalOpen(false)} />
      </Modal>

      {/* Post Journal Entry Modal */}
      <Modal isOpen={isEntryModalOpen} onClose={() => setIsEntryModalOpen(false)} title="Post Journal Entry">
        <JournalEntryForm
          accounts={accounts}
          periods={periods}
          onSuccess={() => { setIsEntryModalOpen(false); fetchAll(); }}
          onClose={() => setIsEntryModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Finance;
