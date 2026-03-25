const mongoose = require('mongoose');

const carbonCreditSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quantity: { // in tons of CO2
        type: Number,
        required: true
    },
    sourceProject: {
        type: String,
        required: true
    },
    vintageYear: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'LISTED', 'RETIRED'],
        default: 'ACTIVE'
    },
    pricePerTon: {
        type: Number // If listed
    },
    algorandAssetId: {
        type: Number, // ASA ID
        required: true
    },
    certificationLink: String // IPFS link to verification cert
}, { timestamps: true });

module.exports = mongoose.model('CarbonCredit', carbonCreditSchema);
