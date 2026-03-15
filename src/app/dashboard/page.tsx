'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading || !isAuthenticated) return null;

    const fullName = user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.email || 'User';

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Dashboard Top Nav Extension */}
            <div className="bg-white border-b border-gray-200 px-6 lg:px-12 py-3 flex items-center justify-between sticky top-16 z-40 shadow-sm">
                <div className="flex gap-6 text-sm font-semibold">
                    <Link href="/dashboard" className="text-primary border-b-2 border-primary pb-3 -mb-3">Dashboard</Link>
                    <Link href="/training" className="text-gray-500 hover:text-gray-900 pb-3 -mb-3">Modules</Link>
                    <Link href="/resources" className="text-gray-500 hover:text-gray-900 pb-3 -mb-3">Library</Link>
                    <Link href="/contact" className="text-gray-500 hover:text-gray-900 pb-3 -mb-3">Help</Link>
                </div>

                <div className="flex items-center gap-6">
                    <div className="relative hidden md:block">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">&#128269;</span>
                        <input
                            type="text"
                            placeholder="Search training, resources..."
                            className="pl-9 pr-4 py-1.5 bg-gray-100 border-none rounded-full text-sm w-64 focus:ring-1 focus:ring-primary focus:bg-white transition-all outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-3 border-l border-gray-200 pl-6">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-bold text-gray-900 leading-tight">{fullName}</div>
                            <div className="text-xs text-gray-500">Access Level: {user?.role || 'User'}</div>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-white font-bold shrink-0 shadow-sm overflow-hidden">
                            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=1e1e24&color=fff`} alt="User Avatar" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-primary mb-1">Welcome back, {user?.first_name || 'User'}.</h1>
                        <p className="text-gray-600">
                            Your cyber resilience score is stable. There are <span className="font-bold text-orange-500">2 new advisories</span> requiring your attention today.
                        </p>
                    </div>
                    <button className="bg-white border border-green-200 text-green-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-green-50 transition-colors shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span> System Operational
                    </button>
                </div>

                {/* Global Alert Banner */}
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-8 flex items-start gap-4 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-orange-100 to-transparent pointer-events-none"></div>
                    <div className="w-10 h-10 rounded-full bg-white text-orange-500 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                        &#9888;
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-bold text-gray-900">National Threat Advisory</h3>
                            <span className="bg-orange-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">Action Required</span>
                        </div>
                        <p className="text-sm text-gray-700 max-w-4xl">
                            Phishing campaigns targeting public sector employees increased by 42%. Verify all &quot;Tax Refund&quot; communications immediately through the official portal.
                        </p>
                    </div>
                    <button className="bg-white border border-orange-200 text-orange-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-50 shrink-0 mt-2 sm:mt-0">
                        View Briefing
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column (Main Content) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md hover:border-primary/30 transition-all group flex gap-4 cursor-pointer relative overflow-hidden">
                                <div className="w-16 h-16 shrink-0 bg-gray-100 rounded-xl flex items-center justify-center text-3xl group-hover:scale-110 group-hover:bg-red-50 transition-all">
                                    &#128274;
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors">Advanced Password Security</h4>
                                    <p className="text-xs text-gray-500 mb-2">Module 3 of 5 • Estimated 15 mins left</p>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1 overflow-hidden">
                                        <div className="bg-primary h-1.5 rounded-full w-[60%] group-hover:bg-red-600 transition-colors"></div>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-2">
                                        <span>60% COMPLETED</span>
                                        <span className="text-primary group-hover:underline cursor-pointer">RESUME &rarr;</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md hover:border-primary/30 transition-all group flex gap-4 cursor-pointer relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-orange-100 to-transparent opacity-50 pointer-events-none group-hover:opacity-100 transition-opacity"></div>
                                <div className="w-16 h-16 shrink-0 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center text-3xl group-hover:scale-110 group-hover:bg-orange-100 transition-all">
                                    &#128241;
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">Mobile Device Management</h4>
                                    <p className="text-xs text-gray-500 mb-4">Recommended based on your role</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">20 mins</span>
                                        <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest group-hover:underline cursor-pointer ml-auto">START &rarr;</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recommended Training */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-primary">Recommended Training</h2>
                                <Link href="/training" className="text-xs font-semibold text-gray-500 hover:text-primary flex items-center gap-1">View catalog &rarr;</Link>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:border-primary/30 transition-colors">
                                    <div className="h-32 bg-secondary relative overflow-hidden border-b border-gray-800 flex items-center justify-center">
                                        {/* Abstract tech background */}
                                        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MCcgaGVpZ2h0PSc0MCc+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSdncmFkMScgeDE9JzAlJyB5MT0nMCUnIHgyPScxMDAlJyB5Mj0nMCUnPjxzdG9wIG9mZnNldD0nMCUnIHN0eWxlPSdzdG9wLWNvbG9yOiNmZmY7c3RvcC1vcGFjaXR5OjEuMCcgLz48c3RvcCBvZmZzZXQ9JzEwMCUnIHN0eWxlPSdzdG9wLWNvbG9yOiMwMDA7c3RvcC1vcGFjaXR5OjEuMCcgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0nNDAnJyBoZWlnaHQ9JzQwJScgZmlsbD0ndXJsKCNncmFkMSknIGZpbGwtb3BhY2l0eT0nMC4xJy8+PC9zdmc+')] mix-blend-overlay"></div>
                                        <div className="w-24 h-24 border-[8px] border-blue-500/80 rounded-full border-t-transparent animate-spin-slow"></div>

                                        <div className="absolute bottom-3 left-3 flex gap-2">
                                            <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">NEW</span>
                                            <span className="bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider backdrop-blur-sm shadow-sm">15 MINS</span>
                                        </div>
                                    </div>
                                    <div className="p-5 flex flex-col flex-1">
                                        <h3 className="font-bold text-gray-900 mb-2">Social Engineering Tactics</h3>
                                        <p className="text-xs text-gray-500 mb-6 flex-1 line-clamp-2">
                                            Learn to identify and neutralize sophisticated psychological manipulation techniques targeting...
                                        </p>
                                        <button className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-hover transition-colors shadow-sm">
                                            Start Module &rarr;
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:border-primary/30 transition-colors">
                                    <div className="h-32 bg-[#0d1b2a] relative overflow-hidden border-b border-[#1b263b] flex items-center justify-center">
                                        <div className="grid grid-cols-12 gap-1 w-full h-full p-2 opacity-30">
                                            {Array.from({ length: 12 * 4 }).map((_, i) => (
                                                <div key={i} className="bg-[#415a77] rounded-sm animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>
                                            ))}
                                        </div>
                                        <div className="absolute bottom-3 left-3 flex gap-2">
                                            <span className="bg-yellow-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">IN PROGRESS</span>
                                        </div>
                                    </div>
                                    <div className="p-5 flex flex-col flex-1">
                                        <h3 className="font-bold text-gray-900 mb-2">Cyber Hygiene 101</h3>
                                        <p className="text-xs text-gray-500 mb-4 flex-1 line-clamp-2">
                                            Master foundational password management, 2FA setup, and secure browsing habits.
                                        </p>
                                        <div className="mb-4">
                                            <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                                <span>40% Complete</span>
                                                <span>10m left</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                <div className="bg-yellow-500 h-1.5 rounded-full w-[40%]"></div>
                                            </div>
                                        </div>

                                        <button className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm">
                                            Continue
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Sidebar) */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Quick Actions */}
                        <div>
                            <h2 className="text-sm font-bold text-primary tracking-wider uppercase mb-4">Quick Actions</h2>
                            <div className="space-y-3">
                                <div className="bg-white border text-left border-gray-100 p-4 rounded-xl flex items-center gap-4 hover:border-primary/30 hover:shadow-sm cursor-pointer transition-all group">
                                    <div className="w-10 h-10 rounded-full bg-red-50 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                                        &#9888;
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 text-sm">Report Incident</h4>
                                        <p className="text-xs text-gray-500">Flag suspicious activity.</p>
                                    </div>
                                    <div className="text-gray-300 group-hover:text-primary">&#11162;</div>
                                </div>

                                <div className="bg-white border text-left border-gray-100 p-4 rounded-xl flex items-center gap-4 hover:border-primary/30 hover:shadow-sm cursor-pointer transition-all group">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors shrink-0">
                                        &#128274;
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 text-sm">Password Check</h4>
                                        <p className="text-xs text-gray-500">Test credentials strength.</p>
                                    </div>
                                    <div className="text-gray-300 group-hover:text-primary">&#11162;</div>
                                </div>

                                <div className="bg-white border text-left border-gray-100 p-4 rounded-xl flex items-center gap-4 hover:border-primary/30 hover:shadow-sm cursor-pointer transition-all group">
                                    <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors shrink-0 font-bold">
                                        ID
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 text-sm">GovID Scanner</h4>
                                        <p className="text-xs text-gray-500">Verify official links.</p>
                                    </div>
                                    <div className="text-gray-300 group-hover:text-primary">&#11162;</div>
                                </div>
                            </div>
                        </div>

                        {/* Latest Intelligence */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-sm font-bold text-primary tracking-wider uppercase">Latest Intelligence</h2>
                                <button className="text-gray-400 hover:text-gray-600">&#8635;</button>
                            </div>
                            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm relative hover:shadow-md transition-shadow">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-gray-50 flex justify-end p-2 rounded-tr-2xl text-gray-300 pointer-events-none">
                                    &#128365;
                                </div>

                                <div className="space-y-4">
                                    <div className="border-b border-gray-100 pb-4">
                                        <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                                            <span className="text-primary">Active Campaign</span>
                                            <span>2 hrs ago</span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 hover:text-primary cursor-pointer leading-tight transition-colors">
                                            New &quot;DarkGate&quot; Ransomware variant identified in sector 4.
                                        </p>
                                    </div>

                                    <div className="border-b border-gray-100 pb-4">
                                        <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                                            <span>Vulnerability</span>
                                            <span>Yesterday</span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 hover:text-primary cursor-pointer leading-tight transition-colors">
                                            Legacy protocols in VPN infrastructure facilitates unauthorized access.
                                        </p>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                                            <span>Patch Alert</span>
                                            <span>Apr 12</span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 hover:text-primary cursor-pointer leading-tight transition-colors">
                                            Critical patch update required for Chromium browsers.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 pt-4 border-t border-gray-100 text-center">
                                    <Link href="/training" className="text-[10px] font-bold text-orange-500 uppercase tracking-widest hover:underline">
                                        View Full Intel Briefing &rarr;
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
