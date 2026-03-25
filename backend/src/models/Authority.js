const mongoose = require('mongoose');

const authoritySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['COLLEGE', 'HOSPITAL', 'LAND_OFFICE', 'GOVERNMENT', 'BANK', 'CARBON_BUYER', 'EMPLOYER'],
        required: true
    },
    emailDomain: {
        type: String, // For auto-assignment e.g., @iitm.ac.in
        required: true,
        unique: true
    },
    contactEmail: {
        type: String,
        required: true
    },
    verificationCapacity: {
        type: Number,
        default: 100 // per day
    },
    isActive: {
        type: Boolean,
        default: true
    },
    metrics: {
        totalVerified: {
            type: Number,
            default: 0
        },
        totalRejected: {
            type: Number,
            default: 0
        },
        averageTimeMs: {
            type: Number,
            default: 0
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('Authority', authoritySchema);
