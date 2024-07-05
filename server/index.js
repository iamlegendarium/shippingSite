const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const path = require("path")
const sequelize = require("./config/database");
const router = require("./routes/user.route");


let PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.static(path.join("../client")))
app.use(cors())
app.use("/", router);

// Catch-all route to serve index.html for any other route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

sequelize
  .sync()
  .then(() => {
    console.log("Database connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(`Server is not running on port ${PORT}`);
  });

  module.exports = app