const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/user')

router.post("/",(req,res,next)=>{
    const user = new User({
        _id: req.body.email,
        displayName: req.body.displayName
    })
    user.save().then((res)=>{
        res.status(200).json({message:"user added"})
    })
})

router.get("/:userMail",(req,res,next)=>{
    const usermail = req.params.userMail
    User.findById(usermail).exec()
    .then((user)=>{
        res.status(200).json({user:user})
    })
})

module.exports = router;