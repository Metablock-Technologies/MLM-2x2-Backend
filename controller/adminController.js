const { Op } = require("sequelize");
const { User, Transaction, Wallet, Income_report } = require("../models")
const asyncHandler = require("express-async-handler");
exports.getDashboard = asyncHandler( async(req,res)=>{
    const data = {}
    data.totalMembers = (await User.findAndCountAll().count) || 0
    data.activeMembers =  (await User.findAndCountAll({
        where:{
            status:"active"
        }
    }).count) || 0
    data.inactiveMembers = parseInt(data.totalMembers) - parseInt(data.activeMembers)
    data.blockedMembers =  (await User.findAndCountAll({
        where:{
            status:"blocked"
        }
    }).count) || 0

    data.withdrawRequests = await Transaction.findAndCountAll({
        where: {
            detail:{
                [Op.or]:[
                    {
                        [Op.like]:"%withdraw%"

                    }

                ]
        }
    }})
    data.withdrawRequests = (await Transaction.findAndCountAll({
        where: {
            detail:{
                [Op.or]:[
                    {
                        [Op.like]:"%withdraw%"

                    }

                ]
        }
    }})).count || 0
    data.withdrawAmount = (await Wallet.sum("withdraw_amount",{
        where:{
            id:{
                [Op.ne]:1
            }
        }
    })) || 0
    data.incomeReport = (await Income_report.findOne({
        where:{
            userId:1
        }
    }))

    res.status(200).json({
        message:"data fetched successfully",
        data:data
    })

})