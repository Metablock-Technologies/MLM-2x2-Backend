const { sequelize, DataTypes } = require('../config/db');
const { User } = require('./User')
// const sequelize = new Sequelize('sqlite::memory:');

const Referral = sequelize.define('referal', {
    referal_userid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
        // field:'referral_user_id' // to match the column name in db table
    },
    referred_by: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

Referral.belongsTo(User, {
    foreignKey: 'referal_userid'
})
User.hasMany(Referral, {
    foreignKey: 'referal_userid'
})
// Referral.sync({ alter: true });
module.exports = { Referral };