import React, { useState, useEffect } from "react";
import handleApiCall from "../shared/services/apiService";
import { apiMethods, endPoints } from "../shared/constants/api";
import EmployeeTable from "../features/hr/components/EmployeeTable";
import EmployeeForm from "../features/hr/components/EmployeeForm";
import Modal from "../shared/components/Modal";
import Badge from "../shared/components/Badge";
import { gooeyToast } from "goey-toast";
import "./styles/hr.styles.css";

// ─── Leave Request Form ───────────────────────────────────────────────────────
const LeaveRequestForm = ({ employees, leaveTypes, onSuccess, onClose }) => {
  const [form, setForm] = useState({
    employeeId: "", leaveTypeId: "", startDate: "", endDate: "", reason: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.employeeId) e.employeeId = "Employee is required";
    if (!form.leaveTypeId) e.leaveTypeId = "Leave type is required";
    if (!form.startDate) e.startDate = "Start date is required";
    if (!form.endDate) e.endDate = "End date is required";
    if (!form.reason.trim()) e.reason = "Reason is required";
    if (form.startDate && form.endDate && form.endDate < form.startDate)
      e.endDate = "End date cannot be before start date";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await handleApiCall(endPoints.leaveRequests, apiMethods.post, form, true);
      gooeyToast.success("Leave request submitted");
      onSuccess();
    } catch (err) {
      gooeyToast.error(err.message || "Failed to submit leave request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="hr-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Employee *</label>
        <select value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })}>
          <option value="">Select employee</option>
          {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
        </select>
        {errors.employeeId && <span className="form-error">{errors.employeeId}</span>}
      </div>
      <div className="form-group">
        <label>Leave Type *</label>
        <select value={form.leaveTypeId} onChange={e => setForm({ ...form, leaveTypeId: e.target.value })}>
          <option value="">Select leave type</option>
          {leaveTypes.map(lt => <option key={lt._id} value={lt._id}>{lt.name} (max {lt.maxDays} days)</option>)}
        </select>
        {errors.leaveTypeId && <span className="form-error">{errors.leaveTypeId}</span>}
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Start Date *</label>
          <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
          {errors.startDate && <span className="form-error">{errors.startDate}</span>}
        </div>
        <div className="form-group">
          <label>End Date *</label>
          <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
          {errors.endDate && <span className="form-error">{errors.endDate}</span>}
        </div>
      </div>
      <div className="form-group">
        <label>Reason *</label>
        <input value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Reason for leave..." />
        {errors.reason && <span className="form-error">{errors.reason}</span>}
      </div>
      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-submit" disabled={loading}>{loading ? "Submitting..." : "Submit Request"}</button>
      </div>
    </form>
  );
};

// ─── Clock In/Out Form ────────────────────────────────────────────────────────
const ClockForm = ({ employees, type, onSuccess, onClose }) => {
  const [employeeId, setEmployeeId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!employeeId) { setError("Employee is required"); return; }
    setLoading(true);
    try {
      const endpoint = type === "in"
        ? `${endPoints.attendance}/clock-in`
        : `${endPoints.attendance}/clock-out`;
      await handleApiCall(endpoint, apiMethods.post, { employeeId }, true);
      gooeyToast.success(`Clocked ${type} successfully`);
      onSuccess();
    } catch (err) {
      gooeyToast.error(err.message || `Failed to clock ${type}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="hr-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Employee *</label>
        <select value={employeeId} onChange={e => { setEmployeeId(e.target.value); setError(""); }}>
          <option value="">Select employee</option>
          {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
        </select>
        {error && <span className="form-error">{error}</span>}
      </div>
      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? "Processing..." : `Clock ${type === "in" ? "In" : "Out"}`}
        </button>
      </div>
    </form>
  );
};

// ─── Main HR Page ─────────────────────────────────────────────────────────────
const HR = () => {
  const [activeTab, setActiveTab] = useState("employees");
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modals
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [clockModal, setClockModal] = useState(null); // "in" | "out" | null

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [empRes, ltRes, lrRes, attRes] = await Promise.allSettled([
        handleApiCall(endPoints.employees, apiMethods.get, null, true),
        handleApiCall(endPoints.leaveTypes, apiMethods.get, null, true),
        handleApiCall(endPoints.leaveRequests, apiMethods.get, null, true),
        handleApiCall(endPoints.attendance, apiMethods.get, null, true),
      ]);
      setEmployees(empRes.status === "fulfilled" ? empRes.value?.data || [] : []);
      setLeaveTypes(ltRes.status === "fulfilled" ? ltRes.value?.data || [] : []);
      setLeaveRequests(lrRes.status === "fulfilled" ? lrRes.value?.data || [] : []);
      setAttendance(attRes.status === "fulfilled" ? attRes.value?.data || [] : []);
    } catch (err) {
      setError(err.message || "Failed to load HR data");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await handleApiCall(`${endPoints.leaveRequests}/${id}/approve`, apiMethods.patch, { requestId: id }, true);
      gooeyToast.success("Leave request approved");
      fetchAll();
    } catch (err) {
      gooeyToast.error(err.message || "Failed to approve");
    }
  };

  const handleReject = async (id) => {
    try {
      await handleApiCall(`${endPoints.leaveRequests}/${id}/reject`, apiMethods.patch, { requestId: id }, true);
      gooeyToast.success("Leave request rejected");
      fetchAll();
    } catch (err) {
      gooeyToast.error(err.message || "Failed to reject");
    }
  };

  const confirmDelete = async () => {
    try {
      await handleApiCall(`${endPoints.employees}/${deleteConfirm._id}`, apiMethods.delete, null, true);
      gooeyToast.success("Employee deleted successfully");
      setDeleteConfirm(null);
      fetchAll();
    } catch (err) {
      gooeyToast.error(err.message || "Failed to delete employee");
    }
  };

  return (
    <div className="hr-page">
      <div className="hr-header">
        <div>
          <h2 className="hr-title">HR Management</h2>
          <p className="hr-subtitle">Manage employees, leave requests and attendance</p>
        </div>
        <div className="hr-header-actions">
          {activeTab === "employees" && (
            <button className="btn-add-employee" onClick={() => { setSelectedEmployee(null); setIsEmployeeModalOpen(true); }}>
              + Add Employee
            </button>
          )}
          {activeTab === "leave" && (
            <button className="btn-add-employee" onClick={() => setIsLeaveModalOpen(true)}>
              + Submit Leave Request
            </button>
          )}
          {activeTab === "attendance" && (
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn-add-employee" onClick={() => setClockModal("in")}>Clock In</button>
              <button className="btn-secondary-action" onClick={() => setClockModal("out")}>Clock Out</button>
            </div>
          )}
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Tabs */}
      <div className="hr-tabs">
        <button className={`tab-btn ${activeTab === "employees" ? "active" : ""}`} onClick={() => setActiveTab("employees")}>
          Employees ({employees.length})
        </button>
        <button className={`tab-btn ${activeTab === "leave" ? "active" : ""}`} onClick={() => setActiveTab("leave")}>
          Leave Requests ({leaveRequests.length})
        </button>
        <button className={`tab-btn ${activeTab === "attendance" ? "active" : ""}`} onClick={() => setActiveTab("attendance")}>
          Attendance ({attendance.length})
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading...</div>
      ) : (
        <>
          {/* Employees Tab */}
          {activeTab === "employees" && (
            <EmployeeTable employees={employees} onEdit={(emp) => { setSelectedEmployee(emp); setIsEmployeeModalOpen(true); }} onDelete={setDeleteConfirm} />
          )}

          {/* Leave Requests Tab */}
          {activeTab === "leave" && (
            <div className="table-wrapper">
              <table className="hr-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Leave Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Days</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveRequests.length === 0 ? (
                    <tr><td colSpan={7} className="empty-cell">No leave requests found.</td></tr>
                  ) : leaveRequests.map(lr => (
                    <tr key={lr._id}>
                      <td>{lr.employee?.name || "—"}</td>
                      <td>{lr.leaveType?.name || "—"}</td>
                      <td>{new Date(lr.startDate).toLocaleDateString()}</td>
                      <td>{new Date(lr.endDate).toLocaleDateString()}</td>
                      <td>{lr.totalDays}</td>
                      <td><Badge status={lr.status} /></td>
                      <td>
                        {lr.status === "pending" && (
                          <div className="action-buttons">
                            <button className="btn-approve" onClick={() => handleApprove(lr._id)}>Approve</button>
                            <button className="btn-reject" onClick={() => handleReject(lr._id)}>Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Attendance Tab */}
          {activeTab === "attendance" && (
            <div className="table-wrapper">
              <table className="hr-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Clock In</th>
                    <th>Clock Out</th>
                    <th>Hours Worked</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.length === 0 ? (
                    <tr><td colSpan={6} className="empty-cell">No attendance records found.</td></tr>
                  ) : attendance.map(att => (
                    <tr key={att._id}>
                      <td>{att.employee?.name || "—"}</td>
                      <td>{new Date(att.date).toLocaleDateString()}</td>
                      <td>{att.clockIn ? new Date(att.clockIn).toLocaleTimeString() : "—"}</td>
                      <td>{att.clockOut ? new Date(att.clockOut).toLocaleTimeString() : "—"}</td>
                      <td>{att.hoursWorked ? `${att.hoursWorked}h` : "—"}</td>
                      <td><Badge status={att.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Employee Add/Edit Modal */}
      <Modal isOpen={isEmployeeModalOpen} onClose={() => setIsEmployeeModalOpen(false)} title={selectedEmployee ? "Edit Employee" : "Add Employee"}>
        <EmployeeForm employee={selectedEmployee} onSuccess={() => { setIsEmployeeModalOpen(false); fetchAll(); }} onClose={() => setIsEmployeeModalOpen(false)} />
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete">
        <div className="delete-confirm">
          <p>Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>?</p>
          <p className="delete-warning">This action cannot be undone.</p>
          <div className="delete-actions">
            <button className="btn-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn-delete-confirm" onClick={confirmDelete}>Delete</button>
          </div>
        </div>
      </Modal>

      {/* Leave Request Modal */}
      <Modal isOpen={isLeaveModalOpen} onClose={() => setIsLeaveModalOpen(false)} title="Submit Leave Request">
        <LeaveRequestForm employees={employees} leaveTypes={leaveTypes} onSuccess={() => { setIsLeaveModalOpen(false); fetchAll(); }} onClose={() => setIsLeaveModalOpen(false)} />
      </Modal>

      {/* Clock In/Out Modal */}
      <Modal isOpen={!!clockModal} onClose={() => setClockModal(null)} title={clockModal === "in" ? "Clock In" : "Clock Out"}>
        <ClockForm employees={employees} type={clockModal} onSuccess={() => { setClockModal(null); fetchAll(); }} onClose={() => setClockModal(null)} />
      </Modal>
    </div>
  );
};

export default HR;
