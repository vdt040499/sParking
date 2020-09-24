const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    plateText: {type: String, required: false},
    createdby: {type: mongoose.Schema.Types.ObjectId, required: true}
});

module.exports = mongoose.model('Ticket', productSchema);