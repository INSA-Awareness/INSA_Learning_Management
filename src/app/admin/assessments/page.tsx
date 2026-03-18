'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { ConfirmModal } from '@/components/ConfirmModal';

interface Assessment { id: string; title?: string; module?: string; passing_score?: number; total_questions?: number; order?: number; }
interface ModuleOption { id: string; title: string; }

const SELECT_CLS = "block w-full rounded-md border border-gray-300 py-2.5 px-3 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none bg-white";

export default function AdminAssessmentsPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [items, setItems] = useState<Assessment[]>([]);
    const [modules, setModules] = useState<ModuleOption[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 10;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [actionError, setActionError] = useState('');
    const [selected, setSelected] = useState<Assessment | null>(null);
    const [form, setForm] = useState({ title: '', module: '', passing_score: 70, order: 0 });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) router.push('/login');
            else if (user?.role !== 'super_admin' && user?.role !== 'course_provider') router.push('/dashboard');
            else {
                fetchAll();
                fetchModules();
            }
        }
    }, [isAuthenticated, isLoading, user, router, page, searchTerm]);

    const fetchModules = async () => {
        const { data } = await apiFetch('/api/v1/modules/?page_size=100');
        if (data?.results) setModules(data.results);
        else if (Array.isArray(data)) setModules(data);
    };

    const fetchAll = async () => {
        setIsFetching(true);
        const query = new URLSearchParams({
            page: page.toString(),
            page_size: pageSize.toString(),
            search: searchTerm,
            ordering: '-order'
        }).toString();
        const { data, error: e } = await apiFetch(`/api/v1/assessments/?${query}`);
        if (e) setError(e);
        else if (data?.results) {
            setItems(data.results);
            setTotalCount(data.count || 0);
        }
        else if (Array.isArray(data)) {
            setItems(data);
            setTotalCount(data.length);
        }
        setIsFetching(false);
    };

    const openModal = (item?: Assessment) => {
        setActionError('');
        if (item) { setSelected(item); setForm({ title: item.title || '', module: item.module || '', passing_score: item.passing_score || 70, order: item.order || 0 }); }
        else { setSelected(null); setForm({ title: '', module: '', passing_score: 70, order: 0 }); }
        setIsModalOpen(true);
    };

    const handleSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault(); setActionError(''); setIsActionLoading(true);
        const isEditing = !!selected;
        const endpoint = `/api/v1/assessments/${isEditing ? `${selected!.id}/` : ''}`;
        const { error: apiErr, status } = await apiFetch(endpoint, { method: isEditing ? 'PATCH' : 'POST', body: JSON.stringify(form) });
        if (apiErr || (status !== 200 && status !== 201)) setActionError(apiErr || 'Failed to save.');
        else { fetchAll(); setIsModalOpen(false); }
        setIsActionLoading(false);
    };

    const handleDelete = (id: string) => {
        setItemToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        setIsActionLoading(true);
        const { error: e, status } = await apiFetch(`/api/v1/assessments/${itemToDelete}/`, { method: 'DELETE' });
        if (e || status !== 204) setError(e || 'Failed to delete.');
        else fetchAll();
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
        setIsActionLoading(false);
    };

    if (isLoading || isFetching) return <div className="flex justify-center items-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    if (!user || (user.role !== 'super_admin' && user.role !== 'course_provider')) return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">Assessments</h1>
                        <p className="text-gray-500">Manage quizzes and assessments for training modules.</p>
                    </div>
                    <Button variant="primary" onClick={() => openModal()}>Add Assessment</Button>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-10">
                {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">{error}</div>}

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <Input
                            placeholder="Search assessments by title..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left text-sm text-gray-500">
                        <thead className="bg-gray-50 text-gray-700 uppercase font-semibold text-xs border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Module UUID</th>
                                <th className="px-6 py-4">Passing Score</th>
                                <th className="px-6 py-4">Order</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {items.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No assessments yet.</td></tr>
                            ) : items.map(a => (
                                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{a.title || '—'}</td>
                                    <td className="px-6 py-4 font-mono text-xs text-gray-600 truncate max-w-[160px]" title={a.module}>{a.module || '—'}</td>
                                    <td className="px-6 py-4">{a.passing_score ?? '—'}%</td>
                                    <td className="px-6 py-4">{a.order ?? 0}</td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <button onClick={() => openModal(a)} className="text-secondary hover:text-primary font-medium mr-3 transition-colors">Edit</button>
                                        <button onClick={() => handleDelete(a.id)} className="text-red-500 hover:text-red-700 font-medium transition-colors">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="mt-6 flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
                    <span className="text-sm text-gray-500">Showing {items.length} of {totalCount} results</span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page <= 1 || isFetching}
                            onClick={() => setPage(p => p - 1)}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={items.length < pageSize && (page * pageSize) >= totalCount || isFetching}
                            onClick={() => setPage(p => p + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selected ? 'Edit Assessment' : 'Add Assessment'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {actionError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">{actionError}</div>}
                    <Input label="Assessment Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required disabled={isActionLoading} />
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Module <span className="text-red-500">*</span></label>
                        <select
                            className={SELECT_CLS}
                            value={form.module}
                            onChange={e => setForm({ ...form, module: e.target.value })}
                            required
                            disabled={isActionLoading}
                        >
                            <option value="">Select Module</option>
                            {modules.map(m => (
                                <option key={m.id} value={m.id}>{m.title}</option>
                            ))}
                        </select>
                    </div>
                    <Input label="Passing Score (%)" type="number" value={form.passing_score} onChange={e => setForm({ ...form, passing_score: parseInt(e.target.value) || 0 })} required disabled={isActionLoading} />
                    <Input label="Order" type="number" value={form.order} onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 0 })} required disabled={isActionLoading} />
                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isActionLoading}>Cancel</Button>
                        <Button type="submit" variant="primary" disabled={isActionLoading}>{isActionLoading ? 'Saving...' : selected ? 'Save Changes' : 'Create Assessment'}</Button>
                    </div>
                </form>
            </Modal>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Assessment"
                message="Are you sure you want to delete this assessment? This action cannot be undone."
                confirmText="Delete"
                isLoading={isActionLoading}
            />
        </div>
    );
}
