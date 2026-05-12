const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} = require("../controllers/departmentController");

/**
 * @swagger
 * /api/departments:
 *   post:
 *     tags:
 *       - Departments
 *     summary: Create a department.
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
 *                 example: Finance
 *               description:
 *                 type: string
 *                 example: Handles accounting and reporting.
 *               managerId:
 *                 type: string
 *                 example: 66c1f0f0f0f0f0f0f0f0f0f0
 *     responses:
 *       201:
 *         description: Department created successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Role access denied.
 */
router.post("/", authMiddleware, roleMiddleware("admin"), createDepartment);
/**
 * @swagger
 * /api/departments:
 *   get:
 *     tags:
 *       - Departments
 *     summary: List departments.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Departments retrieved successfully.
 *       401:
 *         description: Missing or invalid bearer token.
 */
router.get("/", authMiddleware, getAllDepartments);
/**
 * @swagger
 * /api/departments/{id}:
 *   get:
 *     tags:
 *       - Departments
 *     summary: Get a department by ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Department identifier.
 *     responses:
 *       200:
 *         description: Department retrieved successfully.
 *       401:
 *         description: Missing or invalid bearer token.
 *       404:
 *         description: Department not found.
 */
router.get("/:id", authMiddleware, getDepartmentById);
/**
 * @swagger
 * /api/departments/{id}:
 *   put:
 *     tags:
 *       - Departments
 *     summary: Update a department.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Department identifier.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Finance
 *               description:
 *                 type: string
 *                 example: Handles accounting, treasury, and reporting.
 *               managerId:
 *                 type: string
 *                 example: 66c1f0f0f0f0f0f0f0f0f0f0
 *     responses:
 *       200:
 *         description: Department updated successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Role access denied.
 *       404:
 *         description: Department not found.
 */
router.put("/:id", authMiddleware, roleMiddleware("admin"), updateDepartment);
/**
 * @swagger
 * /api/departments/{id}:
 *   delete:
 *     tags:
 *       - Departments
 *     summary: Delete a department.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Department identifier.
 *     responses:
 *       200:
 *         description: Department deleted successfully.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Role access denied.
 *       404:
 *         description: Department not found.
 */
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteDepartment);

module.exports = router;
