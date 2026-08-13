const express = require("express");
const adminController = require("../controllers/adminController");
const authenticate = require("../middleware/authenticate");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

router.use(authenticate, requireRole("ADMIN"));

router.get("/dashboard", adminController.dashboard);
router.post("/users", adminController.createUser);
router.post("/store-owners", adminController.createStoreOwner);
router.post("/stores", adminController.createStore);
router.get("/users", adminController.listUsers);
router.get("/stores", adminController.listStores);

module.exports = router;
