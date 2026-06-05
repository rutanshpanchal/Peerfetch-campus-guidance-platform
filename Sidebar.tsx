'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Student {
    id: string;
    studentId: string;
    name: string;
    year: number;
    profilePicture: string | null;
    bio: string | null;
    skills: string | null;
    extracurriculars: string | null;
}

const ACTIVITIES = ['TRS', 'TSA', 'BAHA', 'IEEE', 'IEI'];

export default function BranchPage() {
    const router = useRouter();
    const params = useParams();
    const branchCode = params.branch as string;

    const [selectedYear, setSelectedYear] = useState(1);
    const [students, setStudents] = useState<Student[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStudents();
    }, [branchCode, selectedYear]);

    useEffect(() => {
        filterStudents();
    }, [students, selectedActivities]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/students?branch=${branchCode}&year=${selectedYear}`);
            const data = await response.json();

            if (response.ok) {
                setStudents(data.students);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterStudents = () => {
        if (selectedActivities.length === 0) {
            setFilteredStudents(students);
            return;
        }

        const filtered = students.filter((student) => {
            if (!student.extracurriculars) return false;

            try {
                const activities = JSON.parse(student.extracurriculars);
                return selectedActivities.some((activity) => activities.includes(activity));
            } catch {
                return false;
            }
        });

        setFilteredStudents(filtered);
    };

    const toggleActivity = (activity: string) => {
        setSelectedActivities((prev) =>
            prev.includes(activity)
                ? prev.filter((a) => a !== activity)
                : [...prev, activity]
        );
    };

    const getBranchName = (code: string) => {
        const branches: Record<string, string> = {
            EL: 'Electronics',
            CP: 'Computer',
            'CP-GIA': 'Computer GIA',
            EC: 'Electronics & Communication',
            EE: 'Electrical',
            ME: 'Mechanical',
            'ME-GIA': 'Mechanical GIA',
            CE: 'Civil',
            PE: 'Production',
            IT: 'IT',
        };
        return branches[code] || code;
    };

    const getYearLabel = (year: number) => {
        return `${year}${year === 1 ? 'st' : year === 2 ? 'nd' : year === 3 ? 'rd' : 'th'} Year`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-primary-600">
                                ← Back
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {getBranchName(branchCode)}
                                </h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Find students and mentors
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Year Tabs */}
                <div className="card p-2 mb-6 inline-flex gap-2">
                    {[1, 2, 3, 4].map((year) => (
                        <button
                            key={year}
                            onClick={() => setSelectedYear(year)}
                            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${selectedYear === year
                                    ? 'bg-primary-600 text-white shadow-lg scale-105'
                                    : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                                }`}
                        >
                            {getYearLabel(year)}
                        </button>
                    ))}
                </div>

                {/* Activity Filter */}
                <div className="card p-6 mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Filter by Activities:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {ACTIVITIES.map((activity) => (
                            <button
                                key={activity}
                                onClick={() => toggleActivity(activity)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${selectedActivities.includes(activity)
                                        ? 'bg-primary-600 text-white shadow-md scale-105'
                                        : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                                    }`}
                            >
                                {activity}
                            </button>
                        ))}
                        {selectedActivities.length > 0 && (
                            <button
                                onClick={() => setSelectedActivities([])}
                                className="px-4 py-2 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Student Count */}
                <div className="mb-4">
                    <p className="text-gray-600 dark:text-gray-400">
                        Showing <span className="font-semibold text-primary-600">{filteredStudents.length}</span> students
                    </p>
                </div>

                {/* Student Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading students...</p>
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <div className="text-center py-12 card p-8">
                        <div className="text-6xl mb-4">🔍</div>
                        <p className="text-gray-600 dark:text-gray-400">No students found with selected filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStudents.map((student, index) => (
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
                                                {student.studentId}
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
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {JSON.parse(student.extracurriculars).map((activity: string) => (
                                                <span key={activity} className="badge">
                                                    {activity}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {student.skills && (
                                        <div className="flex flex-wrap gap-2">
                                            {JSON.parse(student.skills).slice(0, 3).map((skill: string) => (
                                                <span
                                                    key={skill}
                                                    className="text-xs px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded"
                                                >
                                                    {skill}
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
