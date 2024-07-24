const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
  firstName: {type: DataTypes.STRING, allowNull: false},
  lastName: {type: DataTypes.STRING, allowNull: false},
  email: {type: DataTypes.STRING, unique: true, allowNull: false},
  password: {type: DataTypes.STRING, allowNull: false},
  isVerified: {type: DataTypes.BOOLEAN, defaultValue: false},
  verificationToken: {type: DataTypes.STRING}
});

module.exports = User;
