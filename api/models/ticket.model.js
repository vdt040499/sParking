const mongoose = require('mongoose');

const ticketSchema = mongoose.Schema({
    randomCheck: {type: String, require: true},
    createdby: {type: mongoose.Schema.Types.ObjectId, required: true}
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);