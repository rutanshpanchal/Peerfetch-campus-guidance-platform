'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import Image from 'next/image';

interface User {
    id: string;
    studentId: string;
    name: string;
    email: string | null;
    branch: string;
    year: number;
    batch: number;
    profilePicture: string | null;
    bio: string | null;
}

interface Connection {
    id: string;
    user: User;
    status: string;
    createdAt: string;
    type: 'sent' | 'received';
}

export default function ConnectionsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'accepted' | 'pending'>('accepted');
    const [connections, setConnections] = useState<Connection[]>([]);

    useEffect(() => {
        fetchConnections();
    }, [activeTab]);

    const fetchConnections = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/connections?status=${activeTab}`);
            const data = await response.json();

            if (response.ok) {
                setConnections(data.connections || []);
            } else {
                if (response.status === 401) {
                    router.push('/');
                }
            }
        } catch (error) {
            console.error('Error fetching connections:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (connectionId: string) => {
        try {
            const response = await fetch('/api/connections', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ connectionId, action: 'accept' }),
            });

            if (response.ok) {
                fetchConnections();
            }
        } catch (error) {
            console.error('Error accepting connection:', error);
        }
    };

    const handleReject = async (connectionId: string) => {
        try {
            const response = await fetch('/api/connections', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ connectionId, action: 'reject' }),
            });

            if (response.ok) {
                fetchConnections();
            }
        } catch (error) {
            console.error('Error rejecting connection:', error);
        }
    };

    const handleDelete = async (connectionId: string) => {
        if (!confirm('Are you sure you want to remove this connection?')) return;

        try {
            const response = await fetch(`/api/connections?id=${connectionId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchConnections();
            }
        } catch (error) {
            console.error('Error deleting connection:', error);
        }
    };

    const getBranchName = (code: string) => {
        const branches: Record<string, string> = {
            EL: 'Electronics',
            CP: 'Computer Science',
            EC: 'Electronics & Communication',
            EE: 'Electrical',
            ME: 'Mechanical',
            CE: 'Civil',
            PE: 'Production',
            IT: 'Information Technology',
        };
        return branches[code] || code;
    };

    const pendingRequests = connections.filter((conn) => conn.type === 'received');
    const acceptedConnections = connections.filter((conn) => conn.status === 'accepted');

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                <div className="max-w-5xl">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Connections
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Manage your network and connect with other students
                    </p>

                    {/* Tabs */}
                    <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-slate-700">
                        <button
                            onClick={() => setActiveTab('accepted')}
                            className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === 'accepted'
                                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                        >
                            My Connections ({acceptedConnections.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`px-4 py-2 font-medium border-b-2 transition-colors relative ${activeTab === 'pending'
                                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                        >
                            Requests ({pendingRequests.length})
                            {pendingRequests.length > 0 && (
                                <span className="ml-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                    {pendingRequests.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        </div>
                    ) : connections.length === 0 ? (
                        <div className="text-center py-12 card">
                            <div className="text-6xl mb-4">🔗</div>
                            <p className="text-gray-600 dark:text-gray-400">
                                {activeTab === 'accepted'
                                    ? 'No connections yet. Start connecting with other students!'
                                    : 'No pending requests'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {connections.map((connection) => (
                                <div key={connection.id} className="card p-6 hover:shadow-lg transition-shadow">
                                    <div className="flex items-center gap-4">
                                        <Link href={`/student/${connection.user.id}`}>
                                            {connection.user.profilePicture ? (
                                                <Image
                                                    src={connection.user.profilePicture}
                                                    alt={connection.user.name}
                                                    width={64}
                                                    height={64}
                                                    className="rounded-full"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-xl">
                                                    {connection.user.name.charAt(0)}
                                                </div>
                                            )}
                                        </Link>

                                        <div className="flex-1">
                                            <Link
                                                href={`/student/${connection.user.id}`}
                                                className="font-semibold text-lg text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                                            >
                                                {connection.user.name}
                                            </Link>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                                {connection.user.studentId} • {getBranchName(connection.user.branch)} • Year {connection.user.year}
                                            </p>
                                            {connection.user.bio && (
                                                <p className="text-gray-500 dark:text-gray-500 text-sm mt-1 line-clamp-1">
                                                    {connection.user.bio}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            {activeTab === 'pending' && connection.type === 'received' ? (
                                                <>
                                                    <button
                                                        onClick={() => handleAccept(connection.id)}
                                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(connection.id)}
                                                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                                                    >
                                                        Decline
                                                    </button>
                                                </>
                                            ) : activeTab === 'pending' && connection.type === 'sent' ? (
                                                <span className="text-gray-500 dark:text-gray-400 text-sm px-4 py-2">
                                                    Pending...
                                                </span>
                                            ) : (
                                                <>
                                                    <Link
                                                        href={`/messages?userId=${connection.user.id}`}
                                                        className="btn-primary"
                                                    >
                                                        Message
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(connection.id)}
                                                        className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
