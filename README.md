🚀 OwnIt – India’s Digital Ownership Wallet

OwnIt is a next-generation digital ownership and verification platform designed for India. It enables secure storage, verification, and sharing of credentials, land assets, and carbon credits using blockchain + AI-powered validation.

🌟 Key Features
🔐 Secure Digital Vault for documents & credentials
📜 Blockchain Integration (Algorand) for immutability
🤖 AI-Based Verification & Fraud Detection
📱 Real-Time Mobile/Camera Detection (TFJS + COCO-SSD)
🔳 QR Code Sharing & Verification System
🏦 Land Tokenization & Loan Support
🌱 Carbon Credit Marketplace
👥 8 Role-Based User System
⚡ Real-time Alerts via WebSockets
🧠 AI Innovation (Highlight Feature)

We implemented browser-based AI using TensorFlow.js instead of traditional Python ML.

🔍 Mobile Detection System
Uses @tensorflow/tfjs + @tensorflow-models/coco-ssd
Detects "cell phone" objects in real-time
Runs directly in browser (no backend needed)
Triggers:
🚫 Document access block
📢 Owner alert via WebSocket
📸 Evidence capture

💡 This ensures document protection against photography leaks

🏗️ Tech Stack
🔹 Backend
Node.js + Express.js
MongoDB + Mongoose
Socket.IO (real-time)
Algorand SDK (blockchain)
IPFS (decentralized storage)
🔹 Frontend (Web)
React + Vite
Tailwind CSS (Glassmorphism UI)
TensorFlow.js + COCO-SSD
React Router
🔹 Mobile App
React Native + Expo
Expo Camera
SecureStore + Biometrics
📁 Project Structure
OwnIt/
│
├── backend/        # Node.js API + DB + Blockchain
├── frontend/       # React Web App + AI Detection
├── mobile/         # React Native App
⚙️ Setup Instructions
🔧 Prerequisites
Node.js (v18+)
MongoDB (local)
Expo CLI
OpenRouter API Key
🖥️ 1. Backend Setup
cd backend

Create .env file:

PORT=5000
MONGODB_URI=mongodb://localhost:27017/ownit
JWT_SECRET=supersecret
OPENROUTER_API_KEY=your_key_here
ALGOD_SERVER=https://testnet-api.algonode.cloud

Seed database:

node src/scripts/seed.js

Start server:

node server.js
🌐 2. Frontend Setup
cd frontend
npm install
npm run dev

App runs at:

http://localhost:5173
📱 3. Mobile App
cd mobile
npm install
npx expo start
👤 Demo Credentials
Email: admin@ownit.gov.in
Password: password123
🔳 QR Code System
Each verified credential generates a secure QR
Features:
Encrypted data (AES-256)
Expiry-based access
Scan analytics
Share via WhatsApp / Email
🛡️ Document Protection System
❌ Screenshot disabled
❌ Right-click blocked
❌ Print disabled
👁️ Dynamic + Invisible watermarks
📷 Camera detection using AI
⏱️ Session timeout
🔔 Real-time violation alerts
👥 User Roles (8 Types)
Super Admin
Authority Admin
Government Authority
Citizen/User
Employer
Bank
Carbon Buyer
Verification Officer
🔗 Blockchain Features
Land tokenization (ASA tokens)
Carbon credit trading
Immutable credential verification
Smart contracts (escrow + atomic swaps)
📊 Database (15 Collections)

Includes:

Users
Credentials
QR Codes
Audit Logs
Fraud Alerts
Carbon Credits
Loan Applications
Consent Records
🚀 Why This Project Stands Out
⚡ No Python ML server required (browser AI)
🔐 End-to-end secure document lifecycle
🇮🇳 Built specifically for Indian ecosystem
🔗 Real blockchain integration (not mock)
📱 Cross-platform (Web + Mobile)
🏁 Future Scope
Aadhaar / DigiLocker integration
Face recognition verification
Government API integrations
AI model training improvements
Multi-language support
🤝 Contributors
Janhvi Pagare
Harshkumar Bhavsar
