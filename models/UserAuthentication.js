const { sequelize, Op, DataTypes } = require("../config/db");
const { UserDataType } = require("../Constants");

const UserAuthentication = sequelize.define("userAuthentication", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    phone: {
        type: DataTypes.BIGINT,
        isNumber: true,
        allowNUll: true,
        validate: {
            len: {
                args: 12,
                msg: "Phone Number Should have 10 Digits and 91 in the begining",
            },
        },
    },
    phone_otp: DataTypes.STRING,
    phone_expirationTime: DataTypes.DATE,
    role: {
        type: DataTypes.ENUM(Object.values(UserDataType)),
        allowNull: false,
        validate: {
            isIn: {
                args: [Object.values(UserDataType)],
                msg: `Only Allowed Values Are: ${Object.values(UserDataType)} `,
            },
        },
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        validate: {
            isEmail: { msg: "Plz Enter a Valid Email" },
        },
        allowNull: true,
    },
    email_otp: DataTypes.STRING,
    email_expirationTime: DataTypes.DATE,
    is_phone_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    is_email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    isCreated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    isPaymentDone: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    username: {
        type: DataTypes.STRING,
        unique: true,
        // allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
    },
    password: {
        type: DataTypes.STRING
    },
    referred_by: {
        type: DataTypes.STRING
    },
    nodeId: {
        type: DataTypes.INTEGER
    },
    walletaddress: {
        type: DataTypes.STRING,
        unique: true,
    },
});

// const RefreshToken = sequelize.define("refreshToken", {
//   id: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true,
//   },
//   token: {
//     type: DataTypes.STRING,
//   },
// });
// RefreshToken.belongsTo(UserAuthentication);
// RefreshToken.sync()
// UserAuthentication.sync({ alter: true });
module.exports = { UserAuthentication };
