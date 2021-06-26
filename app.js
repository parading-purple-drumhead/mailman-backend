const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("./api/routes/nodemailer");
const cron = require("node-cron");
const Schedule = require("./api/models/schedule");
const Mail = require("./api/models/mail");
var moment = require("moment");

// const sendmail = nodemailer.sendmail
const app = express();

const mailsRoute = require("./api/routes/mails");

mongoose.connect(
  "mongodb+srv://basu:" +
    process.env.MONGO_ATLAS_PWD +
    "@mailman-db.xrpii.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
  { useNewUrlParser: true }
  
);

const task = cron.schedule("*/30 * * * * *", () => {
  Schedule.find()
    .exec()
    .then((docs) => {
      const month = moment().format("MMM");
      const date = moment().format("_DD");
      const day = moment().format("dddd");
      const time = moment().format("HH:MM");
      const sec = moment().format("ss");
      console.log(sec);
      const sendMailIds = [];
      const schedule = docs[0];
      schedule["_30secs"].forEach((mailid) => {
        sendMailIds.push(mailid);
      });
      //add if statement if(sec == 00)
      if (sec == 00) {
        if (schedule["Weekly"][day]) {
          if (schedule["Weekly"][day][time]) {
            schedule["Weekly"][day][time].forEach((mailid) => {
              sendMailIds.push(mailid);
            });
          }
        }
        if (schedule["Monthly"][date]) {
          if (schedule["Monthly"][date][time]) {
            schedule["Monthly"][date][time].forEach((mailid) => {
              sendMailIds.push(mailid);
            });
          }
        }
        if (schedule["Yearly"][month]) {
          if (schedule["Yearly"][month][date]) {
            if (schedule["Yearly"][month][date][time]) {
              schedule["Yearly"][month][date][time].forEach((mailid) => {
                sendMailIds.push(mailid);
              });
            }
          }
        }
      }
      console.log(sendMailIds);
      sendMailIds.forEach((id) => {
        Mail.findById(id)
          .exec()
          .then((mail) => {
            var params = {
              from: "iota-hackathon@outlook.com",
              to: mail.to,
              cc: mail.cc,
              subject: mail.subject,
              text: mail.body,
            };
            nodemailer.sendmail(params);
          });
      });
    });
  // console.log("time")
});
task.start();

app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

app.use("/mails", mailsRoute);

app.use("/sendmail", (req, res, next) => {
  const params = {
    from: "iota-hackathon@outlook.com", // sender address
    to: ["sudhanshubroy@gmail.com", "kartikbansal2000@gmail.com"], // list of receivers
    cc: [],
    subject: "Hello", // Subject line
    text: "Hello world?",
  };
  nodemailer.sendmail(params);
  res.status(200).json({ message: "Mail Sent" });
});

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    error: {
      message: error.message,
    },
  });
});

module.exports = app;
