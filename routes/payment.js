const express = require("express");
const paymentRouter = express.Router();
const {

  callback, distribute,
} = require("../controller/paymentController");




// paymentRouter.use("/webhook", receivePaymentUpdates);

paymentRouter.post("/callback", callback);
paymentRouter.post("/distributeautopool", distribute);

module.exports = paymentRouter;
