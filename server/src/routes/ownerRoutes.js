/**
 * Owner Routes
 * Endpoints for authenticated Store Owners.
 * All endpoints strictly require authentication and STORE_OWNER role.
 */

const express = require("express");
const ownerController = require("../controllers/ownerController");
const authenticate = require("../middleware/authenticate");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

// Strict security: Authenticated + STORE_OWNER role only
router.use(authenticate);
router.use(requireRole("STORE_OWNER"));

router.get("/dashboard", ownerController.getDashboard);
router.get("/store", ownerController.getMyStore);
router.get("/ratings", ownerController.getRatings);

module.exports = router;
