const express = require("express");
const paymentRouter = express.Router();
const {

  callback,
} = require("../controller/paymentController");

// paymentRouter.use("/webhook", receivePaymentUpdates);

paymentRouter.post("/callback", callback);

module.exports = paymentRouter;
