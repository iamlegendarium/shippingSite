const express = require("express");
const router = express.Router();
const authenticateToken = require('../middleware/auth')

const {
  userRegistration,
  verifyUserEmail,
  login,
  getUserRegistration,
  getLogin,
  getDashboard,
  index,
  verifiedEmailPage,
  getLanguages,
  translateSite,
  resendEmailVerificationLink
} = require("../controllers/user.controller");

router.get("/", index);
router.get('/languages', getLanguages);
router.post("/translate-site", translateSite);
router.get("/register", getUserRegistration);
router.post("/register", userRegistration);
router.get("/verify", verifyUserEmail);
router.get("/emailverification", verifiedEmailPage);
router.get("/login", getLogin);
router.post("/login", login);
router.get("/dashboard", authenticateToken, getDashboard);
router.post("/resend", resendEmailVerificationLink)


module.exports = router;
