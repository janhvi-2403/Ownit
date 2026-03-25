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

// Websocket for real-time notifications
const io = new Server(server, {
    cors: { origin: '*' } // In production, restrict to frontend URLs
});

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ownit')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Temporary root
app.get('/', (req, res) => res.send('OwnIt API Running'));

// Mount Routes
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

// Socket.io injection
app.set('io', io);
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('join_dashboard', (userId) => {
        socket.join(userId);
    });
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
