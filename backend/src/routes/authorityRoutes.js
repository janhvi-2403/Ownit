const express = require('express');
const router = express.Router();
const Credential = require('../models/Credential');
const Authority = require('../models/Authority');
const User = require('../models/User');
const VerificationRequest = require('../models/VerificationRequest');
const { recordVerification, createWallet } = require('../services/algorandService');
const bcrypt = require('bcryptjs');

// Helper to get Authority from Admin Email
const getAuthorityByEmail = async (email) => {
    let auth = await Authority.findOne({ contactEmail: email });
    if (!auth && email && email.includes('@')) {
        const domain = email.split('@')[1];
        auth = await Authority.findOne({ emailDomain: domain });
    }
    return auth;
};

// Get Pending Queue filtered by Authority
router.get('/pending-verifications', async (req, res) => {
    try {
        const { email } = req.query;
        const auth = await getAuthorityByEmail(email);
        if (!auth) return res.status(404).json({ error: 'Authority not found for user' });

        const credentials = await Credential.find({ authorityId: auth._id, status: 'PENDING' }).populate('userId', 'name');
        res.json(credentials);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Verify Document
router.post('/verify/:credentialId', async (req, res) => {
    try {
        const cred = await Credential.findById(req.params.credentialId);
        if (!cred) return res.status(404).json({ message: 'Not found' });

        cred.status = 'VERIFIED';
        cred.verifiedAt = new Date();
        const simulatedTx = await recordVerification(process.env.AUTHORITY_DUMMY_SK || 'empty', cred._id, 'VERIFIED_HASH');
        cred.blockchainTxId = simulatedTx;

        await cred.save();
        res.json({ message: 'Credential successfully verified on Algorand', txId: simulatedTx, credential: cred });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Reject Document
router.post('/reject/:credentialId', async (req, res) => {
    try {
        const cred = await Credential.findById(req.params.credentialId);
        cred.status = 'REJECTED';
        cred.rejectionReason = req.body.reason || 'Data mismatch found';
        await cred.save();
        res.json({ message: 'Credential rejected', credential: cred });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Real Statistics
router.get('/stats', async (req, res) => {
    try {
        const { email } = req.query;
        const auth = await getAuthorityByEmail(email);
        if (!auth) return res.json({ verified: 0, pending: 0, rejected: 0 });

        const verified = await Credential.countDocuments({ authorityId: auth._id, status: 'VERIFIED' });
        const pending = await Credential.countDocuments({ authorityId: auth._id, status: 'PENDING' });
        const rejected = await Credential.countDocuments({ authorityId: auth._id, status: 'REJECTED' });

        res.json({ verified, pending, rejected });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Manage Staff
router.get('/staff', async (req, res) => {
    try {
        const { email } = req.query;
        const auth = await getAuthorityByEmail(email);
        if (!auth) return res.json([]);
        // We find users assigned to this authority by matching email domain
        const users = await User.find({ role: 'VERIFICATION_OFFICER', email: new RegExp(auth.emailDomain + '$', 'i') }).select('-password');
        res.json(users);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/staff', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const wallet = createWallet();
        const user = new User({
            name, email, password: hashedPassword, role: 'VERIFICATION_OFFICER', algorandAddress: wallet.address
        });
        await user.save();
        res.status(201).json(user);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
