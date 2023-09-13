const express = require('express');
const adminRouter = express.Router();
const adminController = require("../controller/adminController")
adminRouter.get("/dashboard",adminController.getDashboard)
adminRouter.get("/moneyrequest",adminController.getMoneyRequest)


module.exports = adminRouter;