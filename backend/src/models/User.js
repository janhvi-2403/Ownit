const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['SUPER_ADMIN', 'AUTHORITY_ADMIN', 'GOVERNMENT_AUTHORITY', 'CITIZEN', 'EMPLOYER', 'BANK', 'CARBON_BUYER', 'VERIFICATION_OFFICER'],
    default: 'CITIZEN'
  },
  phoneNumber: {
    type: String
  },
  algorandAddress: {
    type: String, // Each user gets a wallet
    unique: true,
    sparse: true
  },
  profileCompleteness: {
    type: Number,
    default: 0
  },
  // If user is part of an authority (Authority Admin, Verification Officer)
  authorityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Authority'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
