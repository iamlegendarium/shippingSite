const express = require("express");
const router = express.Router();

const { userRegistration, verifyUserEmail, login } = require("../controllers/user.controller");

router.post("/register", userRegistration);
router.get("/verify", verifyUserEmail);
router.post("/login", login);

module.exports = router;
