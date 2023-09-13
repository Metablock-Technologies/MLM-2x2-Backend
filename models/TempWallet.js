const { sequelize, DataTypes } = require('../config/db');
// const { Referral } = require('./Referal');
// const { Renewal } = require('./Renewal');
// const { User } = require('./User')
// const sequelize = new Sequelize('sqlite::memory:');

const TempWallet = sequelize.define('tempWallet', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
  
    balance: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        allowNull: false
    },
    user_id:{
        type:DataTypes.INTEGER,
        allowNull:false
    }
});
// TempWallet.sync()

module.exports = { TempWallet };