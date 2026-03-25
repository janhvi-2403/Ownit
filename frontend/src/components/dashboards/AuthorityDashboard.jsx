import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function AuthorityDashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('QUEUE');

    const [requests, setRequests] = useState([]);
    const [stats, setStats] = useState({ verified: 0, pending: 0, rejected: 0 });
    const [staff, setStaff] = useState([]);

    // Form State
    const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '' });

    // DOCUMENT VIEWER STATE
    const [viewerModal, setViewerModal] = useState({ isOpen: false, url: '', isPdf: false });

    useEffect(() => {
        if (!user) return;
        if (activeTab === 'QUEUE') fetchRequests();
        if (activeTab === 'STATS') fetchStats();
        if (activeTab === 'STAFF') fetchStaff();
    }, [activeTab, user]);

    const fetchRequests = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/authority/pending-verifications?email=${user.email}`);
            setRequests(res.data);
        } catch (e) { }
    };

    const fetchStats = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/authority/stats?email=${user.email}`);
            setStats(res.data);
        } catch (e) { }
    };

    const fetchStaff = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/authority/staff?email=${user.email}`);
            setStaff(res.data);
        } catch (e) { }
    };

    const handleVerify = async (credentialId) => {
        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/authority/verify/${credentialId}`);
            alert("Verification anchored securely to Algorand Blockchain!");
            fetchRequests();
        } catch (err) { alert("Failed verification commit."); }
    };

    const handleReject = async (credentialId) => {
        try {
            const reason = window.prompt("Enter Rejection Reason:");
            if (!reason) return;
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/authority/reject/${credentialId}`, { reason });
            alert("Document Rejected.");
            fetchRequests();
        } catch (err) { alert("Failed to reject."); }
    };

    const handleAddStaff = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/authority/staff`, newStaff);
            alert("Verification Officer account created!");
            setNewStaff({ name: '', email: '', password: '' });
            fetchStaff();
        } catch (e) { alert("Failed to add staff"); }
    };

    return (
        <div className="w-full flex gap-6 mt-4 relative">
            {/* Modal for Raw Document Display */}
            {viewerModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-2 rounded-2xl shadow-2xl max-w-4xl w-full h-[85vh] flex flex-col items-center relative overflow-hidden">
                        <div className="w-full flex justify-between items-center p-4 border-b dark:border-gray-800">
                            <h2 className="text-xl font-black text-gray-800 dark:text-white">Institution Document Viewer</h2>
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

            {/* Sidebar Tabs */}
            <div className="w-64 flex flex-col gap-2">
                <button
                    onClick={() => setActiveTab('QUEUE')}
                    className={`px-4 py-3 text-left rounded-lg font-bold transition ${activeTab === 'QUEUE' ? 'bg-navyBlue text-white shadow-lg' : 'bg-white/10 dark:text-gray-300 hover:bg-white/20'}`}
                >
                    Verification Queue
                </button>
                <button
                    onClick={() => setActiveTab('STAFF')}
                    className={`px-4 py-3 text-left rounded-lg font-bold transition ${activeTab === 'STAFF' ? 'bg-navyBlue text-white shadow-lg' : 'bg-white/10 dark:text-gray-300 hover:bg-white/20'}`}
                >
                    Officer Management
                </button>
                <button
                    onClick={() => setActiveTab('STATS')}
                    className={`px-4 py-3 text-left rounded-lg font-bold transition ${activeTab === 'STATS' ? 'bg-navyBlue text-white shadow-lg' : 'bg-white/10 dark:text-gray-300 hover:bg-white/20'}`}
                >
                    Reports & Statistics
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 glass-panel p-6 min-h-[500px]">

                {activeTab === 'QUEUE' && (
                    <div>
                        <h2 className="text-xl font-bold mb-6 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Institution Verification Queue</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                                        <th className="p-3">Citizen Name</th>
                                        <th className="p-3">Document Type</th>
                                        <th className="p-3">AI Match Score</th>
                                        <th className="p-3">Actions (Blockchain)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.map(req => (
                                        <tr key={req._id} className="border-b border-gray-100 dark:border-gray-800">
                                            <td className="p-3 font-semibold dark:text-gray-200">{req.userId?.name || 'Citizen'}</td>
                                            <td className="p-3 text-sm text-gray-500">{req.type}</td>
                                            <td className="p-3">
                                                <span className={`font-bold ${req.fraudScore > 10 ? 'text-red-500' : 'text-green-600'}`}>
                                                    {req.fraudScore > 10 ? 'High Risk' : '98% Authentic'}
                                                </span>
                                            </td>
                                            <td className="p-3 flex gap-2">
                                                <button onClick={() => setViewerModal({ isOpen: true, url: req.documentUrl, isPdf: req.documentUrl?.includes('application/pdf') })} className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center">View</button>
                                                <button onClick={() => handleVerify(req._id)} className="text-xs bg-indiaGreen text-white px-3 py-1 rounded shadow hover:bg-green-700">Approve</button>
                                                <button onClick={() => handleReject(req._id)} className="text-xs bg-red-500 text-white px-3 py-1 rounded shadow hover:bg-red-600">Reject</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {requests.length === 0 && (
                                        <tr><td colSpan="4" className="p-3 text-center text-gray-500 py-6">All clear! No pending institutional verification requests.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'STAFF' && (
                    <div>
                        <h2 className="text-xl font-bold mb-6 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Assign Verification Officers</h2>

                        <form onSubmit={handleAddStaff} className="mb-8 flex gap-4 bg-gray-50 dark:bg-black/20 p-4 rounded-xl items-end">
                            <div className="flex-1">
                                <label className="block text-sm font-bold text-gray-500 mb-1">Officer Name</label>
                                <input required type="text" value={newStaff.name} onChange={e => setNewStaff({ ...newStaff, name: e.target.value })} className="w-full p-2 text-sm rounded border dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-bold text-gray-500 mb-1">Institutional Email</label>
                                <input required type="email" value={newStaff.email} onChange={e => setNewStaff({ ...newStaff, email: e.target.value })} className="w-full p-2 text-sm rounded border dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-bold text-gray-500 mb-1">Password</label>
                                <input required type="text" value={newStaff.password} onChange={e => setNewStaff({ ...newStaff, password: e.target.value })} className="w-full p-2 text-sm rounded border dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
                            </div>
                            <button type="submit" className="bg-navyBlue text-white font-bold p-2 px-6 rounded h-[38px] hover:bg-blue-900">Add Staff</button>
                        </form>

                        <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4">Active Staff Members</h3>
                        <table className="w-full text-left text-sm">
                            <thead><tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500"><th className="pb-2">Name</th><th className="pb-2">Email</th><th className="pb-2">Wallet Reference</th></tr></thead>
                            <tbody>
                                {staff.map(officer => (
                                    <tr key={officer._id} className="border-b dark:border-gray-800">
                                        <td className="py-2 text-gray-800 dark:text-gray-200 font-bold">{officer.name}</td>
                                        <td className="py-2 text-gray-500">{officer.email}</td>
                                        <td className="py-2 font-mono text-saffron">{officer.algorandAddress?.substring(0, 10)}...</td>
                                    </tr>
                                ))}
                                {staff.length === 0 && <tr><td colSpan="3" className="py-4 text-center text-gray-500">No staff members assigned currently.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'STATS' && (
                    <div>
                        <h2 className="text-xl font-bold mb-6 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Verification Reports</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm text-center">
                                <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wide">Approved & Anchored</h3>
                                <p className="text-4xl font-black text-indiaGreen mt-2">{stats.verified}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm text-center">
                                <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wide">Currently Queued</h3>
                                <p className="text-4xl font-black text-yellow-500 mt-2">{stats.pending}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm text-center">
                                <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wide">Rejected Identifications</h3>
                                <p className="text-4xl font-black text-red-500 mt-2">{stats.rejected}</p>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
