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
  // const transporter = nodemailer.createTransport({
  //   service: "gmail",
  //   auth: {
  //     user: process.env.EMAIL,
  //     pass: process.env.PASSWORD,
  //   },
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
      // return res.json({ message: "User already verified" });
      return res.redirect(
        "https://shipping-site-nine.vercel.app/verifiedEmail.html"
      );
    }

    (users.isVerified = true),
      (users.verificationToken = null),
      await users.save();

    // res.redirect("/emailverification");

    console.log("User verification complete", users);
    res.json({ message: "User verification complete", users });
    res.redirect(
      "https://https://shipping-site-nine.vercel.app/verifiedEmail.html"
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
    const verificationLink = `https://shippingsite.onrender.com/api/verify?token=${verificationToken}`;

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

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer to save files to disk
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Create unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
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
        
        console.log('Received contact form data:', { email, subject, message });
        console.log('File:', file ? {
            name: file.originalname,
            path: file.path,
            size: file.size,
            type: file.mimetype
        } : 'No file');
        
        if (!email || !subject || !message) {
            // Delete uploaded file if validation fails
            if (file && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
            return res.status(400).json({ 
                success: false,
                message: "Email, subject, and message are required"
            });
        }

        // Save to database with file info
        const contactData = {
            email,
            subject,
            message,
            status: 'new'
        };

        if (file) {
            contactData.fileName = file.originalname;
            contactData.filePath = file.path; // Store the file path
            contactData.fileSize = file.size;
            contactData.fileType = file.mimetype;
        }

        const contactSubmission = await Contact.create(contactData);
        console.log('Contact saved to database with ID:', contactSubmission.id);
        console.log('File saved at:', file ? file.path : 'No file');

        // Send email notification
        const emailSent = await sendSupportNotification(email, subject, message, file);

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
                    path: file.path,
                    size: file.size,
                    type: file.mimetype
                } : null,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error("Contact form error:", error);
        
        // Delete uploaded file if error occurs
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({
            success: false,
            message: "Failed to submit support request",
            error: error.message
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

    // Add attachment if file exists
    if (file) {
      mailOptions.attachments = [
        {
          filename: file.originalname,
          content: file.buffer, // file.buffer contains the file data
          contentType: file.mimetype
        }
      ];
    }

    const info = await transporter.sendMail(mailOptions);
    console.log("Support notification sent successfully to:", supportEmail);
    if (file) {
      console.log("Attachment included:", file.originalname);
    }
    return true;

  } catch (error) {
    console.error("Error sending support notification:", error);
    return false;
  }
};

//PASSWORD RESET


// Generate password reset token
const generateResetToken = (email) => {
  return jwt.sign(
    { email, type: 'password_reset' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

// Send password reset email - FIXED VERSION
const sendPasswordResetEmail = async (email, resetLink) => {
  try {
    console.log('Attempting to send password reset email to:', email);

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
      subject: "Reset Your Password - Shipping Site",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #007bff;">Reset Your Password</h2>
          <p>You requested to reset your password for your Shipping Site account.</p>
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
          <p style="color: #64748b; font-size: 14px;">Shipping Site Team</p>
        </div>
      `,
    };

    // Use promise-based sendMail
    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent successfully:", info.response);
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return false;
  }
};

// Request password reset - FIXED VERSION
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    console.log('Password reset requested for email:', email);

    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // For security, don't reveal if email exists or not
      return res.status(200).json({
        message: "If your email is registered, you will receive a password reset link shortly."
      });
    }

    const resetToken = generateResetToken(email);
    if (!resetToken) throw new Error("Reset token is required");

    // Update user with reset token
    await User.update(
      { resetToken },
      { where: { email } }
    );

    console.log("Password reset token generated for user:", user.id);
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const resetLink = `${baseUrl}/reset-password.html?token=${resetToken}`;

    console.log('Reset link:', resetLink);

    // ACTUALLY SEND THE EMAIL - This was missing!
    const emailSent = await sendPasswordResetEmail(email, resetLink);

    if (!emailSent) {
      return res.status(500).json({
        message: "Failed to send password reset email. Please try again later.",
        resetLink // Include link in response as fallback
      });
    }

    res.status(200).json({
      message: "Password reset link has been sent to your email."
    });

  } catch (error) {
    console.error("Password reset request error:", error);
    res.status(500).json({ 
      message: "Error processing password reset request",
      error: error.message 
    });
  }
};

// Reset password function remains the same
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    console.log('Reset password request received');

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }
    
    if (decoded.type !== 'password_reset') {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    console.log('Token decoded for email:', decoded.email);

    // Check if user exists
    const user = await User.findOne({ where: { email: decoded.email } });

    if (!user) {
      console.log('User not found for email:', decoded.email);
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    console.log('User found, updating password for:', user.email);

    // Hash new password
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    // Update user password and clear reset token
    await User.update(
      { 
        password: hashedPassword,
        resetToken: null 
      },
      { where: { email: decoded.email } }
    );

    console.log('Password updated successfully for:', decoded.email);

    res.status(200).json({
      message: "Password has been reset successfully"
    });

  } catch (error) {
    console.error("Password reset error:", error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: "Reset token has expired" });
    }
    
    res.status(500).json({ 
      message: "Error resetting password",
      error: error.message 
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
