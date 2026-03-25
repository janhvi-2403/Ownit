const mongoose = require('mongoose');

const loanApplicationSchema = new mongoose.Schema({
    applicantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bankId: {
        type: mongoose.Schema.Types.ObjectId, // Bank User ID or Authority ID
        ref: 'User'
    },
    collateralAssetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Credential', // A VERIFIED LAND_RECORD
        required: true
    },
    requestedAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'DISBURSED', 'REPAID'],
        default: 'PENDING'
    },
    interestRate: Number,
    termMonths: Number,
    smartContractDbId: String, // Algorand escrow setup
    repaymentSchedule: [{
        dueDate: Date,
        amount: Number,
        isPaid: Boolean
    }]
}, { timestamps: true });

module.exports = mongoose.model('LoanApplication', loanApplicationSchema);
