const nodemailer = require("nodemailer");

async function sendmail(params) {
  let transporter = nodemailer.createTransport({
    service: "hotmail",
    // host: "smtp.ethereal.email",
    // port: 587,
    // secure: false, // true for 465, false for other ports
    auth: {
      user: "iota-hackathon@outlook.com", // generated ethereal user
      pass: "M@ilman123", // generated ethereal password
    },
  });
  let info = await transporter.sendMail(
      params
    // from: "iota-hackathon@outlook.com", // sender address
    // to: "sudhanshubroy@gmail.com", // list of receivers
    // subject: "Hello", // Subject line
    // text: "Hello world?"
  );
  
  console.log("Message sent: %s", info.messageId);

    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}


module.exports = {sendmail}