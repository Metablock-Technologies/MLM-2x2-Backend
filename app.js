var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var mlogger = require("morgan");
const Router = require("./routes/index");
const { logError, returnError } = require("./errors");
const { logger } = require("./logger");
const { sequelize } = require("./config/db");
var app = express();
var cors = require('cors')
app.use(cors())
// view engine setup
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "jade");
// sequelize.sync()
app.use(mlogger("dev", { stream: { write: (msg) => logger.info(msg) } }));
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
app.use(logError);
app.use(returnError);



module.exports = app;
