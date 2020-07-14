const mongoose = require('mongoose');

const moneySourceSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  name: {
    type: String,
  },
  bank: {
    type: String,
  },
  cardnumbersliced: {
    type: String,
  },
});

moneySourceSchema.index(
  { user: 1, bank: 1, cardnumbersliced: 1, balance: 1 },
  { unique: true }
);

module.exports = mongoose.model('MoneySource', moneySourceSchema);
