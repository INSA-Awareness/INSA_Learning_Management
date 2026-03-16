'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getResources, createResource, updateResource, deleteResource, publishResource, Resource } from '@/lib/api';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { ConfirmModal } from '@/components/ConfirmModal';

const SELECT_CLS = "block w-full rounded-md border border-gray-300 py-2.5 px-3 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none bg-white";

export default function AdminResourcesPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [resources, setResources] = useState<Resource[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [actionError, setActionError] = useState('');
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
    const [form, setForm] = useState<{
        organization: string;
        title: string;
        content: string;
        file_url: string;
        category: string;
        audience: string;
        status: 'draft' | 'published';
    }>({ organization: '', title: '', content: '', file_url: '', category: '', audience: '', status: 'draft' });

    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmText: string;
        onConfirm: () => void;
        variant: 'danger' | 'warning' | 'info';
    }>({
        isOpen: false,
        title: '',
        message: '',
        confirmText: '',
        onConfirm: () => { },
        variant: 'danger'
    });

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) router.push('/login');
            else if (user?.role !== 'super_admin' && user?.role !== 'org_admin' && user?.role !== 'course_provider') router.push('/dashboard');
            else fetchResources();
        }
    }, [isAuthenticated, isLoading, user, router]);

    const fetchResources = async () => {
        setIsFetching(true); setError('');
        const { data, error: e } = await getResources();
        if (e) setError(e);
        else if (data?.results) setResources(data.results);
        setIsFetching(false);
    };

    const openModal = (res?: Resource) => {
        setActionError('');
        if (res) {
            setSelectedResource(res);
            setForm({
                organization: res.organization,
                title: res.title,
                content: res.content,
                file_url: res.file_url,
                category: res.category,
                audience: res.audience,
                status: res.status
            });
        } else {
            setSelectedResource(null);
            setForm({ organization: '', title: '', content: '', file_url: '', category: '', audience: '', status: 'draft' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault(); setActionError(''); setIsActionLoading(true);
        const isEditing = !!selectedResource;
        const { error: apiErr } = isEditing
            ? await updateResource(selectedResource!.id, form)
            : await createResource(form);

        if (apiErr) { setActionError(apiErr || 'Failed to save resource.'); }
        else { fetchResources(); setIsModalOpen(false); }
        setIsActionLoading(false);
    };

    const handleDelete = (id: string) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Delete Resource',
            message: 'Are you sure you want to delete this resource? This action cannot be undone.',
            confirmText: 'Delete',
            variant: 'danger',
            onConfirm: async () => {
                setIsActionLoading(true);
                const { error: e } = await deleteResource(id);
                if (e) setError(e || 'Failed to delete.');
                else fetchResources();
                setIsActionLoading(false);
                setConfirmConfig(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handlePublish = (id: string) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Publish Resource',
            message: 'Are you sure you want to publish this resource? It will be visible to its target audience.',
            confirmText: 'Publish',
            variant: 'info',
            onConfirm: async () => {
                setIsActionLoading(true);
                const { error: e } = await publishResource(id, {});
                if (e) setError(e || 'Failed to publish.');
                else fetchResources();
                setIsActionLoading(false);
                setConfirmConfig(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    if (isLoading || isFetching) return <div className="flex justify-center items-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    if (!user || (user.role !== 'super_admin' && user.role !== 'org_admin' && user.role !== 'course_provider')) return null;

    const canPublish = user.role === 'super_admin';

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">Resources Management</h1>
                        <p className="text-gray-500">Manage and publish learning resources.</p>
                    </div>
                    <Button variant="primary" onClick={() => openModal()}>Add Resource</Button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-10">
                {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">{error}</div>}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left text-sm text-gray-500">
                        <thead className="bg-gray-50 text-gray-700 uppercase font-semibold text-xs border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Audience</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {resources.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No resources yet.</td></tr>
                            ) : resources.map(r => (
                                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{r.title}</td>
                                    <td className="px-6 py-4 uppercase text-xs">{r.category}</td>
                                    <td className="px-6 py-4 text-xs">{r.audience}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${r.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        {r.status === 'draft' && canPublish && (
                                            <button onClick={() => handlePublish(r.id)} className="text-green-600 hover:text-green-800 font-medium mr-3 transition-colors">Publish</button>
                                        )}
                                        <button onClick={() => openModal(r)} className="text-secondary hover:text-primary font-medium mr-3 transition-colors">Edit</button>
                                        <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:text-red-700 font-medium transition-colors">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedResource ? 'Edit Resource' : 'Add Resource'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {actionError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">{actionError}</div>}
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required disabled={isActionLoading} />
                        <Input label="Organization UUID" value={form.organization} onChange={e => setForm({ ...form, organization: e.target.value })} required disabled={isActionLoading} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Content</label>
                        <textarea className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none min-h-[100px] resize-y" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} disabled={isActionLoading} />
                    </div>
                    <Input label="File URL" value={form.file_url} onChange={e => setForm({ ...form, file_url: e.target.value })} disabled={isActionLoading} placeholder="https://..." />
                    <div className="grid grid-cols-3 gap-3">
                        <Input label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required disabled={isActionLoading} />
                        <Input label="Audience" value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })} required disabled={isActionLoading} />
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                            <select className={SELECT_CLS} value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })} disabled={isActionLoading}>
                                <option value="draft">Draft</option>
                                {canPublish && <option value="published">Published</option>}
                            </select>
                            {!canPublish && <p className="text-[10px] text-gray-500 mt-1">Contact admin for publishing.</p>}
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isActionLoading}>Cancel</Button>
                        <Button type="submit" variant="primary" disabled={isActionLoading}>{isActionLoading ? 'Saving...' : selectedResource ? 'Save Changes' : 'Add Resource'}</Button>
                    </div>
                </form>
            </Modal>

            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
                confirmText={confirmConfig.confirmText}
                variant={confirmConfig.variant}
                isLoading={isActionLoading}
            />
        </div>
    );
}
