const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user.model');

const Parcel = sequelize.define('Parcel', {
  trackingNumber: {type: DataTypes.STRING, allowNull: false, unique: true},
  origin: {type: DataTypes.STRING, allowNull: false},
  destination: {type: DataTypes.STRING, allowNull: false},
  status: {type: DataTypes.STRING, allowNull: false},
  senderName: {type: DataTypes.STRING, allowNull: false},
  senderPhone: {type: DataTypes.STRING, allowNull: false},
  receiverName: {type: DataTypes.STRING, allowNull: false},
  receiverPhone: {type: DataTypes.STRING, allowNull: false},
  receiverAddress: {type: DataTypes.STRING, allowNull: false},
  currentLocation: {type: DataTypes.STRING }
});

const ParcelStatusUpdate = sequelize.define('ParcelStatusUpdate', {
  status: {type: DataTypes.STRING, allowNull: false},
  location: {type: DataTypes.STRING, allowNull: false}
});

User.hasMany(Parcel, { foreignKey: 'userId' });
Parcel.belongsTo(User, { foreignKey: 'userId' });

Parcel.hasMany(ParcelStatusUpdate, { as: 'statusUpdates' });
ParcelStatusUpdate.belongsTo(Parcel);

module.exports = { Parcel, ParcelStatusUpdate };
