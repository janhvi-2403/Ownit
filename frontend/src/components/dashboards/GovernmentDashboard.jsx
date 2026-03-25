import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function GovernmentDashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('QUEUE');

    // Data States
    const [queue, setQueue] = useState([]);
    const [fraudReports, setFraudReports] = useState([]);

    // Cross Reference State
    const [crossRefParams, setCrossRefParams] = useState({ docType: 'AADHAAR', docNumber: '' });
    const [crossRefResult, setCrossRefResult] = useState(null);
    const [loadingCross, setLoadingCross] = useState(false);

    useEffect(() => {
        if (activeTab === 'QUEUE') fetchQueue();
        if (activeTab === 'FRAUD') fetchFraudReports();
    }, [activeTab]);

    const fetchQueue = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/government/pending-national');
            setQueue(res.data);
        } catch (e) { }
    };

    const fetchFraudReports = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/government/fraud-reports');
            setFraudReports(res.data);
        } catch (e) { }
    };

    const handleIssueCertificate = async (id) => {
        try {
            await axios.post(`http://localhost:5000/api/government/issue-certificate/${id}`);
            alert("Official Validation Certificate Issued and Anchored to Blockchain!");
            fetchQueue();
        } catch (e) { alert("Failed to issue certificate"); }
    };

    const handleFlagFraud = async (id) => {
        try {
            const reason = window.prompt("Reason for Fraud Flag (e.g. Forgery, Spoofed Photo):");
            if (!reason) return;
            await axios.post(`http://localhost:5000/api/government/flag-document`, { credentialId: id, reason, severity: 'CRITICAL' });
            alert("Document Globally Flagged as Fraudulent. Account Frozen.");
            fetchQueue();
        } catch (e) { alert("Failed to flag document"); }
    };

    const executeCrossReference = async (e) => {
        e.preventDefault();
        setLoadingCross(true);
        setCrossRefResult(null);
        try {
            const res = await axios.post('http://localhost:5000/api/government/central-db', crossRefParams);
            setCrossRefResult(res.data);
        } catch (e) {
            alert("Database lookup failed.");
        } finally {
            setLoadingCross(false);
        }
    };

    return (
        <div className="w-full flex flex-col md:flex-row gap-6 mt-4">
            {/* Sidebar Tabs */}
            <div className="w-full md:w-64 flex flex-col gap-2 shrink-0">
                <button
                    onClick={() => setActiveTab('QUEUE')}
                    className={`px-4 py-3 text-left rounded-lg font-bold transition flex flex-col ${activeTab === 'QUEUE' ? 'bg-saffron text-white shadow-lg' : 'bg-white/10 dark:text-gray-300 hover:bg-white/20'}`}
                >
                    <span>National Approvals</span>
                    <span className="text-xs font-normal opacity-80">Aadhaar, Passport, PAN</span>
                </button>
                <button
                    onClick={() => setActiveTab('CROSS_REF')}
                    className={`px-4 py-3 text-left rounded-lg font-bold transition ${activeTab === 'CROSS_REF' ? 'bg-saffron text-white shadow-lg' : 'bg-white/10 dark:text-gray-300 hover:bg-white/20'}`}
                >
                    Central DB Lookup
                </button>
                <button
                    onClick={() => setActiveTab('FRAUD')}
                    className={`px-4 py-3 text-left rounded-lg font-bold transition flex justify-between items-center ${activeTab === 'FRAUD' ? 'bg-red-500 text-white shadow-lg' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'}`}
                >
                    <span>Fraud Monitoring</span>
                    <span className="bg-white/20 px-2 rounded-full text-xs">Alerts</span>
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 glass-panel p-6 min-h-[500px]">

                {activeTab === 'QUEUE' && (
                    <div>
                        <h2 className="text-xl font-bold mb-6 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">National Identity Verification Queue</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                                        <th className="p-3">Citizen Target</th>
                                        <th className="p-3">Doc Type</th>
                                        <th className="p-3">Fraud Probability</th>
                                        <th className="p-3 text-right">Judicial Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {queue.map(req => (
                                        <tr key={req._id} className="border-b border-gray-100 dark:border-gray-800">
                                            <td className="p-3 font-semibold dark:text-gray-200">{req.userId?.name || 'Citizen'}</td>
                                            <td className="p-3 font-mono text-sm text-saffron">{req.type}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${req.fraudScore > 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                    {req.fraudScore > 10 ? 'High Risk' : 'Authentic'}
                                                </span>
                                            </td>
                                            <td className="p-3 flex gap-2 justify-end">
                                                <a href={req.documentUrl} target="_blank" rel="noreferrer" className="text-xs bg-gray-500 text-white px-3 py-1 rounded hover:opacity-80 flex items-center shadow">View Image</a>
                                                <button onClick={() => handleIssueCertificate(req._id)} className="text-xs bg-saffron text-white px-3 py-1 rounded shadow-md hover:opacity-90 font-bold">Issue Certificate</button>
                                                <button onClick={() => handleFlagFraud(req._id)} className="text-xs bg-red-600 text-white px-3 py-1 rounded shadow hover:bg-red-700 font-bold">Flag Fraud</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {queue.length === 0 && (
                                        <tr><td colSpan="4" className="p-3 text-center text-gray-500 py-6">No national documents pending approval.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'CROSS_REF' && (
                    <div className="max-w-2xl">
                        <h2 className="text-xl font-bold mb-6 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Central Database Live Cross-Reference</h2>
                        <p className="text-gray-500 mb-6 text-sm">Ping UIDAI, Passport Seva, or Income Tax databases via secured federated APIs to validate an identifier against active national structures.</p>

                        <form onSubmit={executeCrossReference} className="mb-8 p-6 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-1">National Registry Type</label>
                                <select value={crossRefParams.docType} onChange={e => setCrossRefParams({ ...crossRefParams, docType: e.target.value })} className="w-full p-3 rounded border dark:border-gray-600 dark:bg-gray-800 dark:text-white">
                                    <option value="AADHAAR">UIDAI Aadhaar DB</option>
                                    <option value="PAN">Income Tax PAN DB</option>
                                    <option value="PASSPORT">Passport Seva DB</option>
                                    <option value="DL">RTO Driving License DB</option>
                                    <option value="VOTER_ID">Election Commission DB</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-1">Unique Identifier Number</label>
                                <input required type="text" value={crossRefParams.docNumber} onChange={e => setCrossRefParams({ ...crossRefParams, docNumber: e.target.value })} placeholder="e.g. 5432-8493-2192" className="w-full p-3 font-mono text-lg rounded border dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-saffron outline-none" />
                            </div>
                            <button type="submit" disabled={loadingCross} className={`bg-navyBlue text-white font-bold p-3 rounded shadow-lg mt-2 ${loadingCross ? 'opacity-50' : 'hover:opacity-90'}`}>
                                {loadingCross ? 'Connecting to Central Servers...' : 'Cross-Reference Record'}
                            </button>
                        </form>

                        {crossRefResult && (
                            <div className="p-6 bg-green-50 dark:bg-green-900/10 border-2 border-green-200 dark:border-green-800 rounded-xl animate-fade-in text-green-900 dark:text-green-300">
                                <h3 className="font-bold flex items-center gap-2 mb-4 text-green-700 text-lg">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    Central Database Match Confirmed ({crossRefResult.status})
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm bg-white/50 dark:bg-black/40 p-4 rounded-lg">
                                    <div><span className="font-bold block opacity-60">Registered Name</span>{crossRefResult.details.fullName}</div>
                                    <div><span className="font-bold block opacity-60">Jurisdiction</span>{crossRefResult.details.registeredRegion}</div>
                                    <div><span className="font-bold block opacity-60">Issue Date</span>{crossRefResult.details.issueDate}</div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'FRAUD' && (
                    <div>
                        <h2 className="text-xl font-bold mb-6 text-red-500 border-b border-red-200 dark:border-red-900 pb-2">Global Document Fraud Alerts</h2>

                        <div className="grid gap-4">
                            {fraudReports.map(rep => (
                                <div key={rep._id} className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900 rounded-xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg tracking-widest uppercase shadow">{rep.severity} FLAG</div>
                                    <h4 className="font-bold text-red-800 dark:text-red-400 mb-1">{rep.alertType} Alert - Credential #{rep.credentialId?._id?.toString().slice(0, 6)}</h4>
                                    <p className="text-sm text-red-600 dark:text-red-300 mb-2">Citizen: <span className="font-bold">{rep.credentialId?.userId?.name || 'Unknown'}</span></p>
                                    <div className="bg-white/60 dark:bg-black/40 p-3 rounded font-mono text-sm dark:text-gray-300 border border-red-100/50 dark:border-red-900/50">
                                        Reason Logged: {rep.details?.reason || 'System flagged without reason.'}
                                    </div>
                                    <div className="mt-3 text-xs text-red-400 font-bold uppercase tracking-widest flex justify-between">
                                        <span>Reported by {rep.detectedBy}</span>
                                        <span>{new Date(rep.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                            {fraudReports.length === 0 && <p className="text-gray-500 text-center py-8">No fraud alerts active.</p>}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
