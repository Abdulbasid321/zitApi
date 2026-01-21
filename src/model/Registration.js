const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true
    },
    program: {
      type: String,
      required: true
    },
    accountNumber: {
      type: String,
      required: true
    },
    accountName: {
      type: String,
      required: true
    },
    verificationCode: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Registration', registrationSchema);
