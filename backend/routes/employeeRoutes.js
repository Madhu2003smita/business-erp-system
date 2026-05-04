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

router.post("/", authMiddleware, roleMiddleware("admin"), createEmployee);
router.get("/", authMiddleware, getAllEmployees);
router.get("/:id", authMiddleware, getEmployeeById);
router.put("/:id", authMiddleware, roleMiddleware("admin"), updateEmployee);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteEmployee);

module.exports = router;
