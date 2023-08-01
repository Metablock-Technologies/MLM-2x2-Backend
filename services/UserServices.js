const {
  User,
  Transaction,
  Referral,
  Renewal,
  Income_report,
} = require("../models/index");
const crypto = require("crypto");
const { AMOUNT, REF } = require("../Constants");
class UserServices {
  async generateUniqueHash() {
    try {
      while (true) {
        // Generate a random 16-byte buffer
        const randomBytes = crypto.randomBytes(16);
        // Convert the random bytes to a hexadecimal string
        const hash = randomBytes.toString("hex");
        // Take the first 5 characters as the unique hash code
        const uniqueHash = hash.substring(0, 5);

        // Check if the generated uniqueHash already exists in the database
        const existingUser = await User.findOne({
          where: { hashcode: uniqueHash },
        });
        if (!existingUser) {
          // If the hash code is not found in the database, return the unique hash
          return uniqueHash;
        }
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async createReferralUser(
    username,
    email,
    password,
    name,
    phonenumber,
    referred_by
  ) {
    let uid = 1; // Default node_id if no users exist

    // Find the last user to calculate the new node_id
    const lastUser = await User.findOne({
      order: [["id", "DESC"]], // Order by ID in descending order
      attributes: ["id"],
    });

    if (lastUser) {
      uid = lastUser.id + 1;
    }

    console.log("uid ", uid);
    // Calculate the pack_expiry date (current date + 30 days)
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 30);
    const pack_expiry = currentDate.toISOString().split("T")[0]; // Convert to 'YYYY-MM-DD' format

    // Generate a 5-digit unique hash code for the user
    const uniqueHash = await this.generateUniqueHash();

    // Create the new user in the database
    const newUser = await User.create({
      id: uid,
      username,
      email,
      password,
      name,
      phonenumber,
      status: "active",
      pack_expiry,
      number_of_renew: 0,
      number_of_referral: 0,
      hashcode: uniqueHash,
    });
    const user_income_report = await Income_report.create({
      userId: uid,
      levelincome: 0.0,
      amount_spent: AMOUNT,
    });

    await Referral.create({
      referredUserId: newUser.id,
      referredByUserId: referred_by,
    });
    // Increase the number_of_referral for the referrer user
    let fUser = await User.findByPk(referred_by);
    fUser.number_of_referral += 1;
    await fUser.save();
    // await User.increment('number_of_referral', { where: { id: referred_by } });

    // newUser = user_income_report
    return { newUser, income_report: user_income_report };
  }

  async createRenewal(id) {
    try {
      const existingUser = await User.findOne({ where: { id } });
      console.log("user", existingUser.username);

      let node_id = 1; // Default node_id if no users exist
      // Find the last user to calculate the new node_id
      const lastUser = await User.findOne({
        order: [["id", "DESC"]], // Order by ID in descending order
        attributes: ["node_id"],
      });
      if (lastUser) {
        node_id = lastUser.node_id + 1;
      }

      // Calculate the new pack_expiry date (current pack_expiry + 30 days)
      const currentDate = new Date(existingUser.pack_expiry);
      console.log(currentDate);
      currentDate.setDate(currentDate.getDate() + 30);
      const newPackExpiry = currentDate.toISOString().split("T")[0]; // Convert to 'YYYY-MM-DD' format
      console.log(newPackExpiry);

      let newUsername =
        "renew" + "_" + node_id + "_" + id + "_" + existingUser.username;
      let newEmail =
        "renew" + "+" + node_id + "+" + id + "+" + existingUser.email;
      console.log(newUsername, newEmail);

      const newUser = await User.create({
        username: newUsername,
        email: newEmail,
        password: existingUser.password,
        node_id,
        pack_expiry: newPackExpiry,
        status: "active",
      });

      await Renewal.create({
        renewal_id: newUser.id,
        main_id: existingUser.id,
      });

      // Increase the number_of_renew for the main user
      existingUser.number_of_renew += 1;
      existingUser.pack_expiry = newPackExpiry;
      await existingUser.save();

      // await Income_report.create({
      //   userId:
      // })
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = new UserServices();
