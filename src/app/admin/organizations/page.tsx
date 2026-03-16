'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { ConfirmModal } from '@/components/ConfirmModal';

interface Organization { id: string; name: string; status: 'pending' | 'approved' | 'rejected'; is_active?: boolean; member_count?: number; created_at?: string; }

export default function AdminOrganizationsPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [orgs, setOrgs] = useState<Organization[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [actionError, setActionError] = useState('');
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
    const [form, setForm] = useState({ name: '' });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) router.push('/login');
            else if (user?.role !== 'super_admin') router.push('/dashboard');
            else fetchOrgs();
        }
    }, [isAuthenticated, isLoading, user, router]);

    const fetchOrgs = async () => {
        setIsFetching(true); setError('');
        const { data, error: e } = await apiFetch('/api/v1/organizations/');
        if (e) setError(e);
        else if (data?.results) setOrgs(data.results);
        else if (Array.isArray(data)) setOrgs(data);
        setIsFetching(false);
    };

    const openModal = (org?: Organization) => {
        setActionError('');
        if (org) { setSelectedOrg(org); setForm({ name: org.name }); }
        else { setSelectedOrg(null); setForm({ name: '' }); }
        setIsModalOpen(true);
    };

    const handleStatusUpdate = async (id: string, newStatus: 'approved' | 'rejected') => {
        setIsActionLoading(true);
        const { error: apiErr, status } = await apiFetch(`/api/v1/organizations/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify({ status: newStatus, is_active: newStatus === 'approved' })
        });
        if (apiErr) setActionError(apiErr);
        else fetchOrgs();
        setIsActionLoading(false);
    };

    const handleSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault(); setActionError(''); setIsActionLoading(true);
        const isEditing = !!selectedOrg;
        const endpoint = `/api/v1/organizations/${isEditing ? `${selectedOrg!.id}/` : ''}`;
        const payload = isEditing ? form : { ...form, status: 'approved', is_active: true }; // New ones created by admin are approved by default
        const { error: apiErr, status: httpStatus } = await apiFetch(endpoint, { method: isEditing ? 'PATCH' : 'POST', body: JSON.stringify(payload) });
        if (apiErr || (httpStatus !== 200 && httpStatus !== 201)) setActionError(apiErr || 'Failed to save.');
        else { fetchOrgs(); setIsModalOpen(false); }
        setIsActionLoading(false);
    };

    const handleDelete = (id: string) => {
        setItemToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        setIsActionLoading(true);
        const { error: e, status } = await apiFetch(`/api/v1/organizations/${itemToDelete}/`, { method: 'DELETE' });
        if (e || status !== 204) setError(e || 'Failed to delete.');
        else fetchOrgs();
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
        setIsActionLoading(false);
    };

    if (isLoading || isFetching) return <div className="flex justify-center items-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    if (!user || user.role !== 'super_admin') return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">Organizations</h1>
                        <p className="text-gray-500">Manage organizations registered on the platform.</p>
                    </div>
                    <Button variant="primary" onClick={() => openModal()}>Add Organization</Button>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-10">
                {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">{error}</div>}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left text-sm text-gray-500">
                        <thead className="bg-gray-50 text-gray-700 uppercase font-semibold text-xs border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Created</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {orgs.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No organizations yet.</td></tr>
                            ) : orgs.map(o => (
                                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{o.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${o.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' :
                                                o.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                                    'bg-yellow-50 text-yellow-700 border-yellow-100'
                                            }`}>
                                            {o.status || 'pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs">{o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}</td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        {o.status === 'pending' && (
                                            <>
                                                <button onClick={() => handleStatusUpdate(o.id, 'approved')} className="text-green-600 hover:text-green-800 font-medium mr-3 transition-colors">Approve</button>
                                                <button onClick={() => handleStatusUpdate(o.id, 'rejected')} className="text-red-600 hover:text-red-800 font-medium mr-3 transition-colors">Reject</button>
                                            </>
                                        )}
                                        <button onClick={() => openModal(o)} className="text-secondary hover:text-primary font-medium mr-3 transition-colors">Edit</button>
                                        <button onClick={() => handleDelete(o.id)} className="text-red-500 hover:text-red-700 font-medium transition-colors">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedOrg ? 'Edit Organization' : 'Add Organization'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {actionError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">{actionError}</div>}
                    <Input label="Organization Name" value={form.name} onChange={e => setForm({ name: e.target.value })} required disabled={isActionLoading} placeholder="e.g., INSA Federal Agency" />
                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isActionLoading}>Cancel</Button>
                        <Button type="submit" variant="primary" disabled={isActionLoading}>{isActionLoading ? 'Saving...' : selectedOrg ? 'Save Changes' : 'Create Organization'}</Button>
                    </div>
                </form>
            </Modal>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Organization"
                message="Are you sure you want to delete this organization? All linked users and data might be affected."
                confirmText="Delete"
                isLoading={isActionLoading}
            />
        </div>
    );
}
