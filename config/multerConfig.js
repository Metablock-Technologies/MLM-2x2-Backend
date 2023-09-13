const multer = require("multer");
const multerS3 = require("multer-s3");
const { s3Client } = require("./awsConfig");

const path = require("path");
const { ApiBadRequestError } = require("../errors");
let config;
let fileBaseUrl = "";
if (process.env.NODE_ENV === "production" || true) {
  config = multerS3({
    s3: s3Client,
    acl: "public-read",
    bucket: process.env.IMAGE_BUCKET,
    key: function (req, file, cb) {
      let name =
        file.fieldname + "_" + Date.now() + path.extname(file.originalname);

      file.link = fileBaseUrl + name;
      cb(null, name);
    },
  });
} else {
  config = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, "../public/images"));
    },
    filename: (req, file, cb) => {
      let name =
        file.fieldname + "_" + Date.now() + path.extname(file.originalname);
      file.link = fileBaseUrl + name;
      cb(null, name);
    },
  });
}

const fileUpload = multer({
  storage: config,
  //TODO: file Filter
  fileFilter: function (req, file, cb) {
    // if (!file.originalname.match(/\.(png|jpg|JPG)$/)) {
    //   // upload only png and jpg format
    //   return cb(new ApiBadRequestError("Please Upload A Image"));
    // }
    if(!file.mimetype){
      throw new ApiBadRequestError("file does not have mimetype")
    }
    console.log("originalfile",file);
    cb(undefined, true);
  },
});

module.exports = { fileUpload };
