const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createAccount,
  getAllAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
} = require("../controllers/accountController");

const {
  createJournalEntry,
  getAllJournalEntries,
  getJournalEntryById,
  deleteJournalEntry,
} = require("../controllers/journalEntryController");

const {
  createPeriod,
  getAllPeriods,
  closePeriod,
} = require("../controllers/periodController");


/**
 * @swagger
 * /api/gl/accounts:
 *   post:
 *     tags:
 *       - General Ledger
 *     summary: Create a chart of accounts entry.
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
 *               - code
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 example: Cash on Hand
 *               code:
 *                 type: string
 *                 example: 1000
 *               type:
 *                 type: string
 *                 example: asset
 *               openingBalance:
 *                 type: number
 *                 example: 10000
 *     responses:
 *       201:
 *         description: Account created successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Role access denied.
 */
router.post("/accounts", authMiddleware, roleMiddleware("admin"), createAccount);
/**
 * @swagger
 * /api/gl/accounts:
 *   get:
 *     tags:
 *       - General Ledger
 *     summary: List accounts.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Accounts retrieved successfully.
 *       401:
 *         description: Missing or invalid bearer token.
 */
router.get("/accounts", authMiddleware, getAllAccounts);
/**
 * @swagger
 * /api/gl/accounts/{id}:
 *   get:
 *     tags:
 *       - General Ledger
 *     summary: Get an account by ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Account identifier.
 *     responses:
 *       200:
 *         description: Account retrieved successfully.
 *       401:
 *         description: Missing or invalid bearer token.
 *       404:
 *         description: Account not found.
 */
router.get("/accounts/:id", authMiddleware, getAccountById);
/**
 * @swagger
 * /api/gl/accounts/{id}:
 *   put:
 *     tags:
 *       - General Ledger
 *     summary: Update an account.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Account identifier.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Cash on Hand
 *               code:
 *                 type: string
 *                 example: 1000
 *               type:
 *                 type: string
 *                 example: asset
 *               balance:
 *                 type: number
 *                 example: 12500
 *     responses:
 *       200:
 *         description: Account updated successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Role access denied.
 *       404:
 *         description: Account not found.
 */
router.put("/accounts/:id", authMiddleware, roleMiddleware("admin"), updateAccount);
/**
 * @swagger
 * /api/gl/accounts/{id}:
 *   delete:
 *     tags:
 *       - General Ledger
 *     summary: Delete an account.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Account identifier.
 *     responses:
 *       200:
 *         description: Account deleted successfully.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Role access denied.
 *       404:
 *         description: Account not found.
 */
router.delete("/accounts/:id", authMiddleware, roleMiddleware("admin"), deleteAccount);


/**
 * @swagger
 * /api/gl/journal-entries:
 *   post:
 *     tags:
 *       - General Ledger
 *     summary: Create a journal entry.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - memo
 *               - lines
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: 2026-05-12
 *               memo:
 *                 type: string
 *                 example: Record monthly rent expense
 *               lines:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - accountId
 *                     - debit
 *                     - credit
 *                   properties:
 *                     accountId:
 *                       type: string
 *                       example: 66c1f0f0f0f0f0f0f0f0f0f0
 *                     debit:
 *                       type: number
 *                       example: 1500
 *                     credit:
 *                       type: number
 *                       example: 0
 *     responses:
 *       201:
 *         description: Journal entry created successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Role access denied.
 */
router.post("/journal-entries", authMiddleware, roleMiddleware("admin"), createJournalEntry);
/**
 * @swagger
 * /api/gl/journal-entries:
 *   get:
 *     tags:
 *       - General Ledger
 *     summary: List journal entries.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Journal entries retrieved successfully.
 *       401:
 *         description: Missing or invalid bearer token.
 */
router.get("/journal-entries", authMiddleware, getAllJournalEntries);
/**
 * @swagger
 * /api/gl/journal-entries/{id}:
 *   get:
 *     tags:
 *       - General Ledger
 *     summary: Get a journal entry by ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Journal entry identifier.
 *     responses:
 *       200:
 *         description: Journal entry retrieved successfully.
 *       401:
 *         description: Missing or invalid bearer token.
 *       404:
 *         description: Journal entry not found.
 */
router.get("/journal-entries/:id", authMiddleware, getJournalEntryById);
/**
 * @swagger
 * /api/gl/journal-entries/{id}:
 *   delete:
 *     tags:
 *       - General Ledger
 *     summary: Delete a journal entry.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Journal entry identifier.
 *     responses:
 *       200:
 *         description: Journal entry deleted successfully.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Role access denied.
 *       404:
 *         description: Journal entry not found.
 */
router.delete("/journal-entries/:id", authMiddleware, roleMiddleware("admin"), deleteJournalEntry);


/**
 * @swagger
 * /api/gl/periods:
 *   post:
 *     tags:
 *       - General Ledger
 *     summary: Create an accounting period.
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
 *               - startDate
 *               - endDate
 *             properties:
 *               name:
 *                 type: string
 *                 example: FY2026 P01
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-05-01
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-05-31
 *     responses:
 *       201:
 *         description: Period created successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Role access denied.
 */
router.post("/periods", authMiddleware, roleMiddleware("admin"), createPeriod);
/**
 * @swagger
 * /api/gl/periods:
 *   get:
 *     tags:
 *       - General Ledger
 *     summary: List accounting periods.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Periods retrieved successfully.
 *       401:
 *         description: Missing or invalid bearer token.
 */
router.get("/periods", authMiddleware, getAllPeriods);
/**
 * @swagger
 * /api/gl/periods/{id}/close:
 *   patch:
 *     tags:
 *       - General Ledger
 *     summary: Close an accounting period.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Period identifier.
 *     responses:
 *       200:
 *         description: Period closed successfully.
 *       401:
 *         description: Missing or invalid bearer token.
 *       403:
 *         description: Role access denied.
 *       404:
 *         description: Period not found.
 */
router.patch("/periods/:id/close", authMiddleware, roleMiddleware("admin"), closePeriod);

module.exports = router;
