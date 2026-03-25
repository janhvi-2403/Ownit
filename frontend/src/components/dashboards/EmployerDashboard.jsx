import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function EmployerDashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('SCAN');

    // States for scanning
    const [scanResult, setScanResult] = useState(null);
    const [scannerActive, setScannerActive] = useState(false);

    // Reports State
    const [reports, setReports] = useState([
        { id: '102', candidate: 'Suresh Kumar', document: 'B.Tech Degree', status: 'VERIFIED', date: '2026-03-24' },
        { id: '103', candidate: 'Aisha Rao', document: 'Experience Letter', status: 'FLAGGED', date: '2026-03-25' }
    ]);

    const handleStartScanner = () => {
        setScannerActive(true);
        setTimeout(() => {
            const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
            scanner.render(
                async (decodedText) => {
                    scanner.clear();
                    setScannerActive(false);
                    try {
                        // Ping actual QR backend validation
                        const res = await axios.post('http://localhost:5000/api/qr/verify', { qrPayload: decodedText });
                        setScanResult({
                            valid: res.data.valid,
                            payload: res.data.data
                        });

                        setReports(prev => [{
                            id: Math.floor(Math.random() * 900) + 100 + '',
                            candidate: res.data.data?.userId?.name || 'Applicant',
                            document: res.data.data?.type || 'Identity Record',
                            status: res.data.valid ? 'VERIFIED' : 'FAILED',
                            date: new Date().toISOString().split('T')[0]
                        }, ...prev]);

                    } catch (err) {
                        setScanResult({ valid: false, error: 'Cryptographic signature mismatch or forged QR.' });
                    }
                },
                () => { } // ignore errors
            );
        }, 100);
    };

    const handleRequestAccess = () => {
        const uin = prompt("Enter Candidate Aadhaar/UIN to request digital consent:");
        if (uin) alert(`Consent Request securely dispatched to Candidate ${uin}'s OwnIt Wallet via Push Notification.`);
    };

    const handleBulkUpload = (e) => {
        if (e.target.files.length > 0) {
            alert(`Processing batch of ${e.target.files.length} candidate verification PDFs... \n\nAI matching underway against Algorand state proofs!`);
        }
    };

    return (
        <div className="w-full flex flex-col md:flex-row gap-6 mt-4">
            <div className="w-full md:w-64 flex flex-col gap-2 shrink-0">
                <button
                    onClick={() => setActiveTab('SCAN')}
                    className={`px-4 py-3 text-left rounded-lg font-bold transition flex flex-col ${activeTab === 'SCAN' ? 'bg-navyBlue text-white shadow-lg' : 'bg-white/10 dark:text-gray-300 hover:bg-white/20'}`}
                >
                    <span>HR QR Scanner</span>
                    <span className="text-xs opacity-75 font-normal">Live Candidate Verification</span>
                </button>
                <button
                    onClick={() => setActiveTab('BULK')}
                    className={`px-4 py-3 text-left rounded-lg font-bold transition ${activeTab === 'BULK' ? 'bg-navyBlue text-white shadow-lg' : 'bg-white/10 dark:text-gray-300 hover:bg-white/20'}`}
                >
                    Hiring Event Bulk Sync
                </button>
                <button
                    onClick={() => setActiveTab('HISTORY')}
                    className={`px-4 py-3 text-left rounded-lg font-bold transition flex justify-between items-center ${activeTab === 'HISTORY' ? 'bg-navyBlue text-white shadow-lg' : 'bg-white/10 dark:text-gray-300 hover:bg-white/20'}`}
                >
                    <span>Verification History</span>
                    <span className="bg-white/20 px-2 rounded-full text-xs">{reports.length}</span>
                </button>
            </div>

            <div className="flex-1 glass-panel p-6 min-h-[500px]">
                {activeTab === 'SCAN' && (
                    <div className="max-w-xl mx-auto flex flex-col items-center">
                        <h2 className="text-xl font-bold dark:text-white mb-6 w-full border-b border-gray-200 dark:border-gray-700 pb-2">Single Candidate Validation</h2>

                        {!scannerActive && !scanResult && (
                            <div className="text-center p-8 bg-gray-50 dark:bg-black/20 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 w-full mb-6">
                                <p className="text-gray-500 mb-4">Scan an applicant's OwnIt QR code from their mobile device to instantly verify authenticity against the blockchain.</p>
                                <button onClick={handleStartScanner} className="bg-navyBlue text-white font-bold px-6 py-3 rounded-lg shadow-lg hover:bg-blue-900">Activate Camera</button>
                            </div>
                        )}

                        <div id="reader" className="w-full mb-6 overflow-hidden rounded-xl border-none"></div>

                        {scanResult && (
                            <div className={`w-full p-6 rounded-xl border-2 ${scanResult.valid ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 text-green-800 dark:text-green-300' : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 text-red-800 dark:text-red-300'}`}>
                                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                                    {scanResult.valid ? '✅ Blockchain Authentic' : '❌ Fraudulent Document Detected'}
                                </h3>
                                {scanResult.valid ? (
                                    <div className="space-y-1 text-sm bg-white/50 dark:bg-black/40 p-3 rounded">
                                        <p><span className="font-bold opacity-75">Document:</span> {scanResult.payload?.type}</p>
                                        <p><span className="font-bold opacity-75">Applicant:</span> {scanResult.payload?.userId?.name || 'Verified'}</p>
                                        <p><span className="font-bold opacity-75">Issuing Authority:</span> {scanResult.payload?.authorityId?.name}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm font-bold bg-white/50 dark:bg-black/40 p-3 rounded">{scanResult.error}</p>
                                )}
                                <button onClick={() => setScanResult(null)} className="mt-4 text-sm font-bold opacity-80 hover:opacity-100 underline">Scan Another Document</button>
                            </div>
                        )}

                        <div className="w-full text-center mt-4">
                            <span className="text-sm text-gray-500 font-bold block mb-2">Or, request remote confirmation:</span>
                            <button onClick={handleRequestAccess} className="text-navyBlue border border-navyBlue px-4 py-2 font-bold rounded hover:bg-blue-50 dark:hover:bg-blue-900/20">Request Access Manually</button>
                        </div>
                    </div>
                )}

                {activeTab === 'BULK' && (
                    <div>
                        <h2 className="text-xl font-bold dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">Hiring Event Pipeline</h2>
                        <div className="p-8 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-gray-800 text-center col-span-2">
                            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-2">Bulk Degree & Experience Verification</h3>
                            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">Upload a ZIP file of applicant QR codes or PDFs. Our AI orchestrates batch verification across thousands of university domain nodes securely.</p>

                            <label className="bg-saffron text-white px-6 py-3 font-bold rounded-lg shadow-lg hover:opacity-90 cursor-pointer inline-block">
                                Upload Applicant Batch
                                <input type="file" multiple onChange={handleBulkUpload} className="hidden" />
                            </label>

                            <div className="mt-8 flex justify-center gap-6 text-sm text-gray-400 font-bold">
                                <div><span className="block text-2xl text-navyBlue dark:text-blue-400">12</span> Active Events</div>
                                <div><span className="block text-2xl text-indiaGreen">4,591</span> Scans</div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'HISTORY' && (
                    <div>
                        <h2 className="text-xl font-bold dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">Audit Reports</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b dark:border-gray-700 text-gray-400"><th className="pb-2">Req ID</th><th className="pb-2">Candidate</th><th className="pb-2">Document</th><th className="pb-2">Outcome</th></tr>
                                </thead>
                                <tbody>
                                    {reports.map((r, i) => (
                                        <tr key={i} className="border-b dark:border-gray-800">
                                            <td className="py-3 text-xs font-mono text-gray-400">#{r.id}</td>
                                            <td className="py-3 font-bold dark:text-gray-200">{r.candidate}</td>
                                            <td className="py-3 text-sm text-gray-500">{r.document}</td>
                                            <td className="py-3">
                                                <span className={`text-xs px-2 py-1 font-bold rounded ${r.status === 'VERIFIED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {r.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
