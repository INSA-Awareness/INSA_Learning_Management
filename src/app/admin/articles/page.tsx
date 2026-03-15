'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';

interface ArticleData {
    id: string;
    module: string;
    content: string;
    order: number;
}

export default function AdminArticlesPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [articles, setArticles] = useState<ArticleData[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const [actionError, setActionError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState<ArticleData | null>(null);

    const [formData, setFormData] = useState({
        module: '',
        content: '',
        order: 0
    });

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (user?.role !== 'super_admin' && user?.role !== 'org_admin') {
                router.push('/dashboard');
            } else {
                fetchArticles();
            }
        }
    }, [isAuthenticated, isLoading, user, router, page, searchTerm]);

    const fetchArticles = async () => {
        setIsFetching(true);
        setError('');
        const query = new URLSearchParams({
            page: page.toString(),
            page_size: pageSize.toString(),
            search: searchTerm,
            ordering: '-order'
        }).toString();

        const { data, error: apiError, status } = await apiFetch(`/api/v1/articles/?${query}`);

        if (apiError || status !== 200) {
            setError(apiError || 'Failed to fetch articles');
        } else if (data?.results && Array.isArray(data.results)) {
            setArticles(data.results);
            setTotalCount(data.count || 0);
        } else if (Array.isArray(data)) {
            setArticles(data);
            setTotalCount(data.length);
        }
        setIsFetching(false);
    };

    const handleOpenModal = (article?: ArticleData) => {
        setActionError('');
        if (article) {
            setSelectedArticle(article);
            setFormData({
                module: article.module,
                content: article.content,
                order: article.order
            });
        } else {
            setSelectedArticle(null);
            setFormData({ module: '', content: '', order: 0 });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedArticle(null);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionError('');
        setIsActionLoading(true);

        const isEditing = !!selectedArticle;
        const endpoint = `/api/v1/articles/${isEditing ? `${selectedArticle.id}/` : ''}`;
        const method = isEditing ? 'PATCH' : 'POST';

        const payload = {
            module: formData.module,
            content: formData.content,
            order: Number(formData.order)
        };

        const { error: apiError, status } = await apiFetch(endpoint, {
            method,
            body: JSON.stringify(payload)
        });

        if (apiError || (status !== 200 && status !== 201)) {
            setActionError(apiError || `Failed to ${isEditing ? 'update' : 'create'} article.`);
        } else {
            fetchArticles();
            handleCloseModal();
        }
        setIsActionLoading(false);
    };

    const handleDeleteArticle = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this article?')) return;
        setError('');

        const { error: apiError, status } = await apiFetch(`/api/v1/articles/${id}/`, {
            method: 'DELETE'
        });

        if (apiError || status !== 204) {
            setError(apiError || 'Failed to delete article.');
        } else {
            fetchArticles();
        }
    };

    if (isLoading || isFetching) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user || (user.role !== 'super_admin' && user.role !== 'org_admin')) return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Articles Management</h1>
                        <p className="text-gray-500">Manage training module articles and content.</p>
                    </div>
                    <div>
                        <Button variant="primary" onClick={() => handleOpenModal()}>Add New Article</Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-10">
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">
                        {error}
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <Input
                            placeholder="Search content or module UUID..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        />
                    </div>
                </div>

                {/* Articles Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-500">
                            <thead className="bg-gray-50 text-gray-700 uppercase font-semibold text-xs border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">Module UUID</th>
                                    <th className="px-6 py-4">Content</th>
                                    <th className="px-6 py-4">Order</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {articles.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                            No articles found.
                                        </td>
                                    </tr>
                                ) : (
                                    articles.map((a) => (
                                        <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs text-gray-600 truncate max-w-[200px]" title={a.module}>
                                                {a.module}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="truncate max-w-sm" title={a.content}>
                                                    {a.content}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {a.order}
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <button onClick={() => handleOpenModal(a)} className="text-secondary hover:text-primary font-medium mr-3 transition-colors">Edit</button>
                                                <button onClick={() => handleDeleteArticle(a.id)} className="text-red-500 hover:text-red-700 font-medium transition-colors">Delete</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={selectedArticle ? "Edit Article" : "Add New Article"}
            >
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    {actionError && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                            {actionError}
                        </div>
                    )}

                    <Input
                        label="Module UUID"
                        name="module"
                        value={formData.module}
                        onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                        required
                        disabled={isActionLoading}
                        placeholder="123e4567-e89b-12d3..."
                    />

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Article Content <span className="text-primary">*</span>
                        </label>
                        <textarea
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200 min-h-[120px] resize-y"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            required
                            disabled={isActionLoading}
                            placeholder="Enter article content here..."
                        />
                    </div>

                    <Input
                        label="Order"
                        type="number"
                        name="order"
                        value={formData.order}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                        required
                        disabled={isActionLoading}
                    />

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={handleCloseModal} disabled={isActionLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={isActionLoading}>
                            {isActionLoading ? 'Saving...' : selectedArticle ? 'Save Changes' : 'Create Article'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
