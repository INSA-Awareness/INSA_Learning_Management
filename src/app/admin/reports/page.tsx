'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

interface Report { id: string; title?: string; organization?: string; organization_name?: string; created_at?: string; status?: string; }

export default function AdminReportsPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [reports, setReports] = useState<Report[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) router.push('/login');
            else if (user?.role !== 'super_admin' && user?.role !== 'org_admin') router.push('/dashboard');
            else fetchAll();
        }
    }, [isAuthenticated, isLoading, user, router]);

    const fetchAll = async () => {
        setIsFetching(true);
        const { data, error: e } = await apiFetch('/api/v1/compliance-reports/');
        if (e) setError(e);
        else if (data?.results) setReports(data.results);
        else if (Array.isArray(data)) setReports(data);
        setIsFetching(false);
    };

    if (isLoading || isFetching) return <div className="flex justify-center items-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    if (!user || (user.role !== 'super_admin' && user.role !== 'org_admin')) return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Compliance Reports</h1>
                    <p className="text-gray-500">View organizational compliance and training reports.</p>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-10">
                {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">{error}</div>}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left text-sm text-gray-500">
                        <thead className="bg-gray-50 text-gray-700 uppercase font-semibold text-xs border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Report</th>
                                <th className="px-6 py-4">Organization</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Created</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {reports.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No compliance reports yet.</td></tr>
                            ) : reports.map(r => (
                                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{r.title || `Report ${r.id.split('-')[0]}`}</td>
                                    <td className="px-6 py-4">{r.organization_name || r.organization || '—'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${r.status === 'approved' ? 'bg-green-50 text-green-700' : r.status === 'pending' ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {r.status || 'pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs">{r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
