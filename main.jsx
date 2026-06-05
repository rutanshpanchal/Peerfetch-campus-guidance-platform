'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
    linkedinUrl: string | null;
    skills: string | null;
    extracurriculars: string | null;
}

const ACTIVITIES = ['TRS', 'TSA', 'BAHA', 'IEEE', 'IEI'];

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        bio: '',
        linkedinUrl: '',
        skills: [] as string[],
        extracurriculars: [] as string[],
    });

    const [skillInput, setSkillInput] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await fetch('/api/auth/me');
            const data = await response.json();

            if (response.ok) {
                setUser(data.user);
                setFormData({
                    bio: data.user.bio || '',
                    linkedinUrl: data.user.linkedinUrl || '',
                    skills: data.user.skills ? JSON.parse(data.user.skills) : [],
                    extracurriculars: data.user.extracurriculars ? JSON.parse(data.user.extracurriculars) : [],
                });
            } else {
                router.push('/');
            }
        } catch (error) {
            router.push('/');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch('/api/profile/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                await fetchProfile();
                setEditing(false);
            } else {
                alert('Failed to update profile');
            }
        } catch (error) {
            alert('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const addSkill = () => {
        if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
            setFormData({
                ...formData,
                skills: [...formData.skills, skillInput.trim()],
            });
            setSkillInput('');
        }
    };

    const removeSkill = (skill: string) => {
        setFormData({
            ...formData,
            skills: formData.skills.filter(s => s !== skill),
        });
    };

    const toggleActivity = (activity: string) => {
        setFormData({
            ...formData,
            extracurriculars: formData.extracurriculars.includes(activity)
                ? formData.extracurriculars.filter(a => a !== activity)
                : [...formData.extracurriculars, activity],
        });
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

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 shadow-md">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <Link href="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-primary-600">
                            ← Back to Dashboard
                        </Link>
                        {!editing ? (
                            <button onClick={() => setEditing(true)} className="btn-primary">
                                Edit Profile
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={() => setEditing(false)} className="btn-secondary">
                                    Cancel
                                </button>
                                <button onClick={handleSave} disabled={saving} className="btn-primary">
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="card p-8 animate-fade-in">
                    {/* Profile Header */}
                    <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
                        <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-gray-200 dark:bg-slate-700 flex-shrink-0 shadow-xl">
                            {user.profilePicture ? (
                                <Image
                                    src={user.profilePicture}
                                    alt={user.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-primary-600">
                                    {user.name.charAt(0)}
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                        {user.name}
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                                        {user.studentId} • {getBranchName(user.branch)}
                                    </p>
                                </div>
                                {user.linkedinUrl && (
                                    <a
                                        href={user.linkedinUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-[#0A66C2] hover:bg-[#004182] text-white rounded-lg font-semibold transition-colors shadow-md"
                                        title="View LinkedIn Profile"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                        </svg>
                                        LinkedIn
                                    </a>
                                )}
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <span className="badge">Year {user.year}</span>
                                <span className={`badge ${user.year >= 3
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                    }`}>
                                    {user.year >= 3 ? 'Senior' : 'Junior'}
                                </span>
                                <span className="badge">Batch {user.batch}</span>
                            </div>
                            {user.email && (
                                <p className="text-gray-600 dark:text-gray-400 mt-2">
                                    📧 {user.email}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* LinkedIn URL */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">LinkedIn Profile</h2>
                        {editing ? (
                            <input
                                type="url"
                                value={formData.linkedinUrl}
                                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                                className="input-field"
                                placeholder="https://linkedin.com/in/your-profile"
                            />
                        ) : (
                            <p className="text-gray-700 dark:text-gray-300">
                                {user.linkedinUrl ? (
                                    <a
                                        href={user.linkedinUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#0A66C2] hover:underline flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                        </svg>
                                        {user.linkedinUrl}
                                    </a>
                                ) : (
                                    'No LinkedIn profile added yet.'
                                )}
                            </p>
                        )}
                    </div>

                    {/* Bio */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">About</h2>
                        {editing ? (
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                className="input-field min-h-[100px] resize-none"
                                placeholder="Tell us about yourself..."
                            />
                        ) : (
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                {user.bio || 'No bio added yet.'}
                            </p>
                        )}
                    </div>

                    {/* Skills */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Skills</h2>
                        {editing ? (
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                        className="input-field flex-1"
                                        placeholder="Add a skill (press Enter)"
                                    />
                                    <button onClick={addSkill} className="btn-primary">
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.skills.map((skill) => (
                                        <span
                                            key={skill}
                                            className="px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg font-medium text-sm border border-primary-200 dark:border-primary-800 flex items-center gap-2"
                                        >
                                            {skill}
                                            <button
                                                onClick={() => removeSkill(skill)}
                                                className="text-red-600 hover:text-red-700 font-bold"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {formData.skills.length > 0 ? (
                                    formData.skills.map((skill) => (
                                        <span
                                            key={skill}
                                            className="px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg font-medium text-sm border border-primary-200 dark:border-primary-800"
                                        >
                                            {skill}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-gray-600 dark:text-gray-400">No skills added yet.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Extracurriculars */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                            Extracurricular Activities
                        </h2>
                        {editing ? (
                            <div className="flex flex-wrap gap-2">
                                {ACTIVITIES.map((activity) => (
                                    <button
                                        key={activity}
                                        onClick={() => toggleActivity(activity)}
                                        className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${formData.extracurriculars.includes(activity)
                                            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md scale-105'
                                            : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                                            }`}
                                    >
                                        {activity}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-3">
                                {formData.extracurriculars.length > 0 ? (
                                    formData.extracurriculars.map((activity) => (
                                        <span
                                            key={activity}
                                            className="px-5 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold text-sm shadow-md"
                                        >
                                            {activity}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-gray-600 dark:text-gray-400">No activities added yet.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
