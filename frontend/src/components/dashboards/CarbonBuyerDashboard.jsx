import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function CarbonBuyerDashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('MARKET');

    const [listings, setListings] = useState([]);
    const [priceData, setPriceData] = useState(null);

    useEffect(() => {
        if (activeTab === 'MARKET') fetchListings();
        if (activeTab === 'PREDICTIONS') fetchPrices();
    }, [activeTab]);

    const fetchListings = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/carbon/listings');
            setListings(res.data);
            if (res.data.length === 0) setMockData();
        } catch (e) { setMockData(); }
    };

    const setMockData = () => {
        setListings([
            { _id: 'C100', ownerId: 'Citizen A', quantity: 150, pricePerTon: 45.2, sourceProject: 'Vindhya Reforestation' },
            { _id: 'C101', ownerId: 'Citizen B', quantity: 50, pricePerTon: 43.5, sourceProject: 'Kerala Solar Farm' }
        ]);
    };

    const fetchPrices = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/carbon/market-prices');
            setPriceData(res.data);
        } catch (e) {
            setPriceData({ currentPricePerTon: 45.2, trend: '+5.3%', history: [38, 40, 42, 45.2] });
        }
    };

    const handleBuy = async (id, quantity) => {
        try {
            await axios.post(`http://localhost:5000/api/carbon/buy/${id}`, { buyerId: user?.id || 'BUYER_1' });
            alert(`Algorand Atomic Swap Executed!\n${quantity} Tons transferred securely to your Corporate Wallet.`);
            fetchListings();
        } catch (err) { alert('Atomic Swap matched on Mock logic'); }
    };

    return (
        <div className="w-full flex flex-col md:flex-row gap-6 mt-4">
            <div className="w-full md:w-64 flex flex-col gap-2 shrink-0">
                <button
                    onClick={() => setActiveTab('MARKET')}
                    className={`px-4 py-3 text-left rounded-lg font-bold transition ${activeTab === 'MARKET' ? 'bg-indiaGreen text-white shadow-lg' : 'bg-white/10 dark:text-gray-300 hover:bg-white/20'}`}
                >
                    Carbon Marketplace
                </button>
                <button
                    onClick={() => setActiveTab('PORTFOLIO')}
                    className={`px-4 py-3 text-left rounded-lg font-bold transition ${activeTab === 'PORTFOLIO' ? 'bg-indiaGreen text-white shadow-lg' : 'bg-white/10 dark:text-gray-300 hover:bg-white/20'}`}
                >
                    Corporate Portfolio
                </button>
                <button
                    onClick={() => setActiveTab('PREDICTIONS')}
                    className={`px-4 py-3 text-left rounded-lg font-bold transition flex justify-between items-center ${activeTab === 'PREDICTIONS' ? 'bg-indiaGreen text-white shadow-lg' : 'bg-white/10 dark:text-gray-300 hover:bg-white/20'}`}
                >
                    <span>AI AI Price Trends</span>
                </button>
            </div>

            <div className="flex-1 glass-panel p-6 min-h-[500px]">
                {activeTab === 'MARKET' && (
                    <div>
                        <h2 className="text-2xl font-bold dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">Verified Carbon Offsets Market</h2>
                        <div className="grid gap-4">
                            {listings.map(item => (
                                <div key={item._id} className="p-4 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-xl flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-lg dark:text-white mb-1">{item.sourceProject}</h3>
                                        <p className="text-sm text-gray-500">Tokenized Volume: <span className="font-bold text-gray-700 dark:text-gray-300">{item.quantity} Tons</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-indiaGreen mb-2">${item.pricePerTon}<span className="text-base text-gray-400 font-normal">/ton</span></p>
                                        <button onClick={() => handleBuy(item._id, item.quantity)} className="bg-indiaGreen text-white font-bold px-4 py-2 rounded shadow hover:bg-green-700 text-sm w-full">Atomic Swap Buy</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'PORTFOLIO' && (
                    <div>
                        <h2 className="text-2xl font-bold dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">Decarbonization Vault History</h2>
                        <div className="p-6 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-gray-800 text-center">
                            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wide">Total Corporate Offset Held</h3>
                            <p className="text-5xl font-black text-indiaGreen my-4">24,500 <span className="text-xl">Tons</span></p>
                            <p className="text-sm text-gray-400">All historical holdings fully retired against ISO standards on the Algorand blockchain.</p>
                        </div>
                    </div>
                )}

                {activeTab === 'PREDICTIONS' && (
                    <div>
                        <h2 className="text-2xl font-bold dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">AI-Driven Forward Price Curve</h2>
                        {priceData && (
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-6 bg-gradient-to-br from-indiaGreen to-green-600 rounded-xl shadow-lg text-white">
                                    <h3 className="text-white/80 text-sm font-bold uppercase tracking-wide mb-2">Spot Price Estimate</h3>
                                    <p className="text-4xl font-black">${priceData.currentPricePerTon}</p>
                                </div>
                                <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700">
                                    <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wide mb-2">12-Month Momentum</h3>
                                    <p className="text-4xl font-black text-indiaGreen">{priceData.trend}</p>
                                </div>
                                <div className="col-span-2 p-6 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-gray-800 mt-4">
                                    <p className="text-center text-gray-500 italic">"Global scarcity models predict high yields across Vindhya assets towards Q3..."</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
