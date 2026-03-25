const mongoose = require('mongoose');

const consentRecordSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    grantedToId: {
        type: mongoose.Schema.Types.ObjectId, // User, Employer, Bank
        ref: 'User',
        required: true
    },
    credentialId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Credential' // Optional, could be access to specific cred or all
    },
    accessLevel: {
        type: String,
        enum: ['READ', 'FULL'],
        default: 'READ'
    },
    allowedFields: [{
        type: String // Specific fields if selective sharing
    }],
    status: {
        type: String,
        enum: ['ACTIVE', 'REVOKED', 'EXPIRED'],
        default: 'ACTIVE'
    },
    expiresAt: {
        type: Date,
        required: true
    },
    blockchainTxId: String // Immutable proof of consent grant
}, { timestamps: true });

module.exports = mongoose.model('ConsentRecord', consentRecordSchema);
