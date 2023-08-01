const { sequelize, DataTypes } = require('../config/db');
const { User } = require('./User')
// const sequelize = new Sequelize('sqlite::memory:');

const Referral = sequelize.define('referal', {
    referredUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        unique: true,
        // field:'referral_user_id' // to match the column name in db table
    },
    
});

Referral.belongsTo(User, {
    foreignKey: 'referredByUserId'
})
User.hasMany(Referral, {
    foreignKey: 'referredByUserId'
})

// Referral.sync({ force: true });
module.exports = { Referral };