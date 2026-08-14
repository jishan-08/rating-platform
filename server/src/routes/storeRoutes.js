/**
 * Store Routes
 * Routes for store browsing and rating lookup.
 */

const express = require("express");
const storeController = require("../controllers/storeController");
const authenticate = require("../middleware/authenticate");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

// All store endpoints require authentication
router.use(authenticate);

router.get("/", storeController.listStores);
router.post("/:storeId/rating", requireRole("USER"), storeController.submitRating);

module.exports = router;
