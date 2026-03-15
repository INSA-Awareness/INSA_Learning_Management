'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';

interface Course {
    id: string;
    title: string;
    description: string;
    course_provider: string;
    status?: string;
    difficulty?: string;
    language?: string;
}

const SELECT_CLS = "block w-full rounded-md border border-gray-300 py-2.5 px-3 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none bg-white";

export default function AdminCoursesPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [actionError, setActionError] = useState('');
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [form, setForm] = useState({
        title: '',
        description: '',
        course_provider: '',
        language: 'en',
        difficulty: 'beginner',
        status: 'draft'
    });

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) router.push('/login');
            else if (user?.role !== 'super_admin' && user?.role !== 'org_admin') router.push('/dashboard');
            else fetchCourses();
        }
    }, [isAuthenticated, isLoading, user, router]);

    const fetchCourses = async () => {
        setIsFetching(true); setError('');
        const { data, error: e } = await apiFetch('/api/v1/courses/');
        if (e) setError(e);
        else if (data?.results) setCourses(data.results);
        else if (Array.isArray(data)) setCourses(data);
        setIsFetching(false);
    };

    const openModal = (course?: Course) => {
        setActionError('');
        if (course) {
            setSelectedCourse(course);
            setForm({
                title: course.title,
                description: course.description,
                course_provider: course.course_provider || '',
                language: course.language || 'en',
                difficulty: course.difficulty || 'beginner',
                status: course.status || 'draft'
            });
        }
        else {
            setSelectedCourse(null);
            setForm({
                title: '',
                description: '',
                course_provider: '',
                language: 'en',
                difficulty: 'beginner',
                status: 'draft'
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault(); setActionError(''); setIsActionLoading(true);
        const isEditing = !!selectedCourse;
        const endpoint = `/api/v1/courses/${isEditing ? `${selectedCourse!.id}/` : ''}`;
        const { error: apiErr, status } = await apiFetch(endpoint, { method: isEditing ? 'PATCH' : 'POST', body: JSON.stringify(form) });
        if (apiErr || (status !== 200 && status !== 201)) { setActionError(apiErr || 'Failed to save course.'); }
        else { fetchCourses(); setIsModalOpen(false); }
        setIsActionLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this course?')) return;
        const { error: e, status } = await apiFetch(`/api/v1/courses/${id}/`, { method: 'DELETE' });
        if (e || status !== 204) setError(e || 'Failed to delete.'); else fetchCourses();
    };

    if (isLoading || isFetching) return <div className="flex justify-center items-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    if (!user || (user.role !== 'super_admin' && user.role !== 'org_admin')) return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">Courses Management</h1>
                        <p className="text-gray-500">Create and manage cybersecurity training courses.</p>
                    </div>
                    <Button variant="primary" onClick={() => openModal()}>Add Course</Button>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-10">
                {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">{error}</div>}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left text-sm text-gray-500">
                        <thead className="bg-gray-50 text-gray-700 uppercase font-semibold text-xs border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Provider</th>
                                <th className="px-6 py-4">Language</th>
                                <th className="px-6 py-4">Difficulty</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {courses.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No courses yet.</td></tr>
                            ) : courses.map(c => (
                                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{c.title}</td>
                                    <td className="px-6 py-4">{c.course_provider || '—'}</td>
                                    <td className="px-6 py-4 uppercase text-xs">{c.language || '—'}</td>
                                    <td className="px-6 py-4 capitalize">{c.difficulty || '—'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${c.status === 'published' ? 'bg-green-50 text-green-700' : c.status === 'draft' ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {c.status || 'draft'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <button onClick={() => openModal(c)} className="text-secondary hover:text-primary font-medium mr-3 transition-colors">Edit</button>
                                        <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700 font-medium transition-colors">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedCourse ? 'Edit Course' : 'Add Course'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {actionError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">{actionError}</div>}
                    <Input label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required disabled={isActionLoading} />
                    <Input label="Course Provider" value={form.course_provider} onChange={e => setForm({ ...form, course_provider: e.target.value })} required disabled={isActionLoading} placeholder="Organization or Individual name" />
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                        <textarea className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none min-h-[80px] resize-y" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} disabled={isActionLoading} />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Language</label>
                            <select className={SELECT_CLS} value={form.language} onChange={e => setForm({ ...form, language: e.target.value })} disabled={isActionLoading}>
                                <option value="en">English (en)</option>
                                <option value="am">Amharic (am)</option>
                                <option value="om">Oromo (om)</option>
                                <option value="so">Somali (so)</option>
                                <option value="ti">Tigrinya (ti)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Difficulty</label>
                            <select className={SELECT_CLS} value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })} disabled={isActionLoading}>
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                            <select className={SELECT_CLS} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} disabled={isActionLoading}>
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isActionLoading}>Cancel</Button>
                        <Button type="submit" variant="primary" disabled={isActionLoading}>{isActionLoading ? 'Saving...' : selectedCourse ? 'Save Changes' : 'Create Course'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
