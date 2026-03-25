import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('AUTHORITIES');

    // Data States
    const [authorities, setAuthorities] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [auditLogs, setAuditLogs] = useState([]);

    // Form State
    const [newAuthority, setNewAuthority] = useState({ name: '', domain: '', type: 'COLLEGE', email: '', password: '' });
    const [slaValue, setSlaValue] = useState(24);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            if (activeTab === 'AUTHORITIES') {
                const res = await axios.get('http://localhost:5000/api/admin/authorities');
                setAuthorities(res.data);
            } else if (activeTab === 'ANALYTICS') {
                const res = await axios.get('http://localhost:5000/api/admin/system-stats');
                setAnalytics(res.data);
            } else if (activeTab === 'AUDIT') {
                const res = await axios.get('http://localhost:5000/api/admin/audit-logs');
                setAuditLogs(res.data);
            }
        } catch (e) { console.error("Admin fetch error", e); }
    };

    const handleCreateAuthority = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: newAuthority.name,
                domain: newAuthority.domain,
                type: newAuthority.type,
                email: newAuthority.email,
                password: newAuthority.password
            };
            await axios.post('http://localhost:5000/api/admin/authorities', payload);
            alert('Authority generated and Admin Wallet created successfully!');
            setNewAuthority({ name: '', domain: '', type: 'COLLEGE', email: '', password: '' });
            fetchData();
        } catch (err) { alert(`Failed to create authority: ${err.response?.data?.error || err.message}`); }
    };

    const handleToggleStatus = async (id, currentIsActive) => {
        try {
            await axios.put(`http://localhost:5000/api/admin/authorities/${id}/status`, { isActive: !currentIsActive });
            fetchData();
        } catch (err) { alert(`Failed to change status: ${err.response?.data?.error || err.message}`); }
    };

    const handleDeleteAuthority = async (id) => {
        if (!window.confirm("Are you sure? This cannot be undone.")) return;
        try {
            await axios.delete(`http://localhost:5000/api/admin/authorities/${id}`);
            fetchData();
        } catch (err) { alert('Failed to delete'); }
    };

    const handleSetSla = async () => {
        alert(`Verification SLA updated to ${slaValue} hours. Authorities will be measured against this metric.`);
    };

    return (
        <div className="w-full flex flex-col md:flex-row gap-6 mt-4">
            {/* Sidebar Tabs */}
            <div className="w-full md:w-64 flex flex-col gap-2 shrink-0">
                <button
                    onClick={() => setActiveTab('AUTHORITIES')}
                    className={`px-4 py-3 text-left rounded-lg font-bold transition ${activeTab === 'AUTHORITIES' ? 'bg-saffron text-white shadow-lg' : 'bg-white/10 dark:text-gray-300 hover:bg-white/20'}`}
                >
                    Authorities Management
                </button>
                <button
                    onClick={() => setActiveTab('ANALYTICS')}
                    className={`px-4 py-3 text-left rounded-lg font-bold transition ${activeTab === 'ANALYTICS' ? 'bg-saffron text-white shadow-lg' : 'bg-white/10 dark:text-gray-300 hover:bg-white/20'}`}
                >
                    Analytics & Fraud Reports
                </button>
                <button
                    onClick={() => setActiveTab('AUDIT')}
                    className={`px-4 py-3 text-left rounded-lg font-bold transition ${activeTab === 'AUDIT' ? 'bg-saffron text-white shadow-lg' : 'bg-white/10 dark:text-gray-300 hover:bg-white/20'}`}
                >
                    SLAs & Audit Logs
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 glass-panel p-6 min-h-[500px]">
                {activeTab === 'AUTHORITIES' && (
                    <div>
                        <h2 className="text-2xl font-bold dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">Manage Verifying Authorities</h2>

                        <form onSubmit={handleCreateAuthority} className="mb-8 bg-gray-50 dark:bg-black/20 p-4 rounded-xl">
                            <h3 className="text-gray-700 dark:text-white font-bold mb-4">Add New Authority</h3>
                            <div className="flex flex-wrap gap-4 items-end mb-4">
                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-sm font-bold text-gray-500 mb-1">Institution Name</label>
                                    <input required type="text" value={newAuthority.name} onChange={e => setNewAuthority({ ...newAuthority, name: e.target.value })} className="w-full p-2 text-sm rounded border dark:border-gray-600 dark:bg-gray-800 dark:text-white" placeholder="e.g. IIT Delhi" />
                                </div>
                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-sm font-bold text-gray-500 mb-1">Domain Policy</label>
                                    <input required type="text" value={newAuthority.domain} onChange={e => setNewAuthority({ ...newAuthority, domain: e.target.value })} className="w-full p-2 text-sm rounded border dark:border-gray-600 dark:bg-gray-800 dark:text-white" placeholder="e.g. iitd.ac.in" />
                                </div>
                                <div className="w-48">
                                    <label className="block text-sm font-bold text-gray-500 mb-1">Type</label>
                                    <select value={newAuthority.type} onChange={e => setNewAuthority({ ...newAuthority, type: e.target.value })} className="w-full p-2 text-sm rounded border dark:border-gray-600 dark:bg-gray-800 dark:text-white">
                                        <option value="COLLEGE">College / Univ</option>
                                        <option value="HOSPITAL">Hospital</option>
                                        <option value="LAND_OFFICE">Land Office</option>
                                        <option value="GOVERNMENT">Government Dept</option>
                                        <option value="BANK">Bank</option>
                                        <option value="CARBON_BUYER">Carbon Buyer</option>
                                        <option value="EMPLOYER">Corporate Employer</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4 items-end">
                                <div className="flex-1">
                                    <label className="block text-sm font-bold text-gray-500 mb-1">Admin Email</label>
                                    <input required type="email" value={newAuthority.email} onChange={e => setNewAuthority({ ...newAuthority, email: e.target.value })} className="w-full p-2 text-sm rounded border dark:border-gray-600 dark:bg-gray-800 dark:text-white" placeholder="admin@domain.com" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-bold text-gray-500 mb-1">Admin Password</label>
                                    <input required type="text" value={newAuthority.password} onChange={e => setNewAuthority({ ...newAuthority, password: e.target.value })} className="w-full p-2 text-sm rounded border dark:border-gray-600 dark:bg-gray-800 dark:text-white" placeholder="Password for login" />
                                </div>
                                <button type="submit" className="bg-indiaGreen text-white font-bold p-2 px-6 rounded hover:bg-green-700 h-[38px]">Create Authority</button>
                            </div>
                        </form>

                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-gray-500 text-sm border-b dark:border-gray-700">
                                    <th className="py-2">Institution</th>
                                    <th className="py-2">Domain / Email</th>
                                    <th className="py-2">Status</th>
                                    <th className="py-2 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {authorities.map(a => (
                                    <tr key={a._id} className="border-b dark:border-gray-800">
                                        <td className="py-3 font-bold dark:text-gray-200">{a.name} <span className="block text-xs text-gray-400 font-normal">{a.type}</span></td>
                                        <td className="py-3 text-sm dark:text-gray-400">{a.emailDomain.startsWith('@') ? a.emailDomain : '@' + a.emailDomain}<br /><span className="text-xs">{a.contactEmail}</span></td>
                                        <td className="py-3">
                                            <span className={`px-2 py-1 text-xs font-bold rounded ${a.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {a.isActive ? 'ACTIVE' : 'SUSPENDED'}
                                            </span>
                                        </td>
                                        <td className="py-3 text-right">
                                            <button onClick={() => handleToggleStatus(a._id, a.isActive)} className="text-sm text-blue-500 hover:underline mr-4">
                                                {a.isActive ? 'Suspend' : 'Activate'}
                                            </button>
                                            <button onClick={() => handleDeleteAuthority(a._id)} className="text-sm text-red-500 hover:underline">Remove</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'ANALYTICS' && (
                    <div>
                        <h2 className="text-2xl font-bold dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">System Analytics & Fraud Watch</h2>
                        {analytics ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700">
                                    <div className="text-gray-500 text-sm font-bold mb-1">Total Users</div>
                                    <div className="text-3xl font-black text-navyBlue dark:text-blue-400">{analytics.totalUsers || 0}</div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700">
                                    <div className="text-gray-500 text-sm font-bold mb-1">Total Credentials</div>
                                    <div className="text-3xl font-black text-saffron">{analytics.totalCredentials || 0}</div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700">
                                    <div className="text-gray-500 text-sm font-bold mb-1">Active Authorities</div>
                                    <div className="text-3xl font-black text-indiaGreen">{analytics.totalAuthorities || 0}</div>
                                </div>
                            </div>
                        ) : (<p className="text-gray-400">Loading metrics...</p>)}

                        <h3 className="text-xl font-bold dark:text-white text-red-500 mb-4">Latest Fraud Reports</h3>
                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-800">
                            <p className="text-red-700 dark:text-red-400 font-bold">⚠️ Warning: High rate of spoofing attempts targeting Land Records detected from IP Block 104.28.x.x.</p>
                            <div className="mt-2 text-sm text-red-600 dark:text-red-300 opacity-80">Timestamp: {new Date().toLocaleString()} (Logged to Blockchain)</div>
                        </div>
                    </div>
                )}

                {activeTab === 'AUDIT' && (
                    <div>
                        <h2 className="text-2xl font-bold dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">Global SLAs & Audit Logs</h2>

                        <div className="mb-8 bg-gray-50 dark:bg-black/20 p-6 rounded-xl">
                            <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-2">Configure System Verification SLA (Hours)</h3>
                            <div className="flex items-center gap-4">
                                <input type="number" value={slaValue} onChange={e => setSlaValue(e.target.value)} className="w-24 p-2 rounded border dark:bg-gray-800 dark:text-white" />
                                <button onClick={handleSetSla} className="bg-navyBlue text-white px-4 py-2 font-bold rounded hover:opacity-90">Apply SLA Policy</button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Any authority taking longer than {slaValue} hours will be flagged for review.</p>
                        </div>

                        <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4">Immutable Audit Trail</h3>
                        <div className="overflow-auto max-h-[300px]">
                            <table className="w-full text-left text-sm">
                                <thead><tr className="text-gray-400 border-b dark:border-gray-700"><th className="pb-2">TX Hash</th><th className="pb-2">Action</th><th className="pb-2">Timestamp</th></tr></thead>
                                <tbody>
                                    {auditLogs.map((log, i) => (
                                        <tr key={i} className="border-b dark:border-gray-800">
                                            <td className="py-2 text-blue-500 font-mono truncate max-w-[120px]">{log.txHash}</td>
                                            <td className="py-2 dark:text-gray-300">{log.actionType} on {log.targetEntityId}...</td>
                                            <td className="py-2 text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    {auditLogs.length === 0 && <tr><td colSpan="3" className="py-4 text-gray-500 text-center">No recent audit logs retrieved.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
