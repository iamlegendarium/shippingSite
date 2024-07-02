const express = require("express");
const router = express.Router();

const { userRegistration, verifyUserEmail, login, getUserRegistration, getLogin, getDashboard } = require("../controllers/user.controller");

router.get("/register", getUserRegistration);
router.post("/register", userRegistration);
router.get("/verify", verifyUserEmail);
router.get("/login", getLogin);
router.post("/login", login);
router.get("/dashboard", getDashboard);


module.exports = router;
