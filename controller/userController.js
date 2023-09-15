const { AMOUNT, api_host } = require("../Constants");
const {
  ApiBadRequestError,
  Api404Error,
  ApiInternalServerError,
} = require("../errors");
const {
  User,
  Transaction,
  Income_report,
  UserAuthentication,
  Wallet,
  Referral,
  Renewal,
  Payment,
  TempWallet,
  MoneyRequest,
  FundTransferHistory,
} = require("../models/index");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
// const { UserServices } = require("../services");
const { userServices } = require("../services");
const { walletServices } = require("../services");
var nodemailer = require("nodemailer");
const { Op } = require("sequelize");
const { default: axios } = require("axios");
const userAuthServices = require("../services/userAuthServices");
const WalletServices = require("../services/WalletServices");
const UserServices = require("../services/UserServices");
const logger = require("../logger");
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
  } catch (err) {
    next(err);
  }
  // res.send('respond with a resource');
}

async function createReferralUser(req, res, next) {
  try {
    //STEP 1-------->> Create User in Users table.
    const uid = req.user.uid;
    const userAuth = await UserAuthentication.findOne({
      where: {
        id: uid,
      },
    });
    console.log("userAuth", userAuth);
    let { username, email, password, name, phonenumber, referred_by, role } =
      userAuth;
    phonenumber = userAuth.phone;
    if (userAuth?.isCreated) {
      throw new ApiBadRequestError("User is already created. Please login");
    }
    //TODO: uncomment this
    // if(!(userAuth?.isPaymentDone)){
    //   throw new ApiBadRequestError("Payment of registration pending.")
    // }
    const referredByUser = await User.findOne({
      where: {
        hashcode: referred_by,
      },
    });
    console.log("referred_by", referredByUser?.id);
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
        .json({ message: "All fields are required", data: userAuth });
    const rslt = await userServices.createReferralUser(
      username,
      email,
      password,
      name,
      phonenumber,
      1,
      role
    );
    userAuth.isCreated = true;
    await userAuth.save();
    //STEP 2------>>add 25$ to admin wallet using USDT API

    const wallet = await walletServices.createWallet(rslt.newUser.id);

    //STEP 3------>>Add 36% to wallet of referred_by
    const referralAmount = 0.36 * AMOUNT;
    await walletServices.addAmountToWallet(referredByUser.id, referralAmount);

    await walletServices.updateIncomeReport({
      referral: referralAmount,
      userId: referredByUser.id,
    });
    rslt.wallet = wallet;

    //STEP 4------>> Add levelincome
    const levelincomeAmount = 0.6 * AMOUNT;
    await walletServices.addLevelOrderIncome(
      rslt.newUser.id,
      levelincomeAmount
    );
    //STEP 5------>> Add 4% to autopool 1
    const autoPool1Amount = 0.04 * AMOUNT;
    await walletServices.addAmountToAutoPool1(autoPool1Amount);
    return res.status(201).json({ success: true, data: rslt });
  } catch (err) {
    next(err);
  }
}

async function createRenewal(req, res, next) {
  try {
    const id = req.user.uid;
    if (!id) {
      throw new ApiBadRequestError("id not found");
    }
    //refreed by or root, not root then use referral table to access referral_id to the refrral name
    //STEP 1------>> Create user and income report
    const rslt = await userServices.createRenewal(id);

    //STEP 2------>> Add levelincome
    const levelincomeAmount = 0.6 * AMOUNT;
    await walletServices.addLevelOrderIncome(
      rslt.newUser.id,
      levelincomeAmount
    );
    //STEP 3------>> Add 4% to autopool 1 and 36% to autopool 2
    const autoPool1Amount = 0.04 * AMOUNT;
    await walletServices.addAmountToAutoPool1(autoPool1Amount);

    const autoPool2Amount = 0.36 * AMOUNT;
    await walletServices.addAmountToAutoPool2(autoPool2Amount);
    return res
      .status(201)
      .json({ message: "User created successfully", user: rslt });
  } catch (err) {
    next(err);
  }
}

async function signUp(req, res, next) {
  try {
    let { name, username, password, referral, role } = req.body;
    const uid = req.user.uid;
    if (!name || !username || !password || !role) {
      throw new ApiBadRequestError("Send all data");
    }
    username = username.toLowerCase();

    const user = await UserAuthentication.findOne({
      where: {
        id: uid,
      },
    });
    if (user.isCreated) {
      throw new ApiBadRequestError(
        "User is already created and details are added."
      );
    }

    const checkreferral = await User.findOne({
      where: {
        hashcode: referral,
      },
    });
    if (!checkreferral) {
      throw new ApiBadRequestError("Invalid referral code");
    }

    user.name = name;
    user.username = username;
    user.referred_by = referral;
    const salt = await bcrypt.genSaltSync(10);
    password = bcrypt.hashSync(password, salt);
    user.password = password;
    user.isCreated = true;
    await user.save();
    const tempWallet = await TempWallet.create({
      balance: 0,
      user_id: user.id,
    });
    return res
      .status(201)
      .json({ message: "User created successfully", user: user });
  } catch (err) {
    next(err);
  }
}

async function getUserProfile(req, res, next) {
  try {
    const uid = req.params.userId || req.user.uid;
    console.log("uid", uid);

    // const userAuth = await UserAuthentication.findOne({
    //   where: {
    //     id: uid,
    //   },
    // });
    // if (!userAuth) {
    //   throw Api404Error("No user Found");
    // }
    if (req.user.created || req.params.userId) {
      const user = await User.findOne({
        where: {
          id: uid,
        },
        attributes: {
          exclude: ["password"],
        },
        include: [
          {
            model: Income_report,
          },
          {
            model: Wallet,
          },
        ],
      });
      console.log("ajsdklajfsdkljfaklsdklfajsdl", user);
      let metadata = {};
      const referraluser = await Referral.findOne({
        where: {
          referredUserid: uid,
        },
      });
      let sponsorId = "";
      if (!referraluser) {
        console.log("here");
        sponsorId = "None";
      } else {
        const refUser = await User.findOne({
          where: {
            id: referraluser.referredByUserId,
          },
        });
        sponsorId = refUser.hashcode;
      }
      metadata.sponsorId = sponsorId;
      let arr = await userServices.getMyteam(uid);
      metadata.totalUsers = arr.length;
      metadata.activeUsers = (
        await User.findAndCountAll({
          where: {
            id: {
              [Op.in]: arr,
            },
            status: "active",
          },
        })
      ).count;
      res
        .status(200)
        .json({ message: "User fetched successfully", data: user, metadata });
    } else {
      const user = await UserAuthentication.findOne({
        where: {
          id: req.user.uid,
        },
      });
      let tempWallet
      if(user.isPaymentDone){
        tempWallet = await Wallet.findOne({
          where:{
            userId:user.nodeId
          }
        })
      }
      else{

        tempWallet = await TempWallet.findOne({
          where:
          {
            user_id:user.id
          }
        })
      }
      // user.wallet = tempWallet
      let respuser = {...user.dataValues,wallet:tempWallet}
      res
        .status(200)
        .json({ message: "User fetched successfully", data: respuser });
    }
  } catch (err) {
    next(err);
  }
}

async function getMyteam(req, res, next) {
  try {
    let uid = req.params.userId || req.user.uid;

    let arr = await userServices.getMyteam(uid);

    console.log("arr", arr);
    res
      .status(200)
      .json({ message: "List of team users fetched successfully", data: arr });
  } catch (err) {
    next(err);
  }
}

async function getTransactions(req, res, next) {
  try {
    let rslt = {};
    const limit = req.query.limit || 1000;
    const offset = req.query.offset || 0;
    if (req.user.role == "admin") {
      rslt = await Transaction.findAll({
        limit,
        offset,
      });
    } else {
      rslt = await Transaction.findAll({
        where: {
          userId: req.user.uid,
        },
        limit,
        offset,
      });
    }
    res
      .status(200)
      .json({ message: "Transactions fetched successfully", data: rslt });
  } catch (err) {
    next(err);
  }
}

async function getMyRenew(req, res, next) {
  try {
    const uid = req.params.userId || req.user.uid;
    const rslt = await userServices.getMyRenew(uid);
    res
      .status(200)
      .json({ message: "Renewed Users fetched successfully", data: rslt });
  } catch (err) {
    next(err);
  }
}
async function updateName(req, res, next) {
  try {
    const uid = req.user.uid;
    const name = req.body.name;
    const rslt = await User.findOne({
      where: {
        id: uid,
      },
    });
    rslt.name = name;
    await rslt.save();

    res.status(200).json({ message: "Name Updated successfully", data: rslt });
  } catch (err) {
    next(err);
  }
}

async function initialpayment(req, res, next) {
  try {
    const headers = {
      "x-api-key": process.env.NOW_PAY_API_KEY,
      "Content-Type": "application/json",
    };
    const id = req.user.uid;
    const response = await axios.get(`${api_host}/v1/status`);
    if (response.status == 200) {
      const body = {
        email: "okdreamok25@gmail.com",
        password: "Rks12345",
      };
      const token = (await axios.post(`${api_host}/v1/auth`, body)).data.token;
      console.log(token);

      const payment = await Payment.findOne({
        where: {
          userId: id,
          type: "referral",
        },
      });
      let orderId = payment ? payment.order_id : "reff-" + id;
      const paymentResponse1 = payment
        ? (
            await axios.get(
              `https://api.nowpayments.io/v1/payment/${payment.payment_id}`,
              { headers }
            )
          ).data
        : 1 == 1;
      if (!payment) {
        const createPaymentBody = {
          price_amount: 25,
          price_currency: "usd",
          pay_currency: "usdtbsc",
          ipn_callback_url: process.env.IPN_CALLBACK_URL,
          order_id: orderId,
          order_description: "Payment for Subscription by Referral.",
          is_fixed_rate: true,
          is_fee_paid_by_user: true,
        };
        const headers = {
          "x-api-key": "DD8PTQT-7VZ43F4-G8TYV76-PQYR6NV",
          "Content-Type": "application/json",
        };
        let paymentResponse = (
          await axios.post(
            "https://api.nowpayments.io/v1/payment",
            createPaymentBody,
            { headers }
          )
        ).data;
        console.log("paymentResponse", paymentResponse);
        const createUserPayment = await Payment.create({
          order_id: orderId,
          type: "referral",
          status: paymentResponse.payment_status,
          payment_id: paymentResponse.payment_id,
          purchase_id: paymentResponse.purchase_id,
          userId: id,
        });
        res.status(200).json({
          message: "Payment Created Successfully",
          data: paymentResponse,
        });
      } else {
        if (paymentResponse1.payment_status == "partially_paid") {
          const createPaymentBody = {
            purchase_id: payment.purchase_id,
          };
          const paymentResponse = await axios.post(
            "https://api.nowpayments.io/v1/payment",
            createPaymentBody,
            { headers }
          );
          (payment.order_id = orderId),
            (payment.type = "referral"),
            (payment.status = paymentResponse.payment_status),
            (payment.payment_id = paymentResponse.payment_id),
            (payment.purchase_id = paymentResponse.purchase_id);
          await payment.save();
          console.log("paymentResponse", paymentResponse);

          res.status(200).json({
            message: "Payment Created Successfully",
            data: paymentResponse,
          });
        } else if (
          paymentResponse1.payment_status == "failed" ||
          paymentResponse1.payment_status == "expired"
        ) {
          let orderId = payment ? payment.paymentCode : "reff-" + id;
          const createPaymentBody = {
            price_amount: 25,
            price_currency: "usd",
            pay_currency: "usdtbsc",
            ipn_callback_url: process.env.IPN_CALLBACK_URL,
            order_id: orderId,
            order_description: "Payment for Subscription by Referral.",
            is_fixed_rate: true,
            is_fee_paid_by_user: true,
          };
          const headers = {
            "x-api-key": "DD8PTQT-7VZ43F4-G8TYV76-PQYR6NV",
            "Content-Type": "application/json",
          };
          let paymentResponse = (
            await axios.post(
              "https://api.nowpayments.io/v1/payment",
              createPaymentBody,
              { headers }
            )
          ).data;
          (payment.order_id = orderId),
            (payment.type = "referral"),
            (payment.status = paymentResponse.payment_status),
            (payment.payment_id = paymentResponse.payment_id),
            (payment.purchase_id = paymentResponse.purchase_id);
          await payment.save();
          console.log("paymentResponse", paymentResponse);

          res.status(200).json({
            message: "Payment Created Successfully",
            data: paymentResponse,
          });
        } else {
          const paymentResponse = (
            await axios.get(
              `https://api.nowpayments.io/v1/payment/${payment.payment_id}`,
              { headers }
            )
          ).data;
          res.status(200).json({
            message: "Payment Created Successfully",
            data: paymentResponse,
          });
        }
      }
    } else {
      throw new ApiInternalServerError(
        "Some error has occurred try again later."
      );
    }
    const rslt = {
      url: "https://nowpayments.io/",
    };
  } catch (err) {
    console.log(err);
    // next(err)
    res.status(400).json(err);
  }
}
async function withdrawMoney(req, res, next) {
  try {
    const uid = req.user.uid;
    const amount = req.body.amount;
    if (!amount) {
      throw new ApiBadRequestError("enter amount to add.");
    }
    const address = req.body.address;
    const numberOfrenew = await Renewal.findAndCountAll({
      where: {
        main_id: uid,
      },
    });

    const wallet = await Wallet.findOne({
      where: {
        userId: uid,
      },
    });

    if (amount > wallet.balance) {
      throw new ApiBadRequestError("Insufficient Funds");
    }

    if (amount < 5) {
      throw new ApiBadRequestError("Minimum withdraw amount is 5");
    }
    if (
      numberOfrenew.count == 0 &&
      parseFloat(wallet.withdraw_amount) + parseFloat(amount) > 100
    ) {
      throw new ApiBadRequestError(
        "You can only withdraw upto 100 with 0 renew id."
      );
    }
    if (
      numberOfrenew.count == 1 &&
      parseFloat(wallet.withdraw_amount) + parseFloat(amount) > 200
    ) {
      throw new ApiBadRequestError(
        "You can only withdraw upto 200 with 1 renew id."
      );
    }
    if (
      numberOfrenew.count == 2 &&
      parseFloat(wallet.withdraw_amount) + parseFloat(amount) > 400
    ) {
      throw new ApiBadRequestError(
        "You can only withdraw upto 200 with 1 renew id."
      );
    }
    wallet.withdraw_amount =
      parseFloat(wallet.withdraw_amount) + parseFloat(amount);
    wallet.balance = parseFloat(wallet.balance) - parseFloat(amount);
    //TODO add send USDTBSC via API
    await wallet.save();

    await Transaction.create({
      userId: uid,
      detail: "Withdrawal",
      amount: amount,
    });

    res.status(200).json({ message: "Funds have been withdrawn successfully" });
  } catch (err) {
    next(err);
  }
}

async function getMoneyRequest(req, res, next) {
  try {
    let rslt = {};
    // console.log("user check",req);
    if (req.user.created) {
      const user = await UserAuthentication.findOne({
        where: {
          nodeId: req.user.uid,
        },
      });
      rslt = await MoneyRequest.findAll({
        where: {
          [Op.or]: [
            {
              [Op.and]: [
                {
                  user_id: req.user.uid,
                },
                {
                  account_type: "existing",
                },
              ],
            },
            {
              [Op.and]: [
                {
                  user_id: user.id,
                },
                {
                  account_type: "new",
                },
              ],
            },
          ],
        },
      });
    } else {
      const user = await UserAuthentication.findOne({
        where: {
          id: req.user.uid,
        },
      });
      rslt = await MoneyRequest.findAll({
        where: {
          [Op.or]: [
            {
              [Op.and]: [
                {
                  user_id: user.id,
                },
                {
                  account_type: "new",
                },
              ],
            },
          ],
        },
      });
    }
    res
      .status(200)
      .json({ message: "Requests fetched successfully", data: rslt });
  } catch (err) {
    next(err);
  }
}

async function activateAcc(req, res, next) {
  try {
    // const {username } = req.body
    const payeeId = req.user.uid;
    const payeeuser = await UserAuthentication.findOne({
      where: {
        ...(req.user.created && { nodeId: req.user.uid }),
        ...(!req.user.created && { id: req.user.uid }),
      },
    });

    if (!req.user.created) {
      const tempWallet = await TempWallet.findOne({
        where: {
          user_id: payeeId,
        },
      });

      if (parseFloat(tempWallet.balance) < parseFloat(AMOUNT)) {
        throw new ApiBadRequestError(
          "Insufficient balance. Required at least: " +
            AMOUNT +
            ". Current: " +
            tempWallet.balance
        );
      } else {
        tempWallet.balance =
          parseFloat(tempWallet.balance) - parseFloat(AMOUNT);
        await tempWallet.save();
        let {
          username,
          email,
          password,
          name,
          phonenumber,
          referred_by,
          role,
        } = payeeuser;
        phonenumber = payeeuser.phone;

        // if (payeeuser?.isCreated) {
        //   throw new ApiBadRequestError("User is already created. Please login");
        // }
        //TODO: uncomment this
        // if(!(userAuth?.isPaymentDone)){
        //   throw new ApiBadRequestError("Payment of registration pending.")
        // }
        const referredByUser = await User.findOne({
          where: {
            hashcode: referred_by,
          },
        });
        console.log("referred_by", referredByUser?.id);
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
            .json({ message: "All fields are required", data: userAuth });
        const rslt = await userServices.createReferralUser(
          username,
          email,
          password,
          name,
          phonenumber,
          referredByUser?.id,
          role
        );
        payeeuser.isPaymentDone = true;
        payeeuser.nodeId = rslt.newUser.id;
        await payeeuser.save();
        const wallet = await WalletServices.createWallet(rslt.newUser.id);

        const referralAmount = 0.36 * AMOUNT;
        await walletServices.addAmountToWallet(
          referredByUser.id,
          referralAmount
        );
        await walletServices.addAmountToWallet(
          rslt.newUser.id,
          tempWallet.balance
        );
        // await TempWallet.destroy({
        //   where:{

        //   }
        // })

        res.status(200).json({ message: "Created referral user" });
      }
    } else {
      const id = req.user.uid;
      if (!id) {
        throw new ApiBadRequestError("id not found");
      }
      //refreed by or root, not root then use referral table to access referral_id to the refrral name
      //STEP 1------>> Create user and income report
      const rslt = await UserServices.createRenewal(id);

      //STEP 2------>> Add levelincome
      const wallet = await Wallet.findOne({
        where: {
          userId: id,
        },
      });
      if (parseFloat(wallet.balance) < parseFloat(AMOUNT)) {
        throw new ApiBadRequestError(
          "Insufficient balance. Required at least: " +
            AMOUNT +
            ". Current: " +
            wallet.balance
        );
      } else {
        wallet.balance = parseFloat(wallet.balance) - parseFloat(AMOUNT);
        await wallet.save();
      }
      const levelincomeAmount = 0.6 * AMOUNT;
      await walletServices.addLevelOrderIncome(
        rslt.newUser.id,
        levelincomeAmount
      );
      //STEP 3------>> Add 4% to autopool 1 and 36% to autopool 2
      const autoPool1Amount = 0.04 * AMOUNT;
      await walletServices.addAmountToAutoPool1(autoPool1Amount);

      const autoPool2Amount = 0.36 * AMOUNT;
      await walletServices.addAmountToAutoPool2(autoPool2Amount);
      return res
        .status(201)
        .json({ message: "Renewal User created successfully", user: rslt });
    }
  } catch (err) {
    next(err);
  }
}

async function fundtransfer(req, res, next) {
  try {
    const { amount } = req.body;
    if (isNaN(amount)) {
      throw new ApiBadRequestError("amount is not a valid number");
    }
    let resp = {}
    const sender = await UserAuthentication.findOne({
      where: {
        ...(req.user.created && { nodeId: req.user.uid }),
        ...(!req.user.created && { id: req.user.uid }),
      },
    });
    let fundTransfer = {};
    fundTransfer.amount = amount;
    const { username } = req.body;
    if (!username) {
      throw new ApiBadRequestError("Please enter a username in the request");
    }
    const receiver = await UserAuthentication.findOne({
      where: {
        username,
        isCreated: true,
      },
    });
    if (!receiver) {
      throw new Api404Error("No user found with the user name");
    }
    if (req.user.created) {
      const wallet = await Wallet.findOne({
        where: {
          userId: req.user.uid,
        },
      });
      console.log(
        "parseFloat(wallet.balance) < parseFloat(AMOUNT)",
        parseFloat(wallet.balance),
        parseFloat(AMOUNT)
      );
      if (
        parseFloat(wallet.balance) < parseFloat(amount) &&
        req.user.role != "admin"
      ) {
        throw new ApiBadRequestError(
          "Insufficient balance. Required at least: " +
            amount +
            ". Current: " +
            wallet.balance
        );
      } else {
        console.log("sender existing ", wallet.balance);
        if (req.user.role != "admin"){
          wallet.balance = parseFloat(wallet.balance) - parseFloat(amount);

        }
        await wallet.save();
        console.log("sender existing ", wallet.balance);
        fundTransfer.sender_type = "existing";
        fundTransfer.sender = req.user.uid;
      }
    } else {
      const wallet = await TempWallet.findOne({
        where: {
          user_id: req.user.uid,
        },
      });
      console.log(
        "parseFloat(wallet.balance) < parseFloat(AMOUNT)",
        parseFloat(wallet.balance),
        parseFloat(AMOUNT)
      );

      if (parseFloat(wallet.balance) < parseFloat(amount)) {
        throw new ApiBadRequestError(
          "Insufficient balance. Required at least: " +
            amount +
            ". Current: " +
            wallet.balance
        );
      } else {
        console.log("sender new ", wallet.balance);
        wallet.balance = parseFloat(wallet.balance) - parseFloat(amount);
        await wallet.save();
        console.log("sender new ", wallet.balance);
        fundTransfer.sender_type = "new";
        fundTransfer.sender = req.user.uid;
      }
    }

    if (receiver.isPaymentDone) {
      const wallet = await Wallet.findOne({
        where: {
          userId: receiver.nodeId,
        },
      });
      
      console.log("reciever existing ", wallet.balance);
      wallet.balance = parseFloat(wallet.balance) + parseFloat(amount);
      await wallet.save();
      resp.wallet = wallet
      console.log("reciever existing ", wallet.balance);
      fundTransfer.receiver = receiver.nodeId;
      fundTransfer.receiver_type = "existing";
    } else {
      const wallet = await TempWallet.findOne({
        where: {
          user_id: receiver.id,
        },
      });
      console.log("receiver new ", wallet.balance);
      wallet.balance = parseFloat(wallet.balance) + parseFloat(amount);
      await wallet.save();
      resp.wallet = wallet
      console.log("receiver new ", wallet.balance);
      fundTransfer.receiver = receiver.id;
      fundTransfer.receiver_type = "new";
    }
    console.log("fundtransfer ", fundTransfer);
    await FundTransferHistory.create(fundTransfer);
    await res.status(200).json({ message: "Funds transferred successfully",data:resp });
  } catch (err) {
    next(err);
  }
}

async function fundtransferHistory(req, res, next) {
  try {
    const rslt = await FundTransferHistory.findAll();
    res.status(200).json({
      message: "Fund transfer history Fetched successfully",
      data: rslt,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getUserTransaction,
  createReferralUser,
  createRenewal,
  signUp,
  getUserProfile,
  getTransactions,
  getMyteam,
  getMyRenew,
  updateName,
  withdrawMoney,
  initialpayment,
  getMoneyRequest,
  activateAcc,
  fundtransfer,
  fundtransferHistory,
};
