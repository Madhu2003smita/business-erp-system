const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');

const {
  addMilestone,
  getMilestones,
  completeMilestone,
} = require('../controllers/milestoneController');

// Project Routes

// POST: Create a project
router.post(
  '/',
  authMiddleware,
  roleMiddleware('admin'),
  createProject
);

// GET: List all projects (employees can view)
router.get('/', authMiddleware, getProjects);

// GET: Fetch project details with milestones (employees can view)
router.get('/:id', authMiddleware, getProjectById);

// PUT: Update a project
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  updateProject
);

// DELETE: Soft delete a project
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  deleteProject
);

// Milestone Routes (nested under projects)

// POST: Add a milestone to a project
router.post(
  '/:projectId/milestones',
  authMiddleware,
  roleMiddleware('admin'),
  addMilestone
);

// GET: List milestones for a project (employees can view)
router.get('/:projectId/milestones', authMiddleware, getMilestones);

// PATCH: Mark a milestone as complete
router.patch(
  '/:projectId/milestones/:milestoneId/complete',
  authMiddleware,
  roleMiddleware('admin'),
  completeMilestone
);

module.exports = router;
