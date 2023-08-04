const express = require('express');
const userRouter = express.Router();

const { User, Transaction } = require('../models/index');
const { getUserTransaction, createReferralUser, createRenewal, UserAuthentication, UserSignIn,registerEmail,verifyOTP } = require('../controller/userController');

/* GET users listing. */
userRouter.get('/', getUserTransaction);
console.log("here");
userRouter.post('/referral', createReferralUser);
userRouter.post('/renewal', createRenewal);
userRouter.post('/registeremail',registerEmail)
userRouter.post('/verify',verifyOTP)
userRouter.post('/signup', UserAuthentication);
userRouter.post('/signin', UserSignIn);


module.exports = userRouter;