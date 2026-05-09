import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { gooeyToast } from "goey-toast";

import Modal from "../shared/components/Modal";
import Badge from "../shared/components/Badge";
import handleApiCall from "../shared/services/apiService";
import { apiMethods, endPoints } from "../shared/constants/api";

import "./styles/supplychain.styles.css";

const poStatuses = ["pending", "approved", "delivered"];
const vendorStatuses = ["active", "inactive"];

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());

const SupplyChain = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("vendors");

  const [vendors, setVendors] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [vendorForm, setVendorForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    status: "active",
  });
  const [vendorErrors, setVendorErrors] = useState({});
  const [vendorSubmitting, setVendorSubmitting] = useState(false);

  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [poForm, setPoForm] = useState({
    vendorId: "",
    status: "pending",
    deliveryDate: "",
    items: [{ name: "", quantity: 1, unitPrice: 0 }],
  });
  const [poErrors, setPoErrors] = useState({});
  const [poSubmitting, setPoSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/", { replace: true });
  }, [navigate]);

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [vRes, poRes] = await Promise.all([
        handleApiCall(endPoints.vendors, apiMethods.get, null, true),
        handleApiCall(endPoints.purchaseOrders, apiMethods.get, null, true),
      ]);
      setVendors(vRes?.data || vRes || []);
      setPurchaseOrders(poRes?.data || poRes || []);
    } catch (e) {
      setError(e?.message || "Failed to load supply chain data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const vendorById = useMemo(() => {
    const map = new Map();
    vendors.forEach((v) => map.set(v._id || v.id, v));
    return map;
  }, [vendors]);

  const poAmount = useMemo(() => {
    return (poForm.items || []).reduce((sum, it) => {
      const q = Number(it.quantity || 0);
      const p = Number(it.unitPrice || 0);
      if (!Number.isFinite(q) || !Number.isFinite(p)) return sum;
      return sum + q * p;
    }, 0);
  }, [poForm.items]);

  const openVendorModal = () => {
    setVendorForm({ name: "", email: "", phone: "", address: "", status: "active" });
    setVendorErrors({});
    setIsVendorModalOpen(true);
  };

  const openPoModal = () => {
    setPoForm({
      vendorId: vendors?.[0]?._id || vendors?.[0]?.id || "",
      status: "pending",
      deliveryDate: "",
      items: [{ name: "", quantity: 1, unitPrice: 0 }],
    });
    setPoErrors({});
    setIsPoModalOpen(true);
  };

  const validateVendor = () => {
    const e = {};
    if (!vendorForm.name.trim()) e.name = "Vendor name is required";
    if (!vendorForm.email.trim()) e.email = "Email is required";
    else if (!validateEmail(vendorForm.email)) e.email = "Enter a valid email";
    if (!vendorForm.phone.trim()) e.phone = "Phone is required";
    if (!vendorForm.address.trim()) e.address = "Address is required";
    if (!vendorStatuses.includes(vendorForm.status)) e.status = "Invalid status";
    setVendorErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitVendor = async (ev) => {
    ev.preventDefault();
    if (!validateVendor()) return;
    setVendorSubmitting(true);
    setError("");
    try {
      await handleApiCall(endPoints.vendors, apiMethods.post, vendorForm, true);
      gooeyToast.success("Vendor created");
      setIsVendorModalOpen(false);
      loadAll();
    } catch (e) {
      setError(e?.message || "Failed to create vendor");
      gooeyToast.error(e?.message || "Failed to create vendor");
    } finally {
      setVendorSubmitting(false);
    }
  };

  const validatePo = () => {
    const e = {};
    if (!poForm.vendorId) e.vendorId = "Vendor is required";
    if (!poForm.deliveryDate) e.deliveryDate = "Delivery date is required";
    if (!poStatuses.includes(poForm.status)) e.status = "Invalid status";

    const itemErrors = (poForm.items || []).map((it) => {
      const ie = {};
      if (!String(it.name || "").trim()) ie.name = "Item name is required";
      const q = Number(it.quantity);
      if (!Number.isFinite(q) || q <= 0) ie.quantity = "Quantity must be > 0";
      const p = Number(it.unitPrice);
      if (!Number.isFinite(p) || p < 0) ie.unitPrice = "Unit price must be >= 0";
      return ie;
    });
    if ((poForm.items || []).length === 0) e.items = "At least 1 item is required";
    if (itemErrors.some((ie) => Object.keys(ie).length > 0)) e.itemErrors = itemErrors;
    if (!poAmount || poAmount <= 0) e.amount = "Amount must be greater than 0";

    setPoErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitPo = async (ev) => {
    ev.preventDefault();
    if (!validatePo()) return;
    setPoSubmitting(true);
    setError("");
    try {
      const payload = {
        vendorId: poForm.vendorId,
        status: poForm.status,
        deliveryDate: poForm.deliveryDate,
        items: poForm.items.map((it) => ({
          name: String(it.name || "").trim(),
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
        })),
        amount: poAmount,
      };

      await handleApiCall(endPoints.purchaseOrders, apiMethods.post, payload, true);
      gooeyToast.success("Purchase order created");
      setIsPoModalOpen(false);
      loadAll();
    } catch (e) {
      setError(e?.message || "Failed to create purchase order");
      gooeyToast.error(e?.message || "Failed to create purchase order");
    } finally {
      setPoSubmitting(false);
    }
  };

  return (
    <div className="sc-page">
      <div className="sc-header">
        <div>
          <h2 className="sc-title">Supply Chain</h2>
          <p className="sc-subtitle">Vendor & Purchase Order Management</p>
        </div>

        <div className="sc-actions">
          {activeTab === "vendors" ? (
            <button className="btn-primary" onClick={openVendorModal}>+ Add Vendor</button>
          ) : (
            <button className="btn-primary" onClick={openPoModal} disabled={vendors.length === 0}>
              + Add PO
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="sc-tabs">
        <button className={`tab-btn ${activeTab === "vendors" ? "active" : ""}`} onClick={() => setActiveTab("vendors")}>
          Vendors ({vendors.length})
        </button>
        <button className={`tab-btn ${activeTab === "purchaseOrders" ? "active" : ""}`} onClick={() => setActiveTab("purchaseOrders")}>
          Purchase Orders ({purchaseOrders.length})
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading...</div>
      ) : (
        <>
          {activeTab === "vendors" && (
            <div className="table-wrapper">
              <table className="sc-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="empty-cell">No vendors yet. Add your first vendor.</td>
                    </tr>
                  ) : (
                    vendors.map((v) => (
                      <tr key={v._id || v.id}>
                        <td>{v.name}</td>
                        <td>{v.email}</td>
                        <td>{v.phone}</td>
                        <td><Badge status={v.status || "active"} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "purchaseOrders" && (
            <div className="table-wrapper">
              <table className="sc-table">
                <thead>
                  <tr>
                    <th>PO Number</th>
                    <th>Vendor</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="empty-cell">No purchase orders yet.</td>
                    </tr>
                  ) : (
                    purchaseOrders.map((po) => {
                      const vid = po.vendorId || po.vendor?._id || po.vendor;
                      const vendorName =
                        po.vendorName ||
                        po.vendor?.name ||
                        vendorById.get(vid)?.name ||
                        "—";

                      return (
                        <tr key={po._id || po.id}>
                          <td><code>{po.poNumber || po.number || po.id}</code></td>
                          <td>{vendorName}</td>
                          <td className="amount-positive">{Number(po.amount || 0).toLocaleString()}</td>
                          <td><Badge status={po.status || "pending"} /></td>
                          <td>{po.deliveryDate ? new Date(po.deliveryDate).toLocaleDateString() : (po.createdAt ? new Date(po.createdAt).toLocaleDateString() : "—")}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Add Vendor Modal */}
      <Modal isOpen={isVendorModalOpen} onClose={() => setIsVendorModalOpen(false)} title="Add Vendor">
        <form className="sc-form" onSubmit={submitVendor}>
          <div className="form-grid">
            <div className="form-group">
              <label>Name *</label>
              <input value={vendorForm.name} onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })} placeholder="Vendor name" />
              {vendorErrors.name && <span className="form-error">{vendorErrors.name}</span>}
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={vendorForm.status} onChange={(e) => setVendorForm({ ...vendorForm, status: e.target.value })}>
                {vendorStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {vendorErrors.status && <span className="form-error">{vendorErrors.status}</span>}
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input value={vendorForm.email} onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })} placeholder="name@company.com" />
              {vendorErrors.email && <span className="form-error">{vendorErrors.email}</span>}
            </div>
            <div className="form-group">
              <label>Phone *</label>
              <input value={vendorForm.phone} onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })} placeholder="+91..." />
              {vendorErrors.phone && <span className="form-error">{vendorErrors.phone}</span>}
            </div>
            <div className="form-group form-group-full">
              <label>Address *</label>
              <input value={vendorForm.address} onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })} placeholder="Full address" />
              {vendorErrors.address && <span className="form-error">{vendorErrors.address}</span>}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setIsVendorModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={vendorSubmitting}>
              {vendorSubmitting ? "Saving..." : "Create Vendor"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add PO Modal */}
      <Modal isOpen={isPoModalOpen} onClose={() => setIsPoModalOpen(false)} title="Add Purchase Order">
        {vendors.length === 0 ? (
          <div className="sc-empty-note">
            Add at least one vendor before creating a purchase order.
          </div>
        ) : (
          <form className="sc-form" onSubmit={submitPo}>
            <div className="form-grid">
              <div className="form-group">
                <label>Vendor *</label>
                <select value={poForm.vendorId} onChange={(e) => setPoForm({ ...poForm, vendorId: e.target.value })}>
                  {vendors.map((v) => (
                    <option key={v._id || v.id} value={v._id || v.id}>{v.name}</option>
                  ))}
                </select>
                {poErrors.vendorId && <span className="form-error">{poErrors.vendorId}</span>}
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={poForm.status} onChange={(e) => setPoForm({ ...poForm, status: e.target.value })}>
                  {poStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {poErrors.status && <span className="form-error">{poErrors.status}</span>}
              </div>
              <div className="form-group">
                <label>Delivery date *</label>
                <input type="date" value={poForm.deliveryDate} onChange={(e) => setPoForm({ ...poForm, deliveryDate: e.target.value })} />
                {poErrors.deliveryDate && <span className="form-error">{poErrors.deliveryDate}</span>}
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input value={poAmount.toLocaleString()} readOnly />
                {poErrors.amount && <span className="form-error">{poErrors.amount}</span>}
              </div>
            </div>

            <div className="items-header">
              <div className="items-title">Items *</div>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setPoForm({ ...poForm, items: [...poForm.items, { name: "", quantity: 1, unitPrice: 0 }] })}
              >
                + Add Item
              </button>
            </div>

            {poErrors.items && <div className="form-error">{poErrors.items}</div>}

            <div className="items-list">
              {poForm.items.map((it, idx) => {
                const itemErr = (poErrors.itemErrors || [])[idx] || {};
                return (
                  <div key={idx} className="item-row">
                    <div className="form-group">
                      <label>Item</label>
                      <input
                        value={it.name}
                        onChange={(e) => {
                          const next = [...poForm.items];
                          next[idx] = { ...next[idx], name: e.target.value };
                          setPoForm({ ...poForm, items: next });
                        }}
                        placeholder="e.g. Toner Cartridge"
                      />
                      {itemErr.name && <span className="form-error">{itemErr.name}</span>}
                    </div>
                    <div className="form-group">
                      <label>Qty</label>
                      <input
                        type="number"
                        value={it.quantity}
                        onChange={(e) => {
                          const next = [...poForm.items];
                          next[idx] = { ...next[idx], quantity: e.target.value };
                          setPoForm({ ...poForm, items: next });
                        }}
                        min={1}
                      />
                      {itemErr.quantity && <span className="form-error">{itemErr.quantity}</span>}
                    </div>
                    <div className="form-group">
                      <label>Unit price</label>
                      <input
                        type="number"
                        value={it.unitPrice}
                        onChange={(e) => {
                          const next = [...poForm.items];
                          next[idx] = { ...next[idx], unitPrice: e.target.value };
                          setPoForm({ ...poForm, items: next });
                        }}
                        min={0}
                        step="0.01"
                      />
                      {itemErr.unitPrice && <span className="form-error">{itemErr.unitPrice}</span>}
                    </div>
                    <div className="form-group item-actions">
                      <label>&nbsp;</label>
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => setPoForm({ ...poForm, items: poForm.items.filter((_, i) => i !== idx) })}
                        disabled={poForm.items.length === 1}
                        title={poForm.items.length === 1 ? "At least one item is required" : "Remove item"}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setIsPoModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={poSubmitting}>
                {poSubmitting ? "Saving..." : "Create PO"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default SupplyChain;

