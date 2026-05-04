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

router.post("/", authMiddleware, roleMiddleware("admin"), createDepartment);
router.get("/", authMiddleware, getAllDepartments);
router.get("/:id", authMiddleware, getDepartmentById);
router.put("/:id", authMiddleware, roleMiddleware("admin"), updateDepartment);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteDepartment);

module.exports = router;
