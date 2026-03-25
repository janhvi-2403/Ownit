const express = require('express');
const router = express.Router();
const QRCode = require('../models/QRCode');
const QRScan = require('../models/QRScan');
const crypto = require('crypto');
const upload = require('../middleware/uploadMiddleware');

// GENERATE QR
router.post('/generate', async (req, res) => {
    try {
        const { originalResourceId, resourceType, expiresAt } = req.body;
        const qrId = crypto.randomBytes(16).toString('hex');

        const qr = new QRCode({
            originalResourceId,
            resourceType,
            qrId,
            expiresAt,
            isTemporary: !!expiresAt
        });
        await qr.save();

        // Auto-Generate Consent Audit Record tightly coupled to the QR Code ID
        const ConsentRecord = require('../models/ConsentRecord');
        const mongoose = require('mongoose');
        const cred = await require('../models/Credential').findById(originalResourceId);
        
        let validOwner = req.body.userId;
        if (cred && cred.userId) validOwner = cred.userId;
        if (!validOwner || !mongoose.Types.ObjectId.isValid(validOwner)) validOwner = new mongoose.Types.ObjectId('000000000000000000000000');

        const consent = new ConsentRecord({
            ownerId: validOwner,
            grantedToId: new mongoose.Types.ObjectId('111111111111111111111111'), // Flag reserved for Public QR
            credentialId: originalResourceId,
            accessLevel: 'READ',
            expiresAt,
            blockchainTxId: qrId // Tie it irrevocably to the QR ID
        });
        await consent.save();

        // Send back the QR payload block
        res.status(201).json({ message: 'QR Generated', qrId, payload: qr, consentId: consent._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// SCAN QR EVENT
router.post('/scan', async (req, res) => {
    try {
        const { qrId, deviceInfo, coords } = req.body;

        const qr = await QRCode.findOne({ qrId });
        if (!qr) return res.status(404).json({ message: 'Invalid QR Code' });
        if (qr.status !== 'ACTIVE' || (qr.expiresAt && new Date() > qr.expiresAt)) {
            await QRScan.create({ qrId: qr._id, deviceInfo, isSuccessful: false, failureReason: 'Expired or Revoked' });
            return res.status(403).json({ message: 'QR Code Expired or Revoked' });
        }

        await QRScan.create({
            qrId: qr._id,
            deviceInfo,
            scanLocation: coords ? { type: 'Point', coordinates: coords } : undefined
        });

        // Emitting real-time scan alert via Socket.io
        const io = req.app.get('io');
        io.to(qr.originalResourceId.toString()).emit('scan_alert', { message: 'Your credential was just scanned.' });

        res.json({ message: 'Scan successful', resource: qr.originalResourceId, type: qr.resourceType });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// FETCH SECURE DOCUMENT
router.get('/document/:qrId', async (req, res) => {
    try {
        const qr = await QRCode.findOne({ qrId: req.params.qrId });
        if (!qr) return res.status(404).json({ message: 'Invalid QR Link' });
        if (qr.status !== 'ACTIVE' || (qr.expiresAt && new Date() > qr.expiresAt)) {
            return res.status(403).json({ message: 'QR Code Expired or Revoked' });
        }

        // Fetch credential
        const Credential = require('../models/Credential');
        const cred = await Credential.findById(qr.originalResourceId).populate('userId', 'name email');
        if (!cred) return res.status(404).json({ message: 'Document missing' });

        res.json({ credential: cred, qrPayload: qr });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// LOG SECURITY VIOLATION (Phone Detection / Tab Switching)
router.post('/violation/:qrId', async (req, res) => {
    try {
        const qr = await QRCode.findOne({ qrId: req.params.qrId });
        if (!qr) return res.status(404).json({ message: 'Invalid QR Link' });

        // Decrement allowed violations or instantly revoke
        qr.status = 'REVOKED';
        await qr.save();

        const QRScan = require('../models/QRScan');
        await QRScan.create({
            qrId: qr._id,
            isSuccessful: false,
            failureReason: `SECURITY VIOLATION: ${req.body.reason || 'Screen capture device detected'}`
        });

        // Emit real time socket alert
        const io = req.app.get('io');
        io.to(qr.originalResourceId.toString()).emit('security_breach', { message: 'URGENT: Recording device detected capturing your document!' });

        res.json({ message: 'Violation logged and access instantly revoked globally.' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// UPLOAD & SCAN IMAGE
router.post('/verify-upload', upload.single('qrImage'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No image uploaded' });
        res.json({ message: 'QR Image Processed', simulatedData: 'Decoded-Payload-123' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
