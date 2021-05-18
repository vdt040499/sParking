const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    plateText: {type: String, required: true},
    createdby: {type: mongoose.Schema.Types.ObjectId, required: true, unique: true}
}, { timestamps: true });

module.exports = mongoose.model('Ticket', productSchema);