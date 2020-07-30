const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  note: { type: String },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
  },
  amount: {
    type: String,
  },
});

module.exports = mongoose.model('TransactionHistory', transactionSchema);
