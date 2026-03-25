const mongoose = require('mongoose');

const credentialSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String, // 'DEGREE', 'HEALTH_RECORD', 'LAND_RECORD', 'AADHAAR', etc.
        required: true
    },
    documentUrl: {
        type: String, // IPFS Hash or Cloud URL
        required: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed // JSON field
    },
    status: {
        type: String,
        enum: ['PENDING', 'VERIFIED', 'REJECTED', 'FLAGGED'],
        default: 'PENDING'
    },
    fraudScore: {
        type: Number, // 0-100 from AI Pre-Screening
        default: 0
    },
    verificationHash: {
        type: String // On-chain hash after verification
    },
    blockchainTxId: {
        type: String // Algorand transaction ID
    },
    authorityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Authority'
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId, // The verification officer / admin
        ref: 'User'
    },
    rejectionReason: String,
    verifiedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Credential', credentialSchema);
