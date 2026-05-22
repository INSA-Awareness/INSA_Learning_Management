'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, Lesson, Module } from '@/lib/api';
import { Button } from '@/components/Button';
import { AssessmentViewer } from '@/components/AssessmentViewer';

// Using imported Lesson interface from lib/api

// Using imported Module interface from lib/api

export default function LessonDetailPage() {
    const { id: courseId, moduleId, lessonId } = useParams<{ id: string; moduleId: string; lessonId: string }>();
    const router = useRouter();

    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [module, setModule] = useState<Module | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (lessonId) fetchData();
    }, [lessonId]);

    const fetchData = async () => {
        setIsLoading(true);
        setError('');

        const courseRes = await apiFetch<any>(`/api/v1/courses/${courseId}/`);

        if (courseRes.error) {
            setError(courseRes.error);
            setIsLoading(false);
            return;
        }


        if (courseRes.data && Array.isArray(courseRes.data.modules)) {
            const foundModule = courseRes.data.modules.find((m: any) => m.id === moduleId);

            if (foundModule) {
                setModule(foundModule);

                if (Array.isArray(foundModule.lessons)) {
                    const foundLesson = foundModule.lessons.find((l: any) => l.id === lessonId);

                    if (foundLesson) {

                        // Parse if string and log questions
                        const payload = typeof foundLesson.assessment_payload === 'string'
                            ? (() => { try { return JSON.parse(foundLesson.assessment_payload); } catch { return null; } })()
                            : foundLesson.assessment_payload;

                        if (payload?.questions) {
    payload.questions = payload.questions.map((q: any) => ({
        id: q.id,
        type: q.type,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer
    }));
} else {
    // Handle the else case if needed
}

                        setLesson(foundLesson);
                    } else {
                        const lessonRes = await apiFetch<any>(`/api/v1/lessons/${lessonId}/`);
                        if (lessonRes.data) setLesson(lessonRes.data);
                        else setError('Lesson not found.');
                    }
                }
            } else {
                setError('Module not found in this course.');
            }
        }
        setIsLoading(false);
    };


    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !lesson) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
                <div>
                    <div className="text-4xl mb-4">📖</div>
                    <p className="text-red-600 font-bold mb-4">{error || 'Lesson not found.'}</p>
                    <Link href={`/courses/${courseId}/modules/${moduleId}`} className="text-primary hover:underline font-bold">← Return to Module</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-32">
            {/* Top Reader Bar */}
            <div className="sticky top-16 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href={`/courses/${courseId}/modules/${moduleId}`} className="text-xs font-bold text-gray-400 hover:text-primary transition-colors uppercase tracking-widest flex items-center gap-2">
                        ← Back to Module
                    </Link>
                    <div className="text-center flex-1 mx-4">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-0.5">{module?.title || 'Lesson'}</span>
                        <h2 className="text-sm font-bold text-gray-900 truncate max-w-[300px]">{lesson.title}</h2>
                    </div>
                    <div className="w-20"></div> {/* Spacer */}
                </div>
            </div>

            <article className="max-w-3xl mx-auto px-6 mt-16">
                <header className="mb-12">
                    <div className="flex items-center justify-between mb-4">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${lesson.content_type === 'video' ? 'bg-blue-50 text-blue-600' :
                            lesson.content_type === 'article' ? 'bg-green-50 text-green-600' :
                                'bg-purple-50 text-purple-600'
                            }`}>
                            {lesson.content_type}
                        </span>

                        {lesson.content_type === 'assessment' && (
                            <Button
                                variant="primary"
                                size="sm"
                                className="rounded-full shadow-lg shadow-primary/20"
                                onClick={() => document.getElementById('assessment-section')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Take Quiz Now 📝
                            </Button>
                        )}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                        {lesson.title}
                    </h1>
                </header>

                <div className="lesson-content">
                    {lesson.content_type === 'article' && lesson.content && (
                        <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed font-serif">
                            {lesson.content.split('\n').map((para: string, i: number) => (
                                <p key={i} className="mb-6">{para}</p>
                            ))}
                        </div>
                    )}

                    {lesson.content_type === 'video' && lesson.media_url && (
                        <div className="mb-8">
                            <div className="aspect-video bg-gray-900 rounded-3xl overflow-hidden shadow-2xl mb-8 border border-gray-100">
                                <video
                                    src={lesson.media_url}
                                    controls
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {lesson.content && (
                                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed font-serif bg-gray-50 p-8 rounded-3xl">
                                    {lesson.content.split('\n').map((para: string, i: number) => (
                                        <p key={i} className="mb-4 last:mb-0">{para}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {lesson.content_type === 'image' && lesson.image_url && (
                        <div className="mb-8 text-center">
                            <img
                                src={lesson.image_url}
                                alt={lesson.title || 'Lesson Image'}
                                className="max-w-full rounded-3xl shadow-xl mx-auto border border-gray-100"
                            />
                            {lesson.content && (
                                <div className="mt-8 text-left prose prose-lg max-w-none text-gray-700 leading-relaxed font-serif bg-gray-50 p-8 rounded-3xl">
                                    {lesson.content.split('\n').map((para: string, i: number) => (
                                        <p key={i} className="mb-4 last:mb-0">{para}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {lesson.content_type === 'assessment' && (
                        <div className="mt-8" id="assessment-section">
                            <AssessmentViewer lesson={lesson} type="lesson" />
                        </div>
                    )}
                </div>

                <div className="mt-24 pt-12 border-t border-gray-100 flex flex-col items-center gap-6">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] text-center block">END OF LESSON</span>
                    <div className="flex gap-4">
                        <Link href={`/courses/${courseId}/modules/${moduleId}`}>
                            <Button variant="outline" className="rounded-full px-8 underline decoration-primary/30 underline-offset-4">Return to Module</Button>
                        </Link>
                    </div>
                </div>
            </article>
        </div>
    );
}
