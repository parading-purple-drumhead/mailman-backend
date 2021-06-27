const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/user')

router.post("/", (req, res, next) => {
    const user = new User({
        _id: req.body._id,
        displayName: req.body.displayName
    })
    user.save().then(() => {
        res.status(200).json({ message: "User added successfully" })
    }).catch(err => res.status(500).json({ error: "Users already exists" }))
})

router.get("/:userMail", (req, res, next) => {
    const usermail = req.params.userMail
    User.findById(usermail).exec()
        .then((user) => {
            res.status(200).json({ user: user })
        })
})

module.exports = router;