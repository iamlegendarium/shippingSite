const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const sequelize = require("../config/database");
const User = require("../models/user.model");
const Contact = require("../models/contact.model");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const nodemailer = require("nodemailer");
const { Op } = require("sequelize");
const axios = require("axios");
const multer = require('multer');
const fs = require('fs');

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

    const verificationLink = `${process.env.BACKEND_URL}/api/verify?token=${verificationToken}`;

    sendVerificationEmail(email, verificationLink);
    res.status(200).json({
      message: "Registration successful, and Verification link sent",
      user,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
};

const sendVerificationEmail = (email, verificationLink) => {
  const transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey', 
        pass: process.env.SENDGRID_API_KEY
      }
  });

  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: "Complete your registration",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Welcome to BAP!</h2>
        <p>Thank you for registering. Please verify your email to complete your registration.</p>
        <a href="${verificationLink}" 
           style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; margin: 20px 0;">
          Verify Email
        </a>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px;">
          ${verificationLink}
        </p>
        <p><small>This link will expire in 2 hours.</small></p>
      </div>
    `,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error("Email sending error:", err.message);
    }
  });
};

const verifyUserEmail = async (req, res) => {
  const { token } = req.query;
  try {
    const decoded = jwt.verify(token, secret);

    const users = await User.findOne({ where: { email: decoded.email } });
    if (!users) {
      return res.redirect(`${process.env.FRONTEND_URL}/verifiedEmail.html?status=error`);
    }

    if (users.isVerified) {
      return res.redirect(`${process.env.FRONTEND_URL}/verifiedEmail.html?status=success`);
    }

    users.isVerified = true;
    users.verificationToken = null;
    await users.save();

    res.redirect(`${process.env.FRONTEND_URL}/verifiedEmail.html?status=success`);
  } catch (error) {
    console.error("Verification error:", error);
    if (error.name === "TokenExpiredError") {
      return res.redirect(`${process.env.FRONTEND_URL}/verifiedEmail.html?status=expired`);
    }
    res.redirect(`${process.env.FRONTEND_URL}/verifiedEmail.html?status=error`);
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
      return res.status(401).json({ message: "User not verified" });
    }

    const token = jwt.sign({ id: user.id }, secret);
    res.status(200).json({ message: "User signin success", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

const getDashboard = (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/dashboard.html"));
};

const getLanguages = async (req, res) => {
  try {
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
    console.error('Error getting languages:', error);
    res.status(500).json({
      success: false,
      message: "Failed to get languages"
    });
  }
};

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

    const textElements = pageContent.map((item) => item.text);
    const uniqueTexts = [
      ...new Set(textElements.filter((text) => text && text.trim())),
    ];

    const translations = {};
    const batchSize = 10;
    let translatedCount = 0;

    for (let i = 0; i < uniqueTexts.length; i += batchSize) {
      const batch = uniqueTexts.slice(i, i + batchSize);

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
                "x-rapidapi-key": process.env.RAPIDAPI_KEY,
                "x-rapidapi-host": "google-translator9.p.rapidapi.com",
                "content-type": "application/json",
              },
              timeout: 10000,
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
            translations[text] = text;
          }
        } catch (error) {
          console.error("Translation failed for text:", error.message);
          translations[text] = text;
        }
      });

      await Promise.all(batchPromises);

      if (i + batchSize < uniqueTexts.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

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
      message: "Site translation failed"
    });
  }
};

const resendEmailVerificationLink = async(req,res) => {
  try {
    const {email} = req.body
    if(!email){
      return res.status(400).json({message: "email is required"})
    }

    const user = await User.findOne({where: {email}})
    if(!user){
      return res.status(404).json({message: "user not found"})
    }

    if(user.isVerified){
      return res.status(400).json({message: "user already verified"})
    }

    const verificationToken = generateVerificationToken(email);
    if (!verificationToken) throw new Error("verification token is required");

    user.verificationToken = verificationToken;
    await user.save();

    const verificationLink = `${process.env.BACKEND_URL}/api/verify?token=${verificationToken}`;

    sendVerificationEmail(email, verificationLink);
    
    res.status(200).json({
      message: "Verification link resent successfully"
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return res.status(500).json({message: "internal error"})
  }
}

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/jpeg',
            'image/jpg', 
            'image/png',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    }
});

const submitContactForm = async (req, res) => {
    try {
        const { email, subject, message } = req.body;
        const file = req.file;
        
        if (!email || !subject || !message) {
            if (file && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
            return res.status(400).json({ 
                success: false,
                message: "Email, subject, and message are required"
            });
        }

        const contactData = {
            email,
            subject,
            message,
            status: 'new'
        };

        if (file) {
            contactData.fileName = file.originalname;
            contactData.filePath = file.path;
            contactData.fileSize = file.size;
            contactData.fileType = file.mimetype;
        }

        const contactSubmission = await Contact.create(contactData);

        await sendSupportNotification(email, subject, message, file);

        res.status(200).json({
            success: true,
            message: "Support request submitted successfully!",
            data: {
                id: contactSubmission.id,
                email,
                subject,
                message,
                file: file ? {
                    name: file.originalname,
                    size: file.size,
                    type: file.mimetype
                } : null,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error("Contact form error:", error);
        
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({
            success: false,
            message: "Failed to submit support request"
        });
    }
};

const sendSupportNotification = async (email, subject, message, file) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });

    const supportEmail = process.env.SUPPORT_EMAIL || process.env.FROM_EMAIL;
    
    if (!supportEmail) {
      console.error('No support email configured');
      return false;
    }

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: supportEmail,
      subject: `Support Request: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #007bff;">New Support Request</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
            <p><strong>From:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            ${file ? `<p><strong>Attachment:</strong> ${file.originalname} (${(file.size / 1024).toFixed(2)} KB)</p>` : ''}
            <p><strong>Message:</strong></p>
            <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #007bff;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          <p style="margin-top: 20px; color: #666; font-size: 14px;">
            This is an automated notification from your support system.
          </p>
        </div>
      `,
    };

    if (file && fs.existsSync(file.path)) {
      mailOptions.attachments = [
        {
          filename: file.originalname,
          content: fs.readFileSync(file.path),
          contentType: file.mimetype
        }
      ];
    }

    await transporter.sendMail(mailOptions);
    return true;

  } catch (error) {
    console.error("Error sending support notification:", error);
    return false;
  }
};

const generateResetToken = (email) => {
  return jwt.sign(
    { email, type: 'password_reset' },
    secret,
    { expiresIn: '1h' }
  );
};

const sendPasswordResetEmail = async (email, resetLink) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: email,
      subject: "Reset Your Password - Ship24",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #007bff;">Reset Your Password</h2>
          <p>You requested to reset your password for your Ship24 account.</p>
          <p>Click the button below to create a new password:</p>
          <a href="${resetLink}" 
             style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; margin: 20px 0;">
            Reset Password
          </a>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px; border: 1px solid #ddd;">
            ${resetLink}
          </p>
          <p><small>This link will expire in 1 hour. If you didn't request this, please ignore this email.</small></p>
          <hr style="margin: 20px 0;">
          <p style="color: #64748b; font-size: 14px;">Ship24 Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return false;
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(200).json({
        message: "If your email is registered, you will receive a password reset link shortly."
      });
    }

    const resetToken = generateResetToken(email);
    if (!resetToken) throw new Error("Reset token is required");

    await User.update(
      { resetToken },
      { where: { email } }
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password.html?token=${resetToken}`;

    const emailSent = await sendPasswordResetEmail(email, resetLink);

    if (!emailSent) {
      return res.status(500).json({
        message: "Failed to send password reset email. Please try again later."
      });
    }

    res.status(200).json({
      message: "Password reset link has been sent to your email."
    });

  } catch (error) {
    console.error("Password reset request error:", error);
    res.status(500).json({ 
      message: "Error processing password reset request"
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (jwtError) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }
    
    if (decoded.type !== 'password_reset') {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    const user = await User.findOne({ where: { email: decoded.email } });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    await User.update(
      { 
        password: hashedPassword,
        resetToken: null 
      },
      { where: { email: decoded.email } }
    );

    res.status(200).json({
      message: "Password has been reset successfully"
    });

  } catch (error) {
    console.error("Password reset error:", error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: "Reset token has expired" });
    }
    
    res.status(500).json({ 
      message: "Error resetting password"
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
  getLanguages,
  translateSite,
  resendEmailVerificationLink,
  submitContactForm,
  requestPasswordReset,
  resetPassword
};