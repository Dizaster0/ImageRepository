/**
 * Sends all incoming requests to the images route.
 */
const express = require('express');
const app = express();
const imageRoutes = require('./api/routes/images');

app.use('/images', imageRoutes);

module.exports = app;