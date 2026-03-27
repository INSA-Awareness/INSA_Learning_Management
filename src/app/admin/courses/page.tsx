'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { apiFetch, getCourses, createCourse, updateCourse, deleteCourse, getOrganizations, getCertificateExams, createCertificateExam, updateCertificateExam, CertificateExam, Question } from '@/lib/api';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { ConfirmModal } from '@/components/ConfirmModal';
import { CloudinaryUpload } from '@/components/CloudinaryUpload';
import { QuestionBuilder } from '@/components/QuestionBuilder';

interface Course {
    id: string;
    title: string;
    description: string;
    level?: string;
    organization?: string;
    course_provider?: string;
    status?: string;
    language?: string;
    is_active?: boolean;
    thumbnail_url?: string;
}

interface OrgOption { id: string; name: string; }
interface UserData { id: string; email: string; first_name: string; last_name: string; role: string; }
interface CoursePayload {
    title: string;
    description: string;
    level: string;
    language: string;
    status: 'draft' | 'published' | 'archived';
    is_active: boolean;
    course_provider?: string;
    organization?: string;
    thumbnail_url?: string;
}

const SELECT_CLS = "block w-full rounded-md border border-gray-300 py-2.5 px-3 text-sm text-gray-900 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none bg-white disabled:opacity-75 disabled:bg-gray-100 disabled:cursor-not-allowed";

export default function AdminCoursesPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [orgs, setOrgs] = useState<OrgOption[]>([]);
    const [providers, setProviders] = useState<UserData[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [actionError, setActionError] = useState('');
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [form, setForm] = useState({
        title: '',
        description: '',
        organization: '',
        course_provider: '',
        language: 'en',
        level: 'beginner',
        status: 'draft',
        is_active: true,
        thumbnail_url: ''
    });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    // Filtering states
    const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchCourses = React.useCallback(async () => {
        setIsFetching(true); setError('');
        const { data, error: e } = await getCourses();
        if (e) setError(e);
        else if (data?.results) setCourses(data.results);
        else if (Array.isArray(data)) setCourses(data);
        setIsFetching(false);
    }, []);

    const fetchOrgs = React.useCallback(async () => {
        const { data } = await getOrganizations();
        if (data?.results) setOrgs(data.results);
        else if (Array.isArray(data)) setOrgs(data);
    }, []);

    const fetchUsers = React.useCallback(async () => {
        const { data } = await apiFetch('/api/auth/users/');
        let allUsers: UserData[] = [];
        if (data?.results) allUsers = data.results;
        else if (Array.isArray(data)) allUsers = data;

        // Filter for course providers
        setProviders(allUsers.filter(u => u.role === 'course_provider'));
    }, []);

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) router.push('/login');
            else if (user?.role !== 'super_admin' && user?.role !== 'org_admin' && user?.role !== 'course_provider') router.push('/dashboard');
            else {
                fetchCourses();
                fetchOrgs();
                fetchUsers();
            }
        }
    }, [isAuthenticated, isLoading, user, router, fetchCourses, fetchOrgs, fetchUsers]);

    const openModal = (course?: Course) => {
        setActionError('');
        if (course) {
            setSelectedCourse(course);
            setForm({
                title: course.title,
                description: course.description,
                organization: course.organization || '',
                course_provider: course.course_provider || '',
                language: course.language || 'en',
                level: course.level || 'beginner',
                status: course.status || 'draft',
                is_active: course.is_active !== false,
                thumbnail_url: course.thumbnail_url || ''
            });
        }
        else {
            setSelectedCourse(null);
            setForm({
                title: '',
                description: '',
                organization: '',
                course_provider: user?.role === 'course_provider' ? user.id : '',
                language: 'en',
                level: 'beginner',
                status: 'draft',
                is_active: true,
                thumbnail_url: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault(); setActionError(''); setIsActionLoading(true);
        const isEditing = !!selectedCourse;

        // Build the payload to match the API schema
        const payload: CoursePayload = {
            title: form.title,
            description: form.description,
            level: form.level,
            language: form.language,
            status: form.status as 'draft' | 'published' | 'archived',
            is_active: form.is_active,
            ...(form.thumbnail_url ? { thumbnail_url: form.thumbnail_url } : {}),
        };

        // Set course_provider and organization
        if (!isEditing) {
            if (user?.role === 'course_provider') {
                payload.course_provider = user.id;
            } else {
                if (form.course_provider) payload.course_provider = form.course_provider;
                if (form.organization) payload.organization = form.organization;
            }
        } else if (form.organization) {
            payload.organization = form.organization;
        }

        let res;
        if (isEditing) {
            res = await updateCourse(selectedCourse!.id, payload);
        } else {
            res = await createCourse(payload);
        }

        if (res.error) { setActionError(res.error || 'Failed to save course.'); }
        else { fetchCourses(); setIsModalOpen(false); }
        setIsActionLoading(false);
    };

    const handleDelete = (id: string) => {
        setItemToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        setIsActionLoading(true);
        const { error: apiErr } = await updateCourse(id, { status: newStatus as any });
        if (apiErr) setActionError(apiErr);
        else fetchCourses();
        setIsActionLoading(false);
    };

    const handleDeleteConfirm = async () => {
        if (!itemToDelete) return;
        setIsActionLoading(true);
        const { error: err } = await deleteCourse(itemToDelete);
        if (err) setError(err);
        else fetchCourses();
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
        setIsActionLoading(false);
    };

    const handleOpenExamModal = (course: any) => {
        router.push(`/admin/assessments?course=${course.id}`);
    };

    if (isLoading || isFetching) return <div className="flex justify-center items-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    if (!user || (user.role !== 'super_admin' && user.role !== 'org_admin' && user.role !== 'course_provider')) return null;

    const filteredCourses = courses.filter(c => {
        const matchesLevel = selectedLevels.length === 0 || (c.level && selectedLevels.includes(c.level.toLowerCase()));
        const matchesStatus = selectedStatuses.length === 0 || (c.status && selectedStatuses.includes(c.status.toLowerCase()));
        const matchesSearch = !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesLevel && matchesStatus && matchesSearch;
    });

    const canPublish = user.role === 'super_admin';
    const isEditing = !!selectedCourse;
    const isSuperAdminEditing = isEditing && user.role === 'super_admin';

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
                                    placeholder="Course title..."
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Level</h3>
                            <div className="space-y-3">
                                {['beginner', 'medium', 'advanced'].map(level => (
                                    <label key={level} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                            checked={selectedLevels.includes(level)}
                                            onChange={() => {
                                                setSelectedLevels(prev =>
                                                    prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
                                                );
                                            }}
                                        />
                                        <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors capitalize">{level === 'medium' ? 'Medium' : level}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Status</h3>
                            <div className="space-y-3">
                                {['draft', 'pending', 'published', 'archived'].map(status => (
                                    <label key={status} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                            checked={selectedStatuses.includes(status)}
                                            onChange={() => {
                                                setSelectedStatuses(prev =>
                                                    prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
                                                );
                                            }}
                                        />
                                        <span className="text-sm text-gray-600 capitalize group-hover:text-gray-900 transition-colors">{status}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {(selectedLevels.length > 0 || selectedStatuses.length > 0 || searchQuery) && (
                            <button
                                onClick={() => { setSelectedLevels([]); setSelectedStatuses([]); setSearchQuery(''); }}
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
                                    <th className="px-6 py-4">Level</th>
                                    <th className="px-6 py-4">Language</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredCourses.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No courses found matching your criteria.</td></tr>
                                ) : filteredCourses.map(c => (
                                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            <div className="flex items-center gap-3">
                                                {c.thumbnail_url ? (
                                                    <img src={c.thumbnail_url} alt={c.title} className="w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs shrink-0">📚</div>
                                                )}
                                                <span>{c.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 capitalize">{c.level || '—'}</td>
                                        <td className="px-6 py-4 uppercase text-xs">{c.language || '—'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${c.status === 'published' ? 'bg-green-50 text-green-700' :
                                                c.status === 'pending' ? 'bg-blue-50 text-blue-700' :
                                                    c.status === 'draft' ? 'bg-yellow-50 text-yellow-700' :
                                                        'bg-gray-100 text-gray-600'
                                                }`}>
                                                {c.status || 'draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            {c.status === 'draft' && user.role === 'course_provider' && (
                                                <button onClick={() => handleStatusUpdate(c.id, 'pending')} className="text-blue-600 hover:text-blue-800 font-medium mr-3 transition-colors">Submit</button>
                                            )}
                                            {c.status === 'pending' && user.role === 'super_admin' && (
                                                <button onClick={() => handleStatusUpdate(c.id, 'published')} className="text-green-600 hover:text-green-800 font-medium mr-3 transition-colors">Approve</button>
                                            )}
                                            <button onClick={() => openModal(c)} className="text-secondary hover:text-primary font-medium mr-3 transition-colors">Edit</button>
                                            <button onClick={() => handleOpenExamModal(c)} className="text-primary hover:text-primary-hover font-medium mr-3 transition-colors">Exam</button>
                                            <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700 font-medium transition-colors">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedCourse ? 'Edit Course' : 'Add Course'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {actionError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">{actionError}</div>}
                    <Input label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required disabled={isActionLoading || isSuperAdminEditing} />
                    <CloudinaryUpload
                        label="Course Thumbnail"
                        folder="lms-course-thumbnails"
                        resourceType="image"
                        value={form.thumbnail_url || ''}
                        onUploadSuccess={(url) => setForm({ ...form, thumbnail_url: url })}
                        disabled={isActionLoading || isSuperAdminEditing}
                    />
                    {form.thumbnail_url && (
                        <div className="rounded-xl overflow-hidden border border-gray-200 h-32">
                            <img src={form.thumbnail_url} alt="Thumbnail preview" className="w-full h-full object-cover" />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                        <textarea className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-primary/20 outline-none min-h-[80px] resize-y disabled:bg-gray-100 disabled:opacity-75 disabled:cursor-not-allowed" placeholder="Enter course description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} disabled={isActionLoading || isSuperAdminEditing} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Organization {user?.role === 'super_admin' && <span className="text-red-500">*</span>}</label>
                        <select className={SELECT_CLS} value={form.organization} onChange={e => setForm({ ...form, organization: e.target.value })} disabled={isActionLoading || isSuperAdminEditing} required={user?.role === 'super_admin' && !isSuperAdminEditing}>
                            <option value="">Select Organization {user?.role === 'super_admin' ? '(Required)' : '(optional)'}</option>
                            {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                        </select>
                    </div>
                    {user?.role === 'super_admin' && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Course Provider <span className="text-red-500">*</span></label>
                            <select className={SELECT_CLS} value={form.course_provider} onChange={e => setForm({ ...form, course_provider: e.target.value })} disabled={isActionLoading || isSuperAdminEditing} required>
                                <option value="">Select Course Provider (User)</option>
                                {providers.map(p => (
                                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.email})</option>
                                ))}
                            </select>
                            {providers.length === 0 && <p className="text-[10px] text-red-500 mt-1">No users with 'Course Provider' role found. Please create one first.</p>}
                        </div>
                    )}
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Language</label>
                            <select className={SELECT_CLS} value={form.language} onChange={e => setForm({ ...form, language: e.target.value })} disabled={isActionLoading || isSuperAdminEditing}>
                                <option value="en">English (en)</option>
                                <option value="am">Amharic (am)</option>
                                <option value="om">Oromo (om)</option>
                                <option value="so">Somali (so)</option>
                                <option value="ti">Tigrinya (ti)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Level</label>
                            <select className={SELECT_CLS} value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} disabled={isActionLoading || isSuperAdminEditing}>
                                <option value="beginner">Beginner</option>
                                <option value="medium">Medium</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                            <select className={SELECT_CLS} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} disabled={isActionLoading}>
                                <option value="draft">Draft</option>
                                {canPublish && <option value="published">Published</option>}
                                <option value="archived">Archived</option>
                            </select>
                            {!canPublish && <p className="text-[10px] text-gray-500 mt-1">Only System Admins can publish courses.</p>}
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isActionLoading}>Cancel</Button>
                        <Button type="submit" variant="primary" disabled={isActionLoading}>{isActionLoading ? 'Saving...' : selectedCourse ? 'Save Changes' : 'Create Course'}</Button>
                    </div>
                </form>
            </Modal>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Course"
                message="Are you sure you want to delete this course? This action cannot be undone."
                confirmText="Delete"
                isLoading={isActionLoading}
            />
        </div>
    );
}
