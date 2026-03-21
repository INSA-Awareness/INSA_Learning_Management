'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { apiFetch, getCourses, enrollInCourse, Course } from '@/lib/api';

interface Enrollment {
    id: string;
    course: {
        id: string;
        title: string;
        difficulty: string;
    };
    progress: number;
    last_accessed: string;
}

interface Alert {
    id: string;
    title: string;
    message: string;
    severity: string;
    published_at: string;
}

export default function DashboardPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else {
                fetchDashboardData();
                const interval = setInterval(fetchDashboardData, 60000); // Poll every minute
                return () => clearInterval(interval);
            }
        }
    }, [isAuthenticated, isLoading, router]);

    const fetchDashboardData = async () => {
        setIsFetching(true);
        const [enrollRes, alertsRes, coursesRes] = await Promise.all([
            apiFetch('/api/v1/enrollments/'),
            apiFetch('/api/v1/alerts/?page_size=5'),
            getCourses({ page_size: 6 })
        ]);

        if (enrollRes.data?.results) setEnrollments(enrollRes.data.results);
        else if (Array.isArray(enrollRes.data)) setEnrollments(enrollRes.data);

        if (alertsRes.data?.results) setAlerts(alertsRes.data.results);
        else if (Array.isArray(alertsRes.data)) setAlerts(alertsRes.data);

        if (coursesRes.data?.results) {
            const enrolledCourseIds = new Set(
                (enrollRes.data?.results || (Array.isArray(enrollRes.data) ? enrollRes.data : []))
                    .map((e: any) => typeof e.course === 'object' ? e.course.id : e.course)
            );
            setRecommendedCourses(coursesRes.data.results.filter((c: Course) => !enrolledCourseIds.has(c.id)).slice(0, 2));
        }

        setIsFetching(false);
    };

    const handleEnroll = async (courseId: string) => {
        if (!user) return;
        setActionLoading(courseId);
        setError('');
        const { error: err, status } = await enrollInCourse(courseId, user.id);
        if (err || (status !== 200 && status !== 201)) {
            setError(err || 'Failed to enroll. You might already be enrolled.');
        } else {
            fetchDashboardData(); // Refresh data
        }
        setActionLoading(null);
    };

    if (isLoading || !isAuthenticated) return null;

    const fullName = user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.email || 'User';

    const stats = {
        totalCourses: enrollments.length,
        completedCourses: enrollments.filter(e => e.progress === 100).length,
        avgProgress: enrollments.length > 0
            ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
            : 0
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-primary mb-1">Welcome back, {user?.first_name || 'User'}.</h1>
                        <p className="text-gray-600">
                            Your cyber resilience score is stable. There are <span className="font-bold text-orange-500">{alerts.length} new advisories</span> requiring your attention today.
                        </p>
                    </div>
                    <button className="bg-white border border-green-200 text-green-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-green-50 transition-colors shadow-sm relative overflow-hidden group">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="relative z-10">Live Dashboard &bull; {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <div className="absolute inset-0 bg-green-50/0 group-hover:bg-green-50/50 transition-colors"></div>
                    </button>
                </div>

                {/* Global Alert Banner */}
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-8 flex items-start gap-4 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-orange-100 to-transparent pointer-events-none"></div>
                    <div className="w-10 h-10 rounded-full bg-white text-orange-500 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                        &#9888;
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-bold text-gray-900">{alerts[0]?.title || 'National Threat Advisory'}</h3>
                            <span className="bg-orange-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">Action Required</span>
                        </div>
                        <p className="text-sm text-gray-700 max-w-4xl">
                            {alerts[0]?.message || 'Phishing campaigns targeting public sector employees increased by 42%. Verify all communications immediately through the official portal.'}
                        </p>
                    </div>
                    <Link href="/alerts">
                        <button className="bg-white border border-orange-200 text-orange-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-50 shrink-0 mt-2 sm:mt-0">
                            View Briefing
                        </button>
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-10">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-8 flex items-center justify-between">
                        <span>{error}</span>
                        <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">✕</button>
                    </div>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column (Main Content) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Summary Stats Cards */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Enrolled</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Completed</p>
                                <p className="text-2xl font-bold text-green-600">{stats.completedCourses}</p>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Avg Progress</p>
                                <p className="text-2xl font-bold text-primary">{stats.avgProgress}%</p>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {enrollments.slice(0, 2).map((enrollment, idx) => (
                                <Link key={enrollment.id} href={`/courses/${enrollment.course.id}`} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md hover:border-primary/30 transition-all group flex gap-4 cursor-pointer relative overflow-hidden">
                                    <div className="w-16 h-16 shrink-0 bg-gray-100 rounded-xl flex items-center justify-center text-3xl group-hover:scale-110 group-hover:bg-red-50 transition-all">
                                        {idx === 0 ? '🔒' : '📱'}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{enrollment.course.title}</h4>
                                        <p className="text-xs text-gray-500 mb-2">Progress • {enrollment.progress}% completed</p>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1 overflow-hidden">
                                            <div className="bg-primary h-1.5 rounded-full transition-all duration-500" style={{ width: `${enrollment.progress}%` }}></div>
                                        </div>
                                        <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-2">
                                            <span>{enrollment.progress}% COMPLETED</span>
                                            <span className="text-primary group-hover:underline cursor-pointer">RESUME &rarr;</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            {enrollments.length === 0 && !isFetching && (
                                <div className="md:col-span-2 bg-white rounded-2xl p-8 border border-dashed border-gray-200 text-center">
                                    <p className="text-gray-500 mb-4">You are not enrolled in any courses yet.</p>
                                    <Link href="/courses">
                                        <button className="text-primary font-bold hover:underline">Explore Courses &rarr;</button>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Recommended Courses */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-primary">Recommended Courses</h2>
                                <Link href="/courses" className="text-xs font-semibold text-gray-500 hover:text-primary flex items-center gap-1">View catalog &rarr;</Link>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {recommendedCourses.map((course) => (
                                    <div key={course.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:border-primary/30 transition-colors">
                                        <div className="h-32 bg-secondary relative overflow-hidden border-b border-gray-800 flex items-center justify-center">
                                            <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MCcgaGVpZ2h0PSc0MCc+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSdncmFkMScgeDE9JzAlJyB5MT0nMCUnIHgyPScxMDAlJyB5Mj0nMCUnPjxzdG9wIG9mZnNldD0nMCUnIHN0eWxlPSdzdG9wLWNvbG9yOiNmZmY7c3RvcC1vcGFjaXR5OjEuMCcgLz48c3RvcCBvZmZzZXQ9JzEwMCUnIHN0eWxlPSdzdG9wLWNvbG9yOiMwMDA7c3RvcC1vcGFjaXR5OjEuMCcgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0nNDAnJyBoZWlnaHQ9JzQwJScgZmlsbD0ndXJsKCNncmFkMSknIGZpbGwtb3BhY2l0eT0nMC4xJy8+PC9zdmc+')] mix-blend-overlay"></div>
                                            <div className="w-24 h-24 border-[8px] border-blue-500/80 rounded-full border-t-transparent animate-spin-slow"></div>

                                            <div className="absolute bottom-3 left-3 flex gap-2">
                                                <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">NEW</span>
                                                <span className={`text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider backdrop-blur-sm shadow-sm ${course.difficulty === 'beginner' ? 'bg-green-500/50' : course.difficulty === 'medium' ? 'bg-yellow-500/50' : 'bg-red-500/50'
                                                    }`}>
                                                    {course.difficulty}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-5 flex flex-col flex-1">
                                            <h3 className="font-bold text-gray-900 mb-2">{course.title}</h3>
                                            <p className="text-xs text-gray-500 mb-6 flex-1 line-clamp-2">
                                                {course.description}
                                            </p>
                                            <button
                                                onClick={() => handleEnroll(course.id)}
                                                disabled={actionLoading === course.id}
                                                className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-50"
                                            >
                                                {actionLoading === course.id ? 'Enrolling...' : 'Enroll Now'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {recommendedCourses.length === 0 && !isFetching && (
                                    <div className="sm:col-span-2 bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
                                        <p className="text-gray-500">No new recommendations at this time.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Sidebar) */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Quick Actions */}
                        <div>
                            <h2 className="text-sm font-bold text-primary tracking-wider uppercase mb-4">Quick Actions</h2>
                            <div className="space-y-3">
                                <Link href="/tools/phishing" className="bg-white border text-left border-gray-100 p-4 rounded-xl flex items-center gap-4 hover:border-primary/30 hover:shadow-sm cursor-pointer transition-all group w-full">
                                    <div className="w-10 h-10 rounded-full bg-red-50 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                                        &#9888;
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 text-sm">Phishing Test</h4>
                                        <p className="text-xs text-gray-500">Practice spotting threats.</p>
                                    </div>
                                    <div className="text-gray-300 group-hover:text-primary">&#11162;</div>
                                </Link>

                                <Link href="/tools/password-strength" className="bg-white border text-left border-gray-100 p-4 rounded-xl flex items-center gap-4 hover:border-primary/30 hover:shadow-sm cursor-pointer transition-all group w-full">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors shrink-0">
                                        &#128274;
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 text-sm">Password Check</h4>
                                        <p className="text-xs text-gray-500">Test credentials strength.</p>
                                    </div>
                                    <div className="text-gray-300 group-hover:text-primary">&#11162;</div>
                                </Link>

                                <div className="bg-white border text-left border-gray-100 p-4 rounded-xl flex items-center gap-4 hover:border-primary/30 hover:shadow-sm cursor-pointer transition-all group">
                                    <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors shrink-0 font-bold">
                                        ID
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 text-sm">GovID Scanner</h4>
                                        <p className="text-xs text-gray-500">Verify official links.</p>
                                    </div>
                                    <div className="text-gray-300 group-hover:text-primary">&#11162;</div>
                                </div>
                            </div>
                        </div>

                        {/* Latest Intelligence */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-sm font-bold text-primary tracking-wider uppercase">Latest Intelligence</h2>
                                <button className="text-gray-400 hover:text-gray-600">&#8635;</button>
                            </div>
                            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm relative hover:shadow-md transition-shadow">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-gray-50 flex justify-end p-2 rounded-tr-2xl text-gray-300 pointer-events-none">
                                    &#128365;
                                </div>

                                <div className="space-y-4">
                                    {alerts.slice(0, 3).map((alert, i) => (
                                        <div key={alert.id} className={i !== 2 ? "border-b border-gray-100 pb-4" : ""}>
                                            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                                                <span className={alert.severity.toLowerCase() === 'critical' ? 'text-red-500' : 'text-primary'}>
                                                    {alert.severity}
                                                </span>
                                                <span>{new Date(alert.published_at).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm font-medium text-gray-900 hover:text-primary cursor-pointer leading-tight transition-colors line-clamp-2">
                                                {alert.title}
                                            </p>
                                        </div>
                                    ))}
                                    {alerts.length === 0 && !isFetching && (
                                        <p className="text-xs text-gray-500 text-center py-4">No active advisories.</p>
                                    )}
                                </div>

                                <div className="mt-5 pt-4 border-t border-gray-100 text-center">
                                    <Link href="/alerts" className="text-[10px] font-bold text-orange-500 uppercase tracking-widest hover:underline">
                                        View Full Intel Briefing &rarr;
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
