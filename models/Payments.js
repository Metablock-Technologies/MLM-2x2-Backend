
const { sequelize, DataTypes } = require("../config/db");
const { User } = require("./User");

const Payment = sequelize.define("payment",{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    paymentCode:{
        type:DataTypes.STRING
    },
    type:{
        type:DataTypes.ENUM,
        values:["referral","renewal"]
    },
    isUser:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    }
})

Payment.belongsTo(User)
// Payment.sync({alter:true})

module.exports = {Payment}