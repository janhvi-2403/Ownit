const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { createWallet } = require('../services/algorandService');

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, phoneNumber } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        // Algorand Integration: Generate a wallet for the user
        const wallet = createWallet();

        user = new User({
            name, email, password: hashedPassword, role, phoneNumber, algorandAddress: wallet.address
        });
        await user.save();

        // In a real app we'd securely return the mnemonic once or send it to them
        // Here we omit it in the DB, only storing the address.
        res.status(201).json({ message: 'User registered', address: wallet.address, mnemonic_backup: wallet.mnemonic });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, process.env.JWT_SECRET || 'secret123', { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, algorandAddress: user.algorandAddress } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 🔥 TEMP ROUTE - CREATE SUPER ADMIN
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

module.exports = router;
