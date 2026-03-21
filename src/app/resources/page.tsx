'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/Button';

interface Resource {
    id: string;
    title: string;
    file_url?: string;
    resource_type?: string;
    description?: string;
    uploaded_at?: string;
}

export default function ResourcesPage() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        setIsLoading(true);
        const { data, error: e } = await apiFetch('/api/v1/resources/');
        if (e) setError(e);
        else if (data?.results) setResources(data.results);
        else if (Array.isArray(data)) setResources(data);
        setIsLoading(false);
    };

    const filteredResources = resources.filter(r =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const typeIcon: Record<string, string> = {
        pdf: '📄', video: '🎬', doc: '📝', docx: '📝', xlsx: '📊', ppt: '📑', link: '🔗'
    };

    const getIcon = (r: Resource) => {
        const ext = r.file_url?.split('.').pop()?.toLowerCase() || r.resource_type?.toLowerCase() || '';
        return typeIcon[ext] || '📁';
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center">
            {/* Hero */}
            <section className="w-full relative overflow-hidden bg-white px-6 py-20 text-center flex flex-col items-center border-b border-gray-100">
                <span className="text-primary text-[10px] font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    RESOURCE LIBRARY
                </span>
                <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl max-w-2xl">
                    Cybersecurity Knowledge Base
                </h1>
                <p className="mt-6 text-base leading-7 text-gray-500 max-w-xl mx-auto">
                    Equip yourself with the latest guides, tools, and policy frameworks.
                </p>
                <div className="mt-8 max-w-xl w-full flex bg-white border border-gray-200 rounded-full p-2 shadow-sm focus-within:ring-2 focus-within:ring-primary transition-all">
                    <div className="pl-4 flex items-center text-gray-400">&#128269;</div>
                    <input
                        type="text"
                        placeholder="Search resources..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-4 outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="bg-primary hover:bg-primary-hover text-white rounded-full px-6 py-2 text-sm font-semibold transition-colors">
                        Search
                    </button>
                </div>
            </section>

            <section className="w-full max-w-6xl mx-auto px-6 py-12">
                {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">{error}</div>}

                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        Available Resources
                        <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {filteredResources.length} items
                        </span>
                    </h3>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse h-32"></div>
                        ))}
                    </div>
                ) : filteredResources.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        <div className="text-4xl mb-4">📚</div>
                        <p className="font-medium">{searchQuery ? 'No resources matched your search.' : 'No resources available yet.'}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredResources.map(resource => (
                            <div key={resource.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex gap-5 hover:shadow-md hover:border-primary/20 transition-all group">
                                <div className="w-14 h-14 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                    {getIcon(resource)}
                                </div>
                                <div className="flex-1 flex flex-col justify-between min-w-0">
                                    <div>
                                        <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">{resource.title}</h4>
                                        {resource.description && (
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{resource.description}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                                        {resource.resource_type && (
                                            <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded uppercase">
                                                {resource.resource_type}
                                            </span>
                                        )}
                                        {resource.file_url && (
                                            <a
                                                href={resource.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs font-semibold text-primary hover:underline ml-auto flex items-center gap-1"
                                            >
                                                Open Resource ↗
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Footer CTA */}
            <section className="w-full bg-[#111] py-16 px-6 text-center text-white">
                <h3 className="text-2xl font-bold mb-3">Can&apos;t find what you&apos;re looking for?</h3>
                <p className="text-gray-400 text-sm max-w-lg mx-auto mb-8">
                    Our support team is available to help citizens and organizations find the right resources.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button variant="primary" className="bg-white text-black hover:bg-gray-100">Contact Support</Button>
                </div>
            </section>
        </div>
    );
}
