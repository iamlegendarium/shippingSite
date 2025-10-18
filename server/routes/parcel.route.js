const express = require("express");
const router = express.Router();
const parcelController = require("../controllers/parcel.controller")
const authenticateToken = require('../middleware/auth')


router.post('/create', authenticateToken, parcelController.createParcel); // Protect route
router.get('/track', authenticateToken, parcelController.trackParcel); // Protect route
router.put('/:trackingNumber', authenticateToken, parcelController.updateParcelStatus); // Protect route
router.get('/shipments', authenticateToken, parcelController.getShipments); // Protect route

module.exports = router