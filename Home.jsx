'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Student {
    id: string;
    studentId: string;
    name: string;
    year: number;
    branch: string;
    profilePicture: string | null;
    bio: string | null;
    skills: string | null;
    extracurriculars: string | null;
}

export default function SearchClient() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';

    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (query) {
            searchStudents();
        }
    }, [query]);

    const searchStudents = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/students?search=${encodeURIComponent(query)}`);
            const data = await response.json();

            if (response.ok) {
                setStudents(data.students);
            }
        } catch (error) {
            console.error('Error searching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const getBranchName = (code: string) => {
        const branches: Record<string, string> = {
            EL: 'Electronics',
            CP: 'Computer',
            EC: 'EC',
            EE: 'Electrical',
            ME: 'Mechanical',
            CE: 'Civil',
            PE: 'Production',
            IT: 'IT',
        };
        return branches[code] || code;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-primary-600">
                            ← Back to Dashboard
                        </Link>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Search Results
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Found <span className="font-semibold text-primary-600">{students.length}</span> students matching "{query}"
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Searching...</p>
                    </div>
                ) : students.length === 0 ? (
                    <div className="text-center py-12 card p-8">
                        <div className="text-6xl mb-4">🔍</div>
                        <p className="text-gray-600 dark:text-gray-400">No students found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {students.map((student, index) => (
                            <Link
                                key={student.id}
                                href={`/student/${student.id}`}
                                className="group"
                                style={{ animationDelay: `${index * 30}ms` }}
                            >
                                <div className="card p-6 h-full hover:scale-105 transition-all duration-300 cursor-pointer animate-slide-up">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-slate-700 flex-shrink-0">
                                            {student.profilePicture ? (
                                                <Image
                                                    src={student.profilePicture}
                                                    alt={student.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-primary-600">
                                                    {student.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                                                {student.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {student.studentId} • {getBranchName(student.branch)}
                                            </p>
                                            <span className={`inline-block mt-1 text-xs font-semibold px-2 py-1 rounded ${student.year >= 3
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                                }`}>
                                                {student.year >= 3 ? 'Senior' : 'Junior'}
                                            </span>
                                        </div>
                                    </div>

                                    {student.bio && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                            {student.bio}
                                        </p>
                                    )}

                                    {student.extracurriculars && (
                                        <div className="flex flex-wrap gap-2">
                                            {JSON.parse(student.extracurriculars).map((activity: string) => (
                                                <span key={activity} className="badge">
                                                    {activity}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
