/**
 * User Routes
 * Routes for user profile and user-submitted rating lookups.
 */

const express = require("express");
const userController = require("../controllers/userController");
const authenticate = require("../middleware/authenticate");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

// All user routes require authentication and USER role
router.use(authenticate, requireRole("USER"));

router.get("/me/ratings", userController.getMyRatings);

module.exports = router;
