const express = require('express');
const router = express.Router();
const ConsentRecord = require('../models/ConsentRecord');
const crypto = require('crypto');

router.post('/grant', async (req, res) => {
    try {
        const { ownerId, grantedToId, credentialId, accessLevel, expiresAt } = req.body;

        // Simulating Blockchain Consent Tx
        const blockchainTxId = `ctx-${crypto.randomBytes(12).toString('hex')}`;

        const consent = new ConsentRecord({
            ownerId,
            grantedToId,
            credentialId,
            accessLevel,
            expiresAt: new Date(expiresAt),
            blockchainTxId
        });

        await consent.save();
        res.status(201).json({ message: 'Consent granted securely', consent });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
    try {
        const consent = await ConsentRecord.findById(req.params.id);
        if (!consent) return res.status(404).json({ message: 'Not found' });

        consent.status = 'REVOKED';
        await consent.save();

        if (consent.blockchainTxId) {
            if (consent.blockchainTxId.startsWith('auth-')) {
                // If it was an authority upload, instantly yank it physically from their pending inspection queue!
                const Credential = require('../models/Credential');
                await Credential.findByIdAndUpdate(consent.credentialId, { status: 'REJECTED' });
            } else {
                // Otherwise it's a dynamic QR code sharing link
                const QRCode = require('../models/QRCode');
                await QRCode.updateMany({ qrId: consent.blockchainTxId }, { status: 'REVOKED' });
            }
        }

        res.json({ message: 'Consent revoked', consent });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/active', async (req, res) => {
    try {
        const consents = await ConsentRecord.find({ status: 'ACTIVE' });
        // Filter active relative to expiry date
        const valid = consents.filter(c => c.expiresAt > new Date()).map(c => ({
            _id: c._id,
            granteeName: c.grantedToId.toString() === '111111111111111111111111' ? 'Public QR Share Link' : (c.blockchainTxId?.startsWith('auth-') ? 'Authority Verification' : 'Secure Request'),
            level: c.accessLevel,
            expiry: c.expiresAt
        }));
        res.json(valid);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
