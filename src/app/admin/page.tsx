'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCourses, getOrganizations, getTrainingRequests, getResources, Organization, apiFetch } from '@/lib/api';

/* ─────────────────────── helpers ─────────────────────── */
const StatCard = ({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02]">
        <div className={`w-12 h-12 rounded-xl bg-${color}-50 flex items-center justify-center text-2xl`}>{icon}</div>
        <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

const QuickLink = ({ icon, title, description, href }: { icon: string; title: string; description: string; href: string }) => (
    <Link href={href}>
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:border-primary transition-all group h-full">
            <div className="text-4xl mb-4">{icon}</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
            <div className="mt-6 flex items-center text-primary font-semibold text-sm">
                Manage Now
                <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </div>
    </Link>
);

const ProgressBar = ({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) => (
    <div>
        <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 font-medium">{label}</span>
            <span className={`text-${color}-600 font-bold`}>{value}</span>
        </div>
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className={`bg-${color}-500 h-full rounded-full`} style={{ width: `${pct}%` }} />
        </div>
    </div>
);

/* ─────────────────────── main ─────────────────────── */
export default function AdminDashboard() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    const [coursesCount, setCoursesCount] = useState('0');
    const [orgsCount, setOrgsCount] = useState('0');
    const [reqsCount, setReqsCount] = useState('0');
    const [resourcesCount, setResourcesCount] = useState('0');
    const [recentOrgs, setRecentOrgs] = useState<Organization[]>([]);
    const [isDataLoading, setIsDataLoading] = useState(true);

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) router.push('/login');
            else if (user?.role !== 'super_admin' && user?.role !== 'org_admin' && user?.role !== 'course_provider') router.push('/dashboard');
            else fetchData();
        }
    }, [isAuthenticated, isLoading, user, router]);

    const fetchData = async () => {
        setIsDataLoading(true);
        try {
            const [coursesRes, orgsRes, reqsRes, resourcesRes] = await Promise.all([
                getCourses(), getOrganizations(), getTrainingRequests(), getResources()
            ]);
            setCoursesCount(coursesRes.data?.count?.toString() || '0');
            setOrgsCount(orgsRes.data?.count?.toString() || '0');
            setReqsCount(reqsRes.data?.count?.toString() || '0');
            setResourcesCount(resourcesRes.data?.count?.toString() || '0');
            if (orgsRes.data?.results) setRecentOrgs(orgsRes.data.results.slice(0, 5));
        } catch { /* ignore */ } finally { setIsDataLoading(false); }
    };

    if (isLoading || isDataLoading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    if (!user || (user.role !== 'super_admin' && user.role !== 'org_admin' && user.role !== 'course_provider')) return null;

    const roleLabel: Record<string, string> = {
        super_admin: 'System Administrator',
        org_admin: 'Organization Administrator',
        course_provider: 'Course Provider',
    };

    /* ═══════════════════════ RENDER ═══════════════════════ */
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">{roleLabel[user.role] || user.role}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Welcome back, {user.first_name}</h1>
                    <p className="text-gray-500">Here&apos;s your personalized dashboard overview.</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-10">

                {/* ═══════════ SUPER ADMIN DASHBOARD ═══════════ */}
                {user.role === 'super_admin' && (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                            <StatCard icon="📚" label="Total Courses" value={coursesCount} color="blue" />
                            <StatCard icon="🏢" label="Organizations" value={orgsCount} color="green" />
                            <StatCard icon="⏳" label="Training Requests" value={reqsCount} color="yellow" />
                            <StatCard icon="📄" label="Total Resources" value={resourcesCount} color="purple" />
                        </div>

                        {/* Quick Links */}
                        <h2 className="text-xl font-bold text-gray-900 mb-6">System Management</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                            <QuickLink icon="👥" title="User Management" description="View and manage all users, roles, and permissions." href="/admin/users" />
                            <QuickLink icon="🏢" title="Organizations" description="Manage partner organizations and approve registrations." href="/admin/organizations" />
                            <QuickLink icon="💳" title="Payment Approvals" description="Review and process organization payment requests." href="/admin/payment-approvals" />
                            <QuickLink icon="📖" title="Courses & Content" description="Manage training courses, modules, and learning materials." href="/admin/courses" />
                            <QuickLink icon="📊" title="Reports" description="View compliance reports and platform analytics." href="/admin/reports" />
                            <QuickLink icon="🛡️" title="Audit Logs" description="Monitor system security events and user activity." href="/admin/audit-logs" />
                            <QuickLink icon="🛠️" title="Awareness Tools" description="Configure and monitor interactive cybersecurity tools." href="/admin/awareness-tools" />
                        </div>

                        {/* Analytics */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">📈</span>
                                    National Usage Performance
                                </h2>
                                <div className="space-y-4">
                                    <ProgressBar label="Daily Active Users" value="1,240" pct={75} color="blue" />
                                    <ProgressBar label="Resource Downloads" value="4,821" pct={88} color="green" />
                                    <ProgressBar label="Alert Reach Rate" value="92%" pct={92} color="orange" />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="p-2 bg-purple-50 text-purple-600 rounded-lg">🛡️</span>
                                    Security Audit Summary
                                </h2>
                                <div className="divide-y divide-gray-100">
                                    {[
                                        { msg: 'System role updated by Admin', time: '2h ago' },
                                        { msg: 'Unauthorized login attempt blocked', time: '5h ago' },
                                        { msg: 'New organization batch approved', time: '1d ago' },
                                        { msg: 'System backup completed', time: '1d ago' },
                                    ].map((item, idx) => (
                                        <div key={idx} className="py-3 flex justify-between items-center text-sm">
                                            <span className="text-gray-700">{item.msg}</span>
                                            <span className="text-xs text-gray-400 italic">{item.time}</span>
                                        </div>
                                    ))}
                                </div>
                                <Link href="/admin/audit-logs" className="mt-6 block text-center text-primary text-sm font-semibold hover:underline">
                                    View Full Security Audit Logs
                                </Link>
                            </div>
                        </div>

                        {/* Recent Organizations */}
                        <div className="mt-4">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Organizations</h2>
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                    <span className="text-sm font-semibold text-gray-700">Latest Onboarded</span>
                                    <Link href="/admin/organizations" className="text-primary text-sm font-medium hover:underline">View All</Link>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {recentOrgs.length === 0 ? (
                                        <div className="p-6 text-center text-gray-500 text-sm">No recent data available.</div>
                                    ) : recentOrgs.map(org => (
                                        <div key={org.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                <span className="text-sm text-gray-600">Organization: <span className="font-medium text-gray-900">{org.name}</span></span>
                                            </div>
                                            <span className="text-xs text-gray-400">{new Date(org.created_at).toLocaleDateString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* ═══════════ ORG ADMIN DASHBOARD ═══════════ */}
                {user.role === 'org_admin' && (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                            <StatCard icon="👥" label="Members" value={orgsCount} color="blue" />
                            <StatCard icon="📚" label="Courses" value={coursesCount} color="green" />
                            <StatCard icon="⏳" label="Training Requests" value={reqsCount} color="yellow" />
                            <StatCard icon="📄" label="Resources" value={resourcesCount} color="purple" />
                        </div>

                        {/* Quick Links */}
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Organization Management</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                            <QuickLink icon="👥" title="Members" description="Manage organization memberships and user enrollments." href="/admin/memberships" />
                            <QuickLink icon="📋" title="Training Requests" description="Review and process training requests from your organization." href="/admin/training-requests" />
                            <QuickLink icon="📊" title="Reports" description="View compliance and training progress reports." href="/admin/reports" />
                            <QuickLink icon="📖" title="Courses" description="Browse and manage available training courses." href="/admin/courses" />
                            <QuickLink icon="📄" title="Resources" description="View and distribute cybersecurity awareness materials." href="/admin/resources" />
                            <QuickLink icon="📣" title="Campaigns" description="View and manage awareness campaigns for your org." href="/admin/campaigns" />
                        </div>

                        {/* Org Activity */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="p-2 bg-green-50 text-green-600 rounded-lg">📈</span>
                                    Organization Performance
                                </h2>
                                <div className="space-y-4">
                                    <ProgressBar label="Member Enrollment Rate" value="78%" pct={78} color="green" />
                                    <ProgressBar label="Course Completion Rate" value="62%" pct={62} color="blue" />
                                    <ProgressBar label="Resource Utilization" value="85%" pct={85} color="purple" />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">📋</span>
                                    Recent Activity
                                </h2>
                                <div className="divide-y divide-gray-100">
                                    {[
                                        { msg: 'New member enrolled in Cyber Hygiene', time: '1h ago' },
                                        { msg: 'Training request submitted for Q2', time: '3h ago' },
                                        { msg: '5 members completed Phishing Module', time: '1d ago' },
                                        { msg: 'New resource uploaded: Security Policy', time: '2d ago' },
                                    ].map((item, idx) => (
                                        <div key={idx} className="py-3 flex justify-between items-center text-sm">
                                            <span className="text-gray-700">{item.msg}</span>
                                            <span className="text-xs text-gray-400 italic">{item.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* ═══════════ COURSE PROVIDER DASHBOARD ═══════════ */}
                {user.role === 'course_provider' && (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                            <StatCard icon="📚" label="My Courses" value={coursesCount} color="blue" />
                            <StatCard icon="📄" label="Resources" value={resourcesCount} color="green" />
                            <StatCard icon="📝" label="Assessments" value="—" color="yellow" />
                            <StatCard icon="📰" label="Articles" value="—" color="purple" />
                        </div>

                        {/* Quick Links */}
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Content Management</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                            <QuickLink icon="📖" title="Courses" description="Create and manage your cybersecurity training courses." href="/admin/courses" />
                            <QuickLink icon="📦" title="Modules" description="Define module descriptions and learning objectives." href="/admin/modules" />
                            <QuickLink icon="📹" title="Videos & Lessons" description="Upload training materials — videos, documents, and presentations." href="/admin/videos" />
                            <QuickLink icon="📝" title="Assessments" description="Create quizzes, add questions, and define passing scores." href="/admin/assessments" />
                            <QuickLink icon="📰" title="Articles & Toolkits" description="Write cybersecurity awareness articles organized by category." href="/admin/articles" />
                            <QuickLink icon="📄" title="Resources" description="Upload and maintain cybersecurity awareness resources." href="/admin/resources" />
                        </div>

                        {/* Content Activity */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">📊</span>
                                    Content Performance
                                </h2>
                                <div className="space-y-4">
                                    <ProgressBar label="Courses Published" value="4 / 6" pct={67} color="blue" />
                                    <ProgressBar label="Average Quiz Score" value="78%" pct={78} color="green" />
                                    <ProgressBar label="Learner Engagement" value="85%" pct={85} color="purple" />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="p-2 bg-orange-50 text-orange-600 rounded-lg">🔔</span>
                                    Submission Status
                                </h2>
                                <div className="divide-y divide-gray-100">
                                    {[
                                        { msg: 'Course "Phishing 101" approved', status: 'published', time: '2h ago' },
                                        { msg: 'Course "Secure Coding" pending review', status: 'pending', time: '1d ago' },
                                        { msg: 'Article "Password Best Practices" published', status: 'published', time: '2d ago' },
                                        { msg: 'Module "Social Engineering" draft saved', status: 'draft', time: '3d ago' },
                                    ].map((item, idx) => (
                                        <div key={idx} className="py-3 flex justify-between items-center text-sm">
                                            <span className="text-gray-700">{item.msg}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${item.status === 'published' ? 'bg-green-50 text-green-700' :
                                                item.status === 'pending' ? 'bg-blue-50 text-blue-700' :
                                                    'bg-yellow-50 text-yellow-700'
                                                }`}>{item.status}</span>
                                        </div>
                                    ))}
                                </div>
                                <Link href="/admin/courses" className="mt-6 block text-center text-primary text-sm font-semibold hover:underline">
                                    View All My Courses
                                </Link>
                            </div>
                        </div>

                        {/* Workflow Reminder */}
                        <div className="mt-8 bg-gradient-to-r from-primary/5 to-blue-50 p-6 rounded-2xl border border-primary/10">
                            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <span>💡</span> Content Workflow Reminder
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                As a Course Provider, your content goes through a review process:
                                <strong className="text-gray-800"> Draft → Submit for Review → System Admin Approval → Published</strong>.
                                You cannot publish content directly — all courses and resources must be approved by a System Administrator.
                            </p>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}
