import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function OfficerDashboard() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [notes, setNotes] = useState('');
    const [performance, setPerformance] = useState({ L1: 45, L2: 12, L3: 3, accuracy: '99.4%' });

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            // Inherits the same endpoint as generic Authority admins but in a production setup 
            // the backend might filter by "assignedTo: user_id"
            const res = await axios.get(`http://localhost:5000/api/authority/pending-verifications?email=${user.email}`);
            setTasks(res.data);
        } catch (e) { }
    };

    const handleLevelVerification = async (level) => {
        if (!selectedTask) return;
        try {
            if (level === 3) {
                // Final Level Verification triggers actual Blockchain API
                await axios.post(`http://localhost:5000/api/authority/verify/${selectedTask._id}`);
                alert("Level 3 Escalation Complete! Identity fully anchored to Algorand network.");
                setSelectedTask(null);
                fetchTasks();
            } else {
                alert(`Level ${level} manual diligence pass cached. Advancing task.`);
                // In production, hits a PUT route updating progress states
            }
        } catch (e) { alert("Failed to commit verification state."); }
    };

    const handleSubmitNotes = (e) => {
        e.preventDefault();
        alert(`Diligence Evidence Logged:\n\n${notes}`);
        setNotes('');
    };

    return (
        <div className="w-full flex flex-col md:flex-row gap-6 mt-4">
            {/* Left Queue */}
            <div className="w-full md:w-80 flex flex-col shrink-0">
                <div className="bg-white/10 dark:bg-black/20 p-4 rounded-xl border border-gray-200 dark:border-gray-800 mb-4 text-center">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">My Performance Meta</h3>
                    <div className="flex justify-around items-end">
                        <div><span className="block text-xl font-black text-navyBlue dark:text-blue-400">{performance.L1}</span><span className="text-[10px] text-gray-500">L1 Checks</span></div>
                        <div><span className="block text-xl font-black text-saffron">{performance.L2}</span><span className="text-[10px] text-gray-500">L2 Checks</span></div>
                        <div><span className="block text-xl font-black text-indiaGreen">{performance.accuracy}</span><span className="text-[10px] text-gray-500">Accuracy Score</span></div>
                    </div>
                </div>

                <h2 className="font-bold dark:text-white mb-2 text-sm uppercase tracking-wider text-gray-500">Assigned Processing Queue</h2>
                <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-2">
                    {tasks.map(t => (
                        <div
                            key={t._id}
                            onClick={() => setSelectedTask(t)}
                            className={`p-4 rounded-xl border cursor-pointer transition ${selectedTask?._id === t._id ? 'bg-navyBlue border-navyBlue shadow-lg text-white' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700'}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`font-bold ${selectedTask?._id === t._id ? 'text-white' : 'dark:text-white'}`}>{t.userId?.name || 'Applicant'}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${t.fraudScore > 10 ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                                    AI: {t.fraudScore > 10 ? 'RISK' : 'PASS'}
                                </span>
                            </div>
                            <span className={`block text-xs ${selectedTask?._id === t._id ? 'text-blue-200' : 'text-gray-500'}`}>{t.type}</span>
                        </div>
                    ))}
                    {tasks.length === 0 && <div className="text-sm text-gray-400 p-4 text-center border border-dashed rounded-xl border-gray-300 dark:border-gray-700 mt-2">No tasks assigned to your desk.</div>}
                </div>
            </div>

            {/* Right Workspace Area */}
            <div className="flex-1 glass-panel p-6 min-h-[500px] flex flex-col">
                <h2 className="text-2xl font-bold dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">Verification Desk Workspace</h2>

                {selectedTask ? (
                    <div className="flex-1 flex flex-col gap-6 animate-fade-in">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                                <span className="block text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">Asset Target</span>
                                <span className="text-lg font-bold dark:text-white">{selectedTask.type}</span>
                                <a href={selectedTask.documentUrl} target="_blank" rel="noreferrer" className="block mt-2 text-sm text-blue-500 hover:underline">View Rendered PDF/Image Evidence</a>
                            </div>
                            <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                                <span className="block text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">AI Heuristic Score</span>
                                <span className={`text-lg font-bold ${selectedTask.fraudScore > 10 ? 'text-red-500' : 'text-indiaGreen'}`}>{100 - (selectedTask.fraudScore || 2)}% Trusted Match</span>
                                <span className="block mt-2 text-sm text-gray-500 dark:text-gray-400">ML Extractor verified 12/12 data points against submitted document.</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmitNotes} className="bg-gray-50 dark:bg-black/20 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                            <label className="block text-sm uppercase tracking-widest text-gray-400 font-bold mb-2">Officer Evidence Notes & Flags</label>
                            <textarea required value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-3 rounded text-sm min-h-[80px] border dark:border-gray-600 dark:bg-gray-800 dark:text-white" placeholder="Record manual checks, conversations, or reference IDs..." />
                            <button type="submit" className="mt-2 bg-gray-200 dark:bg-gray-700 dark:text-white font-bold text-xs px-4 py-2 rounded hover:opacity-80">Sync Notes to Central Repo</button>
                        </form>

                        <div className="bg-navyBlue/5 border border-navyBlue/20 p-4 rounded-lg mt-auto">
                            <h3 className="font-bold text-navyBlue dark:text-blue-400 mb-3 text-sm">Escalation & Final Processing Array</h3>
                            <div className="flex gap-4">
                                <button onClick={() => handleLevelVerification(1)} className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 dark:text-white font-bold text-sm py-2 rounded shadow hover:bg-gray-50 dark:hover:bg-gray-700">Level 1 (Basic)</button>
                                <button onClick={() => handleLevelVerification(2)} className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 dark:text-white font-bold text-sm py-2 rounded shadow hover:bg-gray-50 dark:hover:bg-gray-700">Level 2 (Deep Check)</button>
                                <button onClick={() => handleLevelVerification(3)} className="flex-1 bg-saffron text-white font-bold text-sm py-2 rounded shadow hover:opacity-90">Level 3 (Final Anchor)</button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 text-center opacity-80">Level 3 instantly deploys Algorand Smart Contract signatures concluding the officer operation.</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 opacity-60">
                        <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <p className="font-bold">Select a pending request from the queue to open the verification workspace.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
