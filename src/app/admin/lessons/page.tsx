'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';

interface Lesson {
    id: string;
    module: string;
    title: string;
    content_type: 'video' | 'article' | 'image' | 'assessment';
    language: string;
    content?: string;
    media_url?: string;
    image_url?: string;
    assessment_type?: 'true_false' | 'multiple_choice';
    assessment_payload?: string;
    order: number;
}

interface Module {
    id: string;
    title: string;
}

const SELECT_CLS = "block w-full rounded-md border border-gray-300 py-2.5 px-3 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none bg-white";

export default function AdminLessonsPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [modules, setModules] = useState<Module[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 10;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [actionError, setActionError] = useState('');
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

    const [form, setForm] = useState({
        module: '',
        title: '',
        content_type: 'article',
        language: 'en',
        content: '',
        media_url: '',
        image_url: '',
        assessment_type: 'true_false',
        assessment_payload: '',
        order: 0
    });

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) router.push('/login');
            else if (user?.role !== 'super_admin' && user?.role !== 'org_admin') router.push('/dashboard');
            else {
                fetchModules();
                fetchLessons();
            }
        }
    }, [isAuthenticated, isLoading, user, router, page, searchTerm]);

    const fetchModules = async () => {
        const { data } = await apiFetch('/api/v1/modules/?page_size=100');
        if (data?.results) setModules(data.results);
        else if (Array.isArray(data)) setModules(data);
    };

    const fetchLessons = async () => {
        setIsFetching(true);
        setError('');
        const query = new URLSearchParams({
            page: page.toString(),
            page_size: pageSize.toString(),
            search: searchTerm,
            ordering: 'order'
        }).toString();

        const { data, error: e } = await apiFetch(`/api/v1/lessons/?${query}`);
        if (e) setError(e);
        else if (data?.results) {
            setLessons(data.results);
            setTotalCount(data.count || 0);
        } else if (Array.isArray(data)) {
            setLessons(data);
            setTotalCount(data.length);
        }
        setIsFetching(false);
    };

    const openModal = (lesson?: Lesson) => {
        setActionError('');
        if (lesson) {
            setSelectedLesson(lesson);
            setForm({
                module: lesson.module,
                title: lesson.title,
                content_type: lesson.content_type,
                language: lesson.language,
                content: lesson.content || '',
                media_url: lesson.media_url || '',
                image_url: lesson.image_url || '',
                assessment_type: lesson.assessment_type || 'true_false',
                assessment_payload: lesson.assessment_payload || '',
                order: lesson.order
            });
        } else {
            setSelectedLesson(null);
            setForm({
                module: modules[0]?.id || '',
                title: '',
                content_type: 'article',
                language: 'en',
                content: '',
                media_url: '',
                image_url: '',
                assessment_type: 'true_false',
                assessment_payload: '',
                order: lessons.length + 1
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        setActionError('');
        setIsActionLoading(true);

        const isEditing = !!selectedLesson;
        const endpoint = `/api/v1/lessons/${isEditing ? `${selectedLesson.id}/` : ''}`;

        const { error: apiErr, status } = await apiFetch(endpoint, {
            method: isEditing ? 'PATCH' : 'POST',
            body: JSON.stringify(form)
        });

        if (apiErr || (status !== 200 && status !== 201)) {
            setActionError(apiErr || 'Failed to save lesson.');
        } else {
            fetchLessons();
            setIsModalOpen(false);
        }
        setIsActionLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this lesson?')) return;
        const { error: e, status } = await apiFetch(`/api/v1/lessons/${id}/`, { method: 'DELETE' });
        if (e || status !== 204) setError(e || 'Failed to delete lesson.');
        else fetchLessons();
    };

    const getModuleName = (moduleId: string) => {
        return modules.find(m => m.id === moduleId)?.title || moduleId;
    };

    if (isLoading || isFetching) return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    if (!user || (user.role !== 'super_admin' && user.role !== 'org_admin')) return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">Lessons Management</h1>
                        <p className="text-gray-500">Create rich content including videos, articles, and assessments.</p>
                    </div>
                    <Button variant="primary" onClick={() => openModal()}>Add Lesson</Button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-10">
                {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">{error}</div>}

                {/* Search */}
                <div className="mb-6 max-w-md">
                    <Input
                        placeholder="Search lessons..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                    />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left text-sm text-gray-500">
                        <thead className="bg-gray-50 text-gray-700 uppercase font-semibold text-xs border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Module</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4 text-center">Order</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {lessons.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No lessons found.</td></tr>
                            ) : lessons.map(l => (
                                <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{l.title}</td>
                                    <td className="px-6 py-4 text-gray-600 truncate max-w-[200px]">{getModuleName(l.module)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-xs font-semibold capitalize bg-blue-50 text-blue-700`}>
                                            {l.content_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">{l.order}</td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <button onClick={() => openModal(l)} className="text-secondary hover:text-primary font-medium mr-3 transition-colors">Edit</button>
                                        <button onClick={() => handleDelete(l.id)} className="text-red-500 hover:text-red-700 font-medium transition-colors">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalCount > pageSize && (
                    <div className="mt-6 flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
                        <span className="text-sm text-gray-500">Showing {lessons.length} of {totalCount} lessons</span>
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
                                disabled={(page * pageSize) >= totalCount || isFetching}
                                onClick={() => setPage(p => p + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedLesson ? 'Edit Lesson' : 'Add Lesson'} maxWidth="2xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {actionError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">{actionError}</div>}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Parent Module</label>
                            <select
                                className={SELECT_CLS}
                                value={form.module}
                                onChange={e => setForm({ ...form, module: e.target.value })}
                                disabled={isActionLoading}
                                required
                            >
                                <option value="" disabled>Select a module</option>
                                {modules.map(m => (
                                    <option key={m.id} value={m.id}>{m.title}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Language</label>
                            <select
                                className={SELECT_CLS}
                                value={form.language}
                                onChange={e => setForm({ ...form, language: e.target.value })}
                                disabled={isActionLoading}
                                required
                            >
                                <option value="en">English (en)</option>
                                <option value="am">Amharic (am)</option>
                                <option value="om">Oromo (om)</option>
                                <option value="so">Somali (so)</option>
                                <option value="ti">Tigrinya (ti)</option>
                            </select>
                        </div>
                    </div>

                    <Input
                        label="Lesson Title"
                        value={form.title}
                        onChange={e => setForm({ ...form, title: e.target.value })}
                        required
                        disabled={isActionLoading}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Content Type</label>
                            <select
                                className={SELECT_CLS}
                                value={form.content_type}
                                onChange={e => setForm({ ...form, content_type: e.target.value as any })}
                                disabled={isActionLoading}
                                required
                            >
                                <option value="article">Article</option>
                                <option value="video">Video</option>
                                <option value="image">Image</option>
                                <option value="assessment">Assessment</option>
                            </select>
                        </div>
                        <Input
                            label="Order"
                            type="number"
                            value={form.order}
                            onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                            required
                            disabled={isActionLoading}
                        />
                    </div>

                    {/* Conditional Fields */}
                    {form.content_type === 'article' && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Article Content</label>
                            <textarea
                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none min-h-[150px] resize-y"
                                value={form.content}
                                onChange={e => setForm({ ...form, content: e.target.value })}
                                disabled={isActionLoading}
                                placeholder="Write your article content here (Markdown supported)..."
                            />
                        </div>
                    )}

                    {(form.content_type === 'video' || form.content_type === 'image') && (
                        <div className="grid grid-cols-1 gap-4">
                            <Input
                                label={form.content_type === 'video' ? "Video URL" : "Image URL"}
                                value={form.content_type === 'video' ? form.media_url : form.image_url}
                                onChange={e => setForm({ ...form, [form.content_type === 'video' ? 'media_url' : 'image_url']: e.target.value })}
                                disabled={isActionLoading}
                                placeholder="https://..."
                            />
                            {form.content_type === 'video' && (
                                <textarea
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none min-h-[80px] resize-y"
                                    value={form.content}
                                    onChange={e => setForm({ ...form, content: e.target.value })}
                                    disabled={isActionLoading}
                                    placeholder="Video description (optional)..."
                                />
                            )}
                        </div>
                    )}

                    {form.content_type === 'assessment' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Assessment Type</label>
                                <select
                                    className={SELECT_CLS}
                                    value={form.assessment_type}
                                    onChange={e => setForm({ ...form, assessment_type: e.target.value as any })}
                                    disabled={isActionLoading}
                                >
                                    <option value="true_false">True/False</option>
                                    <option value="multiple_choice">Multiple Choice</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Assessment Payload (JSON)</label>
                                <textarea
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary outline-none min-h-[100px] resize-y"
                                    value={form.assessment_payload}
                                    onChange={e => setForm({ ...form, assessment_payload: e.target.value })}
                                    disabled={isActionLoading}
                                    placeholder='{ "question": "...", "options": [...] }'
                                />
                            </div>
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isActionLoading}>Cancel</Button>
                        <Button type="submit" variant="primary" disabled={isActionLoading}>
                            {isActionLoading ? 'Saving...' : selectedLesson ? 'Save Changes' : 'Create Lesson'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
