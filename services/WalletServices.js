const { User, Wallet, Income_report, Renewal } = require("../models/index");
const { AMOUNT } = require("../Constants");
const { ApiBadRequestError } = require("../errors");
// const {Wallet} = require('../models');
class WalletServices {
  async createWallet(userId) {
    const wallet = await Wallet.findOne({
      where: {
        userId: userId,
      },
    });
    if (wallet) {
      throw new ApiBadRequestError(`wallet already exists for user`);
    }

    const new_walltet = await Wallet.create({
      userId: userId,
    });
    const user = await User.findByPk(userId);
    user.walletId = new_walltet.id;
    await user.save();
    return new_walltet;
  }
  async addAmountToWallet(userId, amount) {
      console.log("Wallet add userId :", userId, " | amount : ",amount);
    const isRenewedAccount = await Renewal.findOne({
      where: {
        renewal_id: userId,
      },
    });
    if (isRenewedAccount) {
      userId = isRenewedAccount.main_id;
    }
    const wallet = await Wallet.findOne({
      where: {
        userId: userId,
      },
    });
    if (!wallet) {
      throw new ApiBadRequestError("No wallet found. CONTACT ADMIN!!!");
    }

    wallet.balance += amount;
    await wallet.save();
    console.log("Updated wallet : ", JSON.stringify(wallet));
  }

  async updateIncomeReport({
    userId,
    amount_spent = 0,
    levelincome = 0,
    autopool1 = 0,
    autopool2 = 0,
    referral = 0,
  } = {}) {
    console.log( "updated income report: ",userId,
    amount_spent ,
    levelincome ,
    autopool1 ,
    autopool2,
    referral ,)
    const userIncomeReport = await Income_report.findOne({
      where: {
        userId: userId,
      },
    });
    const increase = levelincome + autopool1 + autopool2 + referral;

    userIncomeReport.totalincome =  userIncomeReport.totalincome+increase;
    userIncomeReport.referral =userIncomeReport.referral+ referral;
    userIncomeReport.autopool1 =userIncomeReport.autopool1+ autopool1;
    userIncomeReport.autopool2 = userIncomeReport.autopool2 + autopool2;
    userIncomeReport.autopool2 =userIncomeReport.autopool2 + amount_spent;
    userIncomeReport.levelincome =userIncomeReport.levelincome + levelincome;
    await userIncomeReport.save();
    console.log("Updated income report: ",JSON.stringify(userIncomeReport))
    return userIncomeReport;
  }

  async addLevelOrderIncome(startUserId, amount) {
    let tempId = startUserId;
    let count = 1;
    let percent = 0;
    tempId = parseInt(tempId / 2);
    while (tempId != 0) {
      console.log("tempId : ", tempId, " | count : ", count);
      if (count == 1) {
        percent = 0.12;
      } else if (count == 2) {
        percent = 0.1;
      } else if (count == 3) {
        percent = 0.05;
      } else if (count == 4) {
        percent = 0.04;
      } else if (count == 5) {
        percent = 0.03;
      } else if (count <= 10 || count == 25) {
        percent = 0.02;
      } else if (count < 25) {
        percent = 0.01;
      }
      console.log(amount*percent);
      await this.addAmountToWallet(tempId, amount * percent);
      await this.updateIncomeReport({
        userId: tempId,
        levelincome: amount * percent,
      });
      tempId = parseInt(tempId / 2);
      count += 1;
    }
  }
}
module.exports = new WalletServices();
