'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { ConfirmModal } from '@/components/ConfirmModal';

interface Alert {
    id: string;
    title?: string;
    message: string;
    severity: string;
    published_at: string;
    description?: string;
}

const SELECT_CLS = "block w-full rounded-md border border-gray-300 py-2.5 px-3 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none bg-white";

export default function AdminAlertsPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [actionError, setActionError] = useState('');
    const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
    const [form, setForm] = useState({ title: '', message: '', severity: 'medium' });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) router.push('/login');
            else if (user?.role !== 'super_admin') router.push('/dashboard');
            else fetchAlerts();
        }
    }, [isAuthenticated, isLoading, user, router]);

    const fetchAlerts = async () => {
        setIsFetching(true); setError('');
        const { data, error: e } = await apiFetch('/api/v1/alerts/');
        if (e) setError(e);
        else if (data?.results) setAlerts(data.results);
        else if (Array.isArray(data)) setAlerts(data);
        setIsFetching(false);
    };

    const openModal = (alert?: Alert) => {
        setActionError('');
        if (alert) {
            setSelectedAlert(alert);
            setForm({ title: alert.title || '', message: alert.message || '', severity: alert.severity || 'medium' });
        } else {
            setSelectedAlert(null);
            setForm({ title: '', message: '', severity: 'medium' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault(); setActionError(''); setIsActionLoading(true);
        const isEditing = !!selectedAlert;
        const endpoint = `/api/v1/alerts/${isEditing ? `${selectedAlert!.id}/` : ''}`;
        const { error: apiErr, status } = await apiFetch(endpoint, { method: isEditing ? 'PATCH' : 'POST', body: JSON.stringify(form) });
        if (apiErr || (status !== 200 && status !== 201)) setActionError(apiErr || 'Failed to save.');
        else { fetchAlerts(); setIsModalOpen(false); }
        setIsActionLoading(false);
    };

    const handleDelete = (id: string) => {
        setItemToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        setIsActionLoading(true);
        const { error: e, status } = await apiFetch(`/api/v1/alerts/${itemToDelete}/`, { method: 'DELETE' });
        if (e || status !== 204) setError(e || 'Failed to delete.');
        else fetchAlerts();
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
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">Alerts Management</h1>
                        <p className="text-gray-500">Create and publish cybersecurity advisories.</p>
                    </div>
                    <Button variant="primary" onClick={() => openModal()}>Create Alert</Button>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-10">
                {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">{error}</div>}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left text-sm text-gray-500">
                        <thead className="bg-gray-50 text-gray-700 uppercase font-semibold text-xs border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Status & Severity</th>
                                <th className="px-6 py-4">Title / Message</th>
                                <th className="px-6 py-4">Published</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {alerts.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No alerts yet.</td></tr>
                            ) : alerts.map(a => (
                                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${a.severity === 'critical' ? 'bg-red-50 text-red-700' :
                                            a.severity === 'high' ? 'bg-orange-50 text-orange-700' :
                                                'bg-blue-50 text-blue-700'
                                            }`}>
                                            {a.severity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{a.title}</div>
                                        <div className="text-gray-500 truncate max-w-sm">{a.message}</div>
                                    </td>
                                    <td className="px-6 py-4 text-xs">{new Date(a.published_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <button onClick={() => openModal(a)} className="text-secondary hover:text-primary font-medium mr-3 transition-colors">Edit</button>
                                        <button onClick={() => handleDelete(a.id)} className="text-red-500 hover:text-red-700 font-medium transition-colors">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedAlert ? 'Edit Alert' : 'Create Alert'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {actionError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">{actionError}</div>}
                    <Input label="Alert Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required disabled={isActionLoading} />
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Severity</label>
                        <select className={SELECT_CLS} value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })} disabled={isActionLoading}>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Message Content</label>
                        <textarea className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary outline-none transition-all min-h-[100px]" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required disabled={isActionLoading} />
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isActionLoading}>Cancel</Button>
                        <Button type="submit" variant="primary" disabled={isActionLoading}>{isActionLoading ? 'Saving...' : selectedAlert ? 'Save Changes' : 'Publish Alert'}</Button>
                    </div>
                </form>
            </Modal>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Alert"
                message="Are you sure you want to delete this alert? This action cannot be undone."
                confirmText="Delete"
                isLoading={isActionLoading}
            />
        </div>
    );
}
