import React from "react";
import Badge from "../../../shared/components/Badge";
import "./employeetable.styles.css";

const EmployeeTable = ({ employees, onEdit, onDelete }) => {
  if (employees.length === 0) {
    return (
      <div className="empty-state">
        <p>No employees found. Add your first employee.</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="employee-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Designation</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp._id}>
              <td>{emp.name}</td>
              <td>{emp.email}</td>
              <td>{emp.department?.name || "—"}</td>
              <td>{emp.designation || "—"}</td>
              <td><Badge status={emp.status} /></td>
              <td>
                <div className="action-buttons">
                  <button className="btn-edit" onClick={() => onEdit(emp)}>Edit</button>
                  <button className="btn-delete" onClick={() => onDelete(emp)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeTable;
