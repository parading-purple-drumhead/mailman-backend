const nodemailer = require("nodemailer");

async function sendmail(params) {
  let transporter = nodemailer.createTransport({
    service: "hotmail",
    auth: {
      user: "iota-hackathon@outlook.com",
      pass: "M@ilman123",
    },
  });
  let info = await transporter.sendMail(
    params
  );
}


module.exports = { sendmail }