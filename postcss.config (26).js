'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

interface User {
    id: string;
    name: string;
    studentId: string;
    branch: string;
    year: number;
}

const BRANCHES = [
    { code: 'CP', name: 'Computer SFI', icon: '💻', color: 'from-blue-500 to-blue-600' },
    { code: 'CP-GIA', name: 'Computer GIA', icon: '🖥️', color: 'from-cyan-500 to-cyan-600' },
    { code: 'EL', name: 'Electronics', icon: '⚡', color: 'from-yellow-500 to-yellow-600' },
    { code: 'EC', name: 'Electronics & Comm', icon: '📡', color: 'from-purple-500 to-purple-600' },
    { code: 'EE', name: 'Electrical', icon: '🔌', color: 'from-orange-500 to-orange-600' },
    { code: 'ME', name: 'Mechanical SFI', icon: '⚙️', color: 'from-gray-500 to-gray-600' },
    { code: 'ME-GIA', name: 'Mechanical GIA', icon: '🔧', color: 'from-slate-500 to-slate-600' },
    { code: 'CE', name: 'Civil', icon: '🏗️', color: 'from-green-500 to-green-600' },
    { code: 'PE', name: 'Production', icon: '🏭', color: 'from-red-500 to-red-600' },
    { code: 'IT', name: 'IT', icon: '📱', color: 'from-indigo-500 to-indigo-600' },
];

export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await fetch('/api/auth/me');
            const data = await response.json();

            if (!response.ok || !data.user.isApproved) {
                router.push('/');
                return;
            }

            setUser(data.user);
        } catch (error) {
            router.push('/');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/');
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <Sidebar />

            <div className="flex-1 ml-64">
                {/* Header */}
                <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-50">
                    <div className="px-8 py-4">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome, {user?.name}!</h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Find and connect with students across all branches</p>
                            </div>

                            <form onSubmit={handleSearch} className="flex-1 max-w-md w-full">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search students by name..."
                                    className="input-field w-full"
                                />
                            </form>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="p-8">
                    <div className="text-center mb-8 animate-fade-in">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Engineering Branches
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Select a branch to explore students and find mentors
                        </p>
                    </div>

                    {/* Branch Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-slide-up">
                        {BRANCHES.map((branch, index) => (
                            <Link
                                key={branch.code}
                                href={`/branch/${branch.code}`}
                                className="group"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="card p-6 h-full flex flex-col items-center text-center cursor-pointer hover:scale-105 transition-all duration-300 group-hover:shadow-2xl">
                                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${branch.color} flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                        {branch.icon}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                        {branch.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        View students →
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Quick Stats */}
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="card p-6 text-center">
                            <div className="text-4xl font-bold text-primary-600 mb-2">2000+</div>
                            <div className="text-gray-600 dark:text-gray-400">Students</div>
                        </div>
                        <div className="card p-6 text-center">
                            <div className="text-4xl font-bold text-primary-600 mb-2">10</div>
                            <div className="text-gray-600 dark:text-gray-400">Branches</div>
                        </div>
                        <div className="card p-6 text-center">
                            <div className="text-4xl font-bold text-primary-600 mb-2">5+</div>
                            <div className="text-gray-600 dark:text-gray-400">Activities</div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
