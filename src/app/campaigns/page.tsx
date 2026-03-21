'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch, getCampaigns, Campaign } from '@/lib/api';



export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        setIsLoading(true);
        const { data, error: e } = await getCampaigns({ status: 'active' });
        if (e) setError(e);
        else if (data?.results) setCampaigns(data.results);
        else if (Array.isArray(data)) setCampaigns(data as any);
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-[#0f172a] relative overflow-hidden py-24">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                <div className="max-w-5xl mx-auto px-6 lg:px-12 relative z-10 text-center">
                    <span className="inline-block px-3 py-1 bg-primary/20 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border border-primary/30">National Initiative</span>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Security Awareness Campaigns</h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
                        Join our nation-wide efforts to foster a culture of digital resilience. Participate in active campaigns to earn exclusive rewards and certificates.
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 mt-16">
                {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-8">{error}</div>}

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[1, 2].map(i => (
                            <div key={i} className="bg-white h-64 rounded-3xl border border-gray-100 animate-pulse outline outline-8 outline-gray-50"></div>
                        ))}
                    </div>
                ) : campaigns.length === 0 ? (
                    <div className="bg-white rounded-[3rem] border border-gray-100 p-24 text-center shadow-sm">
                        <div className="text-6xl mb-6">📢</div>
                        <h3 className="text-2xl font-extrabold text-gray-900 mb-2">No active campaigns at the moment</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">We are currently planning the next series of awareness events. Check back soon for new opportunities!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {campaigns.map((camp) => (
                            <div key={camp.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-xl hover:border-primary/20 transition-all group">
                                <div className="h-48 bg-gray-900 relative">
                                    {camp.image_url ? (
                                        <img src={camp.image_url} alt={camp.title} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-secondary to-gray-900 opacity-80"></div>
                                    )}
                                    <div className="absolute top-4 right-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${camp.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                                            {camp.status}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-4 left-4">
                                        <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest bg-black/40 backdrop-blur-sm px-2 py-1 rounded">
                                            Starts: {new Date(camp.start_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-8 flex flex-col flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">{camp.title}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed mb-8 flex-1">
                                        {camp.message}
                                    </p>
                                    <Link href={`/courses`} className="inline-block">
                                        <button className="text-sm font-bold text-primary group-hover:underline flex items-center gap-2">
                                            Participate Now <span>→</span>
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
