const mongoose = require('mongoose');

const imageSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    image: {type: String, required: true},
    size: Number
});

module.exports = mongoose.model('Image', imageSchema);