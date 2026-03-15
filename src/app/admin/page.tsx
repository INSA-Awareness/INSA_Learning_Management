'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCourses, getOrganizations, getTrainingRequests, getResources, Organization } from '@/lib/api';

export default function AdminDashboard() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    const [stats, setStats] = useState([
        { label: 'Total Courses', value: '0', icon: '📚', color: 'blue' },
        { label: 'Organizations', value: '0', icon: '🏢', color: 'green' },
        { label: 'Training Requests', value: '0', icon: '⏳', color: 'yellow' },
        { label: 'Total Resources', value: '0', icon: '📄', color: 'purple' },
    ]);
    const [recentOrgs, setRecentOrgs] = useState<Organization[]>([]);
    const [isDataLoading, setIsDataLoading] = useState(true);

    const managementAreas = [
        { title: 'Courses & Lessons', description: 'Manage training content, modules, and videos.', link: '/admin/courses', icon: '📖' },
        { title: 'User Management', description: 'View and manage users, roles, and memberships.', link: '/admin/users', icon: '👥' },
        { title: 'Organizations', description: 'Manage partner organizations and their settings.', link: '/admin/organizations', icon: '🏢' },
        { title: 'Resources', description: 'View and manage training resources and downloads.', link: '/admin/resources', icon: '📊' },
    ];

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) router.push('/login');
            else if (user?.role !== 'super_admin' && user?.role !== 'org_admin') router.push('/dashboard');
            else fetchData();
        }
    }, [isAuthenticated, isLoading, user, router]);

    const fetchData = async () => {
        setIsDataLoading(true);
        try {
            const [coursesRes, orgsRes, reqsRes, resourcesRes] = await Promise.all([
                getCourses(),
                getOrganizations(),
                getTrainingRequests(),
                getResources()
            ]);

            setStats([
                { label: 'Total Courses', value: coursesRes.data?.count.toString() || '0', icon: '📚', color: 'blue' },
                { label: 'Organizations', value: orgsRes.data?.count.toString() || '0', icon: '🏢', color: 'green' },
                { label: 'Training Requests', value: reqsRes.data?.count.toString() || '0', icon: '⏳', color: 'yellow' },
                { label: 'Total Resources', value: resourcesRes.data?.count.toString() || '0', icon: '📄', color: 'purple' },
            ]);

            if (orgsRes.data?.results) {
                setRecentOrgs(orgsRes.data.results.slice(0, 5));
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setIsDataLoading(false);
        }
    };

    if (isLoading || isDataLoading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    if (!user || (user.role !== 'super_admin' && user.role !== 'org_admin')) return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
                    <p className="text-gray-500">Welcome back, {user.first_name}. Here&apos;s an overview of the platform.</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02]">
                            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl">
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Management Sections */}
                <h2 className="text-xl font-bold text-gray-900 mb-6">Management Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {managementAreas.map((area, i) => (
                        <Link href={area.link} key={i}>
                            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:border-primary transition-all group h-full">
                                <div className="text-4xl mb-4">{area.icon}</div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">{area.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{area.description}</p>
                                <div className="mt-6 flex items-center text-primary font-semibold text-sm">
                                    Manage Now
                                    <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Recent Activity */}
                <div className="mt-12">
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
            </div>
        </div>
    );
}
