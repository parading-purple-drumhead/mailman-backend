const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Mail = require('../models/mail');
const Schedule = require('../models/schedule');


router.get("/", (req, res, next) => {
    Mail.find().exec()
        .then(docs => {
            console.log(docs);
            res.status(200).json(docs);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err })
        })
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
    const mailId = mongoose.Types.ObjectId();

    const mail = new Mail({
        _id: mailId,
        sender: req.body.sender,
        to: req.body.to,
        cc: req.body.cc,
        subject: req.body.subject,
        body: req.body.body,
        type: type,
        time: req.body.time,
        day: req.body.day,
        date: req.body.date,
        month: req.body.month
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
    updateProps = {}
    req.body.forEach(prop => {
        updateProps[prop.propName] = prop.value;
    });
    Mail.updateOne({ _id: mailId }, { $set: updateProps }).exec()
        .then(result => {
            res.status(200).json({
                message: "Mail updated successfully"
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})


router.delete("/:mailId", (req, res, next) => {
    const mailId = req.params.mailId;
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
            })
        });
});

module.exports = router;