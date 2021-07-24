const mongoose = require('mongoose');

const spaceSchema = mongoose.Schema({
    name: {type: String},
    totalSlots: {type: Number},
    parked: {type: Number},
    avai: {type: Number},
    ticketPrice: {type: Number}
});

module.exports = mongoose.model('Spaces', spaceSchema);