const { User, Transaction, Referral } = require('../models/index');

class UserServices {
    async createReferralUser(username, email, password, name, phonenumber, referred_by) {
        // Check if the user with the same email already exists, if it is then it will be a renew user
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            console.log('User with this email already exists');
            return;
        }

        let node_id = 1; // Default node_id if no users exist

        // Find the last user to calculate the new node_id
        const lastUser = await User.findOne({
            order: [['id', 'DESC']], // Order by ID in descending order
            attributes: ['node_id'],
        });

        if (lastUser) {
            node_id = lastUser.node_id + 1;
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
            number_of_renew: 0,
            number_of_referral: 0,
        });

        // If the user is referred, update the referral information in the Referral table
        if (referred_by) {
            await Referral.create({
                referal_userid: newUser.id,
                referred_by: referred_by
            });

            // Increase the number_of_referral for the referrer user
            await User.increment('number_of_referral', { where: { id: referred_by } });
        }
    }
}

module.exports = new UserServices();