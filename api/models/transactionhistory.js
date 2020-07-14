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

transactionSchema.index(
  { user: 1, bank: 1, cardnumbersliced: 1, balance: 1 },
  { unique: true }
);

module.exports = mongoose.model('TransactionHistory', transactionSchema);
