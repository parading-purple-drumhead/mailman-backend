const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Mail = require('../models/mail');
const Schedule = require('../models/schedule');
const { v4: uuidv4 } = require('uuid');


router.get("/", (req, res, next) => {
    const sender = req.headers.sender;
    Mail.find({ sender: sender }).exec()
        .then(docs => {
            console.log(docs);
            res.status(200).json(docs);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err })
        });
});


router.get("/:mailId", (req, res, next) => {
    const mailId = req.params.mailId;
    Mail.findById(mailId).exec()
        .then(mail => {
            console.log(mail);
            res.status(200).json(mail);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err })
        })
});


router.post("/", (req, res, next) => {
    const type = req.body.type;
    const mailId = uuidv4().toString();

    const mail = new Mail({
        _id: mailId,
        sender: req.body.sender,
        displayName: req.body.displayName,
        to: req.body.to,
        cc: req.body.cc,
        bcc: req.body.bcc,
        subject: req.body.subject,
        body: req.body.body,
        type: type,
        time: req.body.time,
        day: req.body.day,
        date: req.body.date,
        month: req.body.month,
        last_sent: ""
    });

    mail.save()
        .then(result => {
            console.log("Mail added successfully");
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });

    Schedule.find().exec()
        .then(docs => {
            var schedule = docs[0];
            console.log(schedule)
            if (type == "30secs") {
                schedule["_30secs"].push(mailId);
                Schedule.updateOne({ _id: schedule["_id"] }, { $set: schedule }).exec()
                    .then(result => res.status(200).json({ message: "Mail scheduled for every 30 seconds" }))
                    .catch(err => res.status(500).json({ error: err }))
            }
            else if (type == "Weekly" || type == "Monthly") {
                const day_or_date = (type == "Weekly") ? mail["day"] : mail["date"];
                const time = mail["time"];
                if (schedule[type][day_or_date] == undefined) {
                    schedule[type][day_or_date] = {}
                    schedule[type][day_or_date][time] = [mailId]
                    console.log(schedule[type][day_or_date][time])
                    console.log("Updated 1:", schedule)
                }
                else {
                    if (schedule[type][day_or_date][time] == undefined) {
                        schedule[type][day_or_date][time] = [mailId]
                        console.log("Updated 2:", schedule)
                    }
                    else {
                        schedule[type][day_or_date][time].push(mailId)
                        console.log("Updated 3:", schedule)
                    }
                }
                Schedule.updateOne({ _id: schedule["_id"] }, { $set: schedule }).exec()
                    .then(result => res.status(200).json({ message: "Mail scheduled for every week/month" }))
                    .catch(err => res.status(500).json({ error: err }))
            }
            else if (type == "Yearly") {
                const month = req.body.month;
                const date = req.body.date;
                const time = req.body.time;
                if (schedule[type][month] == undefined) {
                    schedule[type][month] = {}
                    schedule[type][month][date] = {}
                    schedule[type][month][date][time] = [mailId]
                } else if (schedule[type][month][date] == undefined) {
                    schedule[type][month][date] = {}
                    schedule[type][month][date][time] = [mailId]
                }
                else if (schedule[type][month][date][time] == undefined) {
                    schedule[type][month][date][time] = [mailId]
                }
                else {
                    schedule[type][month][date][time].push(mailId)
                }
                Schedule.updateOne({ _id: schedule["_id"] }, { $set: schedule }).exec()
                    .then(result => res.status(200).json({ message: "Mail scheduled for every year" }))
                    .catch(err => res.status(500).json({ error: err }))
            }
        })
});


router.patch("/:mailId", (req, res, next) => {
    const mailId = req.params.mailId;
    const newMail = req.body
    Schedule.find().exec()
        .then(docs => {
            var schedule = docs[0];
            Mail.findById(mailId).exec()
                //Removing old schedule
                .then(oldMail => {
                    const type = oldMail.type;
                    if (type == "30secs") {
                        var arr = schedule["_30secs"];
                        arr = arr.filter(item => item != mailId)
                        schedule["_30secs"] = arr;
                    }
                    else if (type == "Weekly" || type == "Monthly") {
                        const day_or_date = (type == "Weekly") ? oldMail.day : oldMail.date;
                        const time = oldMail.time;
                        var arr = schedule[type][day_or_date][time];
                        arr = arr.filter(item => item != mailId);
                        schedule[type][day_or_date][time] = arr;
                    }
                    else {
                        const month = oldMail.month;
                        const date = oldMail.date;
                        const time = oldMail.time;
                        var arr = schedule[type][month][date][time];
                        arr = arr.filter(item => item != mailId);
                        schedule[type][month][date][time] = arr;
                        console.log("Line 155:",schedule[type][month][date][time])
                    }
                    Schedule.updateOne({ _id: schedule["_id"] }, { $set: schedule }).exec()
                        .then(() => {
                            console.log("Removed from schedule")
                        })
                        .catch((err) => console.log(err))
                })

                //Updating new schedule
                .then(() => {
                    const type = newMail.type;
                    if (type == "30secs") {
                        schedule["_30secs"].push(mailId);
                        Schedule.updateOne({ _id: schedule["_id"] }, { $set: schedule }).exec()
                            .then(result => console.log("Mail scheduled for every 30 seconds"))
                            .catch(err => console.log(err))
                    }
                    else if (type == "Weekly" || type == "Monthly") {
                        const day_or_date = (type == "Weekly") ? newMail["day"] : newMail["date"];
                        const time = newMail["time"];
                        if (schedule[type][day_or_date] == undefined) {
                            schedule[type][day_or_date] = {}
                            schedule[type][day_or_date][time] = [mailId]
                        }
                        else {
                            if (schedule[type][day_or_date][time] == undefined) {
                                schedule[type][day_or_date][time] = [mailId]
                            }
                            else {
                                schedule[type][day_or_date][time].push(mailId)
                            }
                        }
                        console.log("Line 188:",schedule[type][day_or_date][time])
                        Schedule.updateOne({ _id: schedule["_id"] }, { $set: schedule }).exec()
                            .then(result => console.log("Mail scheduled for every week/month"))
                            .catch(err => console.log(err))
                    }
                    else if (type == "Yearly") {
                        const month = newMail.month;
                        const date = newMail.date;
                        const time = newMail.time;
                        if (schedule[type][month] == undefined) {
                            schedule[type][month] = {}
                            schedule[type][month][date] = {}
                            schedule[type][month][date][time] = [mailId]
                        } else if (schedule[type][month][date] == undefined) {
                            schedule[type][month][date] = {}
                            schedule[type][month][date][time] = [mailId]
                        }
                        else if (schedule[type][month][date][time] == undefined) {
                            schedule[type][month][date][time] = [mailId]
                        }
                        else {
                            schedule[type][month][date][time].push(mailId)
                        }
                        console.log("Line 211:",schedule[type][month][date][time])
                        Schedule.updateOne({ _id: schedule["_id"] }, { $set: schedule }).exec()
                            .then(result => console.log("Mail scheduled for every year"))
                            .catch(err => console.log(err))
                    }
                })

                //Updaing mail
                .then(() => {
                    Mail.updateOne({ _id: mailId }, { $set: req.body }).exec()
                        .then(result => {
                            res.status(200).json({
                                message: "Mail updated successfully"
                            });
                        })
                        .catch(err => {
                            res.status(500).json({
                                error: err
                            })
                        });
                });
        });
});


router.delete("/:mailId", async (req, res, next) => {
    const mailId = req.params.mailId;
    Schedule.find().exec()
        .then(docs => {
            const schedule = docs[0];
            Mail.findById(mailId).exec()
                .then(mail => {
                    console.log(mail);
                    const type = mail.type;
                    if (type == "30secs") {
                        var arr = schedule["_30secs"];
                        arr = arr.filter(item => item != mailId)
                        schedule["_30secs"] = arr;

                    }
                    else if (type == "Weekly" || type == "Monthly") {
                        const day_or_date = (type == "Weekly") ? mail.day : mail.date;
                        const time = mail.time;
                        var arr = schedule[type][day_or_date][time];
                        arr = arr.filter(item => item != mailId);
                        schedule[type][day_or_date][time] = arr;
                    }
                    else {
                        const month = mail.month;
                        const date = mail.date;
                        const time = mail.time;
                        var arr = schedule[type][month][date][time];
                        arr = arr.filter(item => item != mailId);
                        schedule[type][month][date][time] = arr;
                        console.log(schedule[type][month][date][time])
                    }
                    Schedule.updateOne({ _id: schedule["_id"] }, { $set: schedule }).exec()
                        .then(() => {
                            console.log("Removed from schedule")
                            Mail.remove({ _id: mailId }).exec()
                                .then(result => {
                                    res.status(200).json({
                                        message: "Mail deleted successfully"
                                    })
                                })
                                .catch(err => {
                                    console.log(err);
                                    res.status(500).json({
                                        error: err
                                    });
                                });
                        })
                        .catch((err) => console.log(err))
                })
        });
});

module.exports = router;