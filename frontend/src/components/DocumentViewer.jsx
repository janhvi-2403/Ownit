import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

export default function DocumentViewer({ documentUrl, credentialId }) {
    const videoRef = useRef(null);
    const [accessBlocked, setAccessBlocked] = useState(false);
    const [violationMsg, setViolationMsg] = useState('');
    const [model, setModel] = useState(null);

    // Security Measures Component
    useEffect(() => {
        // Disable right click
        const handleContext = (e) => e.preventDefault();
        document.addEventListener('contextmenu', handleContext);

        // Disable Print and Save Shortcuts
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's')) {
                e.preventDefault();
                alert("Action blocked for security reasons.");
            }
        };
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('contextmenu', handleContext);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Load COCO-SSD Model
    useEffect(() => {
        let isMounted = true;
        cocoSsd.load().then(loadedModel => {
            if (isMounted) setModel(loadedModel);
        }).catch(err => console.error("Failed to load COCO-SSD", err));
        return () => { isMounted = false; };
    }, []);

    // Set up camera for background ML analysis
    useEffect(() => {
        let streamRef = null;
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    streamRef = stream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                })
                .catch(err => {
                    console.error("Camera access denied. Document access requires camera verification.", err);
                    setAccessBlocked(true);
                    setViolationMsg("Camera access is mandatory to view secure documents.");
                });
        }

        return () => {
            // Clean up camera stream
            if (streamRef) {
                streamRef.getTracks().forEach(t => t.stop());
            }
        };
    }, []);

    // Real-time TF.JS Detection polling every 1.5 seconds
    useEffect(() => {
        if (accessBlocked || !model || !videoRef.current) return;

        const interval = setInterval(async () => {
            if (videoRef.current.readyState === 4) {
                try {
                    const predictions = await model.detect(videoRef.current);

                    // Check if any prediction is a cell phone
                    const phoneDetected = predictions.find(p => p.class === 'cell phone' && p.score > 0.60);

                    if (phoneDetected) {
                        setAccessBlocked(true);
                        setViolationMsg(`Mobile device detected! Confidence: ${(phoneDetected.score * 100).toFixed(1)}%. Screenshot attempt blocked.`);

                        // Log to backend
                        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/detection/analyze`, {
                            confidence: Math.round(phoneDetected.score * 100),
                            documentId: credentialId,
                            isMobileDetected: true,
                            frames: 'client-side-coco-ssd'
                        });
                    }
                } catch (error) {
                    console.error("TFJS detection analysis failed", error);
                }
            }
        }, 1500);

        return () => clearInterval(interval);
    }, [accessBlocked, model, credentialId]);

    if (accessBlocked) {
        return (
            <div className="h-64 flex flex-col items-center justify-center bg-red-50 text-red-600 rounded-xl border border-red-200 p-8 text-center animate-pulse">
                <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 className="text-2xl font-bold">Access Blocked</h2>
                <p className="mt-2 text-red-500 font-medium">{violationMsg}</p>
                <p className="mt-4 text-sm text-red-400">Your session has been terminated and the document owner notified.</p>
            </div>
        );
    }

    return (
        <div className="relative group p-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            {/* Invisible video element to pipe into TFJS */}
            <video ref={videoRef} autoPlay playsInline muted className="hidden" />

            {/* Watermark overlay to deter simple screenshottings */}
            <div className="absolute inset-0 pointer-events-none opacity-10 flex flex-wrap content-center justify-center overflow-hidden z-10 select-none">
                {Array.from({ length: 20 }).map((_, i) => (
                    <span key={i} className="transform -rotate-45 text-4xl p-8 font-bold">OWNIT SECURE VIEWER - UID {credentialId}</span>
                ))}
            </div>

            <div className="h-96 w-full bg-gray-100 dark:bg-slate-900 rounded flex items-center justify-center overflow-auto no-print">
                {documentUrl ? (
                    <iframe
                        src={documentUrl}
                        title="Document Viewer"
                        className="w-full h-full"
                        sandbox="allow-same-origin allow-scripts"
                    />
                ) : (
                    <div className="text-gray-400 dark:text-gray-600 flex flex-col items-center gap-2">
                        <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>Document securely loaded. Mobile detection active (COCO-SSD).</span>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @media print {
          .no-print { display: none !important; }
          body::after {
            content: "UNAUTHORIZED PRINT ATTEMPT";
            position: fixed;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            font-size: 50px;
            color: red;
          }
        }
      `}} />
        </div>
    );
}
