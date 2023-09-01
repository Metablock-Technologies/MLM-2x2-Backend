const {
  User,
  Wallet,
  Income_report,
  Renewal,
  Autopool1,
  Autopool2,
  Transaction,
} = require("../models/index");
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
    console.log("Wallet add userId :", userId, " | amount : ", amount);
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
    console.log(
      "updated income report: ",
      userId,
      amount_spent,
      levelincome,
      autopool1,
      autopool2,
      referral
    );
    const userIncomeReport = await Income_report.findOne({
      where: {
        userId: userId,
      },
    });
    const increase = levelincome + autopool1 + autopool2 + referral;

    userIncomeReport.totalincome = userIncomeReport.totalincome + increase;
    userIncomeReport.referral = userIncomeReport.referral + referral;
    if(parseFloat(referral) > 0){
      await Transaction.create({
        userId,
        detail:"Referral Income",
        amount:referral
      })
    }
    userIncomeReport.autopool1 = userIncomeReport.autopool1 + autopool1;
    if(parseFloat(autopool1) > 0){
      await Transaction.create({
        userId,
        detail:"Autopool1 Income",
        amount:autopool1
      })
    }
    userIncomeReport.autopool2 = userIncomeReport.autopool2 + autopool2;
    if(parseFloat(autopool2) > 0){
      await Transaction.create({
        userId,
        detail:"Autopool2 Income",
        amount:autopool2
      })
    }
    userIncomeReport.amount_spent = userIncomeReport.amount_spent + amount_spent;
    if(parseFloat(amount_spent) > 0){
      await Transaction.create({
        userId,
        detail:"Spent Amount",
        amount:amount_spent
      })
    }
    userIncomeReport.levelincome = userIncomeReport.levelincome + levelincome;
    await userIncomeReport.save();
    console.log("Updated income report: ", JSON.stringify(userIncomeReport));
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
      console.log(amount * percent);
      await this.addAmountToWallet(tempId, amount * percent);
      await this.updateIncomeReport({
        userId: tempId,
        levelincome: amount * percent,
      });
      await Transaction.create({
        userId:tempId,
        detail:"Level Income",
        amount:amount*percent
      })
      tempId = parseInt(tempId / 2);
      count += 1;
    }
  }

  async addAmountToAutoPool1(amount) {
    const latestAutopool = await Autopool1.findOne({
      order: [["id", "DESC"]], // Order by ID in descending order
    });
    if (latestAutopool) {
      const monthDate = latestAutopool.month;
      const dateObject = new Date(monthDate); // Convert the monthDate to a JavaScript Date object
      const latestAutoPoolMonth = dateObject.getMonth();
      const today = new Date();

      // Get the zero-indexed month (0 for January, 1 for February, etc.)
      const currentMonth = today.getMonth();
      if (currentMonth == latestAutoPoolMonth) {
        latestAutopool.amount += amount;
        await latestAutopool.save();
        return;
      }
    }
    const today = new Date();

    // Extract the year, month, and day from the today Date object
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();
  
    // Create a new Date object with the extracted year, month, and day, effectively removing the time part
    const currentDate = new Date(year, month, day);
    const newAutoPool = Autopool1.create({
      amount:amount,
      month:currentDate,
      status:'pending'
    })
  }
  async addAmountToAutoPool2(amount) {
    const latestAutopool = await Autopool2.findOne({
      order: [["id", "DESC"]], // Order by ID in descending order
    });
    if (latestAutopool) {
      const monthDate = latestAutopool.month;
      const dateObject = new Date(monthDate); // Convert the monthDate to a JavaScript Date object
      const latestAutoPoolMonth = dateObject.getMonth();
      const today = new Date();

      // Get the zero-indexed month (0 for January, 1 for February, etc.)
      const currentMonth = today.getMonth();
      if (currentMonth == latestAutoPoolMonth) {
        latestAutopool.amount += amount;
        await latestAutopool.save();
        return;
      }
    }
    const today = new Date();

    // Extract the year, month, and day from the today Date object
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();
  
    // Create a new Date object with the extracted year, month, and day, effectively removing the time part
    const currentDate = new Date(year, month, day);
    const newAutoPool = Autopool2.create({
      amount:amount,
      month:currentDate,
      status:'pending'
    })
  }
}
module.exports = new WalletServices();
