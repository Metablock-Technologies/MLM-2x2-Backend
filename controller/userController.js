const { AMOUNT } = require("../Constants");
const { ApiBadRequestError, Api404Error } = require("../errors");
const { User, Transaction, Income_report, UserAuthentication, Wallet, Referral } = require("../models/index");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
// const { UserServices } = require("../services");
const { userServices } = require("../services");
const { walletServices } = require("../services");
var nodemailer = require("nodemailer");
const { Op } = require("sequelize");
async function getUserTransaction(req, res, next) {
  try {
    const rslt = await User.findAll({
      where: {
        id: 1,
      },
      include: {
        model: Transaction,
        as: "transactions",
        attributes: ["transaction_id", "detail"],
      },
      // raw: true,
    });
    res.status(200).json({ rslt });
  } catch (err) {
    next(err);
  }
  // res.send('respond with a resource');
}

async function createReferralUser(req, res, next) {
  try {
    //STEP 1-------->> Create User in Users table.
    const uid = req.user.uid
    const userAuth = await UserAuthentication.findOne({
      where:{
        id:uid
      }
    })
    console.log("userAuth",userAuth);
    let { username, email, password, name, phonenumber, referred_by, role } =
      userAuth;
      phonenumber = userAuth.phone
    if(userAuth?.isCreated){
      throw new ApiBadRequestError("User is already created. Please login")
    }
    //TODO: uncomment this
    // if(!(userAuth?.isPaymentDone)){
    //   throw new ApiBadRequestError("Payment of registration pending.")
    // }
    const referredByUser = await User.findOne({
      where: {
        hashcode: referred_by,
      },
    });
    console.log("referred_by", referredByUser?.id);
    //refreed by or root, not root then use referral table to access referral_id to the refrral name
    if (
      !username ||
      !email ||
      !password ||
      !name ||
      !phonenumber ||
      !referred_by
    )
      return res
        .status(400)
        .json({ message: "All fields are required", data: userAuth });
    const rslt = await userServices.createReferralUser(
      username,
      email,
      password,
      name,
      phonenumber,
      1,
      role
    );
      userAuth.isCreated = true
      await userAuth.save()
    //STEP 2------>>add 25$ to admin wallet using USDT API

    const wallet = await walletServices.createWallet(rslt.newUser.id);

    //STEP 3------>>Add 36% to wallet of referred_by
    const referralAmount = 0.36 * AMOUNT;
    await walletServices.addAmountToWallet(referredByUser.id, referralAmount);

    await walletServices.updateIncomeReport({
      referral: referralAmount,
      userId: referredByUser.id,
    });
    rslt.wallet = wallet;

    //STEP 4------>> Add levelincome
    const levelincomeAmount = 0.6 * AMOUNT;
    await walletServices.addLevelOrderIncome(
      rslt.newUser.id,
      levelincomeAmount
    );
    //STEP 5------>> Add 4% to autopool 1
    const autoPool1Amount = 0.04 * AMOUNT;
    await walletServices.addAmountToAutoPool1(autoPool1Amount);
    return res.status(201).json({ success: true, data: rslt });
  } catch (err) {
    next(err);
  }
}





async function createRenewal(req, res, next) {
  try {
    const { id } = req.body;
    if (!id) {
      throw new ApiBadRequestError("id not found");
    }
    //refreed by or root, not root then use referral table to access referral_id to the refrral name
    //STEP 1------>> Create user and income report
    const rslt = await userServices.createRenewal(id);

    //STEP 2------>> Add levelincome
    const levelincomeAmount = 0.6 * AMOUNT;
    await walletServices.addLevelOrderIncome(
      rslt.newUser.id,
      levelincomeAmount
    );
    //STEP 3------>> Add 4% to autopool 1 and 36% to autopool 2
    const autoPool1Amount = 0.04 * AMOUNT;
    await walletServices.addAmountToAutoPool1(autoPool1Amount);

    const autoPool2Amount = 0.36 * AMOUNT;
    await walletServices.addAmountToAutoPool2(autoPool2Amount);
    return res
      .status(201)
      .json({ message: "User created successfully", user: rslt });
  } catch (err) {
    next(err);
  }
}

async function signUp (req,res,next){
  try{

    let  {name,username,password,referral,role} = req.body
    const uid = req.user.uid
    if(!name || !username || !password || !role){
      throw new ApiBadRequestError("Send all data")
    }

    const user = await UserAuthentication.findOne({
      where:{
        id:uid
      }
    })

    user.name = name;
    user.username = username;
    user.referred_by = referral
    const salt = await bcrypt.genSaltSync(10);
    password = bcrypt.hashSync(password, salt);
    user.password = password
    await user.save()
    return res
      .status(201)
      .json({ message: "User created successfully", user: user });

  }
  catch(err){
    next(err)
  }

}

async function getUserProfile(req,res,next){
  try{
    const uid = req.params.userId || req.user.uid
    console.log("uid",uid);

   
    const userAuth = await UserAuthentication.findOne({
      where:{
        id:uid
      },
      
    })
    if(!userAuth){
      throw Api404Error("No user Found")
    }
    const user = await User.findOne({
      where:{
        phonenumber:userAuth.phone
      },
      attributes:{
        exclude:["password"]
      },
      include:[
        {
          model:Income_report
        },
        {
          model:Wallet
        }

      ]
    })
    let metadata = {}
    const referraluser = await Referral.findOne({
      where:{
        referredUserid:uid
      }
    })
    let sponsorId = ""
    if(!referraluser){
      console.log("here");
      sponsorId = "None"
    }
    else{

      const refUser = (await User.findOne({
        where:{
          id:referraluser.referredByUserId
        }
      }))
      sponsorId = refUser.hashcode
    }
    metadata.sponsorId = sponsorId;
    let arr = await userServices.getMyteam(uid)
    metadata.totalUsers = arr.length
    metadata.activeUsers = (await User.findAndCountAll({
      where:{
        id:{
          [Op.in]:arr,

        },
        status:"active"

      }
    })).count
    res
      .status(200)
      .json({ message: "User fetched successfully", data:user,metadata  });

  }
  catch(err){
    next(err)
  }
}


async function getMyteam(req,res,next){
  try{
    let uid = req.params.userId || req.user.uid
   
    let arr = await  userServices.getMyteam(uid)
   
    console.log("arr",arr);
    res.status(200).json({message:"List of team users fetched successfully",data:arr})

  }catch(err){
    next(err)
  }
}


async function getTransactions(req,res,next){
try{

  let rslt ;
  const limit = req.query.limit || 1000
  const offset = req.query.offset || 0
  if(req.user.role == "admin"){
    rslt = await Transaction.findAll({
      limit,
      offset
    })
  }
  else{
    rslt = await Transaction.findAll({
      where:{
        userId:req.user.uid
      },
      limit,
      offset
    })
  }
  res.status(200).json({message:"Transactions fetched successfully",data:rslt})
}catch(err){
  next(err)
}
}

async function getMyRenew(req,res,next){
  try{
    const uid = req.params.userId || req.user.uid
    const rslt = await userServices.getMyRenew(uid)
    res.status(200).json({message:"Renewed Users fetched successfully",data:rslt})
  }catch(err){
    next(err)
  }
}
async function updateName(req,res,next){
  try{
    const uid = req.user.uid
    const name = req.body.name
    const rslt = await User.findOne({
      where:{
        id:uid
      }
    })
    rslt.name = name;
    await rslt.save()

    res.status(200).json({message:"Name Updated successfully",data:rslt})
  }catch(err){
    next(err)
  }
}



module.exports = {
  getUserTransaction,
  createReferralUser,
  createRenewal,
  signUp,
  getUserProfile,
  getTransactions,
  getMyteam,
  getMyRenew,
  updateName,
};
