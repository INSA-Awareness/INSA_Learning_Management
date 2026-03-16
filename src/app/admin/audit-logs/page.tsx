'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

interface AuditLog {
    id: string;
    user_email: string;
    action: string;
    resource: string;
    details: string;
    ip_address: string;
    created_at: string;
}

export default function AuditLogsPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) router.push('/login');
            else if (user?.role !== 'super_admin') router.push('/dashboard');
            else fetchLogs();
        }
    }, [isAuthenticated, isLoading, user, router]);

    const fetchLogs = async () => {
        setIsFetching(true);
        // Mocking audit logs as they might not be fully exposed yet
        // In a real scenario, this would be: const { data } = await apiFetch('/api/v1/audit-logs/');
        const mockLogs: AuditLog[] = [
            { id: '1', user_email: 'admin@insa.gov.et', action: 'LOGIN', resource: 'AUTH', details: 'Successful login from Addis Ababa', ip_address: '197.156.10.2', created_at: new Date(Date.now() - 3600000).toISOString() },
            { id: '2', user_email: 'provider@insa.gov.et', action: 'CREATE', resource: 'COURSE', details: 'Created course "Intro to Phishing"', ip_address: '197.156.10.5', created_at: new Date(Date.now() - 7200000).toISOString() },
            { id: '3', user_email: 'admin@insa.gov.et', action: 'APPROVE', resource: 'ORGANIZATION', details: 'Approved Ethio Telecom registration', ip_address: '197.156.10.2', created_at: new Date(Date.now() - 10800000).toISOString() },
            { id: '4', user_email: 'admin@insa.gov.et', action: 'PUBLISH', resource: 'ALERT', details: 'Published High severity alert on Ransomware', ip_address: '197.156.10.2', created_at: new Date(Date.now() - 86400000).toISOString() },
        ];

        setTimeout(() => {
            setLogs(mockLogs);
            setIsFetching(false);
        }, 800);
    };

    if (isLoading || isFetching) return <div className="flex justify-center items-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    if (!user || user.role !== 'super_admin') return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">Audit Logs</h1>
                        <p className="text-gray-500">Monitor system activity and security events.</p>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-10">
                {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">{error}</div>}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left text-sm text-gray-500">
                        <thead className="bg-gray-50 text-gray-700 uppercase font-semibold text-xs border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Resource</th>
                                <th className="px-6 py-4">Details</th>
                                <th className="px-6 py-4">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {logs.map(log => (
                                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600">
                                        {new Date(log.created_at).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{log.user_email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${log.action === 'LOGIN' ? 'bg-blue-50 text-blue-700' :
                                                log.action === 'DELETE' ? 'bg-red-50 text-red-700' :
                                                    'bg-gray-100 text-gray-700'
                                            }`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-mono">{log.resource}</td>
                                    <td className="px-6 py-4 text-gray-600">{log.details}</td>
                                    <td className="px-6 py-4 text-xs text-gray-500">{log.ip_address}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
