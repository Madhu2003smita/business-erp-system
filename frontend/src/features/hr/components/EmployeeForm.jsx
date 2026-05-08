import React, { useState, useEffect } from "react";
import handleApiCall from "../../../shared/services/apiService";
import { apiMethods, endPoints } from "../../../shared/constants/api";
import { gooeyToast } from "goey-toast";
import "./employeeform.styles.css";

const EmployeeForm = ({ employee, onSuccess, onClose }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    designation: "",
    salary: "",
    joiningDate: "",
    status: "active",
  });
  const [departments, setDepartments] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
    if (employee) {
      setForm({
        name: employee.name || "",
        email: employee.email || "",
        department: employee.department?._id || employee.department || "",
        designation: employee.designation || "",
        salary: employee.salary || "",
        joiningDate: employee.joiningDate
          ? new Date(employee.joiningDate).toISOString().split("T")[0]
          : "",
        status: employee.status || "active",
      });
    }
  }, [employee]);

  const fetchDepartments = async () => {
    try {
      const result = await handleApiCall(endPoints.departments, apiMethods.get, null, true);
      setDepartments(result?.data || []);
    } catch {
      setDepartments([]);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.designation.trim()) newErrors.designation = "Designation is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = { ...form, salary: Number(form.salary) };
      if (employee) {
        await handleApiCall(`${endPoints.employees}/${employee._id}`, apiMethods.put, payload, true);
        gooeyToast.success("Employee updated successfully");
      } else {
        await handleApiCall(endPoints.employees, apiMethods.post, payload, true);
        gooeyToast.success("Employee created successfully");
      }
      onSuccess();
    } catch (err) {
      gooeyToast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="employee-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Full Name *</label>
        <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" />
        {errors.name && <span className="form-error">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label>Email *</label>
        <input name="email" value={form.email} onChange={handleChange} placeholder="john@company.com" type="email" />
        {errors.email && <span className="form-error">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label>Department</label>
        <select name="department" value={form.department} onChange={handleChange}>
          <option value="">Select Department</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>{d.name}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Designation *</label>
        <input name="designation" value={form.designation} onChange={handleChange} placeholder="Software Engineer" />
        {errors.designation && <span className="form-error">{errors.designation}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Salary</label>
          <input name="salary" value={form.salary} onChange={handleChange} placeholder="50000" type="number" />
        </div>
        <div className="form-group">
          <label>Joining Date</label>
          <input name="joiningDate" value={form.joiningDate} onChange={handleChange} type="date" />
        </div>
      </div>

      <div className="form-group">
        <label>Status</label>
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="on_leave">On Leave</option>
          <option value="terminated">Terminated</option>
        </select>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? "Saving..." : employee ? "Update Employee" : "Add Employee"}
        </button>
      </div>
    </form>
  );
};

export default EmployeeForm;
