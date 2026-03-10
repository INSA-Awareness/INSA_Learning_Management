'use client';

import React, { useState } from 'react';

const MODULES = [
    { id: 1, title: 'Spotting Phishing', difficulty: 'Beginner', audience: 'Citizens', topics: 'Phishing', time: '15m', type: '1 Quiz', icon: '🕵️‍♂️' },
    { id: 2, title: 'Password Mastery', difficulty: 'Beginner', audience: 'Citizens', topics: 'Network Security', time: '10m', type: '1 Module', icon: '🔒' },
    { id: 3, title: 'Sensitive Data', difficulty: 'Intermediate', audience: 'Government Agencies', topics: 'Data Privacy', time: '25m', type: '1 Quiz', icon: '💻' },
    { id: 4, title: 'Public Wi-Fi Risks', difficulty: 'Beginner', audience: 'Small Business/Enterprise', topics: 'Network Security', time: '20m', type: '2 Modules', icon: '📡' },
    { id: 5, title: 'Ransomware Defense', difficulty: 'Advanced', audience: 'Government Agencies', topics: 'Network Security', time: '45m', type: '2 Quizzes', icon: '📜' },
    { id: 6, title: 'Social Media Threats', difficulty: 'Intermediate', audience: 'Citizens', topics: 'Data Privacy', time: '30m', type: '1 Quiz', icon: '🌍' },
];

export default function TrainingPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAudience, setSelectedAudience] = useState<string[]>([]);
    const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState('Most Popular');

    const handleCheckboxChange = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
        setter(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]);
    };

    let filteredModules = MODULES.filter(module => {
        const matchesSearch = module.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesAudience = selectedAudience.length === 0 || selectedAudience.includes(module.audience);
        const matchesDifficulty = selectedDifficulty.length === 0 || selectedDifficulty.includes(module.difficulty);
        const matchesTopic = selectedTopics.length === 0 || selectedTopics.includes(module.topics);
        return matchesSearch && matchesAudience && matchesDifficulty && matchesTopic;
    });

    if (sortBy === 'Alphabetical') {
        filteredModules.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'Newest') {
        filteredModules.sort((a, b) => b.id - a.id);
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center">
            {/* Hero Section */}
            <section className="w-full relative overflow-hidden bg-white px-6 py-20 text-center flex flex-col items-center border-b border-gray-100">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[600px] h-[300px] bg-orange-50 rounded-[100%] filter blur-3xl opacity-70"></div>

                <span className="text-orange-600 text-[10px] font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-600"></span>
                    MONTHLY SKILLS ASSESSMENT
                </span>

                <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl max-w-2xl">
                    Ignite Your <span className="text-orange-500">Cyber Resilience</span>
                </h1>

                <p className="mt-6 text-base leading-7 text-gray-500 max-w-2xl">
                    Expert-led training designed to empower you with the skills to identify threats and protect our digital nation. Simple. Powerful. Secure.
                </p>

                <div className="mt-8 max-w-xl w-full flex bg-white border border-gray-200 rounded-full p-2 shadow-sm focus-within:ring-2 focus-within:ring-brand-red focus-within:border-transparent transition-all">
                    <div className="pl-4 flex items-center text-gray-400">
                        &#128269;
                    </div>
                    <input
                        type="text"
                        placeholder="Search topics like 'Phishing', 'Ransomware'..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-4 outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6 py-2 text-sm font-semibold transition-colors">
                        Search
                    </button>
                </div>
            </section>

            {/* Content Section */}
            <section className="w-full max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-8">
                {/* Sidebar Filters */}
                <div className="w-full lg:w-64 shrink-0 space-y-8">
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Target Audience</h4>
                        <div className="space-y-3">
                            {['Citizens', 'Small Business/Enterprise', 'Government Agencies'].map(item => (
                                <label key={item} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={selectedAudience.includes(item)}
                                        onChange={() => handleCheckboxChange(setSelectedAudience, item)}
                                    />
                                    <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${selectedAudience.includes(item) ? 'bg-orange-500 border-orange-500' : 'bg-white border-gray-300 group-hover:border-brand-red'}`}>
                                        {selectedAudience.includes(item) && <div className="w-2 h-2 bg-white rounded-sm"></div>}
                                    </div>
                                    <span className="text-sm text-gray-600 group-hover:text-gray-900">{item}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Difficulty</h4>
                        <div className="space-y-3">
                            {['Beginner', 'Intermediate', 'Advanced'].map(item => (
                                <label key={item} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={selectedDifficulty.includes(item)}
                                        onChange={() => handleCheckboxChange(setSelectedDifficulty, item)}
                                    />
                                    <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${selectedDifficulty.includes(item) ? 'bg-orange-500 border-orange-500' : 'bg-white border-gray-300 group-hover:border-brand-red'}`}>
                                        {selectedDifficulty.includes(item) && <div className="w-2 h-2 bg-white rounded-sm"></div>}
                                    </div>
                                    <span className={`text-sm ${selectedDifficulty.includes(item) ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>{item}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Key Topics</h4>
                        <div className="space-y-3">
                            {['Phishing', 'Data Privacy', 'Network Security'].map(item => (
                                <label key={item} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={selectedTopics.includes(item)}
                                        onChange={() => handleCheckboxChange(setSelectedTopics, item)}
                                    />
                                    <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${selectedTopics.includes(item) ? 'bg-orange-500 border-orange-500' : 'bg-white border-gray-300 group-hover:border-brand-red'}`}>
                                        {selectedTopics.includes(item) && <div className="w-2 h-2 bg-white rounded-sm"></div>}
                                    </div>
                                    <span className="text-sm text-gray-600 group-hover:text-gray-900">{item}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            All Modules <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{filteredModules.length} total</span>
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>Sort by:</span>
                            <select
                                className="border border-gray-200 rounded-md bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-red cursor-pointer"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option>Most Popular</option>
                                <option>Newest</option>
                                <option>Alphabetical</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredModules.length === 0 ? (
                            <div className="col-span-full text-center py-12 text-gray-500">
                                No modules found matching your criteria.
                            </div>
                        ) : (
                            filteredModules.map(module => {
                                const difficultyColor = module.difficulty === 'Beginner' ? 'green' : module.difficulty === 'Intermediate' ? 'yellow' : 'red';

                                return (
                                    <div key={module.id} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all cursor-pointer flex flex-col h-full relative group">
                                        <div className={`absolute top-6 right-6 px-2 py-1 bg-${difficultyColor}-50 text-${difficultyColor}-600 text-[10px] font-bold rounded-full uppercase tracking-wider group-hover:bg-${difficultyColor}-100 transition-colors`}>
                                            {module.difficulty}
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-xl flex items-center justify-center mb-4 shrink-0 transition-transform group-hover:scale-110">
                                            {module.icon}
                                        </div>
                                        <h4 className="font-bold text-gray-900 mb-2 group-hover:text-brand-red transition-colors">{module.title}</h4>
                                        <p className="text-xs text-gray-500 mb-6 flex-1 line-clamp-3">
                                            Learn the basics of {module.title.toLowerCase()} and understand {module.topics.toLowerCase()} fundamentals to stay secure online.
                                        </p>
                                        <div className="flex items-center gap-4 text-xs font-medium text-gray-400 mt-auto pt-4 border-t border-gray-50 group-hover:border-orange-100 transition-colors">
                                            <span className="flex items-center gap-1.5">&#9202; {module.time}</span>
                                            <span className="flex items-center gap-1.5">&#128218; {module.type}</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="mt-12 flex justify-center items-center gap-2">
                        <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:border-gray-300 pointer-events-none opacity-50">&lt;</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded bg-orange-500 text-white font-medium shadow-sm">1</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:border-orange-500 hover:text-orange-500 transition-colors">2</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:border-orange-500 hover:text-orange-500 transition-colors">3</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:border-orange-500 hover:text-orange-500 transition-colors">&gt;</button>
                    </div>
                </div>
            </section>
        </div>
    );
}
