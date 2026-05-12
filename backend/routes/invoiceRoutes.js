const express = require('express');
const router = express.Router();
const { createInvoice, getAllInvoices, getAgingReport } = require('../controllers/invoiceController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Protected routes: Only logged-in Admins can access these
router.get('/', authMiddleware, getAllInvoices);
router.get('/aging-report', authMiddleware, roleMiddleware('admin'), getAgingReport);
router.post('/', authMiddleware, roleMiddleware('admin'), createInvoice);

module.exports = router;