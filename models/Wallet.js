const { sequelize, DataTypes } = require('../config/db');
const { User } = require('./User')
// const sequelize = new Sequelize('sqlite::memory:');

const Wallet = sequelize.define('wallet', {
    wallet_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
    wallet_link: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        allowNull: false,
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

Wallet.belongsTo(User, {
    as: 'user_id'
})

User.hasOne(Wallet, {
    as: 'user_id'
})
// Wallet.sync({ alter: true });
module.exports = { Wallet };