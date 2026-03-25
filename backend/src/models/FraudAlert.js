const mongoose = require('mongoose');

const fraudAlertSchema = new mongoose.Schema({
    credentialId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Credential'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId, // User who triggered alert
        ref: 'User'
    },
    detectedBy: {
        type: String, // 'AI_MODEL', 'AUTHORITY', 'GOVERNMENT'
        required: true
    },
    alertType: {
        type: String, // 'FORGERY', 'MOBILE_SCREENSHOT', 'MULTIPLE_FAILED_SCANS'
        required: true
    },
    severity: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        default: 'MEDIUM'
    },
    details: mongoose.Schema.Types.Mixed,
    resolutionStatus: {
        type: String, // 'OPEN', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE'
        default: 'OPEN'
    }
}, { timestamps: true });

module.exports = mongoose.model('FraudAlert', fraudAlertSchema);
