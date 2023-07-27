const { User, Transaction } = require('../models/index');
// const { UserServices } = require("../services");
const { userServices } = require("../services");


async function getUserTransaction(req, res, next) {
    // res.send('respond with a resource');
    const rslt = await User.findAll(
        {
            where: {
                id: 1
            },
            include: {
                model: Transaction,
                as: "transactions",
                attributes: ["transaction_id", "detail"],
            },
            // raw: true,
        })
    res.status(200).json({ rslt });
};

async function createReferralUser(req, res) {
    try {
        const { username, email, password, name, phonenumber, referred_by } = req.body;
        //refreed by or root, not root then use referral table to access referral_id to the refrral name 

        const rslt = await userServices.createReferralUser(username, email, password, name, phonenumber, referred_by);

        return res.status(201).json({ message: 'User created successfully', user: rslt });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = { getUserTransaction, createReferralUser };