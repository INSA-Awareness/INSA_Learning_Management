'use client';

import React, { useState, useEffect } from 'react';
import {
    submitLessonAttempt,
    submitCertificateExam,
    AssessmentPayload,
    Lesson,
    CertificateExam
} from '@/lib/api';
import { Button } from '@/components/Button';

interface AssessmentViewerProps {
    lesson?: Lesson;
    certificateExam?: CertificateExam;
    type?: 'lesson' | 'certificate';
    onComplete?: () => void;
}

interface QuestionResult {
    questionId: string;
    isCorrect: boolean;
    yourAnswer: any;
    correctAnswer: any;
    questionText: string;
}

export function AssessmentViewer({ lesson, certificateExam, type = 'lesson', onComplete }: AssessmentViewerProps) {
    const item = type === 'lesson' ? lesson : certificateExam;
    const itemId = item?.id || '';

    const [payload, setPayload] = useState<AssessmentPayload | null>(null);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [results, setResults] = useState<QuestionResult[] | null>(null);
    const [score, setScore] = useState<number | null>(null);

    useEffect(() => {
        if (!item) return;
        setResults(null);
        setAnswers({});
        setScore(null);
        try {
            if (typeof item.assessment_payload === 'string') {
                const parsed = JSON.parse(item.assessment_payload);
                setPayload(parsed);
            } else if (item.assessment_payload) {
                setPayload(item.assessment_payload as AssessmentPayload);
            } else {
            }
        } catch (e) {
            setLoadError('Failed to load assessment questions.');
        }
    }, [item]);

    const handleAnswerChange = (questionId: string, answer: any) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleMatchingChange = (questionId: string, left: string, right: string) => {
        setAnswers(prev => {
            const currentMatch = prev[questionId] || {};
            return { ...prev, [questionId]: { ...currentMatch, [left]: right } };
        });
    };

    // Local grading: compare answers against correct_answer in the payload
    const gradeLocally = (): QuestionResult[] => {
        if (!payload) return [];


        return payload.questions.map(q => {
            const userAnswer = answers[q.id];
            let isCorrect = false;


            if (q.type === 'true_false') {
                isCorrect = userAnswer === q.correct_answer;
            } else if (q.type === 'matching') {
                const correctPairs = q.correct_answer as Record<string, string>;
                const userPairs = (userAnswer || {}) as Record<string, string>;
                isCorrect = Object.keys(correctPairs).every(k => userPairs[k] === correctPairs[k]);
            } else {
                // multiple / multiple_choice — compare as strings
                isCorrect = String(userAnswer) === String(q.correct_answer);
            }


            // Human-readable label — fall back to "Option A/B/C" if label is blank
            let correctLabel: any = q.correct_answer;
            let userLabel: any = userAnswer ?? '(no answer)';

            if (q.options) {
                const correctOpt = q.options.find(o => String(o.id) === String(q.correct_answer));
                const userOpt = q.options.find(o => String(o.id) === String(userAnswer));
                if (correctOpt) correctLabel = correctOpt.label?.trim() || `Option ${String(correctOpt.id).toUpperCase()}`;
                if (userOpt) userLabel = userOpt.label?.trim() || `Option ${String(userOpt.id).toUpperCase()}`;
            }
            if (q.type === 'true_false') {
                correctLabel = q.correct_answer ? 'True' : 'False';
                userLabel = userAnswer === true ? 'True' : userAnswer === false ? 'False' : '(no answer)';
            }

            return {
                questionId: q.id,
                isCorrect,
                yourAnswer: userLabel,
                correctAnswer: correctLabel,
                questionText: q.question,
            };
        });

    };

    const handleSubmit = async () => {
        if (!payload || !itemId) return;
        setIsSubmitting(true);
        setLoadError('');

        // Format answers for backend: { question_id: selected_option_id, ... }

        const { data, error: submitError, status } = type === 'lesson'
            ? await submitLessonAttempt(itemId, answers)
            : await submitCertificateExam(itemId, answers);


        if (data && (status === 200 || status === 201)) {
            // Backend returned grading result — map to QuestionResult[]
            const score = data.score ?? data.percentage ?? data.result?.score ?? null;
            setScore(score);

            // Try to map per-question results from backend response
            const details: any[] = data.details ?? data.question_results ?? data.results ?? [];
            if (details.length > 0) {
                const mapped: QuestionResult[] = payload.questions.map(q => {
                    const detail = details.find((d: any) =>
                        d.question_id === q.id || d.question === q.id || d.id === q.id
                    );
                    const isCorrect = detail?.is_correct ?? detail?.correct ?? false;
                    const userAnswer = answers[q.id];
                    const userOpt = q.options?.find(o => String(o.id) === String(userAnswer));
                    const correctOptId = detail?.correct_answer ?? detail?.answer ?? q.correct_answer;
                    const correctOpt = q.options?.find(o => String(o.id) === String(correctOptId));

                    return {
                        questionId: q.id,
                        isCorrect,
                        yourAnswer: userOpt
                            ? `${String(userOpt.id).toUpperCase()}. ${userOpt.label?.trim() || `Option ${String(userOpt.id).toUpperCase()}`}`
                            : String(userAnswer ?? '(no answer)'),
                        correctAnswer: correctOpt
                            ? `${String(correctOpt.id).toUpperCase()}. ${correctOpt.label?.trim() || `Option ${String(correctOpt.id).toUpperCase()}`}`
                            : (correctOptId != null ? String(correctOptId) : '—'),
                        questionText: q.question,
                    };
                });
                setResults(mapped);
            } else {
                // Backend gave a score but no per-question breakdown — show summary only
                setResults(payload.questions.map(q => ({
                    questionId: q.id,
                    isCorrect: false,
                    yourAnswer: '—',
                    correctAnswer: '—',
                    questionText: q.question,
                })));
            }
            if (onComplete) onComplete();
        } else {
            // Backend failed — show error
            const msg = submitError || `Server returned status ${status}. Please try again.`;
            setLoadError(`Submission failed: ${msg}`);
        }

        setIsSubmitting(false);
    };


    if (loadError) {
        return <div className="p-6 text-red-600 bg-red-50 rounded-xl border border-red-100">{loadError}</div>;
    }

    if (!payload || !payload.questions || payload.questions.length === 0) {
        return <div className="p-6 text-gray-500 text-center bg-gray-50 rounded-xl">No questions configured for this assessment.</div>;
    }

    const isMultipleChoice = (type: string) => type === 'multiple' || type === 'multiple_choice';

    return (
        <div className="bg-white border text-gray-900 border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">
                    {type === 'certificate' ? '🎓 Certificate Exam' : '📝 Quiz'}
                </h3>
                {!results && (
                    <span className="text-xs text-gray-400 font-medium">{payload.questions.length} questions</span>
                )}
                {results && (
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${score! >= 70 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        Score: {score}%
                    </span>
                )}
            </div>

            {/* Results Summary */}
            {results && (
                <div className={`px-6 py-5 border-b ${score! >= 70 ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'}`}>
                    <div className="flex items-center gap-4">
                        <span className="text-4xl">{score! >= 70 ? '🏆' : '📚'}</span>
                        <div>
                            <p className="text-lg font-extrabold text-gray-900">
                                {score! >= 70 ? 'Excellent work!' : 'Keep practicing!'}
                            </p>
                            <p className="text-sm text-gray-600">
                                You got <strong>{results.filter(r => r.isCorrect).length}</strong> out of <strong>{results.length}</strong> questions correct ({score}%)
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-6 space-y-8">
                {payload.questions.map((q, i) => {
                    const qResult = results?.find(r => r.questionId === q.id);
                    return (
                        <div key={q.id} className={`p-5 rounded-2xl border-2 transition-colors ${qResult
                            ? qResult.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                            : 'border-gray-100 bg-gray-50/50'
                            }`}>
                            <div className="flex gap-3 items-start mb-4">
                                <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${qResult
                                    ? qResult.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                    : 'bg-primary/10 text-primary'
                                    }`}>
                                    {qResult ? (qResult.isCorrect ? '✓' : '✗') : i + 1}
                                </span>
                                <h4 className="text-base font-semibold text-gray-900">{q.question}</h4>
                            </div>

                            {/* Multiple Choice / Multiple */}
                            {isMultipleChoice(q.type) && q.options && (
                                <div className="space-y-2 ml-10">
                                    {q.options.map(opt => {
                                        const isSelected = answers[q.id] === opt.id;
                                        const isCorrectOpt = String(opt.id) === String(q.correct_answer);
                                        let rowClass = 'flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ';
                                        if (qResult) {
                                            if (isCorrectOpt) rowClass += 'border-green-300 bg-green-100';
                                            else if (isSelected && !isCorrectOpt) rowClass += 'border-red-300 bg-red-100';
                                            else rowClass += 'border-gray-200 bg-white';
                                        } else {
                                            rowClass += isSelected
                                                ? 'border-primary bg-primary/10'
                                                : 'border-gray-200 bg-white hover:border-primary/30 hover:bg-primary/5';
                                        }
                                        return (
                                            <label key={opt.id} className={rowClass}>
                                                <input
                                                    type="radio"
                                                    name={`q_${q.id}`}
                                                    value={opt.id}
                                                    checked={isSelected}
                                                    onChange={() => handleAnswerChange(q.id, opt.id)}
                                                    className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                                                    disabled={!!results}
                                                />
                                                <span className="text-gray-800 font-medium">
                                                    <span className="text-gray-400 font-bold mr-1">{String(opt.id).toUpperCase()}.</span>
                                                    {opt.label?.trim() || `Option ${String(opt.id).toUpperCase()}`}
                                                </span>
                                                {qResult && isCorrectOpt && <span className="ml-auto text-green-600 font-bold text-xs">✓ Correct</span>}
                                                {qResult && isSelected && !isCorrectOpt && <span className="ml-auto text-red-600 font-bold text-xs">✗ Your answer</span>}
                                            </label>
                                        );
                                    })}
                                </div>
                            )}

                            {/* True / False */}
                            {q.type === 'true_false' && (
                                <div className="flex gap-3 ml-10">
                                    {([true, false] as const).map(val => {
                                        const isSelected = answers[q.id] === val;
                                        const isCorrectVal = q.correct_answer === val;
                                        let btnClass = 'flex-1 py-3 rounded-xl border font-semibold transition-colors text-sm ';
                                        if (qResult) {
                                            if (isCorrectVal) btnClass += 'border-green-300 bg-green-100 text-green-700';
                                            else if (isSelected) btnClass += 'border-red-300 bg-red-100 text-red-700';
                                            else btnClass += 'border-gray-200 text-gray-400';
                                        } else {
                                            btnClass += isSelected
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-gray-200 text-gray-600 hover:border-primary/50';
                                        }
                                        return (
                                            <button
                                                key={String(val)}
                                                type="button"
                                                className={btnClass}
                                                onClick={() => handleAnswerChange(q.id, val)}
                                                disabled={!!results}
                                            >
                                                {val ? 'True' : 'False'}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Matching */}
                            {q.type === 'matching' && (
                                <div className="space-y-3 ml-10">
                                    {Object.keys(q.correct_answer || {}).map((term, tIdx) => (
                                        <div key={tIdx} className="flex items-center gap-3">
                                            <div className="flex-1 bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700">{term}</div>
                                            <span className="text-gray-400">→</span>
                                            <select
                                                className="flex-1 bg-white px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-primary outline-none"
                                                value={answers[q.id]?.[term] || ''}
                                                onChange={e => handleMatchingChange(q.id, term, e.target.value)}
                                                disabled={!!results}
                                            >
                                                <option value="">Select match…</option>
                                                {Object.values(q.correct_answer || {}).map((def: any, dIdx) => (
                                                    <option key={dIdx} value={def}>{def}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                    {qResult && (
                                        <p className={`text-xs font-bold mt-1 ${qResult.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                            {qResult.isCorrect ? '✓ All pairs correct!' : `✗ Correct answer: ${JSON.stringify(qResult.correctAnswer)}`}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Per-Question feedback for non-matching */}
                            {qResult && q.type !== 'matching' && !qResult.isCorrect && (
                                <p className="ml-10 mt-3 text-xs text-red-700 bg-red-100 px-3 py-2 rounded-lg">
                                    Correct answer: <strong>{String(qResult.correctAnswer)}</strong>
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="px-6 pb-6 flex justify-end gap-3">
                {results ? (
                    <Button
                        variant="outline"
                        onClick={() => { setResults(null); setAnswers({}); setScore(null); }}
                    >
                        Retake Quiz
                    </Button>
                ) : (
                    <Button
                        variant="primary"
                        className="px-10"
                        onClick={handleSubmit}
                        disabled={isSubmitting || Object.keys(answers).length === 0}
                    >
                        {isSubmitting ? 'Checking…' : 'Submit Answers'}
                    </Button>
                )}
            </div>
        </div>
    );
}
