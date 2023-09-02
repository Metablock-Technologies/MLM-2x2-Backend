
const { sequelize, DataTypes } = require("../config/db");
const { User } = require("./User");

const Payment = sequelize.define("payment",{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    order_id:{
        type:DataTypes.STRING
    },
    type:{
        type:DataTypes.ENUM,
        values:["referral","renewal"]
    },

    status:{
        type:DataTypes.STRING
    },
    payment_id:{
        type:DataTypes.STRING
    },
    purchase_id:{
        type:DataTypes.STRING
    }
})

Payment.belongsTo(User)
// Payment.sync({alter:true})

module.exports = {Payment}