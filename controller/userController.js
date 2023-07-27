const { User, Transaction } = require('../models/index');

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

async function createUser(req, res) {
    try {
        const { username, email, password, node_id, name, phonenumber, referred_by } = req.body;


        //refreed by or root, not root then use referral table to access referral_id to the refrral name 


        // Check if the user with the same email already exists, if it is then it will be renew user
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }

        // Create the new user in the database
        const newUser = await User.create({
            username,
            email,
            password,
            node_id,
            name,
            phonenumber,
            status: 'active',
            pack_expiry: '60 days',
            number_of_renew: '0',
            number_of_referral: '0',
        });


        // If the user is referred, update the referral information in the Referral table
        if (referred_by) {
            await Referral.create({
                referrer_id: referral_id,
                referred_user_id: newUser.id,
            });

            // Increase the number_of_referral for the referrer user
            await User.increment('number_of_referral', { where: { id: referral_id } });
        }

        return res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
module.exports = { getUserTransaction, createUser };