const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);

// =======================
// SOCKET.IO SETUP
// =======================
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || '*', // better than *
        methods: ['GET', 'POST']
    }
});

// =======================
// MIDDLEWARE
// =======================
app.use(express.json());

app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));

app.use(helmet());
app.use(morgan('dev'));

// =======================
// DATABASE
// =======================
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ownit')
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Error:', err));

// =======================
// HEALTH CHECK
// =======================
app.get('/', (req, res) => {
    res.json({ message: 'OwnIt API Running 🚀' });
});

// =======================
// ROUTES
// =======================
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/qr', require('./src/routes/qrRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use('/api/authority', require('./src/routes/authorityRoutes'));
app.use('/api/citizen', require('./src/routes/citizenRoutes'));
app.use('/api/consent', require('./src/routes/consentRoutes'));
app.use('/api/tokenization', require('./src/routes/tokenizationRoutes'));
app.use('/api/government', require('./src/routes/governmentRoutes'));
app.use('/api/verification', require('./src/routes/verificationRoutes'));
app.use('/api/carbon', require('./src/routes/carbonRoutes'));
app.use('/api/insights', require('./src/routes/insightsRoutes'));
app.use('/api/detection', require('./src/routes/detectionRoutes'));

// =======================
// SOCKET EVENTS
// =======================
app.set('io', io);

io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    socket.on('join_dashboard', (userId) => {
        socket.join(userId);
    });

    socket.on('disconnect', () => {
        console.log('❌ Client disconnected:', socket.id);
    });
});

// =======================
// 404 HANDLER (API only)
// =======================
app.use((req, res) => {
    res.status(404).json({ message: 'API Route Not Found' });
});

// =======================
// SERVER START
// =======================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
