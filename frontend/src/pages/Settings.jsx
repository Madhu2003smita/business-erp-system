import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router";
import { gooeyToast } from "goey-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./styles/settings.styles.css";

const Settings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", email: "", role: "", id: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false, new: false, confirm: false,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/", { replace: true });
      return;
    }
    try {
      const decoded = jwtDecode(token);
      setUser({
        name: decoded.name || "User",
        email: decoded.email || "—",
        role: decoded.role || "user",
        id: decoded.id || decoded.sub || "—",
      });
    } catch {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const validatePassword = () => {
    const e = {};
    if (!passwordForm.currentPassword) e.currentPassword = "Current password is required";
    if (!passwordForm.newPassword) e.newPassword = "New password is required";
    else if (passwordForm.newPassword.length < 6) e.newPassword = "Password must be at least 6 characters";
    if (!passwordForm.confirmPassword) e.confirmPassword = "Please confirm your new password";
    else if (passwordForm.newPassword !== passwordForm.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    setPasswordErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}auth/change-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to change password");
      gooeyToast.success("Password changed successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordErrors({});
    } catch (err) {
      gooeyToast.error(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  const getRoleBadgeClass = (role) => {
    if (role === "admin") return "role-badge role-admin";
    return "role-badge role-user";
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h2 className="settings-title">Settings</h2>
        <p className="settings-subtitle">Manage your account and preferences</p>
      </div>

      <div className="settings-grid">
        {/* User Profile Card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h3>User Profile</h3>
          </div>
          <div className="settings-card-body">
            <div className="profile-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="profile-info">
              <div className="profile-row">
                <span className="profile-label">Name</span>
                <span className="profile-value">{user.name || "—"}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">Email</span>
                <span className="profile-value">{user.email || "—"}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">Role</span>
                <span className={getRoleBadgeClass(user.role)}>{user.role}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">User ID</span>
                <span className="profile-value profile-id">{user.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h3>Change Password</h3>
          </div>
          <div className="settings-card-body">
            <form className="password-form" onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>Current Password *</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={e => {
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value });
                      setPasswordErrors({ ...passwordErrors, currentPassword: "" });
                    }}
                    placeholder="Enter current password"
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}>
                    {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {passwordErrors.currentPassword && <span className="form-error">{passwordErrors.currentPassword}</span>}
              </div>
              <div className="form-group">
                <label>New Password *</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={e => {
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value });
                      setPasswordErrors({ ...passwordErrors, newPassword: "" });
                    }}
                    placeholder="Enter new password (min 6 chars)"
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}>
                    {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {passwordErrors.newPassword && <span className="form-error">{passwordErrors.newPassword}</span>}
              </div>
              <div className="form-group">
                <label>Confirm New Password *</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={e => {
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value });
                      setPasswordErrors({ ...passwordErrors, confirmPassword: "" });
                    }}
                    placeholder="Confirm new password"
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}>
                    {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && <span className="form-error">{passwordErrors.confirmPassword}</span>}
              </div>
              <button type="submit" className="btn-save" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>

        {/* System Info Card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h3>System Information</h3>
          </div>
          <div className="settings-card-body">
            <div className="profile-info">
              <div className="profile-row">
                <span className="profile-label">System</span>
                <span className="profile-value">Amdox ERP Suite</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">Version</span>
                <span className="profile-value">v1.0.0</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">Environment</span>
                <span className="profile-value">Development</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">API Base</span>
                <span className="profile-value profile-id">{import.meta.env.VITE_API_BASE_URL || "localhost:5000"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone Card */}
        <div className="settings-card settings-card-danger">
          <div className="settings-card-header">
            <h3>Account Actions</h3>
          </div>
          <div className="settings-card-body">
            <p className="danger-text">Logging out will clear your session and redirect you to the login page.</p>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
