const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const imageRoutes = require('./api/routes/imageRoutes');
const userRoutes = require('./api/routes/userRoutes');
require('dotenv').config()
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use('/images', imageRoutes);
app.use('/user', userRoutes);
app.use((req, res, next) => {
    const error = new Error('Please enter a valid HTTP request as defined in README.md');
    error.status = 404;
    next(error);
});

module.exports = app;