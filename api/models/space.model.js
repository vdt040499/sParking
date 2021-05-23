const mongoose = require('mongoose');

const spaceSchema = mongoose.Schema({
    name: {type: String},
    parked: {type: Number, default: 0},
    avai: {type: Number, default: 500},
    date: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true });

module.exports = mongoose.model('Spaces', spaceSchema);