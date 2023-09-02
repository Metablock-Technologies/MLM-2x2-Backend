const asyncHandler = require("express-async-handler");
const { PaymentCallBackLog } = require("../models");


exports.callback = asyncHandler( async(req,res)=>{
    
        const paymentLog = await PaymentCallBackLog.create(req.body);
        res.status(201).json({ message: 'Log created successfully', id: paymentLog.id });
    
})
