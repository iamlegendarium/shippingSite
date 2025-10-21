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
    const verificationLink = `https://shippingsite.onrender.com/api/verify?token=${verificationToken}`;

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
      console.error("NODEMAILER ERROR:", {
        message: err.message,
        code: err.code,
        responseCode: err.responseCode,
        response: err.response,
        command: err.command,
      });
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
      console.log("User already verified", users);
      return res.json({ message: "User already verified" });
      return res.redirect(
        "https://shipping-site-frontend.vercel.app/verifiedEmail.html"
      );
    }

    (users.isVerified = true),
      (users.verificationToken = null),
      await users.save();

    // res.redirect("/emailverification");

    console.log("User verification complete", users);
    res.json({ message: "User verification complete", users });
    res.redirect(
      "https://shipping-site-frontend.vercel.app/verifiedEmail.html"
    );
  } catch (error) {
    // if (error.name === "TokenExpiredError") {
    //   console.log("Token expired", error);
    //     return res.status(401).json({ message: "Token expired" });
    }
    // console.log("Error verifying token");
    // return res.status(401).json({ message: "Error verifying token" });
  }
// };

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

const getLanguages = async (req, res) => {
  try {
    // You can customize this list based on what your translation API supports
    const languages = [
      { language: "en", name: "English" },
      { language: "es", name: "Spanish" },
      { language: "fr", name: "French" },
      { language: "de", name: "German" },
      { language: "it", name: "Italian" },
      { language: "pt", name: "Portuguese" },
      { language: "ru", name: "Russian" },
      { language: "ja", name: "Japanese" },
      { language: "ko", name: "Korean" },
      { language: "zh", name: "Chinese" },
      { language: "ar", name: "Arabic" },
      { language: "hi", name: "Hindi" },
      { language: "tr", name: "Turkish" },
      { language: "nl", name: "Dutch" },
      { language: "pl", name: "Polish" },
      { language: "sv", name: "Swedish" },
      { language: "da", name: "Danish" },
      { language: "th", name: "Thai" },
      { language: "vi", name: "Vietnamese" },
      { language: "id", name: "Indonesian" },
    ];

    res.json({
      success: true,
      data: {
        languages,
      },
    });
  } catch (error) {
    // console.error('Error getting languages:', error);
    res.status(500).json({
      success: false,
      message: "Failed to get languages",
      error: error.message,
    });
  }
};

// Translate entire site
const translateSite = async (req, res) => {
  try {
    const { pageContent, targetLanguage, sourceLanguage = "en" } = req.body;

    if (!pageContent || !targetLanguage) {
      return res.status(400).json({
        success: false,
        message: "Page content and target language are required",
      });
    }

    if (!Array.isArray(pageContent) || pageContent.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Page content must be a non-empty array",
      });
    }

    // Extract all unique text strings from the page content
    const textElements = pageContent.map((item) => item.text);
    const uniqueTexts = [
      ...new Set(textElements.filter((text) => text && text.trim())),
    ];

    console.log(
      `Translating ${uniqueTexts.length} unique text elements to ${targetLanguage}`
    );

    const translations = {};
    const batchSize = 10; // Translate in batches to avoid rate limiting
    let translatedCount = 0;

    // Process in batches
    for (let i = 0; i < uniqueTexts.length; i += batchSize) {
      const batch = uniqueTexts.slice(i, i + batchSize);

      // Translate each text in the batch
      const batchPromises = batch.map(async (text) => {
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
              timeout: 10000, // 10 second timeout
            }
          );

          if (
            response.data &&
            response.data.data &&
            response.data.data.translations
          ) {
            translations[text] =
              response.data.data.translations[0].translatedText;
            translatedCount++;
          } else {
            // console.warn(`No translation returned for: "${text}"`);
            translations[text] = text; // Fallback to original text
          }
        } catch (error) {
          // console.error(`Failed to translate: "${text.substring(0, 50)}..."`, error.message);
          translations[text] = text; // Fallback to original text
        }
      });

      // Wait for batch to complete
      await Promise.all(batchPromises);

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < uniqueTexts.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    console.log(
      `Successfully translated ${translatedCount}/${uniqueTexts.length} elements`
    );

    res.json({
      success: true,
      translations,
      translatedCount: Object.keys(translations).length,
      totalElements: uniqueTexts.length,
    });
  } catch (error) {
    console.error("Site translation error:", error);
    res.status(500).json({
      success: false,
      message: "Site translation failed",
      error: error.message,
    });
  }
};

const resendEmailVerificationLink = async(req,res) => {
  try {
    const {email} = req.body
    if(!email){
      console.log("email is required");
      return res.status(400).json({message: "email is required"})
    }

    const user = await User.findOne({where: {email}})
    if(!user){
      console.log("user not found");
      return res.status(404).json({message: "user not found"})
    }

    // Check if user is already verified
    if(user.isVerified){
      console.log("user already verified");
      return res.status(400).json({message: "user already verified"})
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken(email);
    if (!verificationToken) throw new Error("verification token is required");

    // Update user with new token
    user.verificationToken = verificationToken;
    await user.save();

    // Create verification link
    const verificationLink = `https://shippingsite.onrender.com/verify?token=${verificationToken}`;

    // Send verification email
    sendVerificationEmail(email, verificationLink);
    
    res.status(200).json({
      message: "Verification link resent successfully",
      verificationLink,
    });
  } catch (error) {
    console.log("internal error", error);
    return res.status(500).json({message: "internal error"}) // Changed from 401 to 500
  }
}

module.exports = {
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
};
