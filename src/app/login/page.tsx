'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

export default function LoginPage() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-20 bg-gray-50">
            <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back 👋</h1>
                <p className="text-sm font-medium text-gray-600 mb-8 max-w-xs mx-auto">
                    Secure Access To The National Cyber Resilience Portal
                </p>

                <form className="space-y-5 text-left">
                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="example@email.com"
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        placeholder="At least 8 characters"
                        required
                    />

                    <div className="flex justify-end">
                        <Link href="/contact" className="text-sm font-medium text-brand-red hover:underline">
                            Forgot Password?
                        </Link>
                    </div>

                    <Button type="button" fullWidth className="bg-brand-dark hover:bg-black text-white py-3 rounded-lg" onClick={() => window.location.href = '/dashboard'}>
                        Sign in
                    </Button>

                    <div className="mt-6 mb-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-4 text-gray-500">Or</span>
                            </div>
                        </div>
                    </div>

                    <Button type="button" variant="primary" fullWidth className="py-3 rounded-lg bg-[#ea4335] hover:bg-[#d33c2e] text-white flex gap-2 items-center justify-center">
                        <span className="bg-white text-[#ea4335] font-bold rounded-full w-5 h-5 flex items-center justify-center text-xs">G</span>
                        Sign in with Google
                    </Button>
                </form>

                <p className="mt-8 text-sm text-gray-600">
                    Don&apos;t you have an account?{' '}
                    <Link href="/signup" className="font-semibold text-brand-red hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
