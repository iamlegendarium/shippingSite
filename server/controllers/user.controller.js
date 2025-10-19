const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const sequelize = require("../config/database");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const nodemailer = require("nodemailer");
const { Op } = require("sequelize");
const axios = require("axios");

dotenv.config();

const secret = process.env.SECRET;

const index = (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/index.html"));
};

const generateVerificationToken = (email) => {
  const payload = { email };
  const expiryTime = { expiresIn: "2h" };

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
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "all fields are required" });
    }
    const verificationToken = generateVerificationToken(email);
    if (!verificationToken) throw new Error("verification token is required");

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
    const verificationLink = `https://shippingsite.onrender.com/verify?token=${verificationToken}`;

    sendVerificationEmail(email, verificationLink);
    res.status(200).json({
      message: "Registration successful, and Verification link sent",
      user,
      verificationLink,
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
    // console.log("Token received", decoded);

    const users = await User.findOne({ where: { email: decoded.email } });
    if (!users) {
      // console.log("User not found");
      return res.json({ message: "User not found" });
    }

    if (users.isVerified) {
      // console.log("User already verified", users);
      // return res.json({ message: "User already verified" });
      return res.redirect(
        "https://shipping-site-frontend.vercel.app/client/verifiedEmail.html"
      );
    }

    (users.isVerified = true),
      (users.verificationToken = null),
      await users.save();

    // res.redirect("/emailverification");

    console.log("User verification complete", users);
    // res.json({ message: "User verification complete", users });
    res.redirect(
      "https://shipping-site-frontend.vercel.app/client/verifiedEmail.html"
    );
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      // console.log("Token expired", error);
      //   return res.status(401).json({ message: "Token expired" });
    }
    // console.log("Error verifying token");
    // return res.status(401).json({ message: "Error verifying token" });
  }
};

const getLogin = (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/login.html"));
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "email and password required" });
  }
  try {
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const verifyPassword = bcryptjs.compareSync(password, user.password);
    if (!verifyPassword) {
      return res.status(401).json({ message: "Wrong password" });
    }

    if (!user.isVerified) {
      // console.log("User not verified");
      return res.status(401).json({ message: "User not verified" });
    }

    const token = jwt.sign({ id: user.id }, secret); // Include user ID in token payload
    res.status(200).json({ message: "User signin success", token });
  } catch (error) {
    // console.log(error);
  }
};

const getDashboard = (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/dashboard.html"));
};

const translateSite = async (req, res) => {
  try {
    const { pageContent, targetLanguage, sourceLanguage = "auto" } = req.body;

    if (!pageContent || !targetLanguage) {
      return res
        .status(400)
        .json({ message: "Page content and target language are required" });
    }

    // Extract all unique text strings from the page content
    const textElements = Array.from(pageContent).map((item) => item.text);
    const uniqueTexts = [
      ...new Set(textElements.filter((text) => text.trim())),
    ];

    console.log(
      `Translating ${uniqueTexts.length} text elements to ${targetLanguage}`
    );

    const translations = {};

    // Translate each unique text (you might want to batch this for better performance)
    for (const text of uniqueTexts) {
      try {
        const response = await axios.post(
          "https://google-translator9.p.rapidapi.com/v2",
          {
            q: text,
            source: sourceLanguage,
            target: targetLanguage,
            format: "text",
          },
          {
            headers: {
              "x-rapidapi-key":
                "7aec16c842msh8daf7979b3ac96dp17b4b2jsnccb0ee056374",
              "x-rapidapi-host": "google-translator9.p.rapidapi.com",
              "content-type": "application/json",
            },
          }
        );

        translations[text] = response.data.data.translations[0].translatedText;

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        // console.error(`Failed to translate: "${text}"`, error);
        translations[text] = text; // Fallback to original text
      }
    }

    res.json({
      success: true,
      translations,
      translatedCount: Object.keys(translations).length,
    });
  } catch (error) {
    // console.error("Site translation error:", error);
    res.status(500).json({
      success: false,
      message: "Site translation failed",
      error: error.message,
    });
  }
};

module.exports = {
  userRegistration,
  verifyUserEmail,
  login,
  getUserRegistration,
  getLogin,
  getDashboard,
  index,
  verifiedEmailPage,
  translateSite,
};
