'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';

interface NotificationData {
    id: string;
    message: string;
    is_read: boolean;
    created_at: string;
    notification_type?: string;
}

export default function NotificationsPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 10;

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            fetchNotifications();
        }
    }, [isAuthenticated, authLoading, page, searchTerm]);

    const fetchNotifications = async () => {
        setIsLoading(true);
        const query = new URLSearchParams({
            page: page.toString(),
            page_size: pageSize.toString(),
            search: searchTerm,
            ordering: '-created_at'
        }).toString();

        const { data, error: apiError } = await apiFetch(`/api/v1/notifications/?${query}`);
        if (apiError) setError(apiError);
        else if (data?.results) {
            setNotifications(data.results);
            setTotalCount(data.count || 0);
        } else if (Array.isArray(data)) {
            setNotifications(data);
            setTotalCount(data.length);
        }
        setIsLoading(false);
    };

    const toggleReadStatus = async (id: string, currentlyRead: boolean) => {
        const action = currentlyRead ? 'mark_unread' : 'mark_read';
        const { error: apiErr } = await apiFetch(`/api/v1/notifications/${id}/${action}/`, {
            method: 'POST'
        });

        if (!apiErr) {
            // Optimistic update
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: !currentlyRead } : n));
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
        } catch {
            return dateStr;
        }
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-6 lg:px-12 py-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">Notifications</h1>
                        <p className="text-gray-500 text-sm">Stay up to date with system alerts and updates.</p>
                    </div>
                    <div className="w-full md:w-64">
                        <Input
                            placeholder="Search messages..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 lg:px-12 mt-8">
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">{error}</div>
                )}

                {notifications.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-16 text-center shadow-sm">
                        <div className="text-5xl mb-4 opacity-20">🔔</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications found</h3>
                        <p className="text-gray-500 text-sm">Refine your search or check back later for updates.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((n) => (
                            <div
                                key={n.id}
                                className={`group bg-white rounded-xl border p-5 flex gap-4 transition-all hover:border-primary/30 ${n.is_read ? 'border-gray-200' : 'border-primary/20 shadow-sm'}`}
                            >
                                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${n.is_read ? 'bg-gray-200' : 'bg-primary'}`}></div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start gap-4">
                                        <p className={`text-sm ${n.is_read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>{n.message}</p>
                                        <button
                                            onClick={() => toggleReadStatus(n.id, n.is_read)}
                                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ${n.is_read ? 'text-primary hover:bg-primary/5' : 'text-gray-400 hover:bg-gray-100'}`}
                                            title={n.is_read ? "Mark as unread" : "Mark as read"}
                                        >
                                            {n.is_read ? "Keep as unread" : "Mark read"}
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-3 mt-2">
                                        {n.notification_type && (
                                            <span className="text-[10px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded border border-gray-200 font-bold uppercase tracking-tight">
                                                {n.notification_type.replace(/_/g, ' ')}
                                            </span>
                                        )}
                                        <span className="text-[11px] text-gray-400 font-medium">{formatDate(n.created_at)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Pagination */}
                        {totalCount > pageSize && (
                            <div className="mt-8 flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <span className="text-sm text-gray-500">Showing {notifications.length} of {totalCount} alerts</span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page <= 1 || isLoading}
                                        onClick={() => setPage(p => p - 1)}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={(page * pageSize) >= totalCount || isLoading}
                                        onClick={() => setPage(p => p + 1)}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
