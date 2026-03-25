const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    action: {
        type: String, // e.g., 'VERIFY_DOCUMENT', 'GRANT_CONSENT', 'TOKENIZE_ASSET'
        required: true
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetResource: {
        resourceType: String, // 'Credential', 'ConsentRecord', 'CarbonCredit'
        resourceId: mongoose.Schema.Types.ObjectId
    },
    details: {
        type: mongoose.Schema.Types.Mixed // JSON metadata
    },
    blockchainTxId: {
        type: String, // Algorand hash
        required: true
    },
    ipAddress: String,
    userAgent: String
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
