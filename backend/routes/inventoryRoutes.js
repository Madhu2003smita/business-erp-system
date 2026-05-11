const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  addInventoryItem,
  getInventory,
  getLowStock,
  updateInventoryItem,
} = require('../controllers/inventoryController');

router.post('/', authMiddleware, roleMiddleware('admin'), addInventoryItem);
router.get('/', authMiddleware, getInventory);
router.get('/low-stock', authMiddleware, roleMiddleware('admin'), getLowStock);
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateInventoryItem);

module.exports = router;
