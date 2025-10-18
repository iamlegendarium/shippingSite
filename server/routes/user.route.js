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
  translateSite
} = require("../controllers/user.controller");

router.get("/", index);
router.get("/languages", translateSite);
router.get("/register", getUserRegistration);
router.post("/register", userRegistration);
router.get("/verify", verifyUserEmail);
router.get("/emailverification", verifiedEmailPage);
router.get("/login", getLogin);
router.post("/login", login);
router.get("/dashboard", authenticateToken, getDashboard);
// curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiaWF0IjoxNzIxNTc5NDIwfQ.cLAjrvNcRCd41R_HB8SvjjLabJo9SiRAOwrSFwDUT1M" http://localhost:4000/shipments


module.exports = router;
