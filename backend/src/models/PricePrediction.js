const mongoose = require('mongoose');

const pricePredictionSchema = new mongoose.Schema({
    assetType: {
        type: String, // 'CARBON_CREDIT', 'LAND_VALUE'
        required: true
    },
    currentPrice: Number,
    predictedPrice1Month: Number,
    predictedPrice6Months: Number,
    predictedPrice12Months: Number,
    confidenceScore: Number, // 0-100
    factors: [String],
    generatedAt: {
        type: Date,
        default: Date.now
    }
}); // No timestamps needed.

module.exports = mongoose.model('PricePrediction', pricePredictionSchema);
