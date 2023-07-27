const { sequelize, DataTypes } = require('../config/db');

// const sequelize = new Sequelize('sqlite::memory:');

const User = sequelize.define('user', {
    username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    email: { //
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
            isEmail: {
                msg: "Must be a valid email address",
            }
        },
    },
    password: DataTypes.STRING,
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    node_id: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        validate: {
            isIn: [['active', 'inactive']]
        },
        allowNull: false
    },
    pack_expiry: {
        type: DataTypes.DATEONLY,
        defaultValue: function () {
            const currentDate = new Date();
            currentDate.setDate(currentDate.getDate() + 30); // Add 30 days
            return currentDate.toISOString().split('T')[0]; // Return in 'YYYY-MM-DD' format
        },
        allowNull: false
    },
    number_of_renew: {
        type: DataTypes.INTEGER,
        defaultValule: 0,
        allowNull: false
    },
    number_of_referral: {
        type: DataTypes.INTEGER,
        defaultValule: 0,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phonenumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // unique: true
    }
});



// User.hasMany(Transaction, {
//     as: 'user_id'
// })
// User.hasOne(Wallet, {
//     as: 'user_id'
// })
// User.hasMany(Referral, {
//     a: 'referal_userid'
// })
// User.hasMany(Renewal, {
//     as: 'main_id'
// })
// User.hasOne(Income_report, {
//     as: 'user_id'
// })

// User.sync({ alter: true });
module.exports = { User };