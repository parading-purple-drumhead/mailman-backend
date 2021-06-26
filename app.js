const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

const mailsRoute = require('./api/routes/mails');

mongoose.connect('mongodb+srv://basu:' + process.env.MONGO_ATLAS_PWD + '@mailman-db.xrpii.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', { useNewUrlParser: true });

app.use(morgan('dev'));
app.use(express.json());
app.use(cors());

app.use('/mails', mailsRoute);

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
        error: {
            message: error.message
        }
    })
})

module.exports = app;