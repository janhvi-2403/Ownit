const mongoose = require('mongoose');

const verificationRequestSchema = new mongoose.Schema({
    credentialId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Credential',
        required: true
    },
    authorityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Authority',
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId, // Optional specific verification officer
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['QUEUED', 'IN_PROGRESS', 'COMPLETED', 'FAILED'],
        default: 'QUEUED'
    },
    notes: String,
    completedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('VerificationRequest', verificationRequestSchema);
