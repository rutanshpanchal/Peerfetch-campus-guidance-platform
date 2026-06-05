'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Student {
    id: string;
    studentId: string;
    name: string;
    email: string | null;
    branch: string;
    year: number;
    batch: number;
    profilePicture: string | null;
    bio: string | null;
    skills: string | null;
    extracurriculars: string | null;
    linkedinUrl: string | null;
}

export default function StudentProfilePage() {
    const router = useRouter();
    const params = useParams();
    const studentId = params.id as string;

    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [requestSent, setRequestSent] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'accepted'>('none');

    useEffect(() => {
        fetchStudent();
        fetchConnectionStatus();
    }, [studentId]);

    const fetchStudent = async () => {
        try {
            const response = await fetch(`/api/students/${studentId}`);
            const data = await response.json();

            if (response.ok) {
                setStudent(data.student);
            } else {
                router.push('/dashboard');
            }
        } catch (error) {
            console.error('Error fetching student:', error);
            router.push('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const fetchConnectionStatus = async () => {
        try {
            // Fetch all connections (both pending and accepted)
            const [pendingRes, acceptedRes] = await Promise.all([
                fetch('/api/connections?status=pending'),
                fetch('/api/connections?status=accepted'),
            ]);

            const pendingData = await pendingRes.json();
            const acceptedData = await acceptedRes.json();

            // Check accepted connections first (higher priority)
            const acceptedConnection = (acceptedData.connections || []).find(
                (conn: any) => conn.user.id === studentId
            );

            if (acceptedConnection) {
                setConnectionStatus('accepted');
                return;
            }

            // Then check pending connections
            const pendingConnection = (pendingData.connections || []).find(
                (conn: any) => conn.user.id === studentId
            );

            if (pendingConnection) {
                setConnectionStatus('pending');
                return;
            }

            // No connection found
            setConnectionStatus('none');
        } catch (error) {
            console.error('Error fetching connection status:', error);
        }
    };

    const handleConnect = async () => {
        try {
            const response = await fetch('/api/connections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ receiverId: studentId }),
            });

            if (response.ok) {
                setConnectionStatus('pending');
                fetchConnectionStatus(); // Refresh status
                alert('Connection request sent!');
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to send request');
            }
        } catch (error) {
            console.error('Error sending connection:', error);
            alert('Failed to send request');
        }
    };

    const handleMentorshipRequest = async () => {
        try {
            const response = await fetch('/api/mentorship/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mentorId: studentId,
                    message: 'Hi! I would like to connect with you for mentorship.',
                }),
            });

            if (response.ok) {
                setRequestSent(true);
                alert('Mentorship request sent successfully!');
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to send request');
            }
        } catch (error) {
            console.error('Error sending request:', error);
            alert('Failed to send request');
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!student) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 shadow-md">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link href="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-primary-600">
                        ← Back to Dashboard
                    </Link>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="card p-8 animate-fade-in">
                    {/* Profile Header */}
                    <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
                        <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-gray-200 dark:bg-slate-700 flex-shrink-0 shadow-xl">
                            {student.profilePicture ? (
                                <Image
                                    src={student.profilePicture}
                                    alt={student.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-primary-600">
                                    {student.name.charAt(0)}
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                        {student.name}
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                                        {student.studentId} • {getBranchName(student.branch)}
                                    </p>
                                    <div className="flex gap-2 flex-wrap">
                                        <span className="badge">
                                            Year {student.year}
                                        </span>
                                        <span className={`badge ${student.year >= 3
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                            }`}>
                                            {student.year >= 3 ? 'Senior' : 'Junior'}
                                        </span>
                                        <span className="badge">
                                            Batch {student.batch}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {connectionStatus === 'none' ? (
                                        <button
                                            onClick={handleConnect}
                                            className="btn-primary whitespace-nowrap flex items-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                                            </svg>
                                            Connect
                                        </button>
                                    ) : connectionStatus === 'pending' ? (
                                        <span className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 rounded-lg font-medium">
                                            Request Pending
                                        </span>
                                    ) : (
                                        <Link
                                            href={`/messages?userId=${studentId}`}
                                            className="btn-primary whitespace-nowrap flex items-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                            </svg>
                                            Message
                                        </Link>
                                    )}

                                    {student.linkedinUrl && (
                                        <a
                                            href={student.linkedinUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-secondary whitespace-nowrap flex items-center gap-2"
                                        >
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                            >
                                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                            </svg>
                                            LinkedIn
                                        </a>
                                    )}
                                </div>
                            </div>

                            {student.email && (
                                <p className="text-gray-600 dark:text-gray-400">
                                    📧 {student.email}
                                </p>
                            )}

                        </div>
                    </div>

                    {/* Bio */}
                    {student.bio && (
                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">About</h2>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                {student.bio}
                            </p>
                        </div>
                    )}

                    {/* Skills */}
                    {student.skills && (
                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Skills</h2>
                            <div className="flex flex-wrap gap-2">
                                {JSON.parse(student.skills).map((skill: string) => (
                                    <span
                                        key={skill}
                                        className="px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg font-medium text-sm border border-primary-200 dark:border-primary-800"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Extracurriculars */}
                    {student.extracurriculars && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                Extracurricular Activities
                            </h2>
                            <div className="flex flex-wrap gap-3">
                                {JSON.parse(student.extracurriculars).map((activity: string) => (
                                    <span
                                        key={activity}
                                        className="px-5 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                                    >
                                        {activity}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
