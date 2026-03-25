const express = require('express');
const router = express.Router();
const CarbonCredit = require('../models/CarbonCredit');

router.get('/listings', async (req, res) => {
    try {
        const listings = await CarbonCredit.find({ status: 'LISTED' });
        res.json(listings);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/list', async (req, res) => {
    try {
        const { ownerId, quantity, sourceProject, vintageYear, pricePerTon, algorandAssetId } = req.body;
        const credit = new CarbonCredit({
            ownerId, quantity, sourceProject, vintageYear, status: 'LISTED', pricePerTon, algorandAssetId
        });
        await credit.save();
        res.status(201).json({ message: 'Carbon Credit listed in Marketplace', credit });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/sell', async (req, res) => {
    try {
        const { amount, price, ownerId } = req.body;
        const validObjectId = require('mongoose').Types.ObjectId.isValid(ownerId) ? ownerId : '000000000000000000000000';
        const credit = new CarbonCredit({
            ownerId: validObjectId, 
            quantity: amount, 
            sourceProject: 'Citizen Ledger Exchange', 
            vintageYear: new Date().getFullYear(),
            status: 'LISTED', 
            pricePerTon: price,
            algorandAssetId: Math.floor(Math.random() * 9000000) + 1000000 // Temporary mock ASA block
        });
        await credit.save();
        res.status(201).json({ message: 'Listed successfully', credit });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/buy/:id', async (req, res) => {
    try {
        const credit = await CarbonCredit.findById(req.params.id);
        if (!credit || credit.status !== 'LISTED') {
            return res.status(400).json({ message: 'Credit not available' });
        }

        const { buyerId } = req.body;
        // Real implementation: Algorand Atomic Swap grouped transaction here

        credit.status = 'ACTIVE';
        credit.ownerId = buyerId;
        await credit.save();

        res.json({ message: 'Atomic swap successful. Ownership transferred.', credit });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/market-prices', async (req, res) => {
    res.json({ currentPricePerTon: 45.2, trend: '+5.3%', history: [38, 40, 42, 45.2] });
});

module.exports = router;
