// const express = require("express");
// const router = express.Router();

// const {
//   userRegistration,
//   verifyUserEmail,
//   login,
//   getUserRegistration,
//   getLogin,
//   getDashboard,
//   index,
//   createParcel,
//   trackParcel,
//   updateParcelStatus,
//   getShipments,
//   authenticateToken
// } = require("../controllers/user.controller");

// router.get("/", index);
// router.get("/register", getUserRegistration);
// router.post("/register", userRegistration);
// router.get("/verify", verifyUserEmail);
// router.get("/login", getLogin);
// router.post("/login", login);
// router.get("/dashboard", getDashboard);
// // router.get("/track", track);
// router.post('/parcels', createParcel);
// router.get('/parcels/:trackingNumber', trackParcel);
// router.put('/parcels/:trackingNumber', updateParcelStatus);
// router.get('/shipments', authenticateToken, getShipments);

// module.exports = router;

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
  authenticateToken
} = require("../controllers/user.controller");

router.get("/", index);
router.get("/register", getUserRegistration);
router.post("/register", userRegistration);
router.get("/verify", verifyUserEmail);
router.get("/login", getLogin);
router.post("/login", login);
router.get("/dashboard", authenticateToken, getDashboard);
router.post('/parcels', authenticateToken, createParcel); // Protect route
router.get('/parcels/:trackingNumber', authenticateToken, trackParcel); // Protect route
router.put('/parcels/:trackingNumber', authenticateToken, updateParcelStatus); // Protect route
router.get('/shipments', authenticateToken, getShipments); // Protect route

// curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiaWF0IjoxNzIxNTc5NDIwfQ.cLAjrvNcRCd41R_HB8SvjjLabJo9SiRAOwrSFwDUT1M" http://localhost:4000/shipments


module.exports = router;
