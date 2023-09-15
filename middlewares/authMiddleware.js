const jwt = require("jsonwebtoken");
const { ApiUnathorizedError, ApiForbiddenError } = require("../errors");
const logger = require("../logger");
// const { UserAuthentication } = require("../models");
const { UserAuthentication } = require("../models");

const isVerifiedUser = async (req, res, next) => {
  try {
    let token =
      req.headers.authorization &&
      req.headers.authorization.match(/^Bearer (.*)$/);
    // console.log("here")
    if (token && token[1]) {
      token = token[1];
    }
    if (!token) {
      throw new ApiUnathorizedError("AccessTokenError: Maybe the Bearer token is not present in the authorization header.");
    }

    const payload = await jwt.verify(token, process.env.JWT_TOKEN_SECRET);

    console.log("RequestUser: ", payload);
    // const rslt = await UserAuthentication.findByPk(payload.uid);
    if (payload) {
      req.user = payload;
      console.log("req.user ",req.user)
      next();
      return;
    } else {
      throw new ApiUnathorizedError("AccessTokenError: The token is invalid. Please generate new (Login again or verify email)");
    }
  } catch (err) {
    next(new ApiUnathorizedError(err.message));
  }
};

const verifyPayment = async(req,res,next) =>{
  if(!req.user.created){
    throw new ApiForbiddenError("Please activate your Id to access this route or login again if payment done.")
  }
  else{
    next()
  }
}

const verifyRole = (...allowedUsers) => {
  return async (req, res, next) => {
    logger.info("allowedUsers", allowedUsers);
    logger.info("req.user.role", req.user.role);
    try {
      const result = allowedUsers.includes(req.user.role);
      if (!result)
        throw new ApiForbiddenError("You are Unathorized to user this route");
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = {
  isVerifiedUser,
  verifyRole,
  verifyPayment,
};
