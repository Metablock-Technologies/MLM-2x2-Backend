const { sequelize, DataTypes } = require('../config/db');
const { User } = require('./User')
// const sequelize = new Sequelize('sqlite::memory:');

const Transaction = sequelize.define('transaction', {
    transaction_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
        // field:'referral_user_id' // to match the column name in db table
    },
    detail: {
        type: DataTypes.STRING,
        allowNull: false,
    }
});

Transaction.belongsTo(User, {
    foreignKey: {
        allowNull: false
    },
    onDelete: 'CASCADE'
})
User.hasMany(Transaction)

// Transaction.sync({ force: true });
module.exports = { Transaction };