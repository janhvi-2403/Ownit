import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function QRScanner({ onScanSuccess, onScanError }) {
    const [scanning, setScanning] = useState(true);

    useEffect(() => {
        if (!scanning) return;

        const scanner = new Html5QrcodeScanner("reader", {
            fps: 10,
            rememberLastUsedCamera: true
        }, false);

        scanner.render(
            (decodedText) => {
                scanner.clear().catch(e => console.error(e));
                setScanning(false);
                if (onScanSuccess) onScanSuccess(decodedText);
            },
            (error) => {
                if (onScanError) onScanError(error);
            }
        );

        return () => {
            scanner.clear().catch(e => console.error(e));
        };
    }, [scanning, onScanSuccess, onScanError]);

    return (
        <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-saffron max-w-sm mx-auto bg-white p-4">
            {scanning ? (
                <>
                    <h3 className="text-center font-bold text-gray-700 mb-4 text-sm">Align QR code within the frame</h3>
                    <div id="reader" className="w-full"></div>
                </>
            ) : (
                <div className="text-center p-6 text-green-600 font-bold flex flex-col items-center gap-4">
                    <svg className="w-16 h-16 text-indiaGreen animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>Secure Token Decoded!</span>
                    <button onClick={() => setScanning(true)} className="px-4 py-2 mt-4 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded text-sm font-bold transition">Scan Another</button>
                </div>
            )}
        </div>
    );
}
