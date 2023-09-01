const { sequelize, DataTypes } = require('../config/db');
const { Referral } = require('./Referal');
const { Renewal } = require('./Renewal');
const { User } = require('./User')
// const sequelize = new Sequelize('sqlite::memory:');

const Wallet = sequelize.define('wallet', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
    wallet_link: {
        type: DataTypes.STRING,
        // allowNull: false,
        unique: true,
        // allowNull: false,
    },
    balance: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        allowNull: false
    },
    withdraw_amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        // validate: {
        //     isFloat: {
        //         msg: 'Withdraw amount should be a float'
        //     }
        // }
        defaultValue: 0.0
    }
});

Wallet.hasMany(User)

User.hasOne(Wallet)
// Wallet.sync({ alter: true });
// Renewal.sync({force:true})
// Referral.sync({force:true})
// User.sync({alter:true})
module.exports = { Wallet };