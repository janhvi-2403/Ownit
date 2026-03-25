const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['VERIFICATION_COMPLETED', 'CONSENT_REQUEST', 'QR_SCANNED', 'LOAN_OFFER', 'CARBON_SOLD', 'SECURITY_ALERT'],
        required: true
    },
    title: String,
    message: String,
    isRead: {
        type: Boolean,
        default: false
    },
    actionData: mongoose.Schema.Types.Mixed // Link payload
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
