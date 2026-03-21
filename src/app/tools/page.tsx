'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { getPublicAwarenessTools, recordAwarenessToolUsage, AwarenessTool } from '@/lib/api';

const toolThemes: Record<string, { icon: string; color: string }> = {
    'phishing': { icon: '🎣', color: 'bg-red-50 text-red-600' },
    'password': { icon: '🛡️', color: 'bg-blue-50 text-blue-600' },
    'assessment': { icon: '🧠', color: 'bg-purple-50 text-purple-600' },
    'default': { icon: '🛠️', color: 'bg-gray-50 text-gray-600' }
};

export default function ToolsLandingPage() {
    const [tools, setTools] = useState<AwarenessTool[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTools();
    }, []);

    const fetchTools = async () => {
        setIsLoading(true);
        const { data, error: e } = await getPublicAwarenessTools();
        if (e) setError(e);
        else if (data?.results) setTools(data.results);
        else if (Array.isArray(data)) setTools(data as any);
        setIsLoading(false);
    };

    const getTheme = (name: string) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('phish')) return toolThemes.phishing;
        if (lowerName.includes('password')) return toolThemes.password;
        if (lowerName.includes('assessment') || lowerName.includes('test')) return toolThemes.assessment;
        return toolThemes.default;
    };

    const getHref = (name: string) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('phish')) return '/tools/phishing';
        if (lowerName.includes('password')) return '/tools/password-strength';
        if (lowerName.includes('assessment') || lowerName.includes('test')) return '/tools/self-assessment';
        return '#';
    };

    const handleLaunch = async (tool: AwarenessTool) => {
        const href = getHref(tool.name);
        if (href !== '#') {
            await recordAwarenessToolUsage({
                tool: tool.id,
                action: 'launch',
                metadata: `User launched ${tool.name}`
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-6 lg:px-12 py-20 text-center">
                    <span className="text-secondary text-xs font-bold tracking-widest uppercase mb-4 block">Interactive Learning</span>
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">Awareness Tools</h1>
                    <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Practical, hands-on tools designed to build your digital defenses and prepare you for real-world cyber threats.
                    </p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 mt-16">
                {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-8">{error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {isLoading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="bg-white h-80 rounded-[2.5rem] border border-gray-100 animate-pulse"></div>
                        ))
                    ) : tools.length === 0 ? (
                        <div className="md:col-span-3 bg-white rounded-[2.5rem] border border-gray-100 p-20 text-center shadow-sm">
                            <div className="text-5xl mb-4">🛠️</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No interactive tools available</h3>
                            <p className="text-gray-500">We are currently developing new awareness tools. Please check back later!</p>
                        </div>
                    ) : (
                        tools.map((tool) => {
                            const theme = getTheme(tool.name);
                            const href = getHref(tool.name);
                            return (
                                <div key={tool.id} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col items-center text-center">
                                    <div className={`w-20 h-20 rounded-2xl ${theme.color} flex items-center justify-center text-4xl mb-6 shadow-sm group-hover:scale-110 transition-transform`}>
                                        {theme.icon}
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-3">{tool.name}</h2>
                                    <p className="text-sm text-gray-500 mb-8 flex-1 leading-relaxed">
                                        {tool.description}
                                    </p>
                                    <Link href={href} className="w-full" onClick={() => handleLaunch(tool)}>
                                        <Button variant="primary" className="w-full" disabled={href === '#'}>
                                            Launch Tool &rarr;
                                        </Button>
                                    </Link>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="mt-20 bg-primary rounded-[2.5rem] p-12 text-white flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="flex-1 text-center lg:text-left">
                        <h3 className="text-3xl font-extrabold mb-4">Earn Badges while you learn</h3>
                        <p className="text-primary-100 mb-8 max-w-xl">
                            Completing awareness tools and quizzes awards points and badges to your profile. Compete with your organization and build a safer digital environment.
                        </p>
                        <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
                                🏅 Phishing Hunter
                            </div>
                            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
                                🛡️ Password Shield
                            </div>
                            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
                                🎓 Awareness Graduate
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
