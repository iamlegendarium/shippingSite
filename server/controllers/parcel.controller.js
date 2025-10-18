const cors = require("cors");
const path = require("path");
const sequelize = require("../config/database");
const User = require("../models/user.model");
const nodemailer = require("nodemailer");
const { Parcel, ParcelStatusUpdate } = require("../models/parcel.model");
const { Op } = require("sequelize");
const axios = require("axios");

const generateTrackingNumber = () => {
  return "TRK" + Math.random().toString(36).substr(2, 9).toUpperCase();
};
const createParcel = async (req, res) => {
  try {
    const {
      origin,
      destination,
      senderName,
      senderPhone,
      receiverName,
      receiverPhone,
      receiverAddress,
    } = req.body;
    const trackingNumber = generateTrackingNumber();
    const userId = req.user.id; // Get user ID from the authenticated user

    const parcel = await Parcel.create({
      trackingNumber,
      origin,
      destination,
      userId,
      status: "Pending",
      senderName,
      senderPhone,
      receiverName,
      receiverPhone,
      receiverAddress,
    });

    res.status(201).json({ message: "Parcel created", trackingNumber, parcel });
  } catch (error) {
    console.error("Error creating parcel:", error);
    res
      .status(500)
      .json({ message: "Error creating parcel", error: error.message });
  }
};

const trackParcel = async (req, res) => {
  try {
    const { trackingNumber } = req.body;
    if(!trackingNumber){
        return res.status(400).json({message: "Provide tracking number"})
    }

    // Find the parcel with the associated status updates
    const parcel = await Parcel.findOne({
      where: { trackingNumber },
      include: [
        {
          model: ParcelStatusUpdate,
          as: "statusUpdates", // Alias specified here
        },
      ],
    });

    if (!parcel) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    res.status(200).json({ parcel });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error tracking parcel", error: error.message });
  }
};

const updateParcelStatus = async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const { status, location } = req.body;

    // Find the parcel by tracking number
    const parcel = await Parcel.findOne({ where: { trackingNumber } });

    if (!parcel) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    // Add new status update
    await ParcelStatusUpdate.create({
      ParcelId: parcel.id,
      status,
      location,
    });

    // Update parcel status and current location
    await parcel.update({ status, currentLocation: location });

    // Find the updated parcel with status updates included
    const updatedParcel = await Parcel.findOne({
      where: { trackingNumber },
      include: [
        {
          model: ParcelStatusUpdate,
          as: "statusUpdates", // Alias specified here
        },
      ],
    });

    res
      .status(200)
      .json({ message: "Parcel status updated", parcel: updatedParcel });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating parcel status", error: error.message });
  }
};

const getShipments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, query = "" } = req.query;
    const itemsPerPage = 10;
    const pageIndex = parseInt(page) - 1;

    const filteredShipments = await Parcel.findAll({
      where: {
        userId,
        [Op.or]: [
          { trackingNumber: { [Op.like]: `%${query}%` } },
          { receiverName: { [Op.like]: `%${query}%` } },
          { origin: { [Op.like]: `%${query}%` } },
          { destination: { [Op.like]: `%${query}%` } },
        ],
      },
      limit: itemsPerPage,
      offset: pageIndex * itemsPerPage,
    });

    const totalShipments = await Parcel.count({
      where: {
        userId,
        [Op.or]: [
          { trackingNumber: { [Op.like]: `%${query}%` } },
          { receiverName: { [Op.like]: `%${query}%` } },
          { origin: { [Op.like]: `%${query}%` } },
          { destination: { [Op.like]: `%${query}%` } },
        ],
      },
    });

    console.log("Shipments found:", filteredShipments); // Add this line for debugging

    res.status(200).json({
      shipments: filteredShipments,
      totalPages: Math.ceil(totalShipments / itemsPerPage),
    });
  } catch (error) {
    console.error("Error fetching shipments:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching shipments" });
  }
};

module.exports = {
  createParcel,
  trackParcel,
  updateParcelStatus,
  getShipments,
};
