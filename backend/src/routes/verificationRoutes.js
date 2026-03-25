const express = require('express');
const router = express.Router();
const VerificationRequest = require('../models/VerificationRequest');
const Credential = require('../models/Credential');

router.post('/verify-credential', async (req, res) => {
    try {
        const { documentHash, authoritySignature } = req.body;
        // Verification against Algorand Blockchain Mock
        const cred = await Credential.findOne({ verificationHash: documentHash });
        if (!cred) return res.status(404).json({ valid: false });

        res.json({ valid: true, credential: cred });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/request-verification', async (req, res) => {
    try {
        const { credentialId, authorityId } = req.body;
        const reqV = new VerificationRequest({ credentialId, authorityId });
        await reqV.save();
        res.status(201).json({ message: 'Verification requested', request: reqV });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/history', async (req, res) => {
    try {
        const history = await VerificationRequest.find().sort('-createdAt').populate('credentialId');
        res.json(history);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
