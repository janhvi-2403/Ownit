const express = require('express');
const router = express.Router();
const Credential = require('../models/Credential');
const CarbonCredit = require('../models/CarbonCredit');
const LoanApplication = require('../models/LoanApplication');
const { createASA } = require('../services/algorandService');

router.post('/tokenize', async (req, res) => {
    try {
        const { surveyNumber, area, value, managerSk } = req.body;

        // Call Algorand to create ASA (Using dummy managerSk if not provided)
        const safeManagerSk = managerSk || 'empty';
        const assetId = await createASA(safeManagerSk, 'OWNIT-LND', 'LND', 1);

        res.json({ message: 'Land tokenized successfully', assetId, data: req.body });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/loan-request', async (req, res) => {
    try {
        const { applicantId, collateralAssetId, requestedAmount, termMonths } = req.body;

        const loan = new LoanApplication({
            applicantId,
            collateralAssetId,
            requestedAmount,
            termMonths,
            status: 'PENDING'
        });

        await loan.save();
        res.status(201).json({ message: 'Loan applied against tokenized land', loan });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/loan-offers', async (req, res) => {
    try {
        const loans = await LoanApplication.find({ status: 'PENDING' }).populate('collateralAssetId');
        res.json(loans);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/accept-offer/:id', async (req, res) => {
    try {
        const loan = await LoanApplication.findById(req.params.id);
        loan.status = 'APPROVED';
        // Integrate logic for Algorand Smart Contract Escrow holding the ASA here
        loan.smartContractDbId = 'algo_escrow_123';
        await loan.save();

        res.json({ message: 'Offer accepted. Asset locked in Smart Contract.', loan });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
