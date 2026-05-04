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

router.post("/", authMiddleware, roleMiddleware("admin"), createTenant);
router.get("/", authMiddleware, getAllTenants);
router.get("/:id", authMiddleware, getTenantById);
router.put("/:id", authMiddleware, roleMiddleware("admin"), updateTenant);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteTenant);

module.exports = router;
