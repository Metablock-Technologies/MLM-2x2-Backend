const { sequelize, DataTypes } = require('../config/db');
const UserAuth = sequelize.define("userauth", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    password: DataTypes.STRING,
    email: {
        type: DataTypes.STRING,
        unique: true,
        // validate: {
        //   isEmail: { msg: "Plz Enter a Valid Email" },
        // },
        allowNull: true,
    },
    otp: DataTypes.STRING,
    expirationTime: DataTypes.DATE,
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    isUpdated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    paymentDone: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    referredBy: DataTypes.STRING,
}
)

// UserAuth.sync({ alter: true });
module.exports = { UserAuth };