const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
  createTenant,
  getAllTenants,
  getTenantById,
  updateTenant,
  deleteTenant,
} = require("../controllers/tenantController");

/**
 * @swagger
 * /api/tenants:
 *   post:
 *     tags:
 *       - Tenants
 *     summary: Create a tenant.
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
 *                 example: Contoso ERP
 *               code:
 *                 type: string
 *                 example: CONTOSO
 *               subscriptionPlan:
 *                 type: string
 *                 example: enterprise
 *               status:
 *                 type: string
 *                 example: active
 *     responses:
 *       201:
 *         description: Tenant created successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Role access denied.
 */
router.post("/", authMiddleware, roleMiddleware("admin"), createTenant);
/**
 * @swagger
 * /api/tenants:
 *   get:
 *     tags:
 *       - Tenants
 *     summary: List tenants.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tenants retrieved successfully.
 *       401:
 *         description: Missing or invalid bearer token.
 */
router.get("/", authMiddleware, getAllTenants);
/**
 * @swagger
 * /api/tenants/{id}:
 *   get:
 *     tags:
 *       - Tenants
 *     summary: Get a tenant by ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tenant identifier.
 *     responses:
 *       200:
 *         description: Tenant retrieved successfully.
 *       401:
 *         description: Missing or invalid bearer token.
 *       404:
 *         description: Tenant not found.
 */
router.get("/:id", authMiddleware, getTenantById);
/**
 * @swagger
 * /api/tenants/{id}:
 *   put:
 *     tags:
 *       - Tenants
 *     summary: Update a tenant.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tenant identifier.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Contoso ERP
 *               code:
 *                 type: string
 *                 example: CONTOSO
 *               subscriptionPlan:
 *                 type: string
 *                 example: enterprise
 *               status:
 *                 type: string
 *                 example: active
 *     responses:
 *       200:
 *         description: Tenant updated successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Role access denied.
 *       404:
 *         description: Tenant not found.
 */
router.put("/:id", authMiddleware, roleMiddleware("admin"), updateTenant);
/**
 * @swagger
 * /api/tenants/{id}:
 *   delete:
 *     tags:
 *       - Tenants
 *     summary: Delete a tenant.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tenant identifier.
 *     responses:
 *       200:
 *         description: Tenant deleted successfully.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Role access denied.
 *       404:
 *         description: Tenant not found.
 */
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteTenant);

module.exports = router;
