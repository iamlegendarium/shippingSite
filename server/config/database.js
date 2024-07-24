const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();

const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USERNAME,
  process.env.DATABASE_PASSWORD,
  { host: process.env.DATABASE_HOST, dialect: "mysql", dialectModule: require("mysql2"),
    dialectOptions: { // optional if you have xampp or port borken
    socketPath: "/opt/lampp/var/mysql/mysql.sock"
}, port: 3306 }
);

sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });

module.exports = sequelize;
