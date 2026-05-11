const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const { getAllPurchaseOrders, createPurchaseOrder, deliverPurchaseOrder } = require("../controllers/purchaseOrderController");

router.get("/", authMiddleware, getAllPurchaseOrders);
router.post("/", authMiddleware, roleMiddleware("admin"), createPurchaseOrder);
router.patch("/:id/deliver", authMiddleware, roleMiddleware("admin"), deliverPurchaseOrder);

module.exports = router;

