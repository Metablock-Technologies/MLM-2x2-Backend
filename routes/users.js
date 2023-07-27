const express = require('express');
const userRouter = express.Router();

const { User, Transaction } = require('../models/index');
const { getUserTransaction, createReferralUser } = require('../controller/userController');


/* GET users listing. */
userRouter.get('/', getUserTransaction);
userRouter.post('/referral', createReferralUser);

module.exports = userRouter;