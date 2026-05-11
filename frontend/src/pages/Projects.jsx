import React, { useState, useEffect } from "react";
import { gooeyToast } from "goey-toast";
import Modal from "../shared/components/Modal";
import Badge from "../shared/components/Badge";
import handleApiCall from "../shared/services/apiService";
import { apiMethods } from "../shared/constants/api";
import "./styles/projects.styles.css";

const projectEndpoints = {
  projects: "projects",
  milestones: (id) => `projects/${id}/milestones`,
  completeMilestone: (projectId, milestoneId) => `projects/${projectId}/milestones/${milestoneId}/complete`,
};

const statusColors = { active: "active", completed: "approved", on_hold: "on_leave" };

// ─── Budget Bar ───────────────────────────────────────────────────────────────
const BudgetBar = ({ budget, actualCost }) => {
  const pct = budget > 0 ? Math.min((actualCost / budget) * 100, 100) : 0;
  const overrun = actualCost > budget * 1.1;
  return (
    <div className="budget-bar-wrapper">
      <div className="budget-bar-track">
        <div className={`budget-bar-fill ${overrun ? "overrun" : ""}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="budget-bar-labels">
        <span>Spent: ${actualCost?.toLocaleString()}</span>
        <span>Budget: ${budget?.toLocaleString()}</span>
      </div>
      {overrun && <span className="overrun-alert">⚠ Budget overrun by 10%+</span>}
    </div>
  );
};

// ─── Milestone List ───────────────────────────────────────────────────────────
const MilestoneList = ({ milestones, onAddMilestone, onComplete }) => (
  <div className="milestone-section">
    <div className="milestone-header">
      <h4>Milestones</h4>
      <button className="btn-sm" onClick={onAddMilestone}>+ Add Milestone</button>
    </div>
    {milestones.length === 0 ? (
      <p className="empty-text">No milestones yet.</p>
    ) : (
      <ul className="milestone-list">
        {milestones.map((m) => (
          <li key={m._id} className="milestone-item">
            <div className="milestone-info">
              <span className="milestone-name">{m.name}</span>
              <span className="milestone-date">{new Date(m.dueDate).toLocaleDateString()}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Badge status={m.status === "completed" ? "approved" : "pending"} />
              {m.status === "pending" && (
                <button className="btn-sm" onClick={() => onComplete(m._id)}>✓ Complete</button>
              )}
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
);

// ─── Project Form ─────────────────────────────────────────────────────────────
const ProjectForm = ({ onSuccess, onClose }) => {
  const [form, setForm] = useState({
    name: "", description: "", budget: "", startDate: "", endDate: "", status: "active",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Project name is required";
    if (!form.budget || Number(form.budget) <= 0) e.budget = "Budget must be greater than 0";
    if (!form.startDate) e.startDate = "Start date is required";
    if (!form.endDate) e.endDate = "End date is required";
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
      const payload = { ...form, budget: Number(form.budget) };
      await handleApiCall(projectEndpoints.projects, apiMethods.post, payload, true);
      gooeyToast.success("Project created successfully");
      onSuccess();
    } catch (err) {
      gooeyToast.error(err.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="project-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Project Name *</label>
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. ERP Phase 2" />
        {errors.name && <span className="form-error">{errors.name}</span>}
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Project description..." rows={3} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Budget *</label>
          <input type="number" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} placeholder="100000" />
          {errors.budget && <span className="form-error">{errors.budget}</span>}
        </div>
        <div className="form-group">
          <label>Status</label>
          <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
        </div>
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
      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-submit" disabled={loading}>{loading ? "Creating..." : "Create Project"}</button>
      </div>
    </form>
  );
};

// ─── Milestone Form ───────────────────────────────────────────────────────────
const MilestoneForm = ({ projectId, onSuccess, onClose }) => {
  const [form, setForm] = useState({ name: "", dueDate: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Milestone name is required";
    if (!form.dueDate) e.dueDate = "Due date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await handleApiCall(projectEndpoints.milestones(projectId), apiMethods.post, form, true);
      gooeyToast.success("Milestone added");
      onSuccess();
    } catch (err) {
      gooeyToast.error(err.message || "Failed to add milestone");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="project-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Milestone Name *</label>
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Design Complete" />
        {errors.name && <span className="form-error">{errors.name}</span>}
      </div>
      <div className="form-group">
        <label>Due Date *</label>
        <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
        {errors.dueDate && <span className="form-error">{errors.dueDate}</span>}
      </div>
      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-submit" disabled={loading}>{loading ? "Adding..." : "Add Milestone"}</button>
      </div>
    </form>
  );
};

// ─── Main Projects Page ───────────────────────────────────────────────────────
const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await handleApiCall(projectEndpoints.projects, apiMethods.get, null, true);
      setProjects(result?.data || []);
    } catch (err) {
      setError(err.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const fetchMilestones = async (projectId) => {
    try {
      const result = await handleApiCall(projectEndpoints.milestones(projectId), apiMethods.get, null, true);
      setMilestones(result?.data || []);
    } catch {
      setMilestones([]);
    }
  };

  const handleViewProject = async (project) => {
    setSelectedProject(project);
    await fetchMilestones(project._id);
  };

  const handleCompleteMilestone = async (milestoneId) => {
    try {
      await handleApiCall(
        projectEndpoints.completeMilestone(selectedProject._id, milestoneId),
        apiMethods.patch, null, true
      );
      gooeyToast.success("Milestone completed");
      await fetchMilestones(selectedProject._id);
    } catch (err) {
      gooeyToast.error(err.message || "Failed to complete milestone");
    }
  };

  return (
    <div className="projects-page">
      <div className="projects-header">
        <div>
          <h2 className="projects-title">Project Management</h2>
          <p className="projects-subtitle">Track projects, milestones and budgets</p>
        </div>
        <button className="btn-add-project" onClick={() => setIsProjectModalOpen(true)}>
          + Add Project
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {selectedProject ? (
        <div className="project-detail">
          <button className="btn-back" onClick={() => { setSelectedProject(null); setMilestones([]); }}>← Back to Projects</button>
          <div className="project-detail-card">
            <div className="project-detail-header">
              <div>
                <h3>{selectedProject.name}</h3>
                <p className="project-desc">{selectedProject.description}</p>
              </div>
              <Badge status={statusColors[selectedProject.status] || "pending"} />
            </div>
            <div className="project-dates">
              <span>Start: {new Date(selectedProject.startDate).toLocaleDateString()}</span>
              <span>End: {new Date(selectedProject.endDate).toLocaleDateString()}</span>
            </div>
            <BudgetBar budget={selectedProject.budget} actualCost={selectedProject.actualCost} />
            <MilestoneList
              milestones={milestones}
              onAddMilestone={() => setIsMilestoneModalOpen(true)}
              onComplete={handleCompleteMilestone}
            />
          </div>
        </div>
      ) : (
        <>
          {loading ? (
            <div className="loading-state">Loading projects...</div>
          ) : (
            <div className="projects-grid">
              {projects.length === 0 ? (
                <div className="empty-state">No projects yet. Add your first project.</div>
              ) : (
                projects.map(project => (
                  <div key={project._id} className="project-card">
                    <div className="project-card-header">
                      <h3 className="project-card-name">{project.name}</h3>
                      <Badge status={statusColors[project.status] || "pending"} />
                    </div>
                    <p className="project-card-desc">{project.description}</p>
                    <div className="project-card-dates">
                      <span>{new Date(project.startDate).toLocaleDateString()}</span>
                      <span>→</span>
                      <span>{new Date(project.endDate).toLocaleDateString()}</span>
                    </div>
                    <BudgetBar budget={project.budget} actualCost={project.actualCost} />
                    <div className="project-card-footer">
                      <span className="milestone-count">{project.projectNumber}</span>
                      <button className="btn-view" onClick={() => handleViewProject(project)}>View →</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      <Modal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} title="Add Project">
        <ProjectForm onSuccess={() => { setIsProjectModalOpen(false); fetchProjects(); }} onClose={() => setIsProjectModalOpen(false)} />
      </Modal>

      <Modal isOpen={isMilestoneModalOpen} onClose={() => setIsMilestoneModalOpen(false)} title="Add Milestone">
        <MilestoneForm
          projectId={selectedProject?._id}
          onSuccess={() => { setIsMilestoneModalOpen(false); fetchMilestones(selectedProject._id); }}
          onClose={() => setIsMilestoneModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Projects;
