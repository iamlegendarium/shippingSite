const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const path = require("path");
const sequelize = require("./config/database");
const router = require("./routes/user.route");

let PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../client")));
app.use(cors());
app.use("/", router);

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
    .catch((error)=>{
      console.error(`Database not connected: ${error}`);
    })
})

// Error handling for unhandled promises
process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
});
module.exports = app;
