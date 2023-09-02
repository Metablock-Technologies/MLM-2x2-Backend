const express = require('express');
const userRouter = express.Router();
const userAuthController = require("../controller/userAuthController")
const userController = require("../controller/userController")
const { User, Transaction } = require('../models/index');
const { getUserTransaction, createReferralUser, createRenewal, UserAuthentication } = require('../controller/userController');
const { isVerifiedUser,verifyRole } = require('../middlewares/authMiddleware');

/* GET users listing. */
// userRouter.get('/', getUserTransaction);
// console.log("here");
userRouter.post('/referral',isVerifiedUser, createReferralUser);
userRouter.post('/renewal',isVerifiedUser, createRenewal);
userRouter.post("/otp",userAuthController.sendOTP)
userRouter.post("/verify",userAuthController.verifyOTP)
userRouter.post("/login",userAuthController.login)
userRouter.get("/transactions",isVerifiedUser,userController.getTransactions)
userRouter.post('/signup', isVerifiedUser,userController.signUp);
userRouter.get("/myteam/:userId",isVerifiedUser,userController.getMyteam)
userRouter.get("/myteam",isVerifiedUser,userController.getMyteam)
userRouter.get("/profile/:userId",isVerifiedUser,userController.getUserProfile)
userRouter.get("/profile/",isVerifiedUser,userController.getUserProfile)
userRouter.put("/profile",isVerifiedUser,userController.updateName)
userRouter.get("/myrenew",isVerifiedUser,userController.getMyRenew)
userRouter.post("/changepassword",isVerifiedUser,userAuthController.changepassword)
userRouter.post("/initialpayment",isVerifiedUser,userController.initialpayment)
userRouter.post("/withdraw",isVerifiedUser,userController.withdrawMoney)
userRouter.post("/block",isVerifiedUser,verifyRole("admin"),userAuthController.blockUser)
module.exports = userRouter;