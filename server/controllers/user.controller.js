const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const sequelize = require("../config/database");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const nodemailer = require("nodemailer");
const { Parcel, ParcelStatusUpdate } = require('../models/parcel.model');
const { Op } = require('sequelize');


dotenv.config();

const secret = process.env.SECRET;

const index = (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/index.html"));
};

const generateVerificationToken = (email) => {
  const payload = { email };
  const expiryTime = { expiresIn: "5m" };

  return jwt.sign(payload, secret, expiryTime);
};

const getUserRegistration = (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/signup.html"));
};

const verifiedEmailPage = (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/verifiedEmail.html"));
};

const userRegistration = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const verificationToken = generateVerificationToken(email);

    const hashedPassword = await bcryptjs.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      verificationToken,
      isVerified: false,
    });

    console.log("Registration successful", user);
    // res.send(user)

    const verificationLink = `https://shippingsite.onrender.com/verify?token=${verificationToken}`;

    sendVerificationEmail(email, verificationLink);
    res.status(200).json({
      message: "Registration successful, and Verification link sent",
      user,
    });
  } catch (error) {
    console.log(error);
  }
};

const sendVerificationEmail = (email, verificationLink) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Complete your registration",
    text: `To complete your registration, click this link ${verificationLink}`,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log("Error sending verification link");
    } else {
      console.log("Verification Link successfully sent", info.response);
    }
  });
};

const verifyUserEmail = async (req, res) => {
  const { token } = req.query;
  try {
    const decoded = jwt.verify(token, secret);
    console.log("Token received", decoded);

    const users = await User.findOne({ where: { email: decoded.email } });
    if (!users) {
      console.log("User not found");
      //   return res.json({ message: "User not found" });
    }

    if (users.isVerified) {
      console.log("User already verified", users);
      //   return res.json({ message: "User already verified" });
    }

    (users.isVerified = true),
      (users.verificationToken = null),
      await users.save();

      res.redirect('/emailverification');

    console.log("User verification complete", users);
    res.json({ message: "User verification complete", users });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      console.log("Token expired", error);
      //   return res.status(401).json({ message: "Token expired" });
    }
    console.log("Error verifying token");
    // return res.status(401).json({ message: "Error verifying token" });
  }
};

const getLogin = (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/login.html"));
};


const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    const verifyPassword = bcryptjs.compareSync(password, user.password);
    if (!verifyPassword) {
      console.log("Wrong password");
      return res.status(401).json({ message: "Wrong password" });
    }

    if (!user.isVerified) {
      console.log("User not verified");
      return res.status(401).json({ message: "User not verified" });
    }

    const token = jwt.sign({ id: user.id }, secret); // Include user ID in token payload
    res.status(200).json({ message: "User signin success", token });
  } catch (error) {
    console.log(error);
  }
};


const getDashboard = (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/dashboard.html"));
};


const generateTrackingNumber = () => {
  return 'TRK' + Math.random().toString(36).substr(2, 9).toUpperCase();
};


const createParcel = async (req, res) => {
  try {
    const {origin, destination, senderName, senderPhone, receiverName, receiverPhone, receiverAddress} = req.body;
    const trackingNumber = generateTrackingNumber();
    const userId = req.user.id; // Get user ID from the authenticated user

    const parcel = await Parcel.create({
      trackingNumber,
      origin,
      destination,
      userId,
      status: 'Pending',
      senderName,
      senderPhone,
      receiverName,
      receiverPhone,
      receiverAddress
    });

    res.status(201).json({ message: 'Parcel created', trackingNumber, parcel });
  } catch (error) {
    console.error('Error creating parcel:', error);
    res.status(500).json({ message: 'Error creating parcel', error: error.message });
  }
};



const trackParcel = async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    // Find the parcel with the associated status updates
    const parcel = await Parcel.findOne({
      where: { trackingNumber },
      include: [{
        model: ParcelStatusUpdate,
        as: 'statusUpdates' // Alias specified here
      }]
    });

    if (!parcel) {
      return res.status(404).json({ message: 'Parcel not found' });
    }

    res.status(200).json({ parcel });
  } catch (error) {
    res.status(500).json({ message: 'Error tracking parcel', error: error.message });
  }
};


const updateParcelStatus = async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const { status, location } = req.body;

    // Find the parcel by tracking number
    const parcel = await Parcel.findOne({ where: { trackingNumber } });

    if (!parcel) {
      return res.status(404).json({ message: 'Parcel not found' });
    }

    // Add new status update
    await ParcelStatusUpdate.create({
      ParcelId: parcel.id,
      status,
      location
    });

    // Update parcel status and current location
    await parcel.update({ status, currentLocation: location });

    // Find the updated parcel with status updates included
    const updatedParcel = await Parcel.findOne({
      where: { trackingNumber },
      include: [{
        model: ParcelStatusUpdate,
        as: 'statusUpdates' // Alias specified here
      }]
    });

    res.status(200).json({ message: 'Parcel status updated', parcel: updatedParcel });
  } catch (error) {
    res.status(500).json({ message: 'Error updating parcel status', error: error.message });
  }
};



const getShipments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, query = '' } = req.query;
    const itemsPerPage = 10;
    const pageIndex = parseInt(page) - 1;

    const filteredShipments = await Parcel.findAll({
      where: {
        userId,
        [Op.or]: [
          { trackingNumber: { [Op.like]: `%${query}%` } },
          { receiverName: { [Op.like]: `%${query}%` } },
          { origin: { [Op.like]: `%${query}%` } },
          { destination: { [Op.like]: `%${query}%` } }
        ]
      },
      limit: itemsPerPage,
      offset: pageIndex * itemsPerPage
    });

    const totalShipments = await Parcel.count({
      where: {
        userId,
        [Op.or]: [
          { trackingNumber: { [Op.like]: `%${query}%` } },
          { receiverName: { [Op.like]: `%${query}%` } },
          { origin: { [Op.like]: `%${query}%` } },
          { destination: { [Op.like]: `%${query}%` } }
        ]
      }
    });

    console.log('Shipments found:', filteredShipments); // Add this line for debugging

    res.status(200).json({
      shipments: filteredShipments,
      totalPages: Math.ceil(totalShipments / itemsPerPage),
    });
  } catch (error) {
    console.error('Error fetching shipments:', error);
    res.status(500).json({ error: 'An error occurred while fetching shipments' });
  }
};



const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user; // Attach user to req object
    next();
  });
};



module.exports = {
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
  verifiedEmailPage
};
