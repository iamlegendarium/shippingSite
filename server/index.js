const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const sequelize = require("./config/database");
const router = require("./routes/user.route");


let PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors())
app.use("/", router);

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
