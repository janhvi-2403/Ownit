const mongoose = require('mongoose');

const qrAnalyticsSchema = new mongoose.Schema({
    qrId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QRCode',
        required: true,
        unique: true
    },
    totalScans: {
        type: Number,
        default: 0
    },
    uniqueDevices: {
        type: Number,
        default: 0
    },
    successfulScans: {
        type: Number,
        default: 0
    },
    failedScans: {
        type: Number,
        default: 0
    },
    lastScannedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('QRAnalytics', qrAnalyticsSchema);
