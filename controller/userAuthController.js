const asyncHandler = require("express-async-handler");
const userAuthServices = require("../services/userAuthServices");
const { Api404Error, ApiBadRequestError } = require("../errors");
const { User, Admin, UserAuthentication } = require("../models");
const bcrypt = require("bcrypt")
exports.sendOTP = asyncHandler(async(req,res)=>{
    if(!req.body.phone){
        throw new ApiBadRequestError("There was no phone number provided in the body. Please provide a phone number");
    }
    if(!req.body.role){
        throw new ApiBadRequestError("There was no role provided in the body. Please provide a role (basic/admin)");
    }
    if(req.query.mode === "email"){
        if(!req.body.email){
            throw new ApiBadRequestError("Please send a email in the body of the request.")
        }
        let rslt = await userAuthServices.sendEmailOTP(req.body.email,req.body.phone,req.body.role);
        res.status(200).json({
            data:rslt
        })
    }
    else if(req.query.mode === "phone"){
       
        let rslt = await userAuthServices.sendPhoneOTP(req.body.phone,req.body.role);
        res.status(200).json({
            data:rslt
        })
    }
    else{
        throw new ApiBadRequestError("Mode of OTP is not included in the query parameter. Should be phone/email")
    }

})

exports.verifyOTP = asyncHandler(async(req,res)=>{
    if(!req.query.mode){
        throw new ApiBadRequestError("Mode not provided in the query parameter. Should be phone/email")
    }
    let rslt;
    if(req.query.mode == "phone"){
        if(!req.body.OTP || !req.body.phone){
            throw new ApiBadRequestError("OTP or phone not provided in body.")
        }
         rslt = await userAuthServices.verifyPhoneOTP(req.body.phone, req.body.OTP,req.body.role)
    }
    else if(req.query.mode == "email"){
        if(!req.body.OTP || !req.body.phone || !req.body.email){
            throw new ApiBadRequestError("OTP or phone or email not provided in request body.")
        }
         rslt = await userAuthServices.verifyEmailOTP(req.body.phone,req.body.email, req.body.OTP,req.body.role)
         console.log(rslt);
         const tokenpayload = {uid:rslt.id,role:rslt.role}
         const token = await userAuthServices.getAccessToken(tokenpayload)
         res.status(200).json({status:200,message:"OTP verified successfully",data:{accessToken:token,user:rslt}})
        }
        res.status(200).json({status:200,message:"OTP verified successfully",data:{user:rslt}})
})

exports.login = asyncHandler(async(req,res)=>{
    const {email,password} = req.body
    if(!email || !password){
        throw new ApiBadRequestError("email or passsword not present in the body")
    }

    const rslt = await userAuthServices.login(email,password);
    res.status(200).json({status:200,message:"Login successful",data:rslt})
})

exports.changepassword = asyncHandler( async(req,res)=>{
    const {uid, role} = req.user
    let {password} = req.body
    if(!password){
        throw new ApiBadRequestError("pleas provide password in body")
    }
    if(role == "basic"){
        const salt = await bcrypt.genSaltSync(10);
        password = bcrypt.hashSync(password, salt);
        const user = await UserAuthentication.findOne({
            where:{
                id:uid
            }
        })
        user.password = password;
        await user.save()
        res.status(200).json({status:200,message:"Password updated. Please Login",data:user})

    }
    else if(role == "admin"){
        const salt = await bcrypt.genSaltSync(10);
        password = bcrypt.hashSync(password, salt);
        const user = await UserAuthentication.findOne({
            where:{
                id:uid
            }
        })
        user.password = password;
        await user.save()
        res.status(200).json({status:200,message:"Password updated. Please Login",data:user})
    }
    
})

exports.blockUser = asyncHandler( async(req,res)=>{
    const status = req.body.status
    const uid = req.body.userId
    if(status != "true" && status != "false"){
        throw new ApiBadRequestError("status should be true or false")
    }
    const rslt = await User.findOne({
        where:{
            id:uid
        }
    })
    const expiryDate = new Date(rslt.pack_expiry);
    const currentDate = new Date();

// console.log(jsDate); 
// console.log(currentDate); 
//     console.log(rslt.pack_expiry , Date.now());
    if(status == "true"){
        rslt.status = "blocked"
        await rslt.save()
    }
    else{
        if(rslt.status == "blocked"){
            if( expiryDate  < currentDate){
                rslt.status = "inactive"
                await rslt.save()
            }
            else {
                rslt.status = "active"
                await rslt.save()
            }
        }
    }
    // await rslt.save()
    res.status(200).json({status:200,message:"User Blocked status updated.",data:rslt})
})