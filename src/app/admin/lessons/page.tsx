'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { ConfirmModal } from '@/components/ConfirmModal';

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

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    // Filter states
    const [selectedModules, setSelectedModules] = useState<string[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) router.push('/login');
            else if (user?.role !== 'super_admin' && user?.role !== 'org_admin' && user?.role !== 'course_provider') router.push('/dashboard');
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

    const handleDelete = (id: string) => {
        setItemToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        setIsActionLoading(true);
        const { error: e, status } = await apiFetch(`/api/v1/lessons/${itemToDelete}/`, { method: 'DELETE' });
        if (e || status !== 204) setError(e || 'Failed to delete lesson.');
        else fetchLessons();
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
        setIsActionLoading(false);
    };

    const getModuleName = (id: string) => modules.find(m => m.id === id)?.title || id;

    if (isLoading || isFetching) return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    if (!user || (user.role !== 'super_admin' && user.role !== 'org_admin' && user.role !== 'course_provider')) return null;

    const filteredLessons = lessons.filter(l => {
        const matchesModule = selectedModules.length === 0 || selectedModules.includes(l.module);
        const matchesType = selectedTypes.length === 0 || selectedTypes.includes(l.content_type);
        const matchesLanguage = selectedLanguages.length === 0 || (l.language && selectedLanguages.includes(l.language));
        const matchesSearch = !searchTerm || l.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesModule && matchesType && matchesLanguage && matchesSearch;
    });

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

            <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-10 flex flex-col lg:flex-row gap-8">
                {/* Sidebar Filter */}
                <div className="w-full lg:w-64 shrink-0">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Search</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                                <input
                                    type="text"
                                    placeholder="Lesson title..."
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2">Module</h3>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                {modules.map(module => (
                                    <label key={module.id} className="flex items-start gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                            checked={selectedModules.includes(module.id)}
                                            onChange={() => {
                                                setSelectedModules(prev =>
                                                    prev.includes(module.id) ? prev.filter(id => id !== module.id) : [...prev, module.id]
                                                );
                                            }}
                                        />
                                        <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors leading-tight">{module.title}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2">Content Type</h3>
                            <div className="space-y-2">
                                {['article', 'video', 'image', 'assessment'].map(type => (
                                    <label key={type} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                            checked={selectedTypes.includes(type)}
                                            onChange={() => {
                                                setSelectedTypes(prev =>
                                                    prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
                                                );
                                            }}
                                        />
                                        <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors capitalize">{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2">Language</h3>
                            <div className="space-y-2">
                                {[
                                    { id: 'en', name: 'English' },
                                    { id: 'am', name: 'Amharic' },
                                    { id: 'om', name: 'Oromo' },
                                    { id: 'so', name: 'Somali' },
                                    { id: 'ti', name: 'Tigrinya' }
                                ].map(lang => (
                                    <label key={lang.id} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                            checked={selectedLanguages.includes(lang.id)}
                                            onChange={() => {
                                                setSelectedLanguages(prev =>
                                                    prev.includes(lang.id) ? prev.filter(l => l !== lang.id) : [...prev, lang.id]
                                                );
                                            }}
                                        />
                                        <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors uppercase">{lang.id} - {lang.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {(selectedModules.length > 0 || selectedTypes.length > 0 || selectedLanguages.length > 0 || searchTerm) && (
                            <button
                                onClick={() => { setSelectedModules([]); setSelectedTypes([]); setSelectedLanguages([]); setSearchTerm(''); }}
                                className="text-xs text-primary font-bold hover:text-primary-hover transition-colors flex items-center gap-1"
                            >
                                ✕ Clear all filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">{error}</div>}

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full text-left text-sm text-gray-500">
                            <thead className="bg-gray-50 text-gray-700 uppercase font-semibold text-xs border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4 border-l border-gray-200">Module</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Lang</th>
                                    <th className="px-6 py-4 text-center">Order</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredLessons.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No lessons found matching your criteria.</td></tr>
                                ) : filteredLessons.map(l => (
                                    <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{l.title}</td>
                                        <td className="px-6 py-4 text-gray-600 border-l border-gray-100 truncate max-w-[200px]">{getModuleName(l.module)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold ${l.content_type === 'video' ? 'bg-blue-50 text-blue-600' :
                                                    l.content_type === 'article' ? 'bg-green-50 text-green-600' :
                                                        l.content_type === 'assessment' ? 'bg-purple-50 text-purple-600' :
                                                            'bg-gray-50 text-gray-600'
                                                }`}>
                                                {l.content_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 uppercase text-xs">{l.language}</td>
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
                    {totalCount > pageSize && !selectedModules.length && !selectedTypes.length && !selectedLanguages.length && !searchTerm && (
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

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Lesson"
                message="Are you sure you want to delete this lesson? This action cannot be undone."
                confirmText="Delete"
                isLoading={isActionLoading}
            />
        </div>
    );
}
