const asyncHandler = require("express-async-handler");
const { PaymentCallBackLog, MoneyRequest, User, Wallet, Autopool1, Autopool2 } = require("../models");
const { ApiBadRequestError, logError } = require("../errors");
const { Op } = require("sequelize");
const { walletServices } = require("../services");
const { sendEmail } = require("../services/mail");

exports.callback = asyncHandler(async (req, res) => {
  const paymentLog = await PaymentCallBackLog.create(req.body);
  res
    .status(201)
    .json({ message: "Log created successfully", id: paymentLog.id });
});

exports.addMoney = asyncHandler(async (req, res) => {
  // const uid = req.user.id
  console.log("test user", req.user);
  const { amount,message } = req.body;
  if (!amount) {
    throw new ApiBadRequestError("enter amount to add.");
  }
  const countrequest = (await MoneyRequest.findAndCountAll({
    where:{
      type:"add",
      status:"pending"
    }
  })).count
  if(countrequest>0){
    throw new ApiBadRequestError("You can only have 1 request at a time. Wait for admin to accept or reject.")
  }
  const link = req.file.link;
  const rslt = await MoneyRequest.create({
    amount,
    type: "add",
    status: "pending",
    message:message,
    account_type: req.user.created ? "existing" : "new",
    user_id: req.user.uid,
    link,
  });

  
  res.status(200).json({ message: "Request added successfully", data: rslt });
});


exports.distribute = asyncHandler( async(req,res)=>{
  console.log("API calleed");
  const eligibleUsersAP1 = await User.findAll({
      where:{
        number_of_referral:{
          [Op.gte]:100
        }
      },
      include:[
        {
          model:Wallet,
          
        }
      ]
  })
  const eligibleUsersAP2 = await User.findAll({
      where:{
        number_of_referral:{
          [Op.gte]:10
        }
      },
      include:[
        {
          model:Wallet,
          
        }
      ]
  })
  console.log("eligibleUsersAP1",eligibleUsersAP1);
  console.log("eligibleUsersAP2",eligibleUsersAP2);

  const amountToDistAP1 = (await Autopool1.sum("amount",{
    where:{
      status:"pending"
    }
  }))
  const amountToDistAP2 = (await Autopool2.sum("amount",{
    where:{
      status:"pending"
    }
  }))
  console.log("amountToDistAP1",amountToDistAP1);
  console.log("amountToDistAP2",amountToDistAP2);
  const peruserAmtAP1 = amountToDistAP1/eligibleUsersAP1.length
  const currentDate = (new Date()).getDate
  
  
  //monthly income
  if(currentDate != 1){
    console.log("Autopool 1 distributed");
    await Promise.all(
      eligibleUsersAP1.map(async(user)=>{
        console.log("inside userrrr",user.dataValues.id);
        await walletServices.addAmountToWallet(user.dataValues.id,peruserAmtAP1)
        await walletServices.updateIncomeReport({userId:user.dataValues.id,autopool1:peruserAmtAP1})
      })
      )

      await Promise.all((await Autopool1.findAll({
        where:{
          status:"pending"
        }
      })).map(async(autopool1s)=>{
        autopool1s.status = "distributed";
        await autopool1s.save()
      }))
    }
    else{
      console.log("Autopool 1 not distributed");
    }
    
    
    //daily income
    const peruserAmtAP2 = amountToDistAP2/eligibleUsersAP2.length
  await Promise.all(
    eligibleUsersAP2.map(async(user)=>{
      console.log("inside userrrr",user.dataValues.id);
      await walletServices.addAmountToWallet(user.dataValues.id,peruserAmtAP2)
      await walletServices.updateIncomeReport({userId:user.dataValues.id,autopool2:peruserAmtAP2})
    })
  )
  await Promise.all((await Autopool2.findAll({
    where:{
      status:"pending"
    }
  })).map(async(autopool2s)=>{
    autopool2s.status = "distributed";
    await autopool2s.save()
  }))


  
  sendEmail("okdreamok25@gmail.com","Daily and Monthly Income Update",`Following amount has been distributed.<br>DailyIncome: ${0}<br> Monthly Income: ${currentDate==1?amountToDistAP1:0}.`)

  // res.send(`Following amount has been distributed.<br>DailyIncome: ${amountToDistAP2}<br> Monthly Income: ${currentDate==1?amountToDistAP1:0}.`)
  res.status("200").json({message:"ok"})
})