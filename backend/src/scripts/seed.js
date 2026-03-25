const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');
const Authority = require('../models/Authority');
const Credential = require('../models/Credential');
const CarbonCredit = require('../models/CarbonCredit');
const ConsentRecord = require('../models/ConsentRecord');
const LoanApplication = require('../models/LoanApplication');
const QRCode = require('../models/QRCode');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ownit');
        console.log('MongoDB Connected for Seeding');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1);
    }
};

const runSeeder = async () => {
    await connectDB();

    // Clear existing
    console.log('Clearing old data...');
    await User.deleteMany({});
    await Authority.deleteMany({});
    await Credential.deleteMany({});
    await CarbonCredit.deleteMany({});
    await ConsentRecord.deleteMany({});
    await LoanApplication.deleteMany({});
    await QRCode.deleteMany({});

    const passwordHash = await bcrypt.hash('password123', 10);

    console.log('Seeding Authorities...');
    const authoritiesData = [
        { name: 'IIT Madras', type: 'COLLEGE', emailDomain: '@iitm.ac.in', contactEmail: 'admin@iitm.ac.in' },
        { name: 'IIT Bombay', type: 'COLLEGE', emailDomain: '@iitb.ac.in', contactEmail: 'admin@iitb.ac.in' },
        { name: 'Apollo Hospitals', type: 'HOSPITAL', emailDomain: '@apollohospitals.com', contactEmail: 'records@apollohospitals.com' },
        { name: 'AIIMS Delhi', type: 'HOSPITAL', emailDomain: '@aiims.edu', contactEmail: 'admin@aiims.edu' },
        { name: 'Maharashtra Land Registry', type: 'LAND_OFFICE', emailDomain: '@mahabhumi.gov.in', contactEmail: 'records@mahabhumi.gov.in' },
        { name: 'Delhi Land Board', type: 'LAND_OFFICE', emailDomain: '@dlb.delhi.gov.in', contactEmail: 'info@dlb.delhi.gov.in' },
        { name: 'UIDAI', type: 'GOVERNMENT', emailDomain: '@uidai.gov.in', contactEmail: 'support@uidai.gov.in' },
        { name: 'Passport Seva', type: 'GOVERNMENT', emailDomain: '@passportindia.gov.in', contactEmail: 'admin@passportindia.gov.in' },
        { name: 'RTO Mumbai', type: 'GOVERNMENT', emailDomain: '@transport.maharashtra.gov.in', contactEmail: 'mumbai@transport.maharashtra.gov.in' },
        { name: 'Income Tax Dept', type: 'GOVERNMENT', emailDomain: '@incometax.gov.in', contactEmail: 'pan@incometax.gov.in' }
    ];
    const authorities = await Authority.insertMany(authoritiesData);

    console.log('Seeding Users...');
    const citizensData = [
        { name: 'Rajesh Sharma', email: 'rajesh@example.com', role: 'CITIZEN', password: passwordHash, algorandAddress: 'ALGO_RAJ_123', phoneNumber: '+91-9876543210' },
        { name: 'Priya Patel', email: 'priya@example.com', role: 'CITIZEN', password: passwordHash, algorandAddress: 'ALGO_PRI_123', phoneNumber: '+91-9876543211' },
        { name: 'Amit Kumar', email: 'amit@example.com', role: 'CITIZEN', password: passwordHash, algorandAddress: 'ALGO_AMI_123', phoneNumber: '+91-9876543212' },
        { name: 'Sneha Reddy', email: 'sneha@example.com', role: 'CITIZEN', password: passwordHash, algorandAddress: 'ALGO_SNE_123', phoneNumber: '+91-9876543213' },
        { name: 'Vikram Singh', email: 'vikram@example.com', role: 'CITIZEN', password: passwordHash, algorandAddress: 'ALGO_VIK_123', phoneNumber: '+91-9876543214' }
    ];

    const superAdmin = { name: 'Super Admin', email: 'admin@ownit.gov.in', role: 'SUPER_ADMIN', password: passwordHash };
    const employers = [
        { name: 'TechCorp India', email: 'hr@techcorp.in', role: 'EMPLOYER', password: passwordHash },
        { name: 'Infosys', email: 'careers@infosys.com', role: 'EMPLOYER', password: passwordHash },
        { name: 'TCS', email: 'recruitment@tcs.com', role: 'EMPLOYER', password: passwordHash }
    ];
    const banks = [
        { name: 'HDFC Bank', email: 'loans@hdfcbank.com', role: 'BANK', password: passwordHash },
        { name: 'SBI', email: 'loans@sbi.co.in', role: 'BANK', password: passwordHash },
        { name: 'ICICI Bank', email: 'support@icicibank.com', role: 'BANK', password: passwordHash }
    ];
    const buyers = [
        { name: 'CarbonCredit India', email: 'purchase@carboncredit.in', role: 'CARBON_BUYER', password: passwordHash },
        { name: 'GreenFuture Corp', email: 'info@greenfuture.com', role: 'CARBON_BUYER', password: passwordHash }
    ];

    const allUsersData = [...citizensData, superAdmin, ...employers, ...banks, ...buyers];
    const users = await User.insertMany(allUsersData);
    const citizens = users.filter(u => u.role === 'CITIZEN');

    console.log('Seeding Credentials (20+)...');
    const credentialTypes = ['DEGREE', 'HEALTH_RECORD', 'LAND_RECORD', 'AADHAAR', 'PAN', 'PASSPORT'];
    let createdCreds = [];
    for (let c of citizens) {
        for (let i = 0; i < 4; i++) {
            const type = credentialTypes[Math.floor(Math.random() * credentialTypes.length)];
            const auth = authorities[Math.floor(Math.random() * authorities.length)];
            createdCreds.push({
                userId: c._id,
                type: type,
                documentUrl: `https://ipfs.io/ipfs/dummy_hash_${c.name.split(' ')[0]}_${type}`,
                status: Math.random() > 0.3 ? 'VERIFIED' : 'PENDING',
                fraudScore: Math.floor(Math.random() * 20),
                authorityId: auth._id,
                metadata: { number: `DOC-${Math.floor(Math.random() * 10000)}` }
            });
        }
    }
    const credentials = await Credential.insertMany(createdCreds);

    console.log('Seeding Complete Modules...');

    console.log('Data seeded successfully!');
    process.exit();
};

runSeeder();
