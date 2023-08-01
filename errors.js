const {
  ValidationError,
  AggregateError,
  UniqueConstraintError,
} = require("sequelize");
const logger = require("./logger");

class BaseError extends Error {
  constructor(type, message, statusCode, isOperational) {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype);
    this.type = type;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

class Api404Error extends BaseError {
  constructor(
    message,
    type = "NOT FOUND",
    statusCode = 404,
    isOperational = true
  ) {
    super(type, message, statusCode, isOperational);
  }
}

class ApiBadRequestError extends BaseError {
  constructor(
    message,
    type = "Bad Request",
    statusCode = 400,
    isOperational = false
  ) {
    super(type, message, statusCode, isOperational);
  }
}
class ApiUnathorizedError extends BaseError {
  constructor(
    message,
    type = "Unauthorized Request Plz Refresh",
    statusCode = 401,
    isOperational = false
  ) {
    super(type, message, statusCode, isOperational);
  }
}
class ApiForbiddenError extends BaseError {
  constructor(
    message,
    type = "Please Login again",
    statusCode = 403,
    isOperational = false
  ) {
    super(type, message, statusCode, isOperational);
  }
}
class ApiInternalServerError extends BaseError {
  constructor(
    message,
    type = "Not found.",
    statusCode = 500,
    isOperational = false
  ) {
    super(type, message, statusCode, isOperational);
  }
}

const logError = (err, req, res, next) => {
  logger.error(err, err);
  next(err);
};
const returnError = (err, req, res, next) => {
  if (err instanceof ValidationError) {
    return res.status(400).json({
      type: "Database Validation Failed",
      message: err.errors[0].message,
      status: 400,
    });
  } else if (err instanceof AggregateError) {
    // logger.debug(err)
    return res.status(err.statusCode || 400).json({
      type: err.name,

      message: err,
      status: 400,
    });
  } else if (err instanceof UniqueConstraintError) {
    return res.status(err.statusCode || 400).json({
      type: err.name,
      message: err,
      status: 400,
    });
  } else {
    return res.status(err.statusCode || 500).json({
      type: err.type,
      message: err.message,
      status: err.statusCode,
    });
  }
};
module.exports = {
  BaseError,
  Api404Error,
  ApiBadRequestError,
  ApiUnathorizedError,
  ApiForbiddenError,
  ApiInternalServerError,
  logError,
  returnError,
};
