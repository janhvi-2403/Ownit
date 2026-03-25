const mongoose = require('mongoose');

const qrScanSchema = new mongoose.Schema({
    qrId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QRCode',
        required: true
    },
    scannedBy: {
        type: mongoose.Schema.Types.ObjectId, // Optional user ID if scanned logged in
        ref: 'User'
    },
    scanLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number] // [longitude, latitude]
        } // GeoJSON
    },
    deviceInfo: String, // Web, Android, iOS
    isSuccessful: {
        type: Boolean,
        default: true
    },
    failureReason: String // e.g. Expired, Revoked
}, { timestamps: true });

// Index for geo-spatial queries
qrScanSchema.index({ scanLocation: '2dsphere' });

module.exports = mongoose.model('QRScan', qrScanSchema);
