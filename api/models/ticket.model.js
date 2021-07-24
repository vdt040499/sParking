const mongoose = require('mongoose');

const ticketSchema = mongoose.Schema({
    randomCheck: {type: String, require: true, unique: true},
    plate: {type: String, require: true},
    price: {type: Number, require: true, default: 0},
    createdby: {type: mongoose.Schema.Types.ObjectId, required: true}
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);