const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  username: { type: String, required: true },
  password: { type: String, required: true },
  oldpass: { type: String, required: false },
  newpass: { type: String, required: false },
  ID: { type: String, required: true },
  position: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
  },
  userImage: { type: String },
  plates: [{ type: String }],
  tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }],
  amount: { type: Number, required: false },
  resetToken: { type: String, required: false },
  amount: { type: Number, required: false },
  resetTokenExpires: { type: Date, required: false },
  balance: {
    type: Number,
    min: 0,
    required: true,
    default: 0,
  },
});

module.exports = mongoose.model('User', userSchema);
