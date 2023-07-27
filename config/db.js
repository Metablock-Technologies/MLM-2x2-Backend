const { Sequelize, DataTypes, op } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DATABASE_NAME,
    process.env.DATABASE_USERNAME,
    process.env.DATABASE_PASSWORD, {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    dialect: process.env.DATABASE_DIALECT,
    // logging: (msg) => logger.debug(msg),
    // dialectOptions: {
    //   ssl: "Amazon RDS",
    // },
})
// Check database connection
async function checkDatabaseConnection() {
    try {
        await sequelize.authenticate();
        console.log('Connection to the database has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

// Call the function to check the database connection
checkDatabaseConnection();


module.exports = { sequelize, DataTypes };