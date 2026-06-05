'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        studentId: '',
        password: '',
        name: '',
        email: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            if (isLogin) {
                if (data.user.isAdmin) {
                    router.push('/admin');
                } else if (data.user.isApproved) {
                    router.push('/dashboard');
                } else {
                    setError('Your account is pending admin approval');
                }
            } else {
                setError('Account created! Please wait for admin approval.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <div className="max-w-md w-full space-y-8 animate-fade-in">
                {/* Logo/Header */}
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-primary-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                        <span className="text-3xl font-bold text-white">PF</span>
                    </div>
                    <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">
                        PeerFetch
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Engineering Student Networking Platform
                    </p>
                </div>

                {/* Form Card */}
                <div className="card p-8 animate-slide-up">
                    <div className="flex rounded-lg bg-gray-100 dark:bg-slate-700 p-1 mb-6">
                        <button
                            type="button"
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${isLogin
                                    ? 'bg-white dark:bg-slate-600 text-primary-600 dark:text-primary-400 shadow-md'
                                    : 'text-gray-600 dark:text-gray-400'
                                }`}
                        >
                            Login
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${!isLogin
                                    ? 'bg-white dark:bg-slate-600 text-primary-600 dark:text-primary-400 shadow-md'
                                    : 'text-gray-600 dark:text-gray-400'
                                }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Full Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    required={!isLogin}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field"
                                    placeholder="John Doe"
                                />
                            </div>
                        )}

                        <div>
                            <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Student ID
                            </label>
                            <input
                                id="studentId"
                                type="text"
                                required
                                value={formData.studentId}
                                onChange={(e) => setFormData({ ...formData, studentId: e.target.value.toUpperCase() })}
                                className="input-field"
                                placeholder="25EL011"
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Format: YearBranchRoll (e.g., 25EL011)
                            </p>
                        </div>

                        {!isLogin && (
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Email (Optional)
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="input-field"
                                    placeholder="you@college.edu"
                                />
                            </div>
                        )}

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="input-field"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Sign Up'}
                        </button>
                    </form>

                    {!isLogin && (
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-700 dark:text-blue-300">
                            <strong>Note:</strong> New accounts require admin approval before accessing the platform.
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                    <p>Supported Branches: EL, CP, EC, EE, ME, CE, PE, IT</p>
                    <p className="mt-1">Demo: ADMIN001 / admin123</p>
                </div>
            </div>
        </div>
    );
}
