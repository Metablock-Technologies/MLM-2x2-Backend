const express = require('express');
const adminRouter = express.Router();
const adminController = require("../controller/adminController")
adminRouter.get("/dashboard",adminController.getDashboard)



module.exports = adminRouter;