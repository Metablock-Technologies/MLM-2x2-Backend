const { User } = require('./User');
const { Wallet } = require('./Wallet');
const { Referral } = require('./Referal');
const { Renewal } = require('./Renewal');
const { Income_report } = require('./Incomereport');
const { Autopool1 } = require('./Autopool1')
const { Autopool2 } = require('./Autopool2')
const { Transaction } = require('./Transaction')
const { UserAuth } = require('./Userauth')

module.exports = {
    User,
    Wallet,
    Referral,
    Renewal,
    Income_report,
    Autopool1,
    Autopool2,
    Transaction,
    UserAuth
}
