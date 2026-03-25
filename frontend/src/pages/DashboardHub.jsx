import React from 'react';
import CitizenDashboard from '../components/dashboards/CitizenDashboard';
import AuthorityDashboard from '../components/dashboards/AuthorityDashboard';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import GovernmentDashboard from '../components/dashboards/GovernmentDashboard';
import BankDashboard from '../components/dashboards/BankDashboard';
import CarbonBuyerDashboard from '../components/dashboards/CarbonBuyerDashboard';
import EmployerDashboard from '../components/dashboards/EmployerDashboard';
import OfficerDashboard from '../components/dashboards/OfficerDashboard';
import { useAuth } from '../context/AuthContext';

export default function DashboardHub() {
    const { user, logout } = useAuth();

    const renderDashboard = () => {
        if (!user) return <p className="text-white">Loading...</p>;

        switch (user.role) {
            case 'CITIZEN': return <CitizenDashboard />;
            case 'GOVERNMENT_AUTHORITY': return <GovernmentDashboard />;
            case 'SUPER_ADMIN': return <AdminDashboard />;
            case 'EMPLOYER': return <EmployerDashboard />;
            case 'VERIFICATION_OFFICER': return <OfficerDashboard />;
            case 'AUTHORITY_ADMIN': return <AuthorityDashboard />;
            case 'BANK': return <BankDashboard />;
            case 'CARBON_BUYER': return <CarbonBuyerDashboard />;
            default:
                return <CitizenDashboard />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 flex flex-col items-center">
            <div className="w-full max-w-7xl">
                <header className="flex flex-col md:flex-row justify-between items-center bg-white/50 dark:bg-black/20 backdrop-blur-xl p-4 rounded-xl shadow-sm border border-white/20 dark:border-white/5 mb-8">
                    <div className="flex items-center gap-3 mb-4 md:mb-0">
                        <div className="h-10 w-10 bg-gradient-to-br from-saffron to-indiaGreen rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            O
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold dark:text-white tracking-tight">OwnIt <span className="text-indiaGreen">Hub</span></h1>
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">{user?.role?.replace('_', ' ')} PORTAL</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <span className="block text-sm font-bold text-gray-800 dark:text-gray-200">{user?.name}</span>
                            <span className="block text-xs text-gray-500">{user?.algorandAddress?.substring(0, 10)}... ALGO</span>
                        </div>
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500/20 font-bold transition"
                        >
                            Sign Out
                        </button>
                    </div>
                </header>

                <main className="w-full">
                    {renderDashboard()}
                </main>
            </div>
        </div>
    );
}
