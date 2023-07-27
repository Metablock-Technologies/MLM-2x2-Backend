const express = require('express');
const userRouter = express.Router();

const { User, Transaction } = require('../models/index');
const { getUserTransaction, createUser } = require('../controller/userController');


/* GET users listing. */
userRouter.get('/', getUserTransaction);
userRouter.post('/', createUser);

module.exports = userRouter;