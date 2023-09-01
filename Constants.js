const AMOUNT = 25;
const REF = 43;

const UserDataType = {
  BASIC: "basic",
  ADMIN: "admin",
};

const challengeCategories = {
  POPULAR: "popular",
  QUICK: "quick",
  RICH: "rich",
};
const challengeStatus = {
  CREATED: "created",
  RUNNING: "running",
  JUDGEMENT: "judgement",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};
const penalties = {
  FRAUD: 100,
  WRONGUPDATE: 50,
  NOUPDATE: 50,
};
// const commission = parseFloat((await walletServices.getCommission()))
module.exports = {
  UserDataType,
  challengeCategories,
  challengeStatus,
  penalties,
  AMOUNT,
  REF,
  // commission
};
