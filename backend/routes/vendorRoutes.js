const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const { getAllVendors, createVendor } = require("../controllers/vendorController");

router.get("/", authMiddleware, getAllVendors);
router.post("/", authMiddleware, roleMiddleware("admin"), createVendor);

module.exports = router;

