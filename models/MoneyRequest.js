const { sequelize, DataTypes } = require("../config/db");

const MoneyRequest = sequelize.define("MoneyRequest",{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    amount:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    type:{
        type:DataTypes.ENUM,
        values:["add","withdraw"],
        allowNull:false
    },
    status:{
        type:DataTypes.ENUM,
        values:["pending","accepted","rejected"],
        defaultValue:"pending",
        allowNull:false,
    },
    account_type:{
        type:DataTypes.ENUM,
        values:["new","existing"],
        allowNull:false,
    },
    message:{
        type:DataTypes.STRING
    },
    user_id:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    link:{
        type:DataTypes.STRING
    }
})

// MoneyRequest.sync()
module.exports = {MoneyRequest}

