var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const Router = require("./routes/index");
var app = express();

// view engine setup
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/v1/", Router);


// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//     next(createError(404));
// });

// error handler

const testuser = [
    {
        username: "user1",
        email: "user1@example.com",
        password: "password1",
        node_id: 1,
        status: "active",
        name: "User One",
        phonenumber: 1234567890,
    },
];
// User.bulkCreate(testuser)

const testTransactions = [
    {
        detail: "Transaction 1 detail",
        userId: 1, // Replace with the appropriate user ID for this transaction
    },
    {
        detail: "Transaction 2 detail",
        userId: 1, // Replace with the appropriate user ID for this transaction
    },
    {
        detail: "Transaction 3 detail",
        userId: 1, // Replace with the appropriate user ID for this transaction
    },
];
// Transaction.bulkCreate(testTransactions)



module.exports = app;
