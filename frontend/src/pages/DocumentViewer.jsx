import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

export default function DocumentViewer() {
    const { qrId } = useParams();
    const [credential, setCredential] = useState(null);
    const [payload, setPayload] = useState(null);
    const [error, setError] = useState('');
    const [blocked, setBlocked] = useState(false);
    const [blockReason, setBlockReason] = useState('');

    const videoRef = useRef(null);
    const modelRef = useRef(null);
    const streamRef = useRef(null);

    // Initial Fetch & Environment Constraints
    useEffect(() => {
        const fetchDoc = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/qr/document/${qrId}`);
                setCredential(res.data.credential);
                setPayload(res.data.qrPayload);
                startCamera(); // Proceed to activate environment tracking
            } catch (e) { setError(e.response?.data?.message || 'Decryption failed or Token expired.'); }
        };
        fetchDoc();

        // 1. Prevent Right Click
        const handleContextMenu = (e) => e.preventDefault();
        window.addEventListener('contextmenu', handleContextMenu);

        // 2. Prevent Ctrl+S, Ctrl+P
        const handleKeyDown = (e) => {
            if (e.ctrlKey && (e.key === 's' || e.key === 'p' || e.key === 'c')) {
                e.preventDefault();
                triggerViolation('Blocked Keyboard Shortcut Attempt (Ctrl+S/P/C)');
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        // 3. Tab Switch Detection
        const handleVisibilityChange = () => {
            if (document.hidden && !blocked) {
                triggerViolation('Tab Switch / Background Focus detected.');
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // 4. Inactivity Timeout (5 mins)
        let timeout;
        const resetTimeout = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => triggerViolation('Session Timeout (5 mins inactivity)'), 5 * 60 * 1000);
        };
        window.addEventListener('mousemove', resetTimeout);
        window.addEventListener('keydown', resetTimeout);
        resetTimeout();

        return () => {
            window.removeEventListener('contextmenu', handleContextMenu);
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('mousemove', resetTimeout);
            window.removeEventListener('keydown', resetTimeout);
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        };
    }, [qrId, blocked]);

    // AI Camera Activation & TensorFlow Loop
    const startCamera = async () => {
        try {
            modelRef.current = await cocoSsd.load();
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            videoRef.current.srcObject = stream;

            // Wait for video to be ready before starting loop
            videoRef.current.onloadeddata = () => {
                detectFrame();
            };
        } catch (err) {
            setError('Camera access is MANDATORY for secure viewing.');
        }
    };

    const detectFrame = async () => {
        if (blocked) return;
        if (videoRef.current && modelRef.current) {
            try {
                const predictions = await modelRef.current.detect(videoRef.current);
                const phone = predictions.find(p => p.class === 'cell phone' && p.score > 0.6);

                if (phone) {
                    triggerViolation(`Mobile Device Detected! (Confidence: ${(phone.score * 100).toFixed(1)}%)`);
                    return; // Stop loop
                }
            } catch (e) { }
        }
        if (!blocked) setTimeout(detectFrame, 2000); // Scan every 2 seconds
    };

    const triggerViolation = async (reason) => {
        if (blocked) return;
        setBlocked(true);
        setBlockReason(reason);
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());

        try {
            await axios.post(`http://localhost:5000/api/qr/violation/${qrId}`, { reason });
        } catch (e) { }
    };

    if (error) {
        return <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6"><div className="bg-red-500/10 border border-red-500 p-8 rounded-xl max-w-md text-red-500 font-bold text-center"><h2>Access Denied</h2><p className="mt-2 opacity-80">{error}</p></div></div>;
    }

    if (!credential) return <div className="text-white text-center p-12">Decrypting Blockchain Vault...</div>;

    const watermarkText = `VIEWER TRACKING\n${new Date().toISOString()}`;

    return (
        <div className="min-h-screen bg-black text-white p-4 lg:p-12 relative overflow-hidden select-none" style={{ '@media print': { display: 'none' } }}>
            {/* Hidden camera output for TFJS to read */}
            <video ref={videoRef} autoPlay playsInline muted srcLang="en" className="opacity-0 absolute top-0 pointer-events-none w-[100px] h-[100px]" />

            <div className={`transition duration-1000 ${blocked ? 'blur-3xl opacity-20 pointer-events-none' : ''}`}>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            <span className="bg-saffron text-black px-2 py-0.5 rounded text-xs">SECURE VIEW</span>
                            {credential.userId?.name}'s {credential.type}
                        </h1>
                        <p className="text-gray-500 text-sm font-mono mt-1">Algorand Asset Anchor: #{credential.blockchainTxId || 'Pending'}</p>
                    </div>
                </div>

                <div className="relative mx-auto rounded-lg overflow-hidden border-2 border-dashed border-gray-700 max-w-4xl bg-white/5 p-4 pointer-events-none">
                    {/* Visual Security Watermarking (Steganography substitute) */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 opacity-10 rotate-[-30deg] text-white whitespace-pre text-8xl font-black mix-blend-overlay break-words leading-tight text-center">
                        {watermarkText.repeat(10)}
                    </div>

                    {/* Render Image (No Right Click allowed by CSS + JS event) */}
                    <img
                        src={credential.documentUrl}
                        alt="Secure Credential"
                        className="w-full h-auto object-contain select-none pointer-events-none"
                        draggable="false"
                    />
                </div>
            </div>

            {/* Blocked Red Alert Component */}
            {blocked && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-red-900/90 backdrop-blur-md p-6">
                    <div className="bg-black border border-red-500 max-w-lg p-8 rounded-2xl shadow-2xl text-center">
                        <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-black text-red-500 mb-2 uppercase tracking-widest">SECURITY BREACH DETECTED</h2>
                        <h3 className="text-xl text-white mb-6">Access Terminated Instantly.</h3>
                        <div className="bg-red-500/10 p-4 rounded text-red-300 font-mono text-sm inline-block border border-red-500/30">
                            <strong>Threat Vector intercepted:</strong><br />
                            {blockReason}
                        </div>
                        <p className="mt-6 text-gray-500 text-sm">Real-time alert has been dispatched to {credential?.userId?.name}'s device. This session trace ID has been logged to the integrity registry.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
