const asyncHandler = require("express-async-handler");
const userAuthServices = require("../services/userAuthServices");
const { Api404Error, ApiBadRequestError } = require("../errors");
const { User, Admin, UserAuthentication } = require("../models");
const { Sequelize, DataTypes, Op } = require('sequelize');

const bcrypt = require("bcrypt");
exports.sendOTP = asyncHandler(async (req, res) => {
    if (!req.body.phone) {
        throw new ApiBadRequestError(
            "There was no phone number provided in the body. Please provide a phone number"
        );
    }
    console.log("hello")
    if (!req.body.role) {
        throw new ApiBadRequestError(
            "There was no role provided in the body. Please provide a role (basic/admin)"
        );
    }
    if (req.query.mode === "email") {
        if (!req.body.email) {
            throw new ApiBadRequestError(
                "Please send a email in the body of the request."
            );
        }
        let rslt = await userAuthServices.sendEmailOTP(
            req.body.email,
            req.body.phone,
            req.body.role
        );
        res.status(200).json({
            data: rslt,
        });
    } else if (req.query.mode === "phone") {
        let rslt = await userAuthServices.sendPhoneOTP(
            req.body.phone,
            req.body.role
        );
        res.status(200).json({
            data: rslt,
        });
    } else {
        throw new ApiBadRequestError(
            "Mode of OTP is not included in the query parameter. Should be phone/email"
        );
    }
});

exports.verifyOTP = asyncHandler(async (req, res) => {
    if (!req.query.mode) {
        throw new ApiBadRequestError(
            "Mode not provided in the query parameter. Should be phone/email"
        );
    }
    let rslt;
    if (req.query.mode == "phone") {
        if (!req.body.OTP || !req.body.phone) {
            throw new ApiBadRequestError("OTP or phone not provided in body.");
        }
        rslt = await userAuthServices.verifyPhoneOTP(
            req.body.phone,
            req.body.OTP,
            req.body.role
        );
        res
            .status(200)
            .json({
                status: 200,
                message: "OTP verified successfully",
                data: { user: rslt },
            });
    } else if (req.query.mode == "email") {
        if (!req.body.OTP || !req.body.phone || !req.body.email) {
            throw new ApiBadRequestError(
                "OTP or phone or email not provided in request body."
            );
        }
        rslt = await userAuthServices.verifyEmailOTP(
            req.body.phone,
            req.body.email,
            req.body.OTP,
            req.body.role
        );
        console.log("rslt", rslt);
        if (!rslt[0]) {
            res.status(403).json({ status: 403, message: "Invalid OTP" });
        } else {
            let tokenpayload
            if (rslt[1].isPaymentDone) {

                tokenpayload = { uid: rslt[1].nodeId, role: rslt[1].role, created: true };
            }
            else {

                tokenpayload = { uid: rslt[1].id, role: rslt[1].role, created: false };
            }
            const token = await userAuthServices.getAccessToken(tokenpayload);
            res
                .status(200)
                .json({
                    status: 200,
                    message: "OTP verified successfully",
                    data: { accessToken: token, user: rslt[1] },
                });
        }
    }
});
exports.sendForgetOTP = asyncHandler(async (req, res) => {
    if (!req.body.role) {
        throw new ApiBadRequestError(
            "There was no role provided in the body. Please provide a role (basic/admin)"
        );
    }

    if (!req.body.email) {
        throw new ApiBadRequestError(
            "Please send a email in the body of the request."
        );
    }
    let rslt = await userAuthServices.sendForgetEmailOTP(
        req.body.email,
        req.body.role
    );
    res.status(200).json({
        data: rslt,
    });
});

exports.verifyForgetOTP = asyncHandler(async (req, res) => {
    let rslt;
    if (!req.body.OTP || !req.body.email) {
        throw new ApiBadRequestError("OTP or email not provided in request body.");
    }
    rslt = await userAuthServices.verifyForgetEmailOTP(
        req.body.email,
        req.body.OTP,
        req.body.role
    );
    console.log("rslt", rslt);
        if (!rslt[0]) {
            res.status(403).json({ status: 403, message: "Invalid OTP" });
        } else {
            let tokenpayload
            if (rslt[1].isPaymentDone) {

                tokenpayload = { uid: rslt[1].nodeId, role: rslt[1].role, created: true };
            }
            else {

                tokenpayload = { uid: rslt[1].id, role: rslt[1].role, created: false };
            }
            const token = await userAuthServices.getAccessToken(tokenpayload);
            res
                .status(200)
                .json({
                    status: 200,
                    message: "OTP verified successfully",
                    data: { accessToken: token, user: rslt[1] },
                });
        }
});

exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new ApiBadRequestError("email or passsword not present in the body");
    }

    const rslt = await userAuthServices.login(email, password);
    res
        .status(200)
        .json({ status: 200, message: "Login successful", data: rslt });
});

exports.changepassword = asyncHandler(async (req, res) => {
    const { uid, role } = req.user;
    let { password } = req.body;
    if (!password) {
        throw new ApiBadRequestError("pleas provide password in body");
    }
    if (role == "basic") {
        
        const salt = await bcrypt.genSaltSync(10);
        password = bcrypt.hashSync(password, salt);
        const user = await UserAuthentication.findOne({
            where:{ [Op.or]: [{nodeId: uid,isPaymentDone:true},{id:uid, isPaymentDone: false}] }
        });
        console.log("++++++++++++++++++++++>>>>>>>>>>>>",user)
        user.password = password;
        await user.save();
        res
            .status(200)
            .json({
                status: 200,
                message: "Password updated. Please Login",
                data: user,
            });
    } else if (role == "admin") {
        const salt = await bcrypt.genSaltSync(10);
        password = bcrypt.hashSync(password, salt);
        const user = await UserAuthentication.findOne({
            where: {
                id: uid,
            },
        });
        user.password = password;
        await user.save();
        res
            .status(200)
            .json({
                status: 200,
                message: "Password updated. Please Login",
                data: user,
            });
    }
});

exports.blockUser = asyncHandler(async (req, res) => {
    const status = req.body.status;
    const uid = req.body.userId;
    if (status != "true" && status != "false") {
        throw new ApiBadRequestError("status should be true or false");
    }
    const rslt = await User.findOne({
        where: {
            id: uid,
        },
    });
    const expiryDate = new Date(rslt.pack_expiry);
    const currentDate = new Date();

    // console.log(jsDate);
    // console.log(currentDate);
    //     console.log(rslt.pack_expiry , Date.now());
    if (status == "true") {
        rslt.status = "blocked";
        await rslt.save();
    } else {
        if (rslt.status == "blocked") {
            if (expiryDate < currentDate) {
                rslt.status = "inactive";
                await rslt.save();
            } else {
                rslt.status = "active";
                await rslt.save();
            }
        }
    }
    // await rslt.save()
    res
        .status(200)
        .json({ status: 200, message: "User Blocked status updated.", data: rslt });
});

exports.getUsername = asyncHandler(async (req, res) => {
    const referralId = req.query.referralcode;

    const user = await User.findOne({
        where: {
            hashcode: referralId,
        },
        attributes: {
            exclude: ["password"]
        }
    });
    if (!user) {
        throw new Api404Error("User with given code does not exist")
    }
    else {
        res.status(200).json({ message: "User found successfully", data: user })
    }
});
