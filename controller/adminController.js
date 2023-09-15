const { Op } = require("sequelize");
const {
  User,
  Transaction,
  Wallet,
  Income_report,
  MoneyRequest,
  UserAuthentication,
  TempWallet,
} = require("../models");
const asyncHandler = require("express-async-handler");
const { Api404Error, ApiBadRequestError } = require("../errors");
const { walletServices } = require("../services");
const { json } = require("body-parser");
exports.getDashboard = asyncHandler(async (req, res) => {
  const data = {};
  data.totalMembers = (await User.findAndCountAll().count) || 0;
  data.activeMembers =
    (await User.findAndCountAll({
      where: {
        status: "active",
      },
    }).count) || 0;
  data.inactiveMembers =
    parseInt(data.totalMembers) - parseInt(data.activeMembers);
  data.blockedMembers =
    (await User.findAndCountAll({
      where: {
        status: "blocked",
      },
    }).count) || 0;

  data.withdrawRequests = await Transaction.findAndCountAll({
    where: {
      detail: {
        [Op.or]: [
          {
            [Op.like]: "%withdraw%",
          },
        ],
      },
    },
  });
  data.withdrawRequests =
    (
      await Transaction.findAndCountAll({
        where: {
          detail: {
            [Op.or]: [
              {
                [Op.like]: "%withdraw%",
              },
            ],
          },
        },
      })
    ).count || 0;
  data.withdrawAmount =
    (await Wallet.sum("withdraw_amount", {
      where: {
        id: {
          [Op.ne]: 1,
        },
      },
    })) || 0;
  data.incomeReport = await Income_report.findOne({
    where: {
      userId: 1,
    },
  });

  res.status(200).json({
    message: "data fetched successfully",
    data: data,
  });
});

exports.getMoneyRequest = asyncHandler(async (req, res) => {
  const addMoney = await MoneyRequest.findAll({
    where: {
      type: "add",
    },
    order:[
      ["createdAt","DESC"]
    ]
  });
  const withdrawMoney = await MoneyRequest.findAll({
    where: {
      type: "withdraw",
    },
    order:[
      ["createdAt","DESC"]
    ]
  });
  res
    .status(200)
    .json({
      message: "Requests fetched successfully",
      data: { addMoney, withdrawMoney },
    });
});

exports.actionMoneyRequest = asyncHandler(async (req, res) => {
  let { requestId, status, type, account_type, user_id, amount, message } = req.body;
  if (
    !requestId ||
    !(type == "add" || type == "withdraw") ||
    !amount ||
    !(account_type == "new" || account_type == "existing") ||
    !status ||
    !user_id
  ) {
    throw new ApiBadRequestError("Bad data in body, please check, " + req.body)
  }
  const request = await MoneyRequest.findOne({
    where: {
      id: requestId,
    },
  });
  if(request.status != "pending"){
    throw new ApiBadRequestError("Request is not in pending state")
  }
  if (!request) {
    throw new Api404Error("MoneyRequest not found.");
  }
  if (type == "add") {
    if (status == "accepted") {
      const user = await UserAuthentication.findOne({
        where: {
          ...(account_type == "new" && { id: user_id }),
          ...(account_type == "existing" && { nodeId: user_id }),
        },
      });
      if(!user){
        throw new Api404Error("user not found")
      }
      if(user.nodeId){
        console.log("here existing")
        account_type = "existing"
        user_id = user.nodeId
      }
      if (account_type == "new") {
        const tempWallet = await TempWallet.findOne({
          where: {
            user_id: user_id,
          },
        });
        tempWallet.balance = parseInt(tempWallet.balance) + parseInt(amount);
        await tempWallet.save();
        // await Transaction.create({
        //     userId:user_id,
        //     detail:"Add Money to TempWallet",
        //     amount:amount
        //   })
      } else {
        // const userAdd = await UserAuthentication.findOne({
        //   where:{
        //     id:
        //   }
        // })
       
        await walletServices.addAmountToWallet(user.nodeId,amount)
        // await Transaction.create({
        //     userId:user_id,
        //     detail:"Add Money to Wallet",
        //     amount:amount
        //   })
        // await walletServices.updateIncomeReport()
      }
      request.status = "accepted"
    }
    else{
        request.status = status
    }
  }else{
    if (status == "accepted") {
      const user = await UserAuthentication.findOne({
        where: {
          ...(account_type == "new" && { id: user_id }),
          ...(account_type == "existing" && { nodeId: user_id }),
        },
      });
      if(!user){
        throw new Api404Error("user not found")
      }
      if(user.nodeId){
        console.log("here existing")
        account_type = "existing"
        user_id = user.nodeId
      }
      if (account_type == "new") {
        const tempWallet = await TempWallet.findOne({
          where: {
            user_id: user_id,
          },
        });
        console.log("temp wallet balance and amount:  ",parseInt(tempWallet.balance));
        tempWallet.balance = parseInt(tempWallet.balance) - parseInt(amount);
        await tempWallet.save();
        // await Transaction.create({
        //     userId:user_id,
        //     detail:"Add Money to TempWallet",
        //     amount:amount
        //   })
      } else {
        // const userAdd = await UserAuthentication.findOne({
        //   where:{
        //     id:
        //   }
        // })
        const wallet = await Wallet.findOne({
          where:{
            userId:user.nodeId

          }
        })

        wallet.withdraw_amount =
        parseFloat(wallet.withdraw_amount) + parseFloat(amount);
      wallet.balance = parseFloat(wallet.balance) - parseFloat(amount);
      //TODO add send USDTBSC via API
      await wallet.save();
       
        // await walletServices.addAmountToWallet(user.nodeId,amount)
        await Transaction.create({
            userId:user.nodeId,
            detail:"Withdraw",
            amount:amount
          })
        // await walletServices.updateIncomeReport()
      }
      request.status = "accepted"
    }
    else{
        request.status = status
    }
  }
  request.message = message
  await request.save()
  res.status(200).json({message:"action successfull",data:request})
});
