'use client';

import React from 'react';
import { QuestionBuilder } from '../QuestionBuilder';

interface BuilderProps {
    form: any;
    setForm: any;
    onSave: () => void;
    onCancel: () => void;
    isSaving: boolean;
    moduleName?: string;
}

export function VideoBuilder({ form, setForm, onSave, onCancel, isSaving, moduleName }: BuilderProps) {
    return (
        <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Video Title</label>
                    <input
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                        value={form.title}
                        onChange={e => setForm({ ...form, title: e.target.value })}
                        placeholder="Introduction to Visual Hierarchy"
                    />

                    <label className="block text-sm font-bold text-gray-700 mt-6 mb-2">Description</label>
                    <textarea
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none min-h-[120px] resize-y"
                        value={form.content || ''}
                        onChange={e => setForm({ ...form, content: e.target.value })}
                        placeholder="Tell your students what they will learn in this video..."
                    />
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="flex border-b border-gray-200">
                        <button className="flex-1 py-4 text-sm font-bold text-gray-500 hover:text-gray-900 border-b-2 border-transparent hover:bg-gray-50 transition-colors">Upload Video</button>
                        <button className="flex-1 py-4 text-sm font-bold text-primary border-b-2 border-primary bg-orange-50/30">External URL</button>
                    </div>
                    <div className="p-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Video URL (YouTube, Vimeo, MP4)</label>
                        <input
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                            value={form.media_url || ''}
                            onChange={e => setForm({ ...form, media_url: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-80 shrink-0 space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Video Settings</h3>

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Duration (minutes)</label>
                        <div className="relative">
                            <input type="number" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none pr-12" placeholder="12" />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">min</span>
                        </div>
                    </div>

                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <label className="block text-sm font-bold text-gray-700">Auto-play</label>
                            <span className="text-xs text-gray-500">Start video immediately</span>
                        </div>
                        <div className="w-10 h-6 bg-primary rounded-full relative cursor-pointer">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Custom Thumbnail</label>
                        <div className="border-2 border-dashed border-gray-200 rounded-lg h-32 flex flex-col items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                            <span className="text-xl mb-1">📸</span>
                            <span className="text-sm font-bold text-gray-700">Change Image</span>
                            <span className="text-xs text-gray-400">1280x720 recommended</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Lesson Access</label>
                        <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none bg-white">
                            <option>Locked (Enrolled Only)</option>
                            <option>Free Preview</option>
                        </select>
                    </div>
                </div>

                <div className="bg-orange-50 border border-orange-100 p-5 rounded-xl">
                    <div className="flex gap-3">
                        <span className="text-primary text-xl">💡</span>
                        <div>
                            <h4 className="text-sm font-bold text-primary mb-1">Pro Tip</h4>
                            <p className="text-xs text-orange-800 leading-relaxed">Use video lessons for core concepts. Adding a short description helps with SEO and student search within the platform.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ArticleBuilder({ form, setForm, onSave, onCancel, isSaving }: BuilderProps) {
    return (
        <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
                <input
                    className="w-full text-4xl font-extrabold text-gray-900 border-none placeholder-gray-300 focus:outline-none focus:ring-0 mb-8 bg-transparent"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="Article Title..."
                />

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
                    <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex gap-2 overflow-x-auto">
                        <button className="px-3 py-1.5 rounded hover:bg-gray-200 text-sm font-bold text-gray-700">H1</button>
                        <button className="px-3 py-1.5 rounded hover:bg-gray-200 text-sm font-bold text-gray-700">H2</button>
                        <div className="w-px h-6 bg-gray-300 my-auto mx-1"></div>
                        <button className="px-3 py-1.5 rounded hover:bg-gray-200 text-sm font-bold text-gray-700">B</button>
                        <button className="px-3 py-1.5 rounded hover:bg-gray-200 text-sm italic text-gray-700">I</button>
                        <div className="w-px h-6 bg-gray-300 my-auto mx-1"></div>
                        <button className="px-3 py-1.5 rounded hover:bg-gray-200 text-sm text-gray-700">≡</button>
                        <button className="px-3 py-1.5 rounded hover:bg-gray-200 text-sm text-gray-700">”</button>
                        <button className="px-3 py-1.5 rounded hover:bg-gray-200 text-sm text-gray-700">🔗</button>
                    </div>
                    <textarea
                        className="w-full px-8 py-8 text-lg text-gray-800 leading-relaxed font-serif focus:outline-none min-h-[400px] resize-y"
                        value={form.content || ''}
                        onChange={e => setForm({ ...form, content: e.target.value })}
                        placeholder="Start writing your amazing article here..."
                    />
                </div>
            </div>

            <div className="w-full lg:w-80 shrink-0 space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-100 pb-3">Lesson Metadata</h3>

                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <label className="block text-sm font-bold text-gray-700 flex items-center gap-2">⏱️ Reading Time</label>
                            <span className="text-sm font-bold text-primary">8 min</span>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-gray-500 font-medium">Auto-calculate time</span>
                            <div className="w-10 h-6 bg-primary rounded-full relative cursor-pointer">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                            </div>
                        </div>
                        <div className="relative opacity-50 cursor-not-allowed">
                            <input type="number" disabled className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none pr-12 bg-gray-50" placeholder="Manual override" />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold uppercase">Mins</span>
                        </div>
                    </div>

                    <div className="mt-8 border-t border-gray-100 pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Table of Contents</h3>
                            <div className="w-8 h-5 bg-primary rounded-full relative cursor-pointer">
                                <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div>
                            </div>
                        </div>
                        <ul className="space-y-3 text-sm font-medium">
                            <li className="flex items-center gap-2 text-gray-500"><span className="w-1.5 h-1.5 rounded-full bg-orange-200"></span> Introduction</li>
                            <li className="flex items-center gap-2 text-gray-900"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Core Concept</li>
                            <li className="flex items-center gap-2 text-gray-300"><span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span> Add new heading...</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function FileBuilder({ form, setForm, onSave, onCancel, isSaving }: BuilderProps) {
    return (
        <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-6">
                <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center border-dashed border-2">
                    <div className="w-16 h-16 bg-orange-50 text-secondary rounded-full flex items-center justify-center text-3xl mx-auto mb-4">☁️</div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Upload Resource / Provide URL</h3>
                    <p className="text-sm text-gray-500 mb-6">Support for PDF, DOCX, PPTX, or ZIP. (Currently accepting URLs)</p>
                    <input
                        className="max-w-md mx-auto w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none block"
                        value={form.image_url || form.media_url || ''}
                        onChange={e => setForm({ ...form, image_url: e.target.value })}
                        placeholder="https://example.com/file.pdf"
                    />
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">📄 Resource Details</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Display Name <span className="text-red-500">*</span></label>
                            <input
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                placeholder="e.g. Q3 Marketing Strategy Framework"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Resource Description</label>
                            <textarea
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none min-h-[100px]"
                                value={form.content || ''}
                                onChange={e => setForm({ ...form, content: e.target.value })}
                                placeholder="Briefly describe what students will learn from this resource..."
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">⚙️ Access Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                            <div>
                                <div className="font-bold text-gray-900 text-sm">Allow Download</div>
                                <div className="text-xs text-gray-500 mt-1">Let students download the file to their local devices.</div>
                            </div>
                            <div className="w-10 h-6 bg-primary rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
                        </div>
                        <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                            <div>
                                <div className="font-bold text-gray-900 text-sm">Force Preview in Browser</div>
                                <div className="text-xs text-gray-500 mt-1">Automatically open the file in the built-in browser viewer.</div>
                            </div>
                            <div className="w-10 h-6 bg-primary rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-80 shrink-0 space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-100 pb-3">File Metadata</h3>

                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-lg bg-red-50 text-red-500 flex items-center justify-center font-bold text-sm border border-red-100">PDF</div>
                        <div>
                            <div className="text-sm font-bold text-gray-900 truncate">strategy_guide_2024.pdf</div>
                            <div className="text-xs text-gray-500 mt-0.5">Ready to upload</div>
                        </div>
                    </div>

                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">File Size</span><span className="font-bold text-gray-900">4.2 MB</span></div>
                        <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Type</span><span className="font-bold text-gray-900">PDF Document</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Pages</span><span className="font-bold text-gray-900">24</span></div>
                    </div>
                </div>

                <div className="bg-orange-50 border border-orange-100 p-5 rounded-xl">
                    <div className="flex gap-3">
                        <span className="text-primary text-xl">💡</span>
                        <div>
                            <h4 className="text-sm font-bold text-primary mb-1">Expert Tip</h4>
                            <p className="text-xs text-orange-800 leading-relaxed">Uploading a PDF ensures consistent formatting across all devices. We recommend optimized PDFs for faster loading.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ExternalToolBuilder({ form, setForm, onSave, onCancel, isSaving }: BuilderProps) {
    return (
        <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-orange-50 text-secondary flex items-center justify-center text-xl">🔗</div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">External Tool Integration</h3>
                            <p className="text-sm text-gray-500">Connect LTI tools, SCORM packages, or external learning resources.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Tool Name</label>
                            <input
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                placeholder="Interactive Prototype Workspace"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">LTI / External URL</label>
                            <input
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                                value={form.media_url || ''}
                                onChange={e => setForm({ ...form, media_url: e.target.value })}
                                placeholder="https://miro.com/app/board/..."
                            />
                            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">Note: If using LTI, ensure the tool provider has been authorized in your global settings.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Integration Description</label>
                            <textarea
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none min-h-[100px]"
                                value={form.content || ''}
                                onChange={e => setForm({ ...form, content: e.target.value })}
                                placeholder="This collaborative workspace allows you to map out your user flows. Please follow the instructions provided in the Miro template once you launch the tool."
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-base font-bold text-gray-900">LTI Credentials</h3>
                        <span className="text-xs font-bold text-primary bg-orange-50 px-2 py-1 rounded">Optional Override</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Consumer Key</label>
                            <input className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-primary outline-none bg-gray-50" placeholder="Leave empty for global defaults" disabled />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Shared Secret</label>
                            <input className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-primary outline-none bg-gray-50" placeholder="••••••••••••" type="password" disabled />
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-80 shrink-0 space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-100 pb-3 flex items-center gap-2">⚙️ Advanced Settings</h3>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-bold text-gray-900 text-sm">Launch in New Window</div>
                                <div className="text-xs text-gray-400">Recommended for LTI</div>
                            </div>
                            <div className="w-10 h-6 bg-primary rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
                        </div>

                        <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                            <div>
                                <div className="font-bold text-gray-900 text-sm">Pass User Data (LTI)</div>
                                <div className="text-xs text-gray-400">Send name & email</div>
                            </div>
                            <div className="w-10 h-6 bg-primary rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Privacy Level</label>
                            <div className="space-y-2">
                                <label className="flex items-center justify-between p-3 border border-primary bg-primary/5 rounded-lg cursor-pointer">
                                    <span className="text-sm font-bold text-primary flex items-center gap-2">🌎 Public</span>
                                    <span className="w-4 h-4 rounded-full border-4 border-primary bg-white"></span>
                                </label>
                                <label className="flex items-center justify-between p-3 border border-gray-200 bg-gray-50 rounded-lg text-gray-400 cursor-not-allowed">
                                    <span className="text-sm font-medium flex items-center gap-2">🔒 Anonymous</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Completion Type</label>
                            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
                                <option>On Manual Check</option>
                                <option>Upon Tool Launch</option>
                            </select>
                        </div>
                    </div>
                </div>

                <button className="flex items-center justify-center gap-2 w-full py-4 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                    🗑️ Delete Integration
                </button>
            </div>
        </div>
    );
}

export function AssessmentBuilder({ form, setForm, onSave, onCancel, isSaving }: BuilderProps) {
    const questions = typeof form.assessment_payload === 'string'
        ? (JSON.parse(form.assessment_payload || '{"questions":[]}').questions || [])
        : (form.assessment_payload?.questions || []);

    return (
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-4xl mx-auto">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 border-b border-gray-100 pb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Builder</h2>
                    <p className="text-sm text-gray-500">Create interactive questions for this lesson. Students must complete this assessment to proceed.</p>
                </div>

                <div className="space-y-8">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Quiz Title</label>
                        <input
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none font-medium"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            placeholder="e.g. Content Mastery Check"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Questions</label>
                        <QuestionBuilder
                            value={questions}
                            onChange={(newQuestions) => setForm({
                                ...form,
                                assessment_payload: JSON.stringify({ questions: newQuestions })
                            })}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

