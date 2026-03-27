'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
    apiFetch,
    Course,
    Module,
    Lesson,
    CertificateExam,
    getCourses,
    getModules,
    getLessons,
    getCertificateExams,
    createCertificateExam,
    updateCertificateExam,
    createLesson,
    updateLesson
} from '@/lib/api';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { ConfirmModal } from '@/components/ConfirmModal';
import { QuestionBuilder } from '@/components/QuestionBuilder';

const SELECT_CLS = "block w-full rounded-md border border-gray-300 py-2.5 px-3 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none bg-white font-medium";

type AssessmentType = 'lesson' | 'certificate';

export default function AdminAssessmentsPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    const [viewType, setViewType] = useState<AssessmentType>('lesson');
    const [lessonAssessments, setLessonAssessments] = useState<Lesson[]>([]);
    const [certificateExams, setCertificateExams] = useState<CertificateExam[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [modules, setModules] = useState<Module[]>([]);
    const [lessons, setLessons] = useState<Lesson[]>([]);

    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [actionError, setActionError] = useState('');

    // Form state
    const [form, setForm] = useState({
        type: 'lesson' as AssessmentType,
        course_id: '',
        module_id: '',
        lesson_id: '',
        title: '',
        passing_score: 70,
        assessment_type: 'multiple' as 'multiple_choice' | 'true_false' | 'matching' | 'multiple',
        assessment_payload: { questions: [] as any[] },
        order: 0
    });

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<any | null>(null);

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) router.push('/login');
            else if (user?.role !== 'super_admin' && user?.role !== 'course_provider') router.push('/dashboard');
            else {
                // Handle initial redirect from Courses page
                const params = new URLSearchParams(window.location.search);
                const courseId = params.get('course');
                if (courseId && !selectedItem && !isModalOpen) {
                    setViewType('certificate');
                }

                fetchAll();
                fetchCoursesList();
            }
        }
    }, [isAuthenticated, isLoading, user, router, viewType]);

    const fetchAll = async () => {
        setIsFetching(true);
        setError('');

        try {
            // Fetch relevant data based on view
            const params = new URLSearchParams(window.location.search);
            const courseId = params.get('course');

            if (viewType === 'lesson') {
                const searchParams: any = { content_type: 'assessment', page_size: 100 };
                // If we have a course filter in URL, find modules for it. 
                // However, the backend /lessons/ doesn't have a direct 'course' filter usually, 
                // it's filtered by 'module' instead.
                const { data } = await getLessons(searchParams);
                setLessonAssessments(data?.results || (Array.isArray(data) ? data : []));
            } else {
                const searchParams: any = { page_size: 100 };
                if (courseId) searchParams.course = courseId;

                const { data } = await getCertificateExams(searchParams);
                setCertificateExams(data?.results || (Array.isArray(data) ? data : []));
            }
        } catch (e) {
            setError('Failed to fetch assessment data.');
        } finally {
            setIsFetching(false);
        }
    };

    const fetchCoursesList = async () => {
        const { data: cData } = await getCourses({ page_size: 100 });
        setCourses(cData?.results || []);
    };

    const fetchModulesForCourse = async (courseId: string) => {
        if (!courseId) {
            setModules([]);
            setLessons([]);
            return;
        }
        try {
            const { data } = await getModules({ course: courseId, page_size: 100 });
            const results = data?.results || (Array.isArray(data) ? data : []);
            setModules(results);
            setLessons([]); // reset lessons
        } catch (e) {
            setModules([]);
        }
    };

    const fetchLessonsForModule = async (moduleId: string) => {
        if (!moduleId) {
            setLessons([]);
            return;
        }
        try {
            const { data } = await getLessons({ module: moduleId, page_size: 100 });
            const results = data?.results || (Array.isArray(data) ? data : []);
            setLessons(results);
        } catch (e) {
            setLessons([]);
        }
    };

    // Keep form and lists in sync
    useEffect(() => {
        if (isModalOpen && form.course_id) {
            fetchModulesForCourse(form.course_id);
        }
    }, [form.course_id, isModalOpen]);

    useEffect(() => {
        if (isModalOpen && form.module_id) {
            fetchLessonsForModule(form.module_id);
        }
    }, [form.module_id, isModalOpen]);

    const handleOpenModal = (item?: any) => {
        setActionError('');
        if (item) {
            setSelectedItem(item);
            const isCert = !!item.course;
            setForm({
                type: isCert ? 'certificate' : 'lesson',
                course_id: item.course || '',
                module_id: item.module || '',
                lesson_id: item.id || '',
                title: item.title || '',
                passing_score: item.passing_score || 70,
                assessment_type: item.assessment_type || 'multiple',
                assessment_payload: typeof item.assessment_payload === 'string'
                    ? JSON.parse(item.assessment_payload)
                    : item.assessment_payload || { questions: [] },
                order: item.order || 0
            });
        } else {
            setSelectedItem(null);
            const params = new URLSearchParams(window.location.search);
            const courseId = params.get('course');

            setForm({
                type: viewType,
                course_id: courseId || '',
                module_id: '',
                lesson_id: '',
                title: '',
                passing_score: 70,
                assessment_type: 'multiple',
                assessment_payload: { questions: [] },
                order: 0
            });
            setLessons([]);
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionError('');
        setIsActionLoading(true);

        const isEditing = !!selectedItem;

        try {
            if (form.type === 'certificate') {
                const payload = {
                    course: form.course_id,
                    title: form.title,
                    passing_score: form.passing_score,
                    // Map to 'multiple' for certificate exams
                    assessment_type: form.assessment_type === 'multiple_choice' ? 'multiple' : form.assessment_type,
                    assessment_payload: form.assessment_payload,
                    order: form.order
                };

                payload.assessment_payload.questions?.forEach((q: any, i: number) => {
                });

                const { error: err, data: resData } = isEditing
                    ? await updateCertificateExam(selectedItem.id, payload as any)
                    : await createCertificateExam(payload as any);

                if (err) {
                    setActionError(err);
                } else {
                    setIsModalOpen(false); fetchAll();
                }
            } else {
                // Lesson Assessment
                const payload: any = {
                    title: form.title,
                    content_type: 'assessment',
                    // Map to 'multiple_choice' for lesson assessments
                    assessment_type: form.assessment_type === 'multiple' ? 'multiple_choice' : form.assessment_type,
                    assessment_payload: form.assessment_payload,
                    order: form.order
                };

                payload.assessment_payload?.questions?.forEach((q: any, i: number) => {
                });

                const { error: err, data: resData } = isEditing
                    ? await updateLesson(selectedItem.id, payload)
                    : (form.lesson_id
                        ? await updateLesson(form.lesson_id, payload)
                        : await createLesson({ ...payload, module: form.module_id })
                    );

                if (err) {
                    setActionError(err);
                } else {
                    setIsModalOpen(false); fetchAll();
                }
            }
        } catch (e) {
            setActionError('An unexpected error occurred.');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDelete = (item: any) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        setIsActionLoading(true);
        const isCert = !!itemToDelete.course;

        const { error: err, status } = isCert
            ? await apiFetch(`/api/v1/certificate-exams/${itemToDelete.id}/`, { method: 'DELETE' })
            : await apiFetch(`/api/v1/lessons/${itemToDelete.id}/`, { method: 'DELETE' });

        if (err || status !== 204) setError(err || 'Failed to delete assessment.');
        else fetchAll();

        setIsDeleteModalOpen(false);
        setItemToDelete(null);
        setIsActionLoading(false);
    };

    if (isLoading || isFetching) return <div className="flex justify-center items-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

    const activeList = viewType === 'lesson' ? lessonAssessments : certificateExams;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">Assessment Management</h1>
                        <p className="text-gray-500">Create and manage module quizzes and final certificate exams.</p>
                    </div>
                    <Button variant="primary" onClick={() => handleOpenModal()}>Add New Assessment</Button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-10">
                {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">{error}</div>}

                {/* Type Switcher */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setViewType('lesson')}
                        className={`flex-1 py-4 rounded-xl border-2 font-bold transition-all ${viewType === 'lesson' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}
                    >
                        📝 Lesson Quizzes
                    </button>
                    <button
                        onClick={() => setViewType('certificate')}
                        className={`flex-1 py-4 rounded-xl border-2 font-bold transition-all ${viewType === 'certificate' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}
                    >
                        🎓 Certificate Exams
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-700 uppercase font-semibold text-xs border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">{viewType === 'lesson' ? 'Module' : 'Course'}</th>
                                <th className="px-6 py-4">Questions</th>
                                <th className="px-6 py-4">Passing Score</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {activeList.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No {viewType === 'lesson' ? 'quizzes' : 'exams'} found.</td></tr>
                            ) : activeList.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-gray-900">{item.title}</td>
                                    <td className="px-6 py-4 text-gray-500">{viewType === 'lesson' ? ((item as any).module_name || (item as any).module) : ((item as any).course_name || (item as any).course)}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded bg-orange-50 text-orange-600 font-bold text-[10px] uppercase">
                                            {typeof (item as any).assessment_payload === 'string' ? JSON.parse((item as any).assessment_payload).questions?.length : (item as any).assessment_payload?.questions?.length || 0} Qs
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-700">{viewType === 'certificate' ? `${(item as any).passing_score || 70}%` : '—'}</td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <button onClick={() => handleOpenModal(item)} className="text-secondary hover:text-primary font-bold mr-4">Edit</button>
                                        <button onClick={() => handleDelete(item)} className="text-red-500 hover:text-red-700 font-bold">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedItem ? `Edit ${form.type === 'lesson' ? 'Quiz' : 'Exam'}` : `Create New ${form.type === 'lesson' ? 'Quiz' : 'Exam'}`}
                maxWidth="3xl"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {actionError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">{actionError}</div>}

                    {!selectedItem && (
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Assessment Type</label>
                            <div className="flex gap-2">
                                {(['lesson', 'certificate'] as AssessmentType[]).map(t => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setForm({ ...form, type: t })}
                                        className={`flex-1 py-2 px-4 rounded-lg border font-bold text-sm transition-all ${form.type === t ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                                    >
                                        {t === 'lesson' ? 'Module Quiz' : 'Certificate Exam'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Title"
                            placeholder="e.g. Cyber Hygiene Basics"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            required
                        />
                        <Input
                            label="Passing Score (%)"
                            type="number"
                            value={form.passing_score}
                            onChange={e => setForm({ ...form, passing_score: parseInt(e.target.value) || 0 })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Course</label>
                            <select
                                className={SELECT_CLS}
                                value={form.course_id}
                                onChange={e => {
                                    setForm({ ...form, course_id: e.target.value, module_id: '', lesson_id: '' });
                                }}
                                required
                                disabled={!!selectedItem}
                            >
                                <option value="">Select Course</option>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                            </select>
                        </div>

                        {form.type === 'lesson' && (
                            <>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Module</label>
                                    <select
                                        className={SELECT_CLS}
                                        value={form.module_id}
                                        onChange={e => {
                                            setForm({ ...form, module_id: e.target.value, lesson_id: '' });
                                        }}
                                        required
                                        disabled={!!selectedItem}
                                    >
                                        <option value="">Select Module</option>
                                        {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Target Lesson (Optional)</label>
                                    <select
                                        className={SELECT_CLS}
                                        value={form.lesson_id}
                                        onChange={e => setForm({ ...form, lesson_id: e.target.value })}
                                        disabled={!!selectedItem}
                                    >
                                        <option value="">New / General</option>
                                        {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                                    </select>
                                </div>
                            </>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Assessment Questions</label>
                        <QuestionBuilder
                            value={form.assessment_payload.questions}
                            onChange={(questions) => setForm({ ...form, assessment_payload: { questions } })}
                            mode={form.type as any}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="primary" disabled={isActionLoading}>
                            {isActionLoading ? 'Saving...' : selectedItem ? 'Update Assessment' : 'Create Assessment'}
                        </Button>
                    </div>
                </form>
            </Modal>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Assessment"
                message="Are you sure? This will permanently remove the quiz/exam."
                confirmText="Delete"
                isLoading={isActionLoading}
            />
        </div>
    );
}
