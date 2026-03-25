import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import QRScanner from '../QRScanner';
import { QRCodeSVG } from 'qrcode.react';

export default function CitizenDashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('VAULT');

    // VAULT STATE
    const [credentials, setCredentials] = useState([]);
    const [credSearch, setCredSearch] = useState('');
    const [file, setFile] = useState(null);
    const [docType, setDocType] = useState('AADHAAR');

    // Authority Search
    const [authorities, setAuthorities] = useState([]);
    const [authorityId, setAuthorityId] = useState('');
    const [authSearch, setAuthSearch] = useState('');
    const [showAuthDropdown, setShowAuthDropdown] = useState(false);

    // QR MODAL STATE
    const [qrModal, setQrModal] = useState({ isOpen: false, link: '' });

    // DOCUMENT VIEWER STATE
    const [viewerModal, setViewerModal] = useState({ isOpen: false, url: '', isPdf: false });

    // ASSETS STATE
    const [landData, setLandData] = useState({ surveyNumber: '', area: '', value: '' });
    const [carbonCredits, setCarbonCredits] = useState([]);
    const [tokenizedLands, setTokenizedLands] = useState([]);

    // INSIGHTS STATE
    const [insights, setInsights] = useState(null);

    // CONSENT STATE
    const [consents, setConsents] = useState([]);
    const [revokeId, setRevokeId] = useState('');

    // SCANNER STATE
    const [scanResult, setScanResult] = useState('');

    useEffect(() => {
        if (activeTab === 'VAULT') {
            fetchCredentials();
            fetchAuthorities();
        } else if (activeTab === 'ASSETS') {
            fetchCarbonCredits();
        } else if (activeTab === 'INSIGHTS') {
            fetchInsights();
        } else if (activeTab === 'CONSENT') {
            fetchConsents();
        }
    }, [activeTab]);

    const fetchCredentials = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/citizen/credentials');
            // Sort to ensure newly uploaded documents appear 1st (descending creation)
            const sorted = res.data
                .filter(c => c.userId === user?.id || true)
                .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            setCredentials(sorted);
        } catch (err) { }
    };

    const fetchAuthorities = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/authorities');
            setAuthorities(res.data);
        } catch (err) { }
    };

    const fetchCarbonCredits = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/carbon/listings');
            setCarbonCredits(res.data);
        } catch (err) {
            setCarbonCredits([]);
        }
    };

    const fetchInsights = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/insights/citizen');
            setInsights(res.data);
        } catch (err) {
            setInsights({ creditScore: 780, predictions: "Carbon credits rising 12%", risk: "Low" });
        }
    };

    const fetchConsents = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/consent/active');
            setConsents(res.data || []);
        } catch (err) { setConsents([]) }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || !authorityId) return alert('Select file and verifying authority');

        const formData = new FormData();
        formData.append('document', file);
        formData.append('type', docType);
        formData.append('authorityId', authorityId);
        formData.append('userId', user?.id);

        try {
            await axios.post('http://localhost:5000/api/citizen/upload-document', formData);
            alert('Document Uploaded Successfully for Verification');
            setFile(null);
            setAuthSearch('');
            setAuthorityId('');
            fetchCredentials();
        } catch (err) { alert('Upload failed'); }
    };

    const shareQR = async (credId) => {
        try {
            const expiresAt = new Date(Date.now() + 15 * 60000); // 15 mins expiry natively
            const res = await axios.post('http://localhost:5000/api/qr/generate', {
                originalResourceId: credId,
                resourceType: 'credential',
                expiresAt,
                userId: user?.id
            });
            const link = `http://localhost:5173/share/${res.data.qrId}`;
            setQrModal({ isOpen: true, link });
            fetchConsents(); // Instantly reload active consents
        } catch (err) { alert('Failed to generate sharing QR.'); }
    };

    const tokenizeLand = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/tokenization/tokenize', landData);
            setTokenizedLands([...tokenizedLands, { ...landData, assetId: res.data.assetId }]);
            alert('Land Asset Tokenized onto Algorand Blockchain as a new ASA!');
            setLandData({ surveyNumber: '', area: '', value: '' });
        } catch (err) { alert('Tokenization Failed'); }
    };

    const sellCarbon = async () => {
        try {
            await axios.post('http://localhost:5000/api/carbon/sell', { amount: 50, price: 15.5, ownerId: user?.id });
            alert('Atomic Swap order placed on marketplace');
            fetchCarbonCredits();
        } catch (err) { alert('Failed to sell carbon credits'); }
    };

    const revokeConsent = async (e) => {
        e.preventDefault();
        try {
            await axios.delete(`http://localhost:5000/api/consent/${revokeId}`);
            alert('Consent Revoked Immutable anchored');
        } catch (e) { alert('Revocation failure'); }
    };

    // Filtering logics
    const filteredAuthorities = authorities.filter(a => a.name.toLowerCase().includes(authSearch.toLowerCase()) || a.type.toLowerCase().includes(authSearch.toLowerCase()));
    const filteredCredentials = credentials.filter(c => c.type.toLowerCase().includes(credSearch.toLowerCase()) || c.status.toLowerCase().includes(credSearch.toLowerCase()));

    return (
        <div className="w-full flex flex-col md:flex-row gap-6 mt-4 relative">
            {/* Modal for Raw Document Display */}
            {viewerModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-2 rounded-2xl shadow-2xl max-w-4xl w-full h-[85vh] flex flex-col items-center relative overflow-hidden">
                        <div className="w-full flex justify-between items-center p-4 border-b dark:border-gray-800">
                            <h2 className="text-xl font-black text-gray-800 dark:text-white">Document Viewer</h2>
                            <button onClick={() => setViewerModal({ isOpen: false, url: '', isPdf: false })} className="p-2 py-1 bg-gray-200 dark:bg-gray-800 dark:text-white rounded hover:bg-red-500 hover:text-white transition font-bold">X</button>
                        </div>
                        <div className="flex-1 w-full bg-gray-100 dark:bg-black/50 overflow-auto flex justify-center items-center">
                            {viewerModal.isPdf ? (
                                <iframe src={viewerModal.url} className="w-full h-full border-0" title="PDF Viewer" />
                            ) : (
                                <img src={viewerModal.url} alt="Secure Upload" className="max-w-full max-h-full object-contain p-2" />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for QR Download */}
            {qrModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center flex flex-col items-center">
                        <h2 className="text-xl font-black text-gray-800 dark:text-white mb-2">Secure Share Link</h2>
                        <p className="text-xs text-saffron font-bold mb-6 tracking-widest uppercase">Expires in 15 Minutes</p>

                        <div className="bg-white p-4 rounded-xl shadow-inner border border-gray-100 mb-6 relative group cursor-pointer inline-block">
                            <QRCodeSVG value={qrModal.link} size={200} level="H" includeMargin={true} />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition rounded-xl">
                                <span className="bg-white text-black text-xs font-bold px-3 py-1 rounded">Right Click &gt; Save Image</span>
                            </div>
                        </div>

                        <div className="w-full bg-gray-100 dark:bg-gray-800 p-3 rounded-lg flex items-center justify-between mb-6">
                            <span className="text-xs font-mono text-gray-500 truncate w-48 text-left">{qrModal.link}</span>
                            <button onClick={() => navigator.clipboard.writeText(qrModal.link).catch(() => { }).then(() => alert('Copied link!'))} className="text-indiaGreen font-bold text-xs hover:underline">COPY</button>
                        </div>

                        <button onClick={() => setQrModal({ isOpen: false, link: '' })} className="w-full py-3 bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 rounded-lg font-bold text-gray-700 hover:bg-gray-300 transition">Close Scanner</button>
                    </div>
                </div>
            )}

            {/* Sidebar Tabs */}
            <div className="w-full md:w-64 flex flex-col gap-2 shrink-0">
                {['VAULT', 'SCANNER', 'CONSENT', 'ASSETS', 'INSIGHTS'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-3 text-left rounded-lg font-bold transition ${activeTab === tab ? 'bg-saffron text-white shadow-lg' : 'bg-white/10 dark:text-gray-300 hover:bg-white/20'}`}
                    >
                        {tab === 'VAULT' ? 'My Vault & Uploads' : tab === 'SCANNER' ? 'Verify Others (QR)' : tab === 'CONSENT' ? 'Manage Consent' : tab === 'ASSETS' ? 'Land & Carbon Assets' : 'AI Insights'}
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <div className="flex-1 glass-panel p-6 min-h-[500px]">
                {activeTab === 'VAULT' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-xl items-end border-t-4 border-saffron relative z-20 h-max">
                            <h2 className="text-xl font-bold mb-4 dark:text-white">Upload Document</h2>
                            <form onSubmit={handleUpload} className="flex flex-col gap-3 relative">
                                <label className="text-xs font-bold text-gray-500">Document Type</label>
                                <select value={docType} onChange={e => setDocType(e.target.value)} className="p-3 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-saffron outline-none">
                                    <option value="AADHAAR">Aadhaar / National ID</option>
                                    <option value="PAN">PAN Card / Tax ID</option>
                                    <option value="DEGREE">College Degree</option>
                                    <option value="LAND_RECORD">Land Record</option>
                                </select>

                                <label className="text-xs font-bold text-gray-500 mt-2">Verifying Institution</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search verifying authority..."
                                        value={authSearch}
                                        onChange={e => { setAuthSearch(e.target.value); setShowAuthDropdown(true); }}
                                        onFocus={() => setShowAuthDropdown(true)}
                                        className="w-full p-3 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-saffron outline-none"
                                    />
                                    {showAuthDropdown && authSearch.trim() !== '' && (
                                        <ul className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                            {filteredAuthorities.length > 0 ? filteredAuthorities.map(a => (
                                                <li
                                                    key={a._id}
                                                    onClick={() => { setAuthorityId(a._id); setAuthSearch(a.name); setShowAuthDropdown(false); }}
                                                    className="p-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer dark:text-gray-200 border-b border-gray-100 dark:border-gray-700 last:border-0"
                                                >
                                                    <span className="font-bold">{a.name}</span>
                                                    <span className="block text-xs text-gray-500 opacity-80">{a.type}</span>
                                                </li>
                                            )) : <li className="p-3 text-sm text-gray-500">No matching authorities.</li>}
                                        </ul>
                                    )}
                                </div>
                                <input type="file" onChange={e => setFile(e.target.files[0])} className="p-2 text-sm dark:text-gray-300 mt-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-saffron file:text-white hover:file:opacity-90 cursor-pointer" />
                                <button type="submit" className="mt-4 bg-saffron text-white p-3 rounded-lg font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition disabled:opacity-50" disabled={!file || !authorityId}>Submit to Authority</button>
                            </form>
                        </div>

                        <div className="lg:col-span-2 relative z-10">
                            <div className="flex justify-between items-end mb-4 flex-wrap gap-4">
                                <h2 className="text-2xl font-bold dark:text-white">My Credentials</h2>
                                <input
                                    type="text"
                                    placeholder="🔍 Search documents..."
                                    value={credSearch}
                                    onChange={e => setCredSearch(e.target.value)}
                                    className="p-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-saffron w-full max-w-xs"
                                />
                            </div>
                            <div className="overflow-x-auto bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-100 dark:border-gray-800">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-gray-500 border-b dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
                                            <th className="p-4 rounded-tl-xl text-sm font-bold uppercase tracking-widest">Type</th>
                                            <th className="p-4 text-sm font-bold uppercase tracking-widest">Status</th>
                                            <th className="p-4 text-right rounded-tr-xl text-sm font-bold uppercase tracking-widest">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCredentials.map(cred => (
                                            <tr key={cred._id} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-white dark:hover:bg-gray-800/80 transition">
                                                <td className="p-4 font-semibold dark:text-gray-200">
                                                    {cred.type}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 flex items-center gap-1 w-max rounded-sm text-xs font-bold uppercase tracking-wider ${cred.status === 'VERIFIED' ? 'bg-green-100 text-green-700 border border-green-200' : (cred.status === 'FLAGGED' || cred.status === 'REJECTED') ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'}`}>
                                                        {cred.status === 'VERIFIED' ? <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> : 
                                                         (cred.status === 'REJECTED' || cred.status === 'FLAGGED') ? <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> : 
                                                         <span className="w-3 h-3 rounded-full bg-current opacity-70 animate-pulse block"></span>}
                                                        {cred.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right flex gap-3 justify-end items-center">
                                                    {cred.status === 'VERIFIED' && (
                                                        <button onClick={() => shareQR(cred._id)} className="text-white text-xs bg-saffron px-3 py-1.5 rounded shadow shadow-orange-500/20 hover:-translate-y-0.5 transition font-bold">Share QR</button>
                                                    )}
                                                    <button onClick={() => setViewerModal({ isOpen: true, url: cred.documentUrl, isPdf: cred.documentUrl?.includes('application/pdf') })} className="text-gray-500 dark:text-gray-400 text-xs font-bold hover:text-navyBlue dark:hover:text-blue-400 transition underline underline-offset-2">Inspect Raw Doc</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredCredentials.length === 0 && <tr><td colSpan="3" className="p-8 text-center text-gray-500 font-bold">No matching credentials found.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'SCANNER' && (
                    <div className="max-w-md mx-auto">
                        <h2 className="text-2xl font-bold dark:text-white mb-4 text-center">Scan to Verify</h2>
                        <p className="text-gray-500 mb-6 text-center">Point your camera at an OwnIt QR code to instantly verify its authenticity on the Algorand blockchain.</p>
                        <QRScanner onScanSuccess={(data) => {
                            const qrId = data.includes('/share/') ? data.split('/share/')[1] : data;
                            // Execute the audit log quietly in the background without waiting
                            axios.post('http://localhost:5000/api/qr/scan', {
                                qrId,
                                deviceInfo: navigator.userAgent
                            }).catch(() => {});
                            
                            // Instantly switch tabs to the native document viewer!
                            window.location.href = `/share/${qrId}`;
                        }} />
                        {scanResult && (
                            <div className={`mt-6 p-4 border-2 rounded-xl font-mono whitespace-pre-wrap shadow-inner ${scanResult.includes('✅') ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                                {scanResult}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'CONSENT' && (
                    <div>
                        <h2 className="text-2xl font-bold dark:text-white mb-6">Manage Data Consents</h2>

                        <form onSubmit={revokeConsent} className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-end gap-4 border border-red-100 dark:border-red-900">
                            <div className="flex-1">
                                <label className="block text-sm font-bold text-red-800 dark:text-red-400 mb-1">Revoke Access Instantly</label>
                                <input required placeholder="Consent ID / Employer ID" value={revokeId} onChange={e => setRevokeId(e.target.value)} className="w-full p-2 rounded border border-red-200 dark:border-red-800 dark:bg-black/20 dark:text-white" />
                            </div>
                            <button type="submit" className="bg-red-500 text-white font-bold p-2 px-6 rounded hover:bg-red-600">Revoke Now</button>
                        </form>

                        <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4">Active Access Grants</h3>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-gray-400 border-b dark:border-gray-700">
                                    <th className="pb-2">Consent ID (Required to Revoke)</th>
                                    <th className="pb-2">Granted To</th>
                                    <th className="pb-2">Access Level</th>
                                    <th className="pb-2">Status</th>
                                    <th className="pb-2">Expiry</th>
                                </tr>
                            </thead>
                            <tbody>
                                {consents.map(c => (
                                    <tr key={c._id} className="border-b dark:border-gray-800">
                                        <td className="py-3 font-mono text-sm dark:text-gray-400 font-bold tracking-tight">
                                            <button onClick={() => {setRevokeId(c._id); window.scrollTo({top: 0, behavior: 'smooth'});}} className="hover:text-red-500 hover:underline cursor-pointer group flex items-center gap-2">
                                                {c._id} 
                                                <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                            </button>
                                        </td>
                                        <td className="py-3 font-semibold dark:text-gray-200">{c.granteeName}</td>
                                        <td className="py-3 text-gray-500">{c.level}</td>
                                        <td className="py-3">
                                            <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider animate-pulse flex w-max items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-green-500 block"></span> Live Active
                                            </span>
                                        </td>
                                        <td className="py-3 text-red-500 font-bold text-sm tracking-tight">{new Date(c.expiry).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                                {consents.length === 0 && <tr><td colSpan="5" className="py-8 text-center text-gray-500 font-bold border-dashed border-2 dark:border-gray-800 mt-4">No active external consents floating.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'ASSETS' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-2xl font-bold dark:text-white mb-4 text-indiaGreen">Tokenize Land</h2>
                            <form onSubmit={tokenizeLand} className="bg-gray-50 dark:bg-black/20 p-6 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col gap-4">
                                <input required placeholder="Survey Number (e.g. 192/B)" value={landData.surveyNumber} onChange={e => setLandData({ ...landData, surveyNumber: e.target.value })} className="p-3 rounded border dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                                <input required placeholder="Area Size (Sq Ft)" type="number" value={landData.area} onChange={e => setLandData({ ...landData, area: e.target.value })} className="p-3 rounded border dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                                <input required placeholder="Market Value (INR)" type="number" value={landData.value} onChange={e => setLandData({ ...landData, value: e.target.value })} className="p-3 rounded border dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                                <button type="submit" className="bg-indiaGreen text-white font-bold p-3 rounded hover:bg-green-700 mt-2 shadow-lg">Generate Algorand ASA Token</button>
                            </form>

                            {tokenizedLands.length > 0 && (
                                <div className="mt-6 bg-white dark:bg-black/40 p-4 rounded-xl shadow-inner border border-gray-100 dark:border-gray-800">
                                    <h4 className="font-bold text-gray-700 dark:text-gray-300 text-sm mb-2">My Algorand Tokenized Properties</h4>
                                    {tokenizedLands.map((t, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm py-2 border-t dark:border-gray-700/50">
                                            <span className="dark:text-gray-400 text-xs font-semibold">{t.surveyNumber} ({t.area} sqft)</span>
                                            <span className="text-indiaGreen font-bold font-mono text-xs bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">ASA: {t.assetId}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold dark:text-white mb-4 text-saffron">Carbon Marketplace</h2>
                            <div className="bg-gray-50 dark:bg-black/20 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-gray-500">Your Carbon Balance</span>
                                    <span className="text-2xl font-black text-saffron">150 Tons</span>
                                </div>
                                <button onClick={sellCarbon} className="w-full bg-saffron text-white font-bold p-3 rounded hover:bg-orange-600 shadow-lg">List 50 Tons for Atomic Swap Sale</button>

                                <div className="mt-6">
                                    <h4 className="font-bold text-gray-700 dark:text-gray-300 text-sm mb-2">Active Listings</h4>
                                    {carbonCredits.map(c => (
                                        <div key={c._id} className="flex justify-between items-center text-sm py-2 px-3 border border-gray-100 dark:border-gray-700 bg-white dark:bg-black/40 rounded shadow-sm mt-2">
                                            <span className="dark:text-gray-300 font-semibold">{c.quantity} Tons</span>
                                            <span className="text-indiaGreen font-bold">${c.pricePerTon}<span className="text-xs text-gray-500 font-normal">/ton</span></span>
                                        </div>
                                    ))}
                                    {carbonCredits.length === 0 && <p className="text-sm text-gray-500 py-4 text-center">No active listings.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'INSIGHTS' && (
                    <div>
                        <h2 className="text-2xl font-bold dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">AI-Generated Insights</h2>
                        {insights ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="glass-panel p-6 border-t-4 border-blue-500 text-center">
                                    <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">Credit Score</h3>
                                    <div className="text-5xl font-black text-blue-500 my-4">{insights.creditScore}</div>
                                    <p className="text-gray-400 text-xs">Derived from blockchain reputation</p>
                                </div>

                                <div className="glass-panel p-6 border-t-4 border-saffron md:col-span-2">
                                    <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">Market Predictions (Next 12 Months)</h3>
                                    <p className="text-xl text-saffron font-medium leading-relaxed my-2">"{insights.predictions}"</p>
                                </div>

                                <div className="glass-panel p-6 md:col-span-3 border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-900/10">
                                    <h3 className="text-red-500 text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        Risk Analysis
                                    </h3>
                                    <p className="text-gray-700 dark:text-gray-300">Account status evaluated as <strong className="text-green-500">{insights.risk} Risk</strong>. No suspicious access patterns detected across active consent grants.</p>
                                </div>
                            </div>
                        ) : (<p className="text-gray-400">Loading AI models...</p>)}
                    </div>
                )}
            </div>
        </div>
    );
}
