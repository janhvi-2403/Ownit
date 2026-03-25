const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const Credential = require('../models/Credential');
const { uploadToIPFS } = require('../services/ipfsService');

router.post('/upload-document', upload.single('document'), async (req, res) => {
    try {
        // req.user.id would be set by auth middleware
        const userId = req.body.userId || 'dummy_user_id';
        const { type, authorityId } = req.body;

        if (!req.file) return res.status(400).json({ message: 'No file provided' });

        const ipfsUrl = await uploadToIPFS(req.file.buffer, req.file.originalname);

        const cred = new Credential({
            userId,
            type,
            documentUrl: ipfsUrl,
            status: 'PENDING',
            authorityId,
            metadata: { originalName: req.file.originalname }
        });
        await cred.save();

        // Automatically map a Consent Policy for the verifying authority
        const ConsentRecord = require('../models/ConsentRecord');
        const mongoose = require('mongoose');

        const validOwner = mongoose.Types.ObjectId.isValid(userId) ? userId : new mongoose.Types.ObjectId('000000000000000000000000');
        const validAuthority = mongoose.Types.ObjectId.isValid(authorityId) ? authorityId : new mongoose.Types.ObjectId('222222222222222222222222');

        const consent = new ConsentRecord({
            ownerId: validOwner,
            grantedToId: validAuthority,
            credentialId: cred._id,
            accessLevel: 'READ',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Standard 30 Day limit for Auth
            blockchainTxId: `auth-${cred._id}` 
        });
        await consent.save();

        res.status(201).json({ message: 'Document uploaded to IPFS', credential: cred, consentId: consent._id });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/credentials', async (req, res) => {
    try {
        const creds = await Credential.find().populate('authorityId');
        res.json(creds);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/credentials/:id', async (req, res) => {
    try {
        const cred = await Credential.findById(req.params.id);
        res.json(cred);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/credentials/:id', async (req, res) => {
    try {
        await Credential.findByIdAndDelete(req.params.id);
        res.json({ message: 'Credential removed' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
