const express = require('express');
const router = express.Router();
const Credential = require('../models/Credential');
const FraudAlert = require('../models/FraudAlert');

// Central DB Cross-Reference simulation
router.post('/central-db', async (req, res) => {
    try {
        const { docType, docNumber } = req.body;
        // Mock external logic with UIDAI/PAN central database
        // In production, this would securely ping the actual government API SOAP/REST endpoints
        setTimeout(() => {
            res.json({
                match: true,
                status: 'VERIFIED_ACTIVE',
                details: {
                    fullName: 'Verified Indian Citizen',
                    registeredRegion: 'Maharashtra / Delhi',
                    issueDate: '2015-08-12'
                }
            });
        }, 800);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// National Verifications Queue
router.get('/pending-national', async (req, res) => {
    try {
        const nationalTypes = ['AADHAAR', 'PAN', 'PASSPORT', 'DL', 'VOTER_ID'];
        const credentials = await Credential.find({ type: { $in: nationalTypes }, status: 'PENDING' }).populate('userId', 'name');
        res.json(credentials);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Issue Official Validation Certificate
router.post('/issue-certificate/:credentialId', async (req, res) => {
    try {
        const cred = await Credential.findById(req.params.credentialId);
        if (!cred) return res.status(404).json({ message: 'Credential not found' });

        cred.status = 'VERIFIED';
        cred.verifiedAt = new Date();

        const { recordVerification } = require('../services/algorandService');
        const simulatedTx = await recordVerification(process.env.AUTHORITY_DUMMY_SK || 'empty', cred._id, 'GOV_CERT_ISSUED');
        cred.blockchainTxId = simulatedTx;

        await cred.save();
        res.json({ message: 'Official Validation Certificate Issued on Algorand', txId: simulatedTx, credential: cred });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Flag Fraudulent Document
router.post('/flag-document', async (req, res) => {
    try {
        const { credentialId, reason, severity } = req.body;
        const cred = await Credential.findById(credentialId);
        if (!cred) return res.status(404).json({ message: 'Credential not found' });

        cred.status = 'FLAGGED';
        await cred.save();

        const alert = new FraudAlert({
            credentialId,
            detectedBy: 'GOVERNMENT',
            alertType: 'FORGERY',
            severity: severity || 'HIGH',
            details: { reason }
        });
        await alert.save();

        res.json({ message: 'Document flagged and suspended globally', alert });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// View Fraud Reports
router.get('/fraud-reports', async (req, res) => {
    try {
        const alerts = await FraudAlert.find({ detectedBy: 'GOVERNMENT' }).populate({ path: 'credentialId', populate: { path: 'userId', select: 'name' } }).sort('-createdAt');
        res.json(alerts);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
