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
const axios = require("axios");

let PORT = process.env.PORT || 3000;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
      scriptSrcAttr: ["'unsafe-inline'"],
      connectSrc: ["'self'", "https://shippingsite.onrender.com"]
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
// app.use(cors());
app.use("/api", router);
app.use("/api/parcel", parcelRouter);

// Serve the default HTML file for the root URL
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "../client/index.html"));
// });
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
