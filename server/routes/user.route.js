const express = require("express");
const router = express.Router();
const authenticateToken = require('../middleware/auth')
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});


const {
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
  submitContactForm
} = require("../controllers/user.controller");

router.get("/", index);
router.get('/languages', getLanguages);
router.post("/translate-site", translateSite);
router.get("/register", getUserRegistration);
router.post("/register", userRegistration);
router.get("/verify", verifyUserEmail);
router.get("/emailverification", verifiedEmailPage);
router.get("/login", getLogin);
router.post("/login", login);
router.get("/dashboard", authenticateToken, getDashboard);
router.post("/resend", resendEmailVerificationLink)
router.post("/contact", upload.single('attachment'), submitContactForm);

// Route to download/view files
router.get('/files/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            success: false,
            message: 'File not found'
        });
    }
    
    // Send the file
    res.sendFile(filePath);
});

// Route to get all contact submissions with file info
router.get('/contacts', authenticateToken, async (req, res) => {
    try {
        const contacts = await Contact.findAll({
            order: [['createdAt', 'DESC']]
        });
        
        res.json({
            success: true,
            data: contacts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch contacts',
            error: error.message
        });
    }
});


module.exports = router;
