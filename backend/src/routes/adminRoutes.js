const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Authority = require('../models/Authority');
const AuditLog = require('../models/AuditLog');
const FraudAlert = require('../models/FraudAlert');
const Credential = require('../models/Credential');
const { createWallet } = require('../services/algorandService');


router.get('/init-super-admin', async (req, res) => {
    try {
        const existing = await User.findOne({ role: 'SUPER_ADMIN' });

        if (existing) {
            return res.json({ message: "Admin already exists" });
        }

        const hashedPassword = await bcrypt.hash("password123l", 10);

        const admin = await User.create({
            name: "Super Admin",
            email: "admin@ownit.gov.in",
            password: hashedPassword,
            role: "SUPER_ADMIN"
        });

        res.json({ message: "SUPER_ADMIN created", admin });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Admin Auth Middleware (omitted for brevity during testing)

// View all authorities
router.get('/authorities', async (req, res) => {
    try {
        const authorities = await Authority.find();
        res.json(authorities);
    } catch (err) { res.status(500).json({ error: err.message }); }
});


// Add new authority and automatically create the admin user
router.post('/authorities', async (req, res) => {
    try {
        const { name, domain, type, email, password } = req.body;

        // 1. Create Authority
        const authority = new Authority({
            name,
            emailDomain: domain,
            type: type.toUpperCase(),
            contactEmail: email
        });
        await authority.save();

        // 2. Derive User Role from Authority Type
        let baseRole = 'AUTHORITY_ADMIN';
        if (type.toUpperCase() === 'BANK') baseRole = 'BANK';
        else if (type.toUpperCase() === 'CARBON_BUYER') baseRole = 'CARBON_BUYER';
        else if (type.toUpperCase() === 'GOVERNMENT') baseRole = 'GOVERNMENT_AUTHORITY';
        else if (type.toUpperCase() === 'EMPLOYER') baseRole = 'EMPLOYER';

        // 3. Create the associated Admin User for that Authority
        const hashedPassword = await bcrypt.hash(password, 10);
        const wallet = createWallet();

        const user = new User({
            name: `${name} Admin`,
            email: email,
            password: hashedPassword,
            role: baseRole,
            algorandAddress: wallet.address
        });
        await user.save();

        res.status(201).json({ message: 'Authority and User generated successfully!', authority });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Suspend or Activate authority
router.put('/authorities/:id/status', async (req, res) => {
    try {
        const { isActive } = req.body;
        const authority = await Authority.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
        res.json({ message: `Authority status updated to ${isActive ? 'Active' : 'Suspended'}`, authority });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete authority
router.delete('/authorities/:id', async (req, res) => {
    try {
        await Authority.findByIdAndDelete(req.params.id);
        res.json({ message: 'Authority successfully removed.' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// View system-wide analytics
router.get('/system-stats', async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const authorityCount = await Authority.countDocuments();
        const credCount = await Credential.countDocuments();
        res.json({ totalUsers: userCount, totalAuthorities: authorityCount, totalCredentials: credCount });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// View Audit Logs
router.get('/audit-logs', async (req, res) => {
    try {
        const logs = await AuditLog.find().sort('-createdAt').limit(50);
        res.json(logs);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// View Fraud Reports
router.get('/fraud-reports', async (req, res) => {
    try {
        const alerts = await FraudAlert.find().sort('-createdAt').limit(20);
        res.json(alerts);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
