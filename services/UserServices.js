const { User, Transaction, Referral } = require('../models/index');

class UserServices {
    async createReferralUser(username, email, password, name, phonenumber, referred_by) {
        // Check if the user with the same email already exists, if it is then it will be a renew user
        try {
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

            // Calculate the pack_expiry date (current date + 30 days)
            const currentDate = new Date();
            currentDate.setDate(currentDate.getDate() + 30);
            const pack_expiry = currentDate.toISOString().split('T')[0]; // Convert to 'YYYY-MM-DD' format

            // Create the new user in the database
            const newUser = await User.create({
                username,
                email,
                password,
                node_id,
                name,
                phonenumber,
                status: 'active',
                pack_expiry,
                number_of_renew: 0,
                number_of_referral: 0,
            });

            // If the user is referred, update the referral information in the Referral table
            if (referred_by) {
                await Referral.create({
                    referal_userid: newUser.id,
                    referred_by: referred_by
                })
                // Increase the number_of_referral for the referrer user
                let fUser = await User.findByPk(referred_by)
                fUser.number_of_referral += 1
                fUser.save();
                // await User.increment('number_of_referral', { where: { id: referred_by } });
            }
        }
        catch (error) {
            console.error(error);
            throw error; // Rethrow the error to handle it in the calling function
        }
    }

    async renewalUser(username, email) {
        try {

        }
        catch (err) {
            console.log(err);
        }
    }
}

module.exports = new UserServices();