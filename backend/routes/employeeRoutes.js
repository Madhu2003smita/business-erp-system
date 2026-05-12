const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");

/**
 * @swagger
 * /api/employees:
 *   post:
 *     tags:
 *       - Employees
 *     summary: Create an employee record.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Amina
 *               lastName:
 *                 type: string
 *                 example: Khan
 *               email:
 *                 type: string
 *                 format: email
 *                 example: amina.khan@example.com
 *               departmentId:
 *                 type: string
 *                 example: 66c1f0f0f0f0f0f0f0f0f0f0
 *               position:
 *                 type: string
 *                 example: Account Executive
 *               hireDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-05-01
 *               role:
 *                 type: string
 *                 example: employee
 *     responses:
 *       201:
 *         description: Employee created successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Role access denied.
 */
router.post("/", authMiddleware, roleMiddleware("admin"), createEmployee);
/**
 * @swagger
 * /api/employees:
 *   get:
 *     tags:
 *       - Employees
 *     summary: List employees.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employees retrieved successfully.
 *       401:
 *         description: Missing or invalid bearer token.
 */
router.get("/", authMiddleware, getAllEmployees);
/**
 * @swagger
 * /api/employees/{id}:
 *   get:
 *     tags:
 *       - Employees
 *     summary: Get an employee by ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee identifier.
 *     responses:
 *       200:
 *         description: Employee retrieved successfully.
 *       401:
 *         description: Missing or invalid bearer token.
 *       404:
 *         description: Employee not found.
 */
router.get("/:id", authMiddleware, getEmployeeById);
/**
 * @swagger
 * /api/employees/{id}:
 *   put:
 *     tags:
 *       - Employees
 *     summary: Update an employee record.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee identifier.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Amina
 *               lastName:
 *                 type: string
 *                 example: Khan
 *               email:
 *                 type: string
 *                 format: email
 *                 example: amina.khan@example.com
 *               departmentId:
 *                 type: string
 *                 example: 66c1f0f0f0f0f0f0f0f0f0f0
 *               position:
 *                 type: string
 *                 example: Senior Account Executive
 *               hireDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-05-01
 *               role:
 *                 type: string
 *                 example: employee
 *     responses:
 *       200:
 *         description: Employee updated successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Role access denied.
 *       404:
 *         description: Employee not found.
 */
router.put("/:id", authMiddleware, roleMiddleware("admin"), updateEmployee);
/**
 * @swagger
 * /api/employees/{id}:
 *   delete:
 *     tags:
 *       - Employees
 *     summary: Delete an employee record.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee identifier.
 *     responses:
 *       200:
 *         description: Employee deleted successfully.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Role access denied.
 *       404:
 *         description: Employee not found.
 */
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteEmployee);

module.exports = router;
