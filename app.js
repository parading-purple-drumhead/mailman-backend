const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("./api/routes/nodemailer");
const cron = require('node-cron');
const Schedule = require('./api/models/schedule')


// const sendmail = nodemailer.sendmail
const app = express();

const mailsRoute = require("./api/routes/mails");

mongoose.connect(
  "mongodb+srv://basu:" +
    process.env.MONGO_ATLAS_PWD +
    "@mailman-db.xrpii.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
  { useNewUrlParser: true }
);

const task = cron.schedule('*/5 * * * * *',()=>{
    Schedule.find().exec()
    .then((docs)=>{
        console.log(docs[0]["_30secs"])
        const schedule = docs[0]

    })
    // console.log("time")
})
task.start()

app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

app.use("/mails", mailsRoute);

app.use("/sendmail", (req, res, next) => {
  const params = {
    from: "iota-hackathon@outlook.com", // sender address
    to: "sudhanshubroy@gmail.com", // list of receivers
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
