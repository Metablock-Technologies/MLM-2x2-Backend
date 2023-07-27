const { sequelize, DataTypes } = require('../config/db');
const { User } = require('./User');
const { Autopool1 } = require('./autopool1');

// const sequelize = new Sequelize('sqlite::memory:');

const Income_report = sequelize.define('income_report', {
    levelincome: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    amount_spent: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0
    },
    autopool1: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0
    },
    autopool2: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0
    },
    referral: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0
    },
    totalincome: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0
    },
});

Income_report.belongsTo(User, {
    foreignKey: 'user_id'
})
User.hasOne(Income_report, {
    foreignKey: 'user_id'
})

// Income_report.sync({ alter: true });
module.exports = { Income_report };