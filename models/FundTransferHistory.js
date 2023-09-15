const { sequelize, DataTypes } = require("../config/db");

const FundTransferHistory = sequelize.define("fundTransferHistory",{
    sender:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    sender_type:{
        type:DataTypes.ENUM,
        values:["new","existing"],
        allowNull:false

    },
    receiver:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    receiver_type:{
        type:DataTypes.ENUM,
        values:["new","existing"],
        allowNull:false

    },
    amount:{
        type:DataTypes.FLOAT,
        allowNull:false
    }

})
// FundTransferHistory.sync()

module.exports = {FundTransferHistory}