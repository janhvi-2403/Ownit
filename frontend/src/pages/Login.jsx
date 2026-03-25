import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            alert('Login Failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900">
            <div className="p-8 max-w-md w-full glass-panel">
                <h1 className="text-3xl font-bold text-center text-white mb-6">OwnIt <span className="text-saffron">Bharat</span></h1>
                <p className="text-center text-gray-300 mb-6">India's Digital Ownership Wallet</p>
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Official Email"
                        className="p-3 bg-white/10 rounded-lg text-white outline-none focus:ring-2 focus:ring-saffron"
                        required
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="p-3 bg-white/10 rounded-lg text-white outline-none focus:ring-2 focus:ring-saffron"
                        required
                    />
                    <button type="submit" className="mt-2 p-3 bg-gradient-to-r from-saffron to-orange-500 rounded-lg text-white font-bold hover:opacity-90 transition shadow-md">
                        Access Dashboard
                    </button>
                </form>

                <div className="mt-6 text-center border-t border-white/10 pt-4">
                    <p className="text-gray-400 mb-2 text-sm">New to OwnIt Bharat?</p>
                    <Link to="/register" className="text-indiaGreen font-bold hover:text-green-400">Click here to Register</Link>
                </div>
            </div>
        </div>
    );
}
