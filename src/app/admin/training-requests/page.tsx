'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { apiFetch, TrainingRequest, approveTrainingRequest, rejectTrainingRequest, getTrainingRequests } from '@/lib/api';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Input } from '@/components/Input';

// Removed local TrainingRequest interface to use the one from @/lib/api

export default function AdminTrainingRequestsPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [requests, setRequests] = useState<TrainingRequest[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        description: '',
        attachment_url: '',
        organization: ''
    });
    const [organizations, setOrganizations] = useState<any[]>([]);

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) router.push('/login');
            else if (user?.role !== 'super_admin' && user?.role !== 'org_admin') router.push('/dashboard');
            else {
                fetchAll();
                fetchOrganizations();
            }
        }
    }, [isAuthenticated, isLoading, user, router]);

    const fetchOrganizations = async () => {
        const { data } = await apiFetch('/api/v1/organizations/');
        if (data?.results) setOrganizations(data.results);
        else if (Array.isArray(data)) setOrganizations(data);
    };

    const fetchAll = async () => {
        setIsFetching(true);
        const { data, error: e } = await getTrainingRequests();
        if (e) setError(e);
        else if (data?.results) setRequests(data.results);
        else if (Array.isArray(data)) setRequests(data);
        setIsFetching(false);
    };

    const handleApprove = async (id: string) => {
        setActionLoading(id);
        const { error: e, status } = await approveTrainingRequest(id);
        if (e || (status !== 200 && status !== 201)) setError(e || 'Failed to approve request.');
        else fetchAll();
        setActionLoading(null);
    };

    const handleReject = async (id: string) => {
        setActionLoading(id);
        const { error: e, status } = await rejectTrainingRequest(id);
        if (e || (status !== 200 && status !== 201)) setError(e || 'Failed to reject request.');
        else fetchAll();
        setActionLoading(null);
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading('create');
        const { data, error: err, status } = await apiFetch('/api/v1/training-requests/', {
            method: 'POST',
            body: JSON.stringify({
                ...formData,
                organization: user?.role === 'org_admin' ? user.organization_id : formData.organization
            })
        });

        if (err || status !== 201) {
            setError(err || 'Failed to create training request.');
        } else {
            setIsCreateModalOpen(false);
            setFormData({ description: '', attachment_url: '', organization: '' });
            fetchAll();
        }
        setActionLoading(null);
    };

    if (isLoading || isFetching) return <div className="flex justify-center items-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    if (!user || (user.role !== 'super_admin' && user.role !== 'org_admin')) return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">Training Requests</h1>
                        <p className="text-gray-500">Review and approve organizational training requests.</p>
                    </div>
                    <div>
                        <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>Submit New Request</Button>
                    </div>
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
                                    {req.description && <p className="text-sm text-gray-600 mb-3">{req.description}</p>}
                                    {req.attachment_url && (
                                        <div className="mb-4">
                                            <a
                                                href={req.attachment_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-xs font-medium text-primary hover:underline bg-primary/5 px-2.5 py-1.5 rounded-lg border border-primary/10 transition-colors"
                                            >
                                                <span>📎</span> View Attachment
                                            </a>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-4 text-xs text-gray-400">
                                        {req.organization_name && <span>Organization: <strong>{req.organization_name}</strong></span>}
                                        {req.created_at && <span>{new Date(req.created_at).toLocaleDateString()}</span>}
                                    </div>
                                </div>
                                {(req.status === 'pending' || !req.status) && (
                                    <div className="flex gap-2 shrink-0">
                                        <Button
                                            variant="primary"
                                            disabled={!!actionLoading}
                                            onClick={() => handleApprove(req.id)}
                                        >
                                            {actionLoading === req.id ? '...' : 'Approve'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="text-red-500 hover:text-red-700 border-red-200 hover:border-red-300"
                                            disabled={!!actionLoading}
                                            onClick={() => handleReject(req.id)}
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

            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Submit Training Request"
            >
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    {user?.role === 'super_admin' && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Organization
                            </label>
                            <select
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200"
                                value={formData.organization}
                                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                                required
                            >
                                <option value="">Select Organization</option>
                                {organizations.map(org => (
                                    <option key={org.id} value={org.id}>{org.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200 min-h-[120px]"
                            placeholder="Describe the training requirements..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                    </div>

                    <Input
                        label="Attachment URL (Optional)"
                        placeholder="e.g. https://example.com/request.pdf"
                        value={formData.attachment_url}
                        onChange={(e) => setFormData({ ...formData, attachment_url: e.target.value })}
                    />

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={!!actionLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={!!actionLoading}>
                            {actionLoading === 'create' ? 'Submitting...' : 'Submit Request'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
