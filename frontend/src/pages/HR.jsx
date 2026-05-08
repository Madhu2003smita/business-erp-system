import React, { useState, useEffect } from "react";
import handleApiCall from "../shared/services/apiService";
import { apiMethods, endPoints } from "../shared/constants/api";
import EmployeeTable from "../features/hr/components/EmployeeTable";
import EmployeeForm from "../features/hr/components/EmployeeForm";
import Modal from "../shared/components/Modal";
import { gooeyToast } from "goey-toast";
import "./styles/hr.styles.css";

const HR = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await handleApiCall(endPoints.employees, apiMethods.get, null, true);
      setEmployees(result?.data || []);
    } catch (err) {
      setError(err.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleDelete = (employee) => {
    setDeleteConfirm(employee);
  };

  const confirmDelete = async () => {
    try {
      await handleApiCall(`${endPoints.employees}/${deleteConfirm._id}`, apiMethods.delete, null, true);
      gooeyToast.success("Employee deleted successfully");
      setDeleteConfirm(null);
      fetchEmployees();
    } catch (err) {
      gooeyToast.error(err.message || "Failed to delete employee");
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
    fetchEmployees();
  };

  return (
    <div className="hr-page">
      <div className="hr-header">
        <div>
          <h2 className="hr-title">HR Management</h2>
          <p className="hr-subtitle">Manage your employees and departments</p>
        </div>
        <button className="btn-add-employee" onClick={handleAdd}>
          + Add Employee
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading-state">Loading employees...</div>
      ) : (
        <EmployeeTable
          employees={employees}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedEmployee ? "Edit Employee" : "Add Employee"}
      >
        <EmployeeForm
          employee={selectedEmployee}
          onSuccess={handleFormSuccess}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Confirm Delete"
      >
        <div className="delete-confirm">
          <p>Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>?</p>
          <p className="delete-warning">This action cannot be undone.</p>
          <div className="delete-actions">
            <button className="btn-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn-delete-confirm" onClick={confirmDelete}>Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HR;
