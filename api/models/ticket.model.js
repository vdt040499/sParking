const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    randomCheck: {type: String, require: true},
    user: {type: mongoose.Schema.Types.ObjectId, required: true}
}, { timestamps: true });

module.exports = mongoose.model('Ticket', productSchema);