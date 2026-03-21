'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/Button';

interface Module { id: string; title: string; description?: string; order?: number; }
interface Course { id: string; title: string; description?: string; difficulty?: string; language?: string; status?: string; }

export default function CourseDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { isAuthenticated, user } = useAuth();
    const [course, setCourse] = useState<Course | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [enrollSuccess, setEnrollSuccess] = useState('');
    const [enrollError, setEnrollError] = useState('');

    useEffect(() => {
        if (id) fetchCourseData();
    }, [id]);

    const fetchCourseData = async () => {
        setIsLoading(true);
        const [courseRes, modulesRes] = await Promise.all([
            apiFetch(`/api/v1/courses/${id}/`),
            apiFetch(`/api/v1/modules/?course=${id}`)
        ]);
        if (courseRes.error) setError(courseRes.error);
        else if (courseRes.data) setCourse(courseRes.data);
        if (modulesRes.data?.results) setModules(modulesRes.data.results);
        else if (Array.isArray(modulesRes.data)) setModules(modulesRes.data);
        setIsLoading(false);
    };

    const handleEnroll = async () => {
        if (!isAuthenticated) { router.push('/login'); return; }
        setIsEnrolling(true); setEnrollError('');
        const { error: e, status } = await apiFetch('/api/v1/enrollments/', {
            method: 'POST',
            body: JSON.stringify({
                user: user?.id,
                course: id,
                progress: 0,
                status: 'in_progress'
            })
        });
        if (e || (status !== 200 && status !== 201)) {
            setEnrollError(e || 'Enrollment failed. You may already be enrolled.');
        } else {
            setEnrollSuccess('You have been successfully enrolled! 🎉');
        }
        setIsEnrolling(false);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 font-medium">{error || 'Course not found.'}</p>
                    <Link href="/courses" className="mt-4 text-primary hover:underline block">← Back to Courses</Link>
                </div>
            </div>
        );
    }

    const difficultyColor: Record<string, string> = { beginner: 'bg-green-50 text-green-700', medium: 'bg-yellow-50 text-yellow-700', advanced: 'bg-red-50 text-red-700' };
    const diff = course.difficulty?.toLowerCase() || '';

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-6 lg:px-12 py-10">
                    <Link href="/courses" className="text-sm text-gray-500 hover:text-primary mb-4 inline-flex items-center gap-1 transition-colors">
                        ← Back to Training
                    </Link>
                    <div className="flex items-start justify-between gap-6 mt-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                {course.difficulty && (
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${difficultyColor[diff] || 'bg-gray-100 text-gray-600'}`}>
                                        {course.difficulty}
                                    </span>
                                )}
                                {course.language && (
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium uppercase">{course.language}</span>
                                )}
                            </div>
                            <h1 className="text-3xl font-extrabold text-gray-900">{course.title}</h1>
                            {course.description && <p className="mt-3 text-gray-600 leading-relaxed">{course.description}</p>}
                        </div>
                        <div className="shrink-0 w-48">
                            {enrollSuccess ? (
                                <div className="bg-green-50 text-green-700 border border-green-100 rounded-xl p-4 text-sm text-center font-medium">{enrollSuccess}</div>
                            ) : (
                                <>
                                    {enrollError && <p className="text-xs text-red-600 mb-2">{enrollError}</p>}
                                    <Button variant="primary" disabled={isEnrolling} onClick={handleEnroll} className="w-full">
                                        {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modules */}
            <div className="max-w-5xl mx-auto px-6 lg:px-12 mt-10">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Course Modules
                    <span className="text-sm font-normal text-gray-500 ml-2">({modules.length})</span>
                </h2>

                {modules.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                        <div className="text-4xl mb-3">📚</div>
                        <p className="text-gray-500">No modules added to this course yet.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {modules
                            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                            .map((module, i) => (
                                <Link
                                    key={module.id}
                                    href={`/courses/${id}/modules/${module.id}`}
                                    className="block bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4 hover:border-primary/40 hover:shadow-md transition-all group"
                                >
                                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">{module.title}</h3>
                                        {module.description && <p className="text-sm text-gray-500 mt-1">{module.description}</p>}
                                    </div>
                                    <div className="ml-auto flex items-center gap-2">
                                        <span className="text-xs font-bold text-gray-300 group-hover:text-primary uppercase tracking-widest hidden sm:block">Start Reading</span>
                                        <span className="text-gray-300 group-hover:text-primary">→</span>
                                    </div>
                                </Link>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
}
