const express = require('express');
const userRouter = express.Router();

const { User, Transaction } = require('../models/index');
const { getUserTransaction, createReferralUser, createRenewal } = require('../controller/userController');


/* GET users listing. */
userRouter.get('/', getUserTransaction);
userRouter.post('/referral', createReferralUser);
userRouter.post('/renewal', createRenewal);

module.exports = userRouter;