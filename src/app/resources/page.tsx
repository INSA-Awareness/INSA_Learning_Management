'use client';

import React, { useState } from 'react';

import { Button } from '@/components/Button';
import { SupportCTA } from '@/components/SupportCTA';

const RESOURCES = [
    { id: 1, title: 'Ransomware Response Playbook', category: 'Guides & Frameworks', audience: 'Enterprise', domain: 'Network Security', type: 'PDF', icon: '📄', new: true },
    { id: 2, title: 'Employee Onboarding Checklist', category: 'Templates & Checklists', audience: 'All Audiences', domain: 'Compliance', type: 'DOCX', icon: '📝', new: false },
    { id: 3, title: 'Secure Coding Guidelines', category: 'Guides & Frameworks', audience: 'Developers', domain: 'Application Security', type: 'PDF', icon: '👨‍💻', new: false },
    { id: 4, title: 'Incident Reporting Template', category: 'Templates & Checklists', audience: 'Enterprise', domain: 'Incident Response', type: 'DOCX', icon: '📝', new: false },
    { id: 5, title: 'Annual Threat Report 2025', category: 'Reports & Research', audience: 'All Audiences', domain: 'Threat Intelligence', type: 'PDF', icon: '📊', new: true },
    { id: 6, title: 'Vendor Risk Assessment', category: 'Tools & Scanners', audience: 'Enterprise', domain: 'Compliance', type: 'XLSX', icon: '🛠', new: false },
];

export default function ResourcesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string[]>([]);
    const [selectedAudience, setSelectedAudience] = useState<string[]>([]);
    const [selectedDomain, setSelectedDomain] = useState<string[]>([]);

    const handleCheckboxChange = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
        setter(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]);
    };

    const filteredResources = RESOURCES.filter(resource => {
        const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedType.length === 0 || selectedType.includes(resource.category);
        const matchesAudience = selectedAudience.length === 0 || selectedAudience.includes(resource.audience);
        const matchesDomain = selectedDomain.length === 0 || selectedDomain.includes(resource.domain);
        return matchesSearch && matchesType && matchesAudience && matchesDomain;
    });

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center">
            {/* Hero Section */}
            <section className="w-full relative overflow-hidden bg-white px-6 py-20 text-center flex flex-col items-center border-b border-gray-100">
                <span className="text-orange-600 text-[10px] font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-600"></span>
                    RESOURCE LIBRARY
                </span>

                <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl max-w-2xl">
                    Cybersecurity Knowledge Base
                </h1>

                <p className="mt-6 text-base leading-7 text-gray-500 max-w-xl mx-auto">
                    Equip yourself with the latest guides, tools, and policy frameworks. A secure digital nation starts with informed citizens.
                </p>

                <div className="mt-8 max-w-xl w-full flex bg-white border border-gray-200 rounded-full p-2 shadow-sm focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-transparent transition-all">
                    <div className="pl-4 flex items-center text-gray-400">
                        &#128269;
                    </div>
                    <input
                        type="text"
                        placeholder="Search frameworks, playbooks, guidelines..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-4 outline-none text-gray-900 placeholder-gray-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6 py-2 text-sm font-semibold transition-colors">
                        Search
                    </button>
                </div>

                <div className="mt-6 flex flex-wrap justify-center items-center gap-2 text-xs text-gray-500">
                    <span>Popular:</span>
                    {['Ransomware', 'Phishing', 'POLICY GUIDE'].map(tag => (
                        <span key={tag} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full cursor-pointer transition-colors max-w-fit pointer-events-auto">
                            {tag}
                        </span>
                    ))}
                </div>
            </section>

            {/* Content Section */}
            <section className="w-full max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-8">
                {/* Sidebar Filters */}
                <div className="w-full lg:w-64 shrink-0 space-y-8">
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Resource Type</h4>
                        <div className="space-y-3">
                            {['Guides & Frameworks', 'Templates & Checklists', 'Tools & Scanners', 'Reports & Research'].map(item => (
                                <label key={item} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={selectedType.includes(item)}
                                        onChange={() => handleCheckboxChange(setSelectedType, item)}
                                    />
                                    <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${selectedType.includes(item) ? 'bg-orange-500 border-orange-500' : 'bg-white border-gray-300 group-hover:border-primary'}`}>
                                        {selectedType.includes(item) && <div className="w-2 h-2 bg-white rounded-sm"></div>}
                                    </div>
                                    <span className={`text-sm ${selectedType.includes(item) ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>{item}</span>
                                    <span className="ml-auto text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {RESOURCES.filter(r => r.category === item).length}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Audience</h4>
                        <div className="space-y-3">
                            {['All Audiences', 'Citizens', 'Enterprise', 'Developers'].map(item => (
                                <label key={item} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={selectedAudience.includes(item)}
                                        onChange={() => handleCheckboxChange(setSelectedAudience, item)}
                                    />
                                    <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${selectedAudience.includes(item) ? 'bg-orange-500 border-orange-500' : 'bg-white border-gray-300 group-hover:border-primary'}`}>
                                        {selectedAudience.includes(item) && <div className="w-2 h-2 bg-white rounded-sm"></div>}
                                    </div>
                                    <span className={`text-sm ${selectedAudience.includes(item) ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>{item}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Domain</h4>
                        <div className="space-y-3">
                            {['Network Security', 'Application Security', 'Compliance', 'Incident Response', 'Threat Intelligence'].map(item => (
                                <label key={item} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={selectedDomain.includes(item)}
                                        onChange={() => handleCheckboxChange(setSelectedDomain, item)}
                                    />
                                    <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${selectedDomain.includes(item) ? 'bg-orange-500 border-orange-500' : 'bg-white border-gray-300 group-hover:border-primary'}`}>
                                        {selectedDomain.includes(item) && <div className="w-2 h-2 bg-white rounded-sm"></div>}
                                    </div>
                                    <span className={`text-sm ${selectedDomain.includes(item) ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>{item}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            Available Resources <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{filteredResources.length} items</span>
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>Sort by:</span>
                            <select className="border border-gray-200 rounded-md bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer">
                                <option>Most Relevant</option>
                                <option>Recently Updated</option>
                                <option>Most Downloaded</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredResources.length === 0 ? (
                            <div className="col-span-full text-center py-12 text-gray-500">
                                No resources found matching your criteria.
                            </div>
                        ) : (
                            filteredResources.map(resource => (
                                <div key={resource.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-5 hover:shadow-md hover:border-orange-200 transition-all cursor-pointer group">
                                    <div className="w-14 h-14 shrink-0 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                        <span className="text-2xl">{resource.icon}</span>
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <h4 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{resource.title}</h4>
                                                {resource.new && <span className="shrink-0 bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">NEW</span>}
                                            </div>
                                            <p className="text-xs text-gray-500 mb-4">{resource.category} • {resource.audience}</p>
                                        </div>
                                        <div className="flex items-center justify-between border-t border-gray-50 pt-3 group-hover:border-orange-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                                                    {resource.type}
                                                </span>
                                                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{resource.domain}</span>
                                            </div>
                                            <button className="text-orange-500 hover:bg-orange-50 p-2 rounded-full transition-colors opacity-80 group-hover:opacity-100">
                                                &#10515; {/* Download icon approx */}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="mt-12 flex justify-center items-center gap-2">
                        <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:border-gray-300 pointer-events-none opacity-50">&lt;</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded bg-orange-500 text-white font-medium shadow-sm">1</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:border-orange-500 hover:text-orange-500 transition-colors">2</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:border-orange-500 hover:text-orange-500 transition-colors">3</button>
                        <span className="text-gray-400 px-1">...</span>
                        <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:border-orange-500 hover:text-orange-500 transition-colors">&gt;</button>
                    </div>
                </div>
            </section>

            {/* Footer Support CTA */}
            <section className="w-full bg-[#111] py-16 px-6 text-center text-white">
                <h3 className="text-2xl font-bold mb-3">Can&apos;t find what you&apos;re looking for?</h3>
                <p className="text-gray-400 text-sm max-w-lg mx-auto mb-8">
                    Our support team is available to help citizens and organizations find the right resources.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button variant="primary" className="bg-white text-black hover:bg-gray-100">Contact Support</Button>
                    <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800">Browse FAQ</Button>
                </div>
            </section>
        </div>
    );
}
