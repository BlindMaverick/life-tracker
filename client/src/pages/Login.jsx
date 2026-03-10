import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

export default function Login({ onSwitch }) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await client.post('/auth/login', { email, password });
            login(res.data.token, res.data.user);
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-indigo-400">⏱ LifeTracker</h1>
                    <p className="text-gray-400 mt-1 text-sm">Your time. Your growth.</p>
                </div>

                <h2 className="text-xl font-bold mb-6">Welcome back</h2>

                {error && (
                    <div className="mb-4 px-4 py-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50
              rounded-lg font-medium text-sm transition mt-2"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </div>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Don't have an account?{' '}
                    <button onClick={onSwitch} className="text-indigo-400 hover:underline">
                        Register
                    </button>
                </p>
            </div>
        </div>
    );
}