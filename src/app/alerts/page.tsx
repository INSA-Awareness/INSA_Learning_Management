'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/Button';

interface Alert {
    id: string;
    message: string;
    severity: string;
    published_at: string;
    title?: string;
    description?: string;
}

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        setIsLoading(true);
        const { data, error: e } = await apiFetch('/api/v1/alerts/');
        if (e) setError(e);
        else if (data?.results) setAlerts(data.results);
        else if (Array.isArray(data)) setAlerts(data);
        setIsLoading(false);
    };

    const handleAcknowledge = async (id: string) => {
        const { error: e } = await apiFetch(`/api/v1/alerts/${id}/acknowledge/`, { method: 'POST' });
        if (!e) fetchAlerts();
    };

    const handleViewDetails = (alert: Alert) => {
        // Here we could open a modal or navigate to a detail page
        // For now, let's acknowledge it as viewed
        handleAcknowledge(alert.id);
    };

    const filteredAlerts = alerts.filter(a => filter === 'all' || a.severity.toLowerCase() === filter);

    const severityStyles: Record<string, string> = {
        critical: 'border-red-500 bg-red-50 text-red-700',
        high: 'border-orange-500 bg-orange-50 text-orange-700',
        medium: 'border-yellow-500 bg-yellow-50 text-yellow-700',
        low: 'border-blue-500 bg-blue-50 text-blue-700'
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-6 lg:px-12 py-12">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900">Cybersecurity Alerts</h1>
                            <p className="mt-2 text-gray-500">Real-time advisories on active threats and vulnerabilities.</p>
                        </div>
                        <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner">
                            {['all', 'critical', 'high', 'medium'].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setFilter(s)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filter === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 mt-12">
                {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-8">{error}</div>}

                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white h-32 rounded-2xl border border-gray-100 animate-pulse"></div>
                        ))}
                    </div>
                ) : filteredAlerts.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-gray-100 p-20 text-center shadow-sm">
                        <div className="text-5xl mb-4 text-gray-300">🛡️</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">No active alerts found</h3>
                        <p className="text-gray-500">Your digital environment is currently stable. Check back later for updates.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredAlerts.map((alert) => (
                            <div
                                key={alert.id}
                                className={`bg-white rounded-2xl border-l-[6px] shadow-sm overflow-hidden hover:shadow-md transition-shadow ${severityStyles[alert.severity.toLowerCase()] || 'border-gray-200'}`}
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${severityStyles[alert.severity.toLowerCase()]}`}>
                                                {alert.severity}
                                            </span>
                                            <span className="text-xs text-gray-400 font-medium">
                                                {new Date(alert.published_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                            </span>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{alert.title || 'Cyber Threat Advisory'}</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                                        {alert.message || alert.description}
                                    </p>
                                    <div className="flex justify-end pt-4 border-t border-gray-50">
                                        <button
                                            onClick={() => handleViewDetails(alert)}
                                            className="text-xs font-bold text-primary hover:underline uppercase tracking-widest"
                                        >
                                            Dismiss / Acknowledge &rarr;
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-16 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center">
                    <h3 className="font-bold text-gray-900 mb-2">Want to receive alerts instantly?</h3>
                    <p className="text-sm text-gray-500 mb-6">Enable SMS or Email notifications in your profile to stay ahead of emerging threats.</p>
                    <Link href="/profile">
                        <Button variant="outline">Update Notification Settings</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
