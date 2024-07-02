const {Sequelize} = require('sequelize')
const dotenv = require('dotenv')
dotenv.config()

const sequelize = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USERNAME, process.env.DATABASE_PASSWORD, {host: process.env.HOST, dialect: 'mysql'})

module.exports = sequelize