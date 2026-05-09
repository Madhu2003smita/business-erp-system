const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const { getAllPurchaseOrders, createPurchaseOrder } = require("../controllers/purchaseOrderController");

router.get("/", authMiddleware, getAllPurchaseOrders);
router.post("/", authMiddleware, roleMiddleware("admin"), createPurchaseOrder);

module.exports = router;

