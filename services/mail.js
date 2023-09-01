let nodemailer = require("nodemailer");

let configOptions = {
  service: "gmail",
  auth: {
    user: process.env.GMAIL_ID,
    pass: process.env.GMAIL_PASS,
  },
};

let transporter = nodemailer.createTransport(configOptions);

const sendEmail = async (to, subject, body) => {
  if (process.env.NODE_ENV === "production" || true) {
    let msg = await transporter.sendMail({
      to,
      subject,

      html: `
      <html><head>
      <meta charset="UTF-8">
      <title>FFG Email Verification</title>
      <link href="https://fonts.googleapis.com/css?family=NTR&display=swap" rel="stylesheet">
      <style>
        body {
          background-color: #0F172A;
          font-family: 'NTR', sans-serif;
          color: white;
          margin: 0;
          padding: 0;
          color:white;
        }
        .container {
          max-width: 600px;
          margin: auto;
          background-color: #1E293F;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.25);
          color:white;
        }
        h1 {
          text-align: center;
          margin-top: 0;
          margin-bottom: 20px;
          color:white;
        }
        p {
          
          margin-top: 0;
          margin-bottom: 20px;
          color:white;
        }
        .otp {
          font-size: 24px;
          text-align: center;
          margin-top: 30px;
          margin-bottom: 30px;
          padding: 10px;
          background-color: #2D3A5E;
          border-radius: 5px;
          box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.25);
          color:white;
        }
        .footer {
          text-align: center;
          font-size: 14px;
        }
      </style>
    </head> <body>
      ${body}
      </body></html>
      `,

      from: process.env.GMAIL_ID,
    });
    console.log(msg);
  } else {
    console.log(to, body);
  }
  //   console.log("msg", msg);
};

module.exports = { sendEmail };
