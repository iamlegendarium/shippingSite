const express = require("express");
const app = express();
const helmet = require("helmet");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const path = require("path");
const sequelize = require("./config/database");
const router = require("./routes/user.route");
const parcelRouter = require("./routes/parcel.route");
const passwordResetRoutes = require('./routes/passwordReset.routes');
const axios = require("axios");

let PORT = process.env.PORT || 3000;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'", 
        "https://cdn.jsdelivr.net", 
        "https://maxcdn.bootstrapcdn.com",
        "https://cdnjs.cloudflare.com",
        "'unsafe-inline'"  // Allow inline styles
      ],
      scriptSrc: [
        "'self'", 
        "https://cdn.jsdelivr.net",
        "https://code.jquery.com",
        "https://cdnjs.cloudflare.com",
        "https://maxcdn.bootstrapcdn.com",
        "'unsafe-inline'"  // Allow inline scripts
      ],
      fontSrc: [
        "'self'",
        "https://maxcdn.bootstrapcdn.com",
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net"
      ],
      connectSrc: [
        "'self'",
        "https://shippingsite.onrender.com",
        "http://localhost:3000",
        "https://maxcdn.bootstrapcdn.com",
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:"
      ]
    }
  }
}));

app.use(
  cors({
    origin: [
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      "http://localhost:3000",
      'https://shippingsite.onrender.com',
      "https://shipping-site-nine.vercel.app"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.static(path.join(__dirname, "../client")));
app.use(express.static(path.join(__dirname, '../client/css')));
app.use("/api", router);
app.use("/api/parcel", parcelRouter);
app.use('/api/auth', passwordResetRoutes);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  sequelize
    .sync()
    .then(() => {
      console.log("Database connected");
    })
    .catch((error) => {
      console.error(`Database not connected: ${error}`);
    });
});

// Error handling for unhandled promises
process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
});
module.exports = app;
