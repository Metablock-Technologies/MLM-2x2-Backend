const { sequelize, DataTypes } = require('../config/db');
const { User } = require('./User');

// const sequelize = new Sequelize('sqlite::memory:');

const Renewal = sequelize.define('renewal', {
    renewal_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
        // field:'referral_user_id' // to match the column name in db table
    },
    main_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
});

Renewal.belongsTo(User, {
    foreignKey: 'main_id'
})
User.hasMany(Renewal, {
    foreignKey: 'main_id'
})
// Renewal.sync({ alter: true });
module.exports = { Renewal };