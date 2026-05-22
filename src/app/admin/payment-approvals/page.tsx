
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { apiFetch, PaymentApproval, Organization } from '@/lib/api';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { ConfirmModal } from '@/components/ConfirmModal';

export default function PaymentApprovalsPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    const [approvals, setApprovals] = useState<PaymentApproval[]>([]);
    const [orgs, setOrgs] = useState<Organization[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState('');

    const [isActionLoading, setIsActionLoading] = useState(false);
    const [actionError, setActionError] = useState('');

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{ id: string; status: 'approved' | 'rejected' } | null>(null);

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) router.push('/login');
            else if (user?.role !== 'super_admin') router.push('/dashboard');
            else {
                fetchOrgs();
                fetchApprovals();
            }
        }
    }, [isAuthenticated, isLoading, user, router]);

    const fetchOrgs = async () => {
        const { data } = await apiFetch('/api/v1/organizations/');
        if (data?.results) setOrgs(data.results);
        else if (Array.isArray(data)) setOrgs(data);
    };

    const fetchApprovals = async () => {
        setIsFetching(true);
        setError('');
        const { data, error: e } = await apiFetch('/api/v1/payment-approvals/');
        if (e) setError(e);
        else if (data?.results) setApprovals(data.results);
        else if (Array.isArray(data)) setApprovals(data);
        setIsFetching(false);
    };

    const handleStatusUpdate = (id: string, status: 'approved' | 'rejected') => {
        setConfirmAction({ id, status });
        setIsConfirmModalOpen(true);
    };

    const confirmStatusUpdate = async () => {
        if (!confirmAction) return;
        setIsActionLoading(true);
        setActionError('');

        const endpoint = `/api/v1/payment-approvals/${confirmAction.id}/${confirmAction.status}/`;
        const { error: apiErr } = await apiFetch(endpoint, { method: 'POST', body: JSON.stringify({}) });

        if (apiErr) {
            setActionError(apiErr);
        } else {
            fetchApprovals();
            setIsConfirmModalOpen(false);
        }
        setIsActionLoading(false);
    };

    const getOrgName = (id: string) => orgs.find(o => o.id === id)?.name || id;

    if (isLoading || isFetching) return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    if (!user || user.role !== 'super_admin') return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Payment Approvals</h1>
                    <p className="text-gray-500">Review and manage organization payment verification requests.</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-10">
                {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">{error}</div>}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left text-sm text-gray-500">
                        <thead className="bg-gray-50 text-gray-700 uppercase font-semibold text-xs border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Organization</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {approvals.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No payment approvals found.</td></tr>
                            ) : approvals.map(a => (
                                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{getOrgName(a.organization)}</td>
                                    <td className="px-6 py-4 font-bold text-gray-900">{a.amount} ETB</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${a.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' :
                                                a.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                                    'bg-yellow-50 text-yellow-700 border-yellow-100'
                                            }`}>
                                            {a.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs">{new Date(a.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        {a.status === 'pending' && (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleStatusUpdate(a.id, 'approved')}
                                                    className="px-3 py-1 bg-green-600 text-white rounded-md text-xs font-semibold hover:bg-green-700 transition-colors"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(a.id, 'rejected')}
                                                    className="px-3 py-1 bg-red-600 text-white rounded-md text-xs font-semibold hover:bg-red-700 transition-colors"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                        {a.status !== 'pending' && <span className="text-gray-400 text-xs italic">Reviewed</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmStatusUpdate}
                title={`${confirmAction?.status === 'approved' ? 'Approve' : 'Reject'} Payment`}
                message={`Are you sure you want to ${confirmAction?.status} this payment request? This action cannot be undone.`}
                confirmText={confirmAction?.status === 'approved' ? 'Approve' : 'Reject'}
                isLoading={isActionLoading}
            />
        </div>
    );
}
