const { AMOUNT } = require("../Constants");
const { User, Transaction, Income_report } = require("../models/index");
// const { UserServices } = require("../services");
const { userServices } = require("../services");
const { walletServices } = require("../services");

async function getUserTransaction(req, res, next) {
    try {
        const rslt = await User.findAll({
            where: {
                id: 1,
            },
            include: {
                model: Transaction,
                as: "transactions",
                attributes: ["transaction_id", "detail"],
            },
            // raw: true,
        });
        res.status(200).json({ rslt });

    }
    catch (err) {
        next(err)
    }
    // res.send('respond with a resource');
}

async function createReferralUser(req, res, next) {
    try {
        //STEP 1-------->> Create User in Users table.
        const { username, email, password, name, phonenumber, referred_by } =
            req.body;

        const referredByUser = await User.findOne({
            where: {
                hashcode: referred_by,
            },
        });
        console.log("referred_by", referredByUser.id);
        //refreed by or root, not root then use referral table to access referral_id to the refrral name
        if (
            !username ||
            !email ||
            !password ||
            !name ||
            !phonenumber ||
            !referred_by
        )
            return res
                .status(400)
                .json({ message: "All fields are required", data: req.body });
        const rslt = await userServices.createReferralUser(
            username,
            email,
            password,
            name,
            phonenumber,
            referredByUser.id
        );

        //STEP 2------>>add 25$ to admin wallet using USDT API

        const wallet = await walletServices.createWallet(rslt.newUser.id)

        //STEP 3------>>Add 36% to wallet of referred_by
        const referralAmount = 0.36 * AMOUNT;
        await walletServices.addAmountToWallet(referredByUser.id, referralAmount);

        await walletServices.updateIncomeReport({ referral: referralAmount, userId: referredByUser.id })
        rslt.wallet = wallet;

        //STEP 4------>> Add levelincome
        const levelincomeAmount = 0.6 * AMOUNT
        await walletServices.addLevelOrderIncome(rslt.newUser.id, levelincomeAmount);
        return res
            .status(201)
            .json({ success: true, data: rslt });
    } catch (err) {
        next(err)
    }
}

async function UserAuthentication(req, res, next) {
    try {
        const { username, email, password, name, phonenumber, referred_by } =
            req.body;

        const rslt = await userServices.UserAuthentication(
            username,
            email,
            password,
            name,
            phonenumber,
            referred_by
        );
        return res
            .status(201)
            .json({ message: "User authentication successfull", user: rslt });
    }
    catch (err) {
        next(err)
    }
}

async function UserSignIn(req, res, next) {
    try {
        const { email, password } =
            req.body;

        console.log(email, password);
        const rslt = await userServices.UserSignIn(
            email,
            password,
        );
        return res
            .status(201)
            .json({ message: "User SignIn successfull", user: rslt });
    }
    catch (err) {
        next(err)
    }
}

async function createRenewal(req, res, next) {
    try {
        const { id } = req.body;
        //refreed by or root, not root then use referral table to access referral_id to the refrral name
        //STEP 1------>> Create user and income report
        const rslt = await userServices.createRenewal(id);

        //STEP 4------>> Add levelincome
        const levelincomeAmount = 0.6 * AMOUNT
        await walletServices.addLevelOrderIncome(rslt.newUser.id, levelincomeAmount);

        return res
            .status(201)
            .json({ message: "User created successfully", user: rslt });
    } catch (err) {
        next(err)
    }
}

module.exports = { getUserTransaction, createReferralUser, createRenewal, UserAuthentication, UserSignIn };
