const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
    originalResourceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true // Can be Credential, CarbonAsset, Authority (for bulk)
    },
    resourceType: {
        type: String, // 'Credential', 'CarbonCredit'
        required: true
    },
    qrId: {
        type: String, // unique encrypted string
        required: true,
        unique: true
    },
    verificationHash: String, // Copy for quick access
    blockchainTxId: String,   // Copy for quick access
    issuerWallet: String,
    signature: String, // Digital signature of the payload
    status: {
        type: String,
        enum: ['ACTIVE', 'REVOKED', 'EXPIRED'],
        default: 'ACTIVE'
    },
    expiresAt: {
        type: Date // Time-based access QR
    },
    isTemporary: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('QRCode', qrCodeSchema);
