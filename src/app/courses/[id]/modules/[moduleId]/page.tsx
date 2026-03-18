'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/Button';

interface Article {
    id: string;
    content: string;
    order: number;
}

interface Module {
    id: string;
    title: string;
    description?: string;
}

interface Assessment {
    id: string;
    title: string;
}

export default function ModuleContentPage() {
    const { id: courseId, moduleId } = useParams<{ id: string; moduleId: string }>();
    const router = useRouter();

    const [module, setModule] = useState<Module | null>(null);
    const [articles, setArticles] = useState<Article[]>([]);
    const [assessment, setAssessment] = useState<Assessment | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (moduleId) fetchModuleData();
    }, [moduleId]);

    const fetchModuleData = async () => {
        setIsLoading(true);
        const [moduleRes, articlesRes, assessmentsRes] = await Promise.all([
            apiFetch(`/api/v1/modules/${moduleId}/`),
            apiFetch(`/api/v1/articles/?module=${moduleId}`),
            apiFetch(`/api/v1/assessments/?module=${moduleId}`)
        ]);

        if (moduleRes.error) setError(moduleRes.error);
        else if (moduleRes.data) setModule(moduleRes.data);

        if (articlesRes.data?.results) setArticles(articlesRes.data.results);
        else if (Array.isArray(articlesRes.data)) setArticles(articlesRes.data);

        if (assessmentsRes.data?.results?.[0]) setAssessment(assessmentsRes.data.results[0]);
        else if (Array.isArray(assessmentsRes.data) && assessmentsRes.data[0]) setAssessment(assessmentsRes.data[0]);

        setIsLoading(false);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !module) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
                <div>
                    <div className="text-4xl mb-4">📂</div>
                    <p className="text-red-600 font-bold mb-4">{error || 'Module not found.'}</p>
                    <Link href={`/courses/${courseId}`} className="text-primary hover:underline font-bold">← Return to Course</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-32">
            {/* Top Reader Bar */}
            <div className="sticky top-16 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href={`/courses/${courseId}`} className="text-xs font-bold text-gray-400 hover:text-primary transition-colors uppercase tracking-widest flex items-center gap-2">
                        ← Exit Reader
                    </Link>
                    <div className="text-center flex-1 mx-4">
                        <h2 className="text-sm font-bold text-gray-900 truncate max-w-[300px]">{module.title}</h2>
                    </div>
                    <div className="w-20"></div> {/* Spacer */}
                </div>
            </div>

            <article className="max-w-3xl mx-auto px-6 mt-16">
                <header className="mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                        {module.title}
                    </h1>
                    {module.description && (
                        <p className="text-xl text-gray-500 italic leading-relaxed font-serif">
                            {module.description}
                        </p>
                    )}
                </header>

                <div className="space-y-12">
                    {articles.length === 0 ? (
                        <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                            <p className="text-gray-400 font-medium">This module is currently awaiting content updates.</p>
                        </div>
                    ) : (
                        articles
                            .sort((a, b) => a.order - b.order)
                            .map((article) => (
                                <div key={article.id} className="prose prose-lg max-w-none text-gray-800 leading-relaxed font-serif">
                                    {article.content.split('\n').map((para, i) => (
                                        <p key={i} className="mb-6">{para}</p>
                                    ))}
                                </div>
                            ))
                    )}
                </div>

                {assessment && (
                    <div className="mt-24 p-10 bg-gray-50 rounded-[2.5rem] border border-gray-100 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready for the challenge?</h3>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto">Complete the module assessment to test your understanding and earn progress points.</p>
                        <Button variant="primary" className="px-10 py-4 shadow-xl">
                            Start Assessment: {assessment.title} &rarr;
                        </Button>
                    </div>
                )}

                <div className="mt-24 pt-12 border-t border-gray-100 flex flex-col items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-4 text-center block">END OF MODULE</span>
                    <Link href={`/courses/${courseId}`}>
                        <Button variant="outline">Continue to next module</Button>
                    </Link>
                </div>
            </article>
        </div>
    );
}
