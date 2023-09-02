const { sequelize, DataTypes } = require("../config/db");
const { User } = require("./User");

const LogWebhook = sequelize.define("logwebhook",{
    details:{
        type:DataTypes.STRING
    },
    paymentId:{
        type:DataTypes.INTEGER

    },
})

LogWebhook.belongsTo(User)
// LogWebhook.sync()

module.exports = {LogWebhook}