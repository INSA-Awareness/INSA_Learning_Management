'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/Button';

interface TrainingRequest { id: string; title?: string; organization?: string; organization_name?: string; status?: string; description?: string; created_at?: string; }

export default function AdminTrainingRequestsPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [requests, setRequests] = useState<TrainingRequest[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) router.push('/login');
            else if (user?.role !== 'super_admin' && user?.role !== 'org_admin') router.push('/dashboard');
            else fetchAll();
        }
    }, [isAuthenticated, isLoading, user, router]);

    const fetchAll = async () => {
        setIsFetching(true);
        const { data, error: e } = await apiFetch('/api/v1/training-requests/');
        if (e) setError(e);
        else if (data?.results) setRequests(data.results);
        else if (Array.isArray(data)) setRequests(data);
        setIsFetching(false);
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        setActionLoading(id);
        const { error: e, status } = await apiFetch(`/api/v1/training-requests/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify({ status: newStatus })
        });
        if (e || status !== 200) setError(e || 'Failed to update status.');
        else fetchAll();
        setActionLoading(null);
    };

    if (isLoading || isFetching) return <div className="flex justify-center items-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    if (!user || (user.role !== 'super_admin' && user.role !== 'org_admin')) return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Training Requests</h1>
                    <p className="text-gray-500">Review and approve organizational training requests.</p>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-10">
                {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">{error}</div>}
                <div className="space-y-4">
                    {requests.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                            <div className="text-4xl mb-4">📋</div>
                            <p className="font-medium text-gray-900">No training requests yet.</p>
                            <p className="text-gray-500 text-sm mt-1">Organizations can submit training requests from their portal.</p>
                        </div>
                    ) : requests.map(req => (
                        <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-semibold text-gray-900">{req.title || `Training Request`}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${req.status === 'approved' ? 'bg-green-50 text-green-700' :
                                                req.status === 'rejected' ? 'bg-red-50 text-red-700' :
                                                    'bg-yellow-50 text-yellow-700'
                                            }`}>
                                            {req.status || 'pending'}
                                        </span>
                                    </div>
                                    {req.description && <p className="text-sm text-gray-600 mb-2">{req.description}</p>}
                                    <div className="flex items-center gap-4 text-xs text-gray-400">
                                        {req.organization_name && <span>Organization: <strong>{req.organization_name}</strong></span>}
                                        {req.created_at && <span>{new Date(req.created_at).toLocaleDateString()}</span>}
                                    </div>
                                </div>
                                {(req.status === 'pending' || !req.status) && (
                                    <div className="flex gap-2 shrink-0">
                                        <Button
                                            variant="primary"
                                            disabled={actionLoading === req.id}
                                            onClick={() => handleStatusChange(req.id, 'approved')}
                                        >
                                            {actionLoading === req.id ? '...' : 'Approve'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            disabled={actionLoading === req.id}
                                            onClick={() => handleStatusChange(req.id, 'rejected')}
                                        >
                                            Reject
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
