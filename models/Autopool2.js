const { sequelize, DataTypes } = require('../config/db');

// const sequelize = new Sequelize('sqlite::memory:');

const Autopool2 = sequelize.define('autopool2', {
    autopool2_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
        // field:'referral_user_id' // to match the column name in db table
    },
    month: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    }
});


// Autopool2.sync({ alter: true });
module.exports = { Autopool2 };