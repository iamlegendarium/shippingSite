const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const sequelize = require("../config/database");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const nodemailer = require("nodemailer");

const secret = process.env.SECRET;

const generateVerificationToken = (email) => {
  const payload = { email };
  const expiryTime = { expiresIn: "5m" };

  return jwt.sign(payload, secret, expiryTime);
};

const getUserRegistration = (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/signup.html"));
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

    // console.log("Registration successful", user);

    const verificationLink = `http://localhost:3000/verify?token=${verificationToken}`;

    sendVerificationEmail(email, verificationLink);
    // res.json({
    //   message: "Registration successful, and Verification link send",
    //   user,
    // });
    res.redirect("/login");

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
    //   return res.status(404).json({ message: "User not found" });
    }

    const verifyPassword = bcryptjs.compareSync(password, user.password);
    if (!verifyPassword) {
      console.log("Wrong password");
    //   return res.status(401).json({ message: "Wrong password" });
    }

    if (!user.isVerified) {
      console.log("User not verified");
    //   return res.status(401).json({ message: "User not verified" });
    }


    const token = jwt.sign({ email: email }, secret);
    // res.json({ token });
    res.redirect("/login");

  } catch (error) {
    console.log(error);
  }
};

const getDashboard = (req,res) =>{
    res.sendFile(path.join(__dirname, "../../client/dashboard.html"))
}

module.exports = {
  userRegistration,
  verifyUserEmail,
  login,
  getUserRegistration,
  getLogin,
  getDashboard
};
