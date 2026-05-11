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
  invoices: "invoices",
  payments: "payments",
};

const accountTypes = ["asset", "liability", "equity", "revenue", "expense"];
const currencyOptions = ["USD", "EUR", "GBP", "INR", "AED", "SGD"];
const paymentMethods = ["bank_transfer", "cash", "cheque", "credit_card", "online"];

// ─── Account Form ─────────────────────────────────────────────────────────────
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

// ─── Invoice Form ─────────────────────────────────────────────────────────────
const InvoiceForm = ({ onSuccess, onClose }) => {
  const [form, setForm] = useState({
    type: "AR", partyName: "", amount: "", currency: "USD",
    dueDate: "", lineItems: [{ description: "", quantity: 1, unitPrice: 0 }],
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.partyName.trim()) e.partyName = "Party name is required";
    if (!form.amount || Number(form.amount) <= 0) e.amount = "Amount must be greater than 0";
    if (!form.dueDate) e.dueDate = "Due date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { ...form, amount: Number(form.amount) };
      await handleApiCall(glEndpoints.invoices, apiMethods.post, payload, true);
      gooeyToast.success("Invoice created successfully");
      onSuccess();
    } catch (err) {
      gooeyToast.error(err.message || "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="finance-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>Type *</label>
          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            <option value="AR">AR — Accounts Receivable (Customer owes us)</option>
            <option value="AP">AP — Accounts Payable (We owe vendor)</option>
          </select>
        </div>
        <div className="form-group">
          <label>Currency</label>
          <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
            {currencyOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Party Name * (Customer / Vendor)</label>
        <input value={form.partyName} onChange={e => setForm({ ...form, partyName: e.target.value })} placeholder="e.g. Acme Corp" />
        {errors.partyName && <span className="form-error">{errors.partyName}</span>}
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Amount *</label>
          <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="10000" />
          {errors.amount && <span className="form-error">{errors.amount}</span>}
        </div>
        <div className="form-group">
          <label>Due Date *</label>
          <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
          {errors.dueDate && <span className="form-error">{errors.dueDate}</span>}
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-submit" disabled={loading}>{loading ? "Saving..." : "Create Invoice"}</button>
      </div>
    </form>
  );
};

// ─── Payment Form ─────────────────────────────────────────────────────────────
const PaymentForm = ({ invoices, onSuccess, onClose }) => {
  const [form, setForm] = useState({ invoiceId: "", amount: "", method: "bank_transfer", paymentDate: "", reference: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const unpaidInvoices = invoices.filter(inv => inv.status !== "paid");

  const validate = () => {
    const e = {};
    if (!form.invoiceId) e.invoiceId = "Invoice is required";
    if (!form.amount || Number(form.amount) <= 0) e.amount = "Amount must be greater than 0";
    if (!form.method) e.method = "Payment method is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { ...form, amount: Number(form.amount) };
      await handleApiCall(glEndpoints.payments, apiMethods.post, payload, true);
      gooeyToast.success("Payment recorded successfully");
      onSuccess();
    } catch (err) {
      gooeyToast.error(err.message || "Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="finance-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Invoice *</label>
        <select value={form.invoiceId} onChange={e => setForm({ ...form, invoiceId: e.target.value })}>
          <option value="">Select invoice</option>
          {unpaidInvoices.map(inv => (
            <option key={inv._id} value={inv._id}>
              {inv.invoiceNumber} — {inv.partyName} ({inv.currency} {inv.amount?.toLocaleString()})
            </option>
          ))}
        </select>
        {errors.invoiceId && <span className="form-error">{errors.invoiceId}</span>}
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Amount *</label>
          <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="5000" />
          {errors.amount && <span className="form-error">{errors.amount}</span>}
        </div>
        <div className="form-group">
          <label>Payment Method *</label>
          <select value={form.method} onChange={e => setForm({ ...form, method: e.target.value })}>
            {paymentMethods.map(m => <option key={m} value={m}>{m.replace("_", " ")}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Payment Date</label>
          <input type="date" value={form.paymentDate} onChange={e => setForm({ ...form, paymentDate: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Reference</label>
          <input value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} placeholder="e.g. TXN-12345" />
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-submit" disabled={loading}>{loading ? "Recording..." : "Record Payment"}</button>
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
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [accRes, entRes, perRes, invRes] = await Promise.allSettled([
        handleApiCall(glEndpoints.accounts, apiMethods.get, null, true),
        handleApiCall(glEndpoints.journalEntries, apiMethods.get, null, true),
        handleApiCall(glEndpoints.periods, apiMethods.get, null, true),
        handleApiCall(glEndpoints.invoices, apiMethods.get, null, true),
      ]);
      setAccounts(accRes.status === "fulfilled" ? accRes.value?.data || [] : []);
      setEntries(entRes.status === "fulfilled" ? entRes.value?.data || [] : []);
      setPeriods(perRes.status === "fulfilled" ? perRes.value?.data || [] : []);
      setInvoices(invRes.status === "fulfilled" ? invRes.value?.data || invRes.value || [] : []);
    } catch (err) {
      setError(err.message || "Failed to load finance data");
    } finally {
      setLoading(false);
    }
  };

  const getAddButton = () => {
    if (activeTab === "accounts") return <button className="btn-add-finance" onClick={() => setIsAccountModalOpen(true)}>+ Add Account</button>;
    if (activeTab === "entries") return <button className="btn-add-finance" onClick={() => setIsEntryModalOpen(true)}>+ Post Entry</button>;
    if (activeTab === "invoices") return <button className="btn-add-finance" onClick={() => setIsInvoiceModalOpen(true)}>+ Add Invoice</button>;
    if (activeTab === "payments") return <button className="btn-add-finance" onClick={() => setIsPaymentModalOpen(true)}>+ Record Payment</button>;
    return null;
  };

  const invoiceStatusColor = { draft: "pending", sent: "on_leave", paid: "approved", overdue: "terminated" };

  return (
    <div className="finance-page">
      <div className="finance-header">
        <div>
          <h2 className="finance-title">Finance & Accounts</h2>
          <p className="finance-subtitle">GL, Invoices and Payments</p>
        </div>
        {getAddButton()}
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="finance-tabs">
        <button className={`tab-btn ${activeTab === "accounts" ? "active" : ""}`} onClick={() => setActiveTab("accounts")}>Accounts ({accounts.length})</button>
        <button className={`tab-btn ${activeTab === "entries" ? "active" : ""}`} onClick={() => setActiveTab("entries")}>Journal Entries ({entries.length})</button>
        <button className={`tab-btn ${activeTab === "invoices" ? "active" : ""}`} onClick={() => setActiveTab("invoices")}>Invoices ({invoices.length})</button>
        <button className={`tab-btn ${activeTab === "payments" ? "active" : ""}`} onClick={() => setActiveTab("payments")}>Payments</button>
      </div>

      {loading ? <div className="loading-state">Loading...</div> : (
        <>
          {activeTab === "accounts" && (
            <div className="table-wrapper">
              <table className="finance-table">
                <thead><tr><th>Code</th><th>Name</th><th>Type</th><th>Balance</th><th>Currency</th></tr></thead>
                <tbody>
                  {accounts.length === 0 ? <tr><td colSpan={5} className="empty-cell">No accounts found.</td></tr>
                    : accounts.map(acc => (
                      <tr key={acc._id}>
                        <td><code>{acc.code}</code></td>
                        <td>{acc.name}</td>
                        <td><Badge status={acc.type} /></td>
                        <td className={acc.balance >= 0 ? "amount-positive" : "amount-negative"}>{acc.currency} {acc.balance?.toLocaleString()}</td>
                        <td>{acc.currency}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "entries" && (
            <div className="table-wrapper">
              <table className="finance-table">
                <thead><tr><th>Entry #</th><th>Debit Account</th><th>Credit Account</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
                <tbody>
                  {entries.length === 0 ? <tr><td colSpan={6} className="empty-cell">No journal entries found.</td></tr>
                    : entries.map(entry => (
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

          {activeTab === "invoices" && (
            <div className="table-wrapper">
              <table className="finance-table">
                <thead><tr><th>Invoice #</th><th>Type</th><th>Party</th><th>Amount</th><th>Due Date</th><th>Status</th></tr></thead>
                <tbody>
                  {invoices.length === 0 ? <tr><td colSpan={6} className="empty-cell">No invoices found. Add your first invoice.</td></tr>
                    : invoices.map(inv => (
                      <tr key={inv._id}>
                        <td><code>{inv.invoiceNumber}</code></td>
                        <td><span className={`invoice-type ${inv.type === "AP" ? "type-ap" : "type-ar"}`}>{inv.type}</span></td>
                        <td>{inv.partyName}</td>
                        <td className="amount-positive">{inv.currency} {inv.amount?.toLocaleString()}</td>
                        <td>{new Date(inv.dueDate).toLocaleDateString()}</td>
                        <td><Badge status={invoiceStatusColor[inv.status] || "pending"} /></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "payments" && (
            <div className="table-wrapper">
              <table className="finance-table">
                <thead><tr><th>Invoice #</th><th>Amount</th><th>Method</th><th>Date</th><th>Reference</th></tr></thead>
                <tbody>
                  <tr><td colSpan={5} className="empty-cell">Record a payment using the button above.</td></tr>
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <Modal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} title="Add Account">
        <AccountForm onSuccess={() => { setIsAccountModalOpen(false); fetchAll(); }} onClose={() => setIsAccountModalOpen(false)} />
      </Modal>

      <Modal isOpen={isEntryModalOpen} onClose={() => setIsEntryModalOpen(false)} title="Post Journal Entry">
        <JournalEntryForm accounts={accounts} periods={periods} onSuccess={() => { setIsEntryModalOpen(false); fetchAll(); }} onClose={() => setIsEntryModalOpen(false)} />
      </Modal>

      <Modal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} title="Add Invoice">
        <InvoiceForm onSuccess={() => { setIsInvoiceModalOpen(false); fetchAll(); }} onClose={() => setIsInvoiceModalOpen(false)} />
      </Modal>

      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Record Payment">
        <PaymentForm invoices={invoices} onSuccess={() => { setIsPaymentModalOpen(false); fetchAll(); }} onClose={() => setIsPaymentModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default Finance;
