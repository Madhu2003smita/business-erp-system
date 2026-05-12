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
/**
 * @swagger
 * /api/projects:
 *   post:
 *     tags:
 *       - Projects
 *     summary: Create a project.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: ERP Upgrade
 *               description:
 *                 type: string
 *                 example: Modernize the finance and inventory workflow.
 *               client:
 *                 type: string
 *                 example: Amdox
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-05-12
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-10-31
 *               status:
 *                 type: string
 *                 example: active
 *     responses:
 *       201:
 *         description: Project created successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Role access denied.
 */
router.post(
  '/',
  authMiddleware,
  roleMiddleware('admin'),
  createProject
);

// GET: List all projects (employees can view)
/**
 * @swagger
 * /api/projects:
 *   get:
 *     tags:
 *       - Projects
 *     summary: List projects.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Projects retrieved successfully.
 *       401:
 *         description: Missing or invalid bearer token.
 */
router.get('/', authMiddleware, getProjects);

// GET: Fetch project details with milestones (employees can view)
/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     tags:
 *       - Projects
 *     summary: Get a project by ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project identifier.
 *     responses:
 *       200:
 *         description: Project retrieved successfully.
 *       401:
 *         description: Missing or invalid bearer token.
 *       404:
 *         description: Project not found.
 */
router.get('/:id', authMiddleware, getProjectById);

// PUT: Update a project
/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     tags:
 *       - Projects
 *     summary: Update a project.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project identifier.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: ERP Upgrade
 *               description:
 *                 type: string
 *                 example: Modernize the finance and inventory workflow.
 *               client:
 *                 type: string
 *                 example: Amdox
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-05-12
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-11-30
 *               status:
 *                 type: string
 *                 example: active
 *     responses:
 *       200:
 *         description: Project updated successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Role access denied.
 *       404:
 *         description: Project not found.
 */
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  updateProject
);

// DELETE: Soft delete a project
/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     tags:
 *       - Projects
 *     summary: Delete a project.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project identifier.
 *     responses:
 *       200:
 *         description: Project deleted successfully.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Role access denied.
 *       404:
 *         description: Project not found.
 */
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  deleteProject
);

// Milestone Routes (nested under projects)

// POST: Add a milestone to a project
/**
 * @swagger
 * /api/projects/{projectId}/milestones:
 *   post:
 *     tags:
 *       - Projects
 *     summary: Add a milestone to a project.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project identifier.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Phase 1 completion
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-06-30
 *               status:
 *                 type: string
 *                 example: pending
 *     responses:
 *       201:
 *         description: Milestone created successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Role access denied.
 *       404:
 *         description: Project not found.
 */
router.post(
  '/:projectId/milestones',
  authMiddleware,
  roleMiddleware('admin'),
  addMilestone
);

// GET: List milestones for a project (employees can view)
/**
 * @swagger
 * /api/projects/{projectId}/milestones:
 *   get:
 *     tags:
 *       - Projects
 *     summary: List milestones for a project.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project identifier.
 *     responses:
 *       200:
 *         description: Milestones retrieved successfully.
 *       401:
 *         description: Missing or invalid bearer token.
 *       404:
 *         description: Project not found.
 */
router.get('/:projectId/milestones', authMiddleware, getMilestones);

// PATCH: Mark a milestone as complete
/**
 * @swagger
 * /api/projects/{projectId}/milestones/{milestoneId}/complete:
 *   patch:
 *     tags:
 *       - Projects
 *     summary: Mark a milestone as complete.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project identifier.
 *       - in: path
 *         name: milestoneId
 *         required: true
 *         schema:
 *           type: string
 *         description: Milestone identifier.
 *     responses:
 *       200:
 *         description: Milestone completed successfully.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Role access denied.
 *       404:
 *         description: Project or milestone not found.
 */
router.patch(
  '/:projectId/milestones/:milestoneId/complete',
  authMiddleware,
  roleMiddleware('admin'),
  completeMilestone
);

module.exports = router;
