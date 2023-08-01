const express = require('express');
const userRouter = express.Router();

const { User, Transaction } = require('../models/index');
const { getUserTransaction, createReferralUser, createRenewal, UserAuthentication, UserSignIn } = require('../controller/userController');

/* GET users listing. */
userRouter.get('/', getUserTransaction);
userRouter.post('/referral', createReferralUser);
userRouter.post('/renewal', createRenewal);
userRouter.post('/signup', UserAuthentication);
userRouter.post('/signin', UserSignIn);


module.exports = userRouter;