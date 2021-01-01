const express = require('express');
const app = express();

// Middleware used for logging HTTP requests and errors.
const morgan = require('morgan');

// Allows to parse request bodies
const bodyParser = require('body-parser');

// MongoDB connection
const mongoose = require('mongoose');

const imageRoutes = require('./api/routes/images');

mongoose.connect('mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use('/images', imageRoutes);
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;