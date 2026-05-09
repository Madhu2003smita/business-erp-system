import React, { useState, useEffect } from "react";
import { gooeyToast } from "goey-toast";
import Modal from "../shared/components/Modal";
import Badge from "../shared/components/Badge";
import "./styles/projects.styles.css";

// Mock data — replace with API calls when backend is ready
const MOCK_PROJECTS = [
  {
    _id: "1",
    name: "ERP System Development",
    description: "Build the full ERP suite for Amdox Technologies",
    budget: 150000,
    actualCost: 45000,
    startDate: "2026-01-01",
    endDate: "2026-06-30",
    status: "active",
    milestones: [
      { _id: "m1", name: "Authentication Module", dueDate: "2026-02-01", status: "completed" },
      { _id: "m2", name: "Finance Module", dueDate: "2026-03-01", status: "completed" },
      { _id: "m3", name: "HR Module", dueDate: "2026-04-01", status: "pending" },
      { _id: "m4", name: "Supply Chain Module", dueDate: "2026-05-01", status: "pending" },
    ],
  },
  {
    _id: "2",
    name: "Mobile App Development",
    description: "React Native mobile app for field employees",
    budget: 80000,
    actualCost: 82000,
    startDate: "2026-02-01",
    endDate: "2026-05-31",
    status: "active",
    milestones: [
      { _id: "m5", name: "UI Design", dueDate: "2026-02-15", status: "completed" },
      { _id: "m6", name: "API Integration", dueDate: "2026-03-15", status: "pending" },
    ],
  },
  {
    _id: "3",
    name: "Data Migration",
    description: "Migrate legacy data to new ERP system",
    budget: 30000,
    actualCost: 30000,
    startDate: "2025-10-01",
    endDate: "2025-12-31",
    status: "completed",
    milestones: [
      { _id: "m7", name: "Data Audit", dueDate: "2025-10-31", status: "completed" },
      { _id: "m8", name: "Migration Scripts", dueDate: "2025-11-30", status: "completed" },
      { _id: "m9", name: "Validation", dueDate: "2025-12-31", status: "completed" },
    ],
  },
];

const statusColors = { active: "active", completed: "approved", on_hold: "on_leave" };

const BudgetBar = ({ budget, actualCost }) => {
  const pct = budget > 0 ? Math.min((actualCost / budget) * 100, 100) : 0;
  const overrun = actualCost > budget * 1.1;
  return (
    <div className="budget-bar-wrapper">
      <div className="budget-bar-track">
        <div
          className={`budget-bar-fill ${overrun ? "overrun" : ""}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="budget-bar-labels">
        <span>Spent: ${actualCost?.toLocaleString()}</span>
        <span>Budget: ${budget?.toLocaleString()}</span>
      </div>
      {overrun && <span className="overrun-alert">⚠ Budget overrun by 10%+</span>}
    </div>
  );
};

const MilestoneList = ({ milestones, onAddMilestone }) => (
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
            <Badge status={m.status === "completed" ? "approved" : "pending"} />
          </li>
        ))}
      </ul>
    )}
  </div>
);

const ProjectForm = ({ onSuccess, onClose }) => {
  const [form, setForm] = useState({
    name: "", description: "", budget: "", startDate: "", endDate: "", status: "active",
  });
  const [errors, setErrors] = useState({});

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

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    // TODO: connect to POST /api/projects
    gooeyToast.success("Project created successfully");
    onSuccess({ ...form, _id: Date.now().toString(), actualCost: 0, milestones: [] });
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
        <button type="submit" className="btn-submit">Create Project</button>
      </div>
    </form>
  );
};

const MilestoneForm = ({ onSuccess, onClose }) => {
  const [form, setForm] = useState({ name: "", dueDate: "" });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Milestone name is required";
    if (!form.dueDate) e.dueDate = "Due date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    gooeyToast.success("Milestone added");
    onSuccess({ ...form, _id: Date.now().toString(), status: "pending" });
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
        <button type="submit" className="btn-submit">Add Milestone</button>
      </div>
    </form>
  );
};

const Projects = () => {
  const [projects, setProjects] = useState(MOCK_PROJECTS);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);

  const handleAddProject = (newProject) => {
    setProjects([newProject, ...projects]);
    setIsProjectModalOpen(false);
  };

  const handleAddMilestone = (newMilestone) => {
    const updated = projects.map(p =>
      p._id === selectedProject._id
        ? { ...p, milestones: [...p.milestones, newMilestone] }
        : p
    );
    setProjects(updated);
    setSelectedProject(updated.find(p => p._id === selectedProject._id));
    setIsMilestoneModalOpen(false);
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

      {selectedProject ? (
        // Project Detail View
        <div className="project-detail">
          <button className="btn-back" onClick={() => setSelectedProject(null)}>← Back to Projects</button>
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
              milestones={selectedProject.milestones}
              onAddMilestone={() => setIsMilestoneModalOpen(true)}
            />
          </div>
        </div>
      ) : (
        // Project Cards Grid
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
                  <span className="milestone-count">
                    {project.milestones.filter(m => m.status === "completed").length}/{project.milestones.length} milestones
                  </span>
                  <button className="btn-view" onClick={() => setSelectedProject(project)}>View →</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <Modal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} title="Add Project">
        <ProjectForm onSuccess={handleAddProject} onClose={() => setIsProjectModalOpen(false)} />
      </Modal>

      <Modal isOpen={isMilestoneModalOpen} onClose={() => setIsMilestoneModalOpen(false)} title="Add Milestone">
        <MilestoneForm onSuccess={handleAddMilestone} onClose={() => setIsMilestoneModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default Projects;
