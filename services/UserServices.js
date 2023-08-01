const {
  User,
  Transaction,
  Referral,
  Renewal,
  Income_report,
  UserAuth,
} = require("../models/index");
const crypto = require("crypto");
const { AMOUNT, REF } = require("../Constants");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { log } = require("console");

const { ApiBadRequestError } = require("../errors");

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

//   async createRenewal(id) {
//     try {
//       const existingUser = await User.findOne({ where: { id } });
//       console.log("user", existingUser.username);

//       let node_id = 1; // Default node_id if no users exist
//       // Find the last user to calculate the new node_id
//       const lastUser = await User.findOne({
//         order: [["id", "DESC"]], // Order by ID in descending order
//         attributes: ["node_id"],
//       });
//       if (lastUser) {
//         node_id = lastUser.node_id + 1;
//       }

//       // Calculate the new pack_expiry date (current pack_expiry + 30 days)
//       const currentDate = new Date(existingUser.pack_expiry);
//       console.log(currentDate);
//       currentDate.setDate(currentDate.getDate() + 30);
//       const newPackExpiry = currentDate.toISOString().split("T")[0]; // Convert to 'YYYY-MM-DD' format
//       console.log(newPackExpiry);

//       let newUsername =
//         "renew" + "_" + node_id + "_" + id + "_" + existingUser.username;
//       let newEmail =
//         "renew" + "+" + node_id + "+" + id + "+" + existingUser.email;
//       console.log(newUsername, newEmail);

//       const newUser = await User.create({
//         username: newUsername,
//         email: newEmail,
//         password: existingUser.password,
//         node_id,
//         pack_expiry: newPackExpiry,
//         status: "active",
//       });

//       await Renewal.create({
//         renewal_id: newUser.id,
//         main_id: existingUser.id,
//       });

//       // Increase the number_of_renew for the main user
//       existingUser.number_of_renew += 1;
//       existingUser.pack_expiry = newPackExpiry;
//       await existingUser.save();
//       const allUserForMainId = await Renewal.findAll({
//         where: {
//           main_id: id,
//         },
//       });

//       allUserForMainId.map(async (user) => {
//         tempId = user.renewal_id;
//         const renewUser = await User.findByPk(tempId);
//         renewUser.pack_expiry = newPackExpiry;
//         await renewUser.save();
//       });
//       const user_income_report = await Income_report.create({
//         userId: newUser.id,
//         amount_spent: AMOUNT,
//       });

//       return { newUser, income_report: user_income_report };
//     } catch (err) {
//       console.log(err);
//     }
//   }

  async UserAuthentication(
    username,
    email,
    password,
    name,
    phonenumber,
    referred_by
  ) {
    const isEmailVerified = true;

    // const encryptedPassword = await bcrypt.hash(password, 10);
    // console.log(encryptedPassword);

    if (isEmailVerified) {
      // Insert user details into the UserAuth table
      const newUser = await UserAuth.create({
        username,
        email,
        password,
        name,
        phonenumber,
        referredBy: referred_by,
        isVerified: true,
      });

      // Check if payment is done (you may have a separate payment process)
      const isPaymentDone = true;

      if (isPaymentDone) {
        const dashboardOption = "dashboard";
        return dashboardOption;
      } else {
        const paymentMessage =
          "Please complete the payment to access the dashboard.";
        return paymentMessage;
      }
    } else {
      const verificationMessage = "Please verify your email to proceed.";
      return verificationMessage;
    }
  }

  async UserSignIn(email, password) {
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }
    // Validate if user exist in our database
    const user = await UserAuth.findOne({ email });
    // const encryptedPassword = await bcrypt.hash(password, 10);
    // console.log(bcrypt.compare(password, user.password));
    if (!user) {
      return { status: "error", error: "user not found" };
    }
    console.log(password, user.password);
    if (await bcrypt.compare(password, user.password)) {
      // Create token
      const token = jwt.sign(
        { user_id: user.id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );
      // save user token
      user.token = token;
      console.log("token", token, user.token);
      // user
      return { status: "ok", data: token };
    }

    return { status: "error", error: "invalid password" };
  }

  async createRenewal(id) {
    const isNotMainId = await Renewal.findOne({
      where: { renewal_id: id },
    });
    if (isNotMainId) {
      throw new ApiBadRequestError(
        "This is not a main_id, it already a renewed id alias user"
      );
    }
    const existingUser = await User.findOne({ where: { id } });
    if (!existingUser) {
      throw new ApiBadRequestError("User With id " + id + " does not exist");
    }
    console.log("user", existingUser.username);
    let node_id = 1; // Default node_id if no users exist
    // Find the last user to calculate the new node_id
    const lastUser = await User.findOne({
      order: [["id", "DESC"]], // Order by ID in descending order
      attributes: ["id"],
    });
    if (lastUser) {
      node_id = lastUser.id + 1;
    }

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
      id: node_id,
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
    const allUserForMainId = await Renewal.findAll({
      where: {
        main_id: id,
      },
    });

    allUserForMainId.map(async (user) => {
      let tempId = user.renewal_id;
      const renewUser = await User.findByPk(tempId);
      renewUser.pack_expiry = newPackExpiry;
      await renewUser.save();
    });
    const user_income_report = await Income_report.create({
      userId: newUser.id,
      levelincome: 0.0,
      amount_spent: AMOUNT,
    });

    return { newUser: newUser, income_report: user_income_report };
  }
}

module.exports = new UserServices();
