
const crypto = require('crypto');
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

function generateWalletAddress() {
    const randomBytes = crypto.randomBytes(16); // Generate 16 random bytes
    const walletAddress = randomBytes.toString('hex'); // Convert to hexadecimal
    return walletAddress.slice(0, 42); // Extract the first 42 digits
}

module.exports = { generateRandomNumber, CustomError, generateWalletAddress };
