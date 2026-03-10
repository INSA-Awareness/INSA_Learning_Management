'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

export default function SignupPage() {
    return (
        <div className="flex min-h-screen bg-white">
            {/* Left Pane - Dark */}
            <div className="hidden lg:flex w-1/2 bg-brand-dark flex-col justify-center px-16 relative lg:sticky lg:top-0 h-screen">
                <div className="max-w-md mx-auto z-10">
                    <span className="inline-block px-3 py-1 bg-brand-red/10 border border-brand-red/20 rounded-full text-brand-red text-xs font-semibold tracking-wider mb-6">
                        &#128274; SECURE REGISTRATION
                    </span>
                    <h1 className="text-4xl font-bold text-white leading-tight mb-2">
                        Forging a Safer <br />
                        <span className="text-brand-red">Digital Frontier.</span>
                    </h1>
                    <p className="text-gray-400 mt-4 leading-relaxed max-w-sm mb-12">
                        Join the national initiative. Equip yourself and your organization with the tools to defend against cyber threats in an evolving digital landscape.
                    </p>

                    <div className="space-y-4">
                        <div className="bg-brand-darker border border-gray-800 p-5 rounded-2xl flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-brand-red/10 text-brand-red flex items-center justify-center shrink-0">
                                &#128302;
                            </div>
                            <div>
                                <h4 className="text-white font-medium">National Defense</h4>
                                <p className="text-sm text-gray-500 mt-1">Contribute to the collective cyber resilience of our critical infrastructure.</p>
                            </div>
                        </div>

                        <div className="bg-brand-darker border border-gray-800 p-5 rounded-2xl flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center shrink-0">
                                &#9888;
                            </div>
                            <div>
                                <h4 className="text-white font-medium">Verified Alerts</h4>
                                <p className="text-sm text-gray-500 mt-1">Receive official warnings about phishing campaigns and ransomware.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Pane - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-white py-12">
                <div className="max-w-md w-full mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h2>
                    <p className="text-gray-500 text-sm mb-8">Enter your credentials to access the secure portal.</p>

                    {/* Progress Indicator */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div className="w-1/2 h-full bg-brand-red"></div>
                        </div>
                        <span className="text-xs font-bold text-brand-red tracking-widest whitespace-nowrap">STEP 1 OF 2</span>
                    </div>

                    <form className="space-y-5">
                        <Input
                            label="Full Legal Name"
                            placeholder="John Doe"
                            required
                            icon={<span className="text-gray-400">&#128100;</span>}
                        />

                        <Input
                            label="Official Email Address"
                            type="email"
                            placeholder="name@agency.gov"
                            required
                            icon={<span className="text-gray-400">&#9993;</span>}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                required
                                icon={<span className="text-gray-400">&#128274;</span>}
                            />
                            <Input
                                label="Confirm Password"
                                type="password"
                                placeholder="••••••••"
                                required
                                icon={<span className="text-gray-400">&#128274;</span>}
                            />
                        </div>

                        {/* Security Requirements */}
                        <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl">
                            <h5 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1">
                                &#9432; Security Requirements:
                            </h5>
                            <div className="grid grid-cols-2 gap-y-2 text-xs text-gray-500">
                                <div className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-gray-400"></span> 12+ characters</div>
                                <div className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-gray-400"></span> 1 uppercase letter</div>
                                <div className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-gray-400"></span> 1 number</div>
                                <div className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-gray-400"></span> 1 special char</div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 mt-6">
                            <div className="flex items-center h-5">
                                <input
                                    id="terms"
                                    type="checkbox"
                                    required
                                    className="w-4 h-4 text-brand-red bg-white border-gray-300 rounded focus:ring-brand-red focus:ring-2"
                                />
                            </div>
                            <label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed">
                                I affirm that the information provided is accurate and agree to the <Link href="/about" className="font-semibold text-brand-red hover:underline">Terms of Service</Link>.
                            </label>
                        </div>

                        <Button type="button" fullWidth className="mt-6" onClick={() => window.location.href = '/dashboard'}>
                            Complete Registration &rarr;
                        </Button>

                        <div className="mt-8">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="bg-white px-2 text-gray-400 font-semibold uppercase tracking-wider">Or verify identity with</span>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-4">
                                <Button variant="social" className="w-full flex justify-center py-2.5 px-4">
                                    <span className="flex items-center gap-2 text-sm">
                                        <span className="font-bold">G</span> Google
                                    </span>
                                </Button>
                                <Button variant="social" className="w-full flex justify-center py-2.5 px-4 text-brand-red">
                                    <span className="flex items-center gap-2 text-sm font-semibold">
                                        <span className="inline-block w-4 h-4 border border-brand-red rounded-sm text-center leading-none">🏛</span> GovID
                                    </span>
                                </Button>
                            </div>
                        </div>

                        <p className="mt-8 text-center text-sm text-gray-600">
                            Already have a CyberSafe ID?{' '}
                            <Link href="/login" className="font-semibold text-brand-red hover:underline">
                                Sign in securely
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
