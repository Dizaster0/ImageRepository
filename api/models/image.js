const mongoose = require('mongoose');

const imageSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userId: String,
    name: String,
    size: Number
});

module.exports = mongoose.model('Image', imageSchema);