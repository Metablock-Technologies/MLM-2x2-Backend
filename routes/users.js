const express = require('express');
const userRouter = express.Router();
const userAuthController = require("../controller/userAuthController")
const userController = require("../controller/userController")
const { User, Transaction } = require('../models/index');
const { getUserTransaction, createReferralUser, createRenewal, UserAuthentication } = require('../controller/userController');
const { isVerifiedUser,verifyRole } = require('../middlewares/authMiddleware');
const paymentController = require("../controller/paymentController");
const { fileUpload } = require('../config/multerConfig');
/* GET users listing. */
// userRouter.get('/', getUserTransaction);
// console.log("here");
// userRouter.post('/referral',isVerifiedUser, createReferralUser);
// userRouter.post('/renewal',isVerifiedUser, createRenewal);

userRouter.post('/addmoneyrequest',isVerifiedUser,fileUpload.single('file'),paymentController.addMoney)
userRouter.post("/otp",userAuthController.sendOTP)
userRouter.post("/verify",userAuthController.verifyOTP)
userRouter.get("/getusername",userAuthController.getUsername)

userRouter.post("/otpemail",userAuthController.sendForgetOTP) //for forgot password
userRouter.post("/verifyemail",userAuthController.verifyForgetOTP) // for forgot password
userRouter.post("/login",userAuthController.login)
userRouter.get("/transactions",isVerifiedUser,userController.getTransactions)
userRouter.post('/signup', isVerifiedUser,userController.signUp);
userRouter.get("/myteam/:userId",isVerifiedUser,userController.getMyteam)
userRouter.get("/myteam",isVerifiedUser,userController.getMyteam)
userRouter.get("/profile/:userId",isVerifiedUser,userController.getUserProfile)
userRouter.get("/profile/",isVerifiedUser,userController.getUserProfile)
userRouter.put("/profile",isVerifiedUser,userController.updateName)
userRouter.get("/myrenew/:userId",isVerifiedUser,userController.getMyRenew)
userRouter.get("/myrenew",isVerifiedUser,userController.getMyRenew)
userRouter.post("/changepassword",isVerifiedUser,userAuthController.changepassword)
userRouter.post("/initialpayment",isVerifiedUser,userController.initialpayment)
userRouter.post("/withdrawmoneyrequest",isVerifiedUser,userController.withdrawMoney)
userRouter.post("/block",isVerifiedUser,verifyRole("admin"),userAuthController.blockUser)
userRouter.get("/moneyrequest",isVerifiedUser,userController.getMoneyRequest)
module.exports = userRouter;