import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'CITIZEN' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/auth/register', formData);
            alert('Account created successfully! Please login.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration Failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900">
            <div className="p-8 max-w-md w-full glass-panel">
                <h1 className="text-3xl font-bold text-center text-white mb-2">OwnIt <span className="text-saffron">Bharat</span></h1>
                <p className="text-center text-gray-300 mb-6 font-medium">Create Citizen Account</p>

                {error && <div className="p-3 mb-4 text-sm text-red-100 bg-red-500/20 shadow border border-red-500/50 rounded">{error}</div>}

                <form onSubmit={handleRegister} className="flex flex-col gap-4">
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Full Legal Name"
                        className="p-3 bg-white/10 rounded-lg text-white outline-none focus:ring-2 focus:ring-saffron placeholder-gray-400"
                        required
                    />
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Aadhaar-linked Email"
                        className="p-3 bg-white/10 rounded-lg text-white outline-none focus:ring-2 focus:ring-saffron placeholder-gray-400"
                        required
                    />
                    <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Password"
                        className="p-3 bg-white/10 rounded-lg text-white outline-none focus:ring-2 focus:ring-saffron placeholder-gray-400"
                        required
                        minLength={6}
                    />
                    <button type="submit" className="mt-2 p-3 bg-gradient-to-r from-indiaGreen to-green-600 rounded-lg text-white font-bold hover:opacity-90 transition shadow-lg">
                        Register for Digital Wallet
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/login" className="text-gray-400 hover:text-white text-sm">Already have an account? Sign In</Link>
                </div>
            </div>
        </div>
    );
}
