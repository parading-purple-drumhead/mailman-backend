const mongoose = require('mongoose');

const userSchema= mongoose.Schema({
    _id: {type: String, required: true},
    displayName: {type: String, required: true}
})

module.exports = mongoose.model('User', userSchema);