const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  month: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  unitsConsumed: {
    type: Number,
    default: 0
  },
  amountDue: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Bill', billSchema);