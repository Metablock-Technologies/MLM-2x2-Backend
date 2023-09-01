const { sequelize, DataTypes } = require('../config/db');
const { User } = require('./User');


// const sequelize = new Sequelize('sqlite::memory:');

const Income_report = sequelize.define('income_report', {
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
    },
    levelincome: {
        type: DataTypes.FLOAT,
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

Income_report.belongsTo(User)
User.hasOne(Income_report)

// Income_report.sync({ alter: true     });
module.exports = { Income_report };