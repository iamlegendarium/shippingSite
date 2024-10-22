const express = require("express");
const router = express.Router();

const {
  userRegistration,
  verifyUserEmail,
  login,
  getUserRegistration,
  getLogin,
  getDashboard,
  index,
  createParcel,
  trackParcel,
  updateParcelStatus,
  getShipments,
  authenticateToken,
  verifiedEmailPage,
  getLanguages
} = require("../controllers/user.controller");

router.get("/", index);
router.get("/languages", getLanguages);
router.get("/register", getUserRegistration);
router.post("/register", userRegistration);
router.get("/verify", verifyUserEmail);
router.get("/emailverification", verifiedEmailPage);
router.get("/login", getLogin);
router.post("/login", login);
router.get("/dashboard", authenticateToken, getDashboard);
router.post('/parcels', authenticateToken, createParcel); // Protect route
router.get('/parcels/:trackingNumber', authenticateToken, trackParcel); // Protect route
router.put('/parcels/:trackingNumber', authenticateToken, updateParcelStatus); // Protect route
router.get('/shipments', authenticateToken, getShipments); // Protect route

// curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiaWF0IjoxNzIxNTc5NDIwfQ.cLAjrvNcRCd41R_HB8SvjjLabJo9SiRAOwrSFwDUT1M" http://localhost:4000/shipments


module.exports = router;
