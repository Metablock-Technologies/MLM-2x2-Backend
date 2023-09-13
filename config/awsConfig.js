const { SNSClient } = require("@aws-sdk/client-sns");
const { SESClient } = require("@aws-sdk/client-ses");
const { S3Client } = require("@aws-sdk/client-s3");
const s3Client = new S3Client({
  region: process.env.P_AWS_REGION,
  credentials: {
    accessKeyId: process.env.P_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.P_AWS_SECRET_ACCESS_KEY,
    region: process.env.P_AWS_REGION,
  },
});

const SNS = new SNSClient({
  apiVersion: "2010-03-31",
  region: process.env.P_AWS_REGION,
  credentials: {
    accessKeyId: process.env.P_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.P_AWS_SECRET_ACCESS_KEY,
    region: process.env.P_AWS_REGION,
  },
});

const SES = new SESClient({
  apiVersion: "2010-12-01",
  region: process.env.P_AWS_REGION,
  credentials: {
    accessKeyId: process.env.P_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.P_AWS_SECRET_ACCESS_KEY,
    region: process.env.P_AWS_REGION,
  },
});
module.exports = { s3Client, SNS, SES };
