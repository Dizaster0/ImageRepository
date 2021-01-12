const express = require('express');
const app = express();

// Middleware used for logging HTTP requests and errors.
const morgan = require('morgan');

// Allows to parse request bodies
const bodyParser = require('body-parser');

// MongoDB connection
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://Dizaster:K1NGD0M@dizaster.2fpmc.mongodb.net/ImageRepository?authSource=admin&replicaSet=Dizaster-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const imageRoutes = require('./api/routes/imageRoutes');

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