function generateRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

class CustomError extends Error {
  constructor({ name, message }) {
    super(message);
    this.name = name;
    this.error = {};
    this.error.message = message;
    this.stack = new Error().stack;
  }
}
CustomError.prototype = new Error();

module.exports = { generateRandomNumber, CustomError };
