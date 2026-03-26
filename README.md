# OwnIt - India's Digital Ownership Wallet

OwnIt is a next-generation platform for digital ownership designed for 1.4 billion Indians. It securely tokenizes credentials, land records, and carbon credits on the Algorand blockchain, using AI-driven verification logic and secure mobile detection.

## Project Structure

- **`backend/`**: Node.js + Express + MongoDB. Contains 15 collections, robust REST routing, WebSocket triggers, and the Algorand/IPFS integrations.
- **`frontend/`**: Vite + React + TailwindCSS (v4). Features global glassmorphism, React-Router, and complex QR/TFJS camera components.
- **`mobile/`**: React Native + Expo App. Includes deep-linking and secure vault screen-capture prevention mechanisms.


## Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- MongoDB running locally on port 27017
- Expo CLI

> **OPENROUTER API KEY**: Replace the key inside `backend/.env` (when created) to enable AI insights.

### 1. Backend & Database Seeding

1. Navigate to backend: `cd backend`
2. Create `.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ownit
   JWT_SECRET=supersecret
   OPENROUTER_API_KEY=your_key_here
   ALGOD_SERVER=https://testnet-api.algonode.cloud
   ```
3. Run the database seeder to populate dummy profiles (IITs, Banks, 20+ Credentials):
   ```bash
   node src/scripts/seed.js
   ```
4. Start Server:
   ```bash
   node server.js
   ```

### 2. Frontend Web App

1. Navigate to: `cd frontend`
2. Start Dev server: 
   ```bash
   npm run dev
   ```
3. App available at usually `http://localhost:5173`. Use credentials from `seed.js` or `admin@ownit.gov.in` (password: `password123`).

### 4. Mobile App (Expo)

1. Navigate to: `cd mobile`
2. Start bundler:
   ```bash
   npx expo start
   ```
3. Use Expo Go on your physical device, scan the terminal QR code to view the secure vault screens.
