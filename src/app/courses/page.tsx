'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Course {
    id: string;
    title: string;
    description: string;
    language: string;
    difficulty?: string;
    status?: string;
    provider?: string;
}

export default function TrainingPage() {
    const { isAuthenticated } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState('Newest');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setIsLoading(true);
        const { data } = await apiFetch('/api/v1/courses/');
        if (data?.results) setCourses(data.results);
        else if (Array.isArray(data)) setCourses(data);
        setIsLoading(false);
    };

    const handleCheckboxChange = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
        setter(prev => prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]);
    };

    let filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDiff = selectedDifficulty.length === 0 || selectedDifficulty.includes(course.difficulty || '');
        return matchesSearch && matchesDiff;
    });

    if (sortBy === 'Alphabetical') {
        filteredCourses = [...filteredCourses].sort((a, b) => a.title.localeCompare(b.title));
    }

    const difficultyColors: Record<string, string> = {
        beginner: 'green', intermediate: 'yellow', advanced: 'red'
    };

    const icons = ['🛡️', '🔒', '🕵️', '💻', '📡', '📜', '🌍', '🔑', '⚙️', '🧠'];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center">
            {/* Hero */}
            <section className="w-full relative overflow-hidden bg-white px-6 py-20 text-center flex flex-col items-center border-b border-gray-100">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[600px] h-[300px] bg-primary/5 rounded-[100%] filter blur-3xl opacity-70"></div>
                <span className="text-primary text-[10px] font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    CYBERSECURITY TRAINING
                </span>
                <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl max-w-2xl">
                    Ignite Your <span className="text-primary">Cyber Resilience</span>
                </h1>
                <p className="mt-6 text-base leading-7 text-gray-500 max-w-2xl">
                    Expert-led training designed to empower you with the skills to identify threats and protect our digital nation.
                </p>
                <div className="mt-8 max-w-xl w-full flex bg-white border border-gray-200 rounded-full p-2 shadow-sm focus-within:ring-2 focus-within:ring-primary transition-all">
                    <div className="pl-4 flex items-center text-gray-400">&#128269;</div>
                    <input
                        type="text"
                        placeholder="Search courses..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-4 outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="bg-primary hover:bg-primary-hover text-white rounded-full px-6 py-2 text-sm font-semibold transition-colors">
                        Search
                    </button>
                </div>
            </section>

            {/* Content */}
            <section className="w-full max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <div className="w-full lg:w-64 shrink-0 space-y-8">
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Difficulty</h4>
                        <div className="space-y-3">
                            {['beginner', 'intermediate', 'advanced'].map(item => (
                                <label key={item} className="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" className="hidden" checked={selectedDifficulty.includes(item)} onChange={() => handleCheckboxChange(setSelectedDifficulty, item)} />
                                    <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${selectedDifficulty.includes(item) ? 'bg-primary border-primary' : 'bg-white border-gray-300 group-hover:border-primary'}`}>
                                        {selectedDifficulty.includes(item) && <div className="w-2 h-2 bg-white rounded-sm"></div>}
                                    </div>
                                    <span className="text-sm text-gray-600 capitalize group-hover:text-gray-900">{item}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            All Courses <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{filteredCourses.length} total</span>
                        </h3>
                        <select
                            className="border border-gray-200 rounded-md bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option>Newest</option>
                            <option>Alphabetical</option>
                        </select>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse h-48"></div>
                            ))}
                        </div>
                    ) : filteredCourses.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            <div className="text-4xl mb-4">🔍</div>
                            <p className="font-medium">{searchQuery ? 'No courses matched your search.' : 'No courses available yet.'}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredCourses.map((course, i) => {
                                const diff = course.difficulty?.toLowerCase() || '';
                                const color = difficultyColors[diff] || 'gray';
                                return (
                                    <div key={course.id} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer flex flex-col h-full relative group">
                                        {course.difficulty && (
                                            <div className={`absolute top-6 right-6 px-2 py-1 bg-${color}-50 text-${color}-600 text-[10px] font-bold rounded-full uppercase tracking-wider`}>
                                                {course.difficulty}
                                            </div>
                                        )}
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-xl flex items-center justify-center mb-4 shrink-0 transition-transform group-hover:scale-110">
                                            {icons[i % icons.length]}
                                        </div>
                                        <h4 className="font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors pr-16">{course.title}</h4>
                                        <p className="text-xs text-gray-500 mb-4 flex-1 line-clamp-3">
                                            {course.description || 'Explore this cybersecurity course and build your skills.'}
                                        </p>
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                                            {course.language && (
                                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded font-medium uppercase">{course.language}</span>
                                            )}
                                            {isAuthenticated ? (
                                                <Link href={`/courses/${course.id}`} className="text-xs font-semibold text-primary hover:underline ml-auto">
                                                    View Course →
                                                </Link>
                                            ) : (
                                                <Link href="/login" className="text-xs font-semibold text-primary hover:underline ml-auto">
                                                    Login to Enroll →
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
