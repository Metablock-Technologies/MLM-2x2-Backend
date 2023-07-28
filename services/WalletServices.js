const { User,Wallet,Income_report } = require('../models/index');
const {Wallet} = require('../models');
class WalletServices{
    async addAmountToWallet(user_id, amount) {
        try {
            const userWallet = await Wallet.findOne({
                where:{
                    user_id : user_id
                }
            });
            if (!user) {
                throw new Error('User not found');
            }
            userWallet.balance += amount;
            await userWallet.save();
        }
        catch (error) {
            console.error(error);
            throw error; // Rethrow the error to handle it in the calling function
        }
    }
}
module.exports = new WalletServices();