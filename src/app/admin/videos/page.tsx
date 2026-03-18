'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getVideos, createVideo, updateVideo, deleteVideo, Video, apiFetch } from '@/lib/api';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { ConfirmModal } from '@/components/ConfirmModal';
import { CloudinaryUpload } from '@/components/CloudinaryUpload';

interface ModuleOption { id: string; title: string; }

export default function AdminVideosPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [videos, setVideos] = useState<Video[]>([]);
    const [modules, setModules] = useState<ModuleOption[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [actionError, setActionError] = useState('');
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
    const [form, setForm] = useState({ module: '', video_url: '', duration: 0, order: 0 });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) router.push('/login');
            else if (user?.role !== 'super_admin' && user?.role !== 'org_admin' && user?.role !== 'course_provider') router.push('/dashboard');
            else {
                fetchVideos();
                fetchModules();
            }
        }
    }, [isAuthenticated, isLoading, user, router]);

    const fetchModules = async () => {
        const { data } = await apiFetch('/api/v1/modules/?page_size=100');
        if (data?.results) setModules(data.results);
        else if (Array.isArray(data)) setModules(data);
    };

    const fetchVideos = async () => {
        setIsFetching(true); setError('');
        const { data, error: e } = await getVideos();
        if (e) setError(e);
        else if (data?.results) setVideos(data.results);
        setIsFetching(false);
    };

    const openModal = (video?: Video) => {
        setActionError('');
        if (video) {
            setSelectedVideo(video);
            setForm({
                module: video.module,
                video_url: video.video_url,
                duration: video.duration,
                order: video.order
            });
        } else {
            setSelectedVideo(null);
            setForm({ module: '', video_url: '', duration: 0, order: 0 });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault(); setActionError(''); setIsActionLoading(true);
        const isEditing = !!selectedVideo;
        const { error: apiErr } = isEditing
            ? await updateVideo(selectedVideo!.id, form)
            : await createVideo(form);

        if (apiErr) { setActionError(apiErr || 'Failed to save video.'); }
        else { fetchVideos(); setIsModalOpen(false); }
        setIsActionLoading(false);
    };

    const handleDelete = (id: string) => {
        setItemToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        setIsActionLoading(true);
        const { error: e } = await deleteVideo(itemToDelete);
        if (e) setError(e || 'Failed to delete.');
        else fetchVideos();
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
        setIsActionLoading(false);
    };

    if (isLoading || isFetching) return <div className="flex justify-center items-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    if (!user || (user.role !== 'super_admin' && user.role !== 'org_admin' && user.role !== 'course_provider')) return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">Videos Management</h1>
                        <p className="text-gray-500">Add and manage training videos for modules.</p>
                    </div>
                    <Button variant="primary" onClick={() => openModal()}>Add Video</Button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-10">
                {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">{error}</div>}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left text-sm text-gray-500">
                        <thead className="bg-gray-50 text-gray-700 uppercase font-semibold text-xs border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Module ID</th>
                                <th className="px-6 py-4">Video URL</th>
                                <th className="px-6 py-4">Duration (s)</th>
                                <th className="px-6 py-4">Order</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {videos.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No videos yet.</td></tr>
                            ) : videos.map(v => (
                                <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs">{v.module}</td>
                                    <td className="px-6 py-4 truncate max-w-xs">{v.video_url}</td>
                                    <td className="px-6 py-4">{v.duration}</td>
                                    <td className="px-6 py-4">{v.order}</td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <button onClick={() => openModal(v)} className="text-secondary hover:text-primary font-medium mr-3 transition-colors">Edit</button>
                                        <button onClick={() => handleDelete(v.id)} className="text-red-500 hover:text-red-700 font-medium transition-colors">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedVideo ? 'Edit Video' : 'Add Video'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {actionError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">{actionError}</div>}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Module <span className="text-red-500">*</span></label>
                        <select
                            className="block w-full rounded-md border border-gray-300 py-2.5 px-3 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none bg-white font-medium"
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
                    <CloudinaryUpload
                        label="Video File"
                        resourceType="video"
                        value={form.video_url}
                        onUploadSuccess={(url) => setForm({ ...form, video_url: url })}
                        className="mb-4"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Duration (seconds)" type="number" value={form.duration.toString()} onChange={e => setForm({ ...form, duration: parseInt(e.target.value) || 0 })} required disabled={isActionLoading} />
                        <Input label="Display Order" type="number" value={form.order.toString()} onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 0 })} required disabled={isActionLoading} />
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isActionLoading}>Cancel</Button>
                        <Button type="submit" variant="primary" disabled={isActionLoading}>{isActionLoading ? 'Saving...' : selectedVideo ? 'Save Changes' : 'Add Video'}</Button>
                    </div>
                </form>
            </Modal>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Video"
                message="Are you sure you want to delete this video? This action cannot be undone."
                confirmText="Delete"
                isLoading={isActionLoading}
            />
        </div>
    );
}
