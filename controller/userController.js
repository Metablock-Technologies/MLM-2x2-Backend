const { AMOUNT } = require("../Constants");
const { ApiBadRequestError } = require("../errors");
const { User, Transaction, Income_report } = require("../models/index");
// const { UserServices } = require("../services");
const { userServices } = require("../services");
const { walletServices } = require("../services");
var nodemailer = require("nodemailer");
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
    const { username, email, password, name, phonenumber, referred_by } =
      req.body;

    const referredByUser = await User.findOne({
      where: {
        hashcode: referred_by,
      },
    });
    console.log("referred_by", referredByUser.id);
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
        .json({ message: "All fields are required", data: req.body });
    const rslt = await userServices.createReferralUser(
      username,
      email,
      password,
      name,
      phonenumber,
      referredByUser.id
    );

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

async function UserAuthentication(req, res, next) {
  try {
    const { username, email, password, name, phonenumber, referred_by } =
      req.body;

    const rslt = await userServices.UserAuthentication(
      username,
      email,
      password,
      name,
      phonenumber,
      referred_by
    );
    return res
      .status(201)
      .json({ message: "User Sign Up Successfull. Please log in to contine.", user: rslt });
  } catch (err) {
    next(err);
  }
}

async function UserSignIn(req, res, next) {
  try {
    const { email, password } = req.body;

    console.log(email, password);
    const rslt = await userServices.UserSignIn(email, password);
    return res
      .status(201)
      .json({ message: "User SignIn successfull", user: rslt });
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

async function registerEmail(req, res, next) {
  try {
    // var transporter = nodemailer.createTransport({
    //     service: 'gmail',
    //     auth: {
    //       user: process.env.MAIL,
    //       pass: process.env.PASS
    //     }
    //   });

    //   var mailOptions = {
    //     from: process.env.MAIL,
    //     to: 'khushigarg.64901@gmail.com',
    //     subject: 'Sending Email using Node.js',
    //     text: 'That was easy!'
    //   };

    //   transporter.sendMail(mailOptions, function(error, info){
    //     if (error) {
    //       console.log(error);
    //     } else {
    //       console.log('Email sent: ' + info.response);
    //     }
    //   });
    
    const rslt = await userServices.createUserAuthentication
    
    res.status(200).json({ message: `OTP sent on mail ${req.body.email}` });
  } catch (err) {
    next(err);
  }
}

async function verifyOTP(req, res, next) {
  try {
    if (!req.body.OTP) {
      throw new ApiBadRequestError("You have not entered any OTP");
    }
    res.status(200).json({ status: "success", OTPisVerified: true });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getUserTransaction,
  createReferralUser,
  createRenewal,
  UserAuthentication,
  UserSignIn,
  registerEmail,
  verifyOTP,
};
