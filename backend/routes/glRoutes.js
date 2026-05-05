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


router.post("/accounts", authMiddleware, roleMiddleware("admin"), createAccount);
router.get("/accounts", authMiddleware, getAllAccounts);
router.get("/accounts/:id", authMiddleware, getAccountById);
router.put("/accounts/:id", authMiddleware, roleMiddleware("admin"), updateAccount);
router.delete("/accounts/:id", authMiddleware, roleMiddleware("admin"), deleteAccount);


router.post("/journal-entries", authMiddleware, roleMiddleware("admin"), createJournalEntry);
router.get("/journal-entries", authMiddleware, getAllJournalEntries);
router.get("/journal-entries/:id", authMiddleware, getJournalEntryById);
router.delete("/journal-entries/:id", authMiddleware, roleMiddleware("admin"), deleteJournalEntry);


router.post("/periods", authMiddleware, roleMiddleware("admin"), createPeriod);
router.get("/periods", authMiddleware, getAllPeriods);
router.patch("/periods/:id/close", authMiddleware, roleMiddleware("admin"), closePeriod);

module.exports = router;
