const asyncHandler = require("express-async-handler");
const { PaymentCallBackLog, MoneyRequest } = require("../models");
const { ApiBadRequestError } = require("../errors");
const { Op } = require("sequelize");

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
