const mongoose = require('mongoose');

const mailSchema = mongoose.Schema({
    // _id: mongoose.Schema.Types.ObjectId,
    _id: {type: String, required: true},
    sender: { type: String, required: true },
    displayName: { type: String, required: true },
    to: { type: [String], required: true },
    cc: { type: [String], required: true },
    bcc: { type: [String], required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    type: { type: String, required: true },
    time: { type: String, required: false },
    day: { type: String, required: false },
    date: { type: String, required: false },
    month: { type: String, required: false },
    last_sent: { type: String, required: false },
});


module.exports = mongoose.model('Mail', mailSchema);