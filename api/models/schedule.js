const mongoose = require('mongoose');

const scheduleSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    _30secs: {type: [mongoose.Schema.Types.ObjectId], ref: 'Mail'},
    Weekly: mongoose.Schema.Types.Mixed,
    Monthly:mongoose.Schema.Types.Mixed,
    Yearly: mongoose.Schema.Types.Mixed,
});


module.exports = mongoose.model('Schedule', scheduleSchema);