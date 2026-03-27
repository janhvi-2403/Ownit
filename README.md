# 🚀 OwnIt – India’s Digital Ownership Wallet

OwnIt is a **next-generation digital ownership and verification platform** designed for India.  
It enables secure storage, verification, and sharing of credentials, land assets, and carbon credits using **blockchain + AI-powered validation**.

---

## 🌟 Key Features

- 🔐 Secure Digital Vault for documents & credentials  
- 📜 Blockchain Integration (Algorand) for immutability  
- 🤖 AI-Based Verification & Fraud Detection  
- 📱 Real-Time Mobile/Camera Detection (TFJS + COCO-SSD)  
- 🔳 QR Code Sharing & Verification System  
- 🏦 Land Tokenization & Loan Support  
- 🌱 Carbon Credit Marketplace  
- 👥 8 Role-Based User System  
- ⚡ Real-time Alerts via WebSockets  

---

## 🧠 AI Innovation (Highlight Feature)

We implemented **browser-based AI using TensorFlow.js** instead of traditional Python ML.

### 🔍 Mobile Detection System

- Uses `@tensorflow/tfjs` and `@tensorflow-models/coco-ssd`  
- Detects **"cell phone" objects in real-time**  
- Runs directly in the browser (no backend required)  

**Triggers:**
- 🚫 Document access block  
- 📢 Owner alert via WebSocket  
- 📸 Evidence capture  

💡 Ensures **document protection against photography leaks**

---

## 🏗️ Tech Stack

### 🔹 Backend
- Node.js  
- Express.js  
- MongoDB + Mongoose  
- Socket.IO  
- Algorand SDK  
- IPFS  

### 🔹 Frontend (Web)
- React + Vite  
- Tailwind CSS (Glassmorphism UI)  
- TensorFlow.js + COCO-SSD  
- React Router  

### 🔹 Mobile App
- React Native + Expo  
- Expo Camera  
- SecureStore  
- Biometric Authentication  

---

## 📁 Project Structure


OwnIt/
│
├── backend/ # Node.js API + Database + Blockchain
├── frontend/ # React Web App + AI Detection
├── mobile/ # React Native Application

---

## ⚙️ Setup Instructions

### 🔧 Prerequisites

- Node.js (v18+)  
- MongoDB (running locally on port 27017)  
- Expo CLI  
- OpenRouter API Key  

---

### 🖥️ Backend Setup

```bash
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
🌐 Frontend Setup
cd frontend
npm install
npm run dev

App runs at:

http://localhost:5173
📱 Mobile App Setup
cd mobile
npm install
npx expo start
👤 Demo Credentials
Email: admin@ownit.gov.in  
Password: password123
🔳 QR Code System
Each verified credential generates a secure QR code
AES-256 encrypted data
Expiry-based access control
Share via WhatsApp, Email, or Link
Scan analytics (location, device, count)
🛡️ Document Protection System
❌ Screenshot disabled
❌ Right-click disabled
❌ Print disabled
👁️ Dynamic + Invisible watermarks
📷 AI-based camera detection
⏱️ Session timeout
🔔 Real-time alerts on violations
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
Land tokenization (Algorand ASA)
Carbon credit trading
Immutable credential verification
Smart contracts (escrow + atomic swaps)
📊 Database (15 Collections)
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
🇮🇳 Built for Indian ecosystem
🔗 Real blockchain integration
📱 Cross-platform (Web + Mobile)
🏁 Future Scope
Aadhaar / DigiLocker integration
Face recognition verification
Government API integrations
Advanced AI model improvements
Multi-language support
🤝 Contributors
Janhvi Pagare
Harshkumar Bhavsar
