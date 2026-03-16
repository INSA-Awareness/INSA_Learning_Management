'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { apiFetch, setTokens } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { checkAuth } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const { data, error: apiError, status } = await apiFetch('/api/auth/login/', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (apiError || status !== 200) {
            setError(apiError || 'Failed to login. Please check your credentials.');
            setIsLoading(false);
            return;
        }

        if (data?.access) {
            setTokens(data);
            const loggedInUser = await checkAuth();
            const role = loggedInUser?.role;
            if (role === 'super_admin' || role === 'org_admin' || role === 'course_provider') {
                router.push('/admin');
            } else {
                router.push('/dashboard');
            }
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        setIsLoading(true);
        setError('');
        // TODO: Replace with the actual backend Google Auth endpoint once provided by user
        // const token = credentialResponse.credential;
        // const { data, error: apiError, status } = await apiFetch('/api/auth/google/', {
        //     method: 'POST',
        //     body: JSON.stringify({ token })
        // });
        console.log('Google credential response:', credentialResponse);
        setError('Backend Google Auth endpoint not yet configured.');
        setIsLoading(false);
    };
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-20 bg-gray-50">
            <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back 👋</h1>
                <p className="text-sm font-medium text-gray-600 mb-8 max-w-xs mx-auto">
                    Secure Access To The National Cyber Resilience Portal
                </p>

                <form className="space-y-5 text-left" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                            {error}
                        </div>
                    )}
                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="example@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                    />

                    <Input
                        label="Password"
                        type="password"
                        placeholder="At least 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                    />

                    <div className="flex justify-end">
                        <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                            Forgot Password?
                        </Link>
                    </div>

                    <Button variant="secondary" type="submit" fullWidth className="py-3 rounded-lg" disabled={isLoading}>
                        {isLoading ? 'Signing in...' : 'Sign in'}
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

                    <div className="flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => {
                                setError('Google Sign-In Failed');
                            }}
                            useOneTap
                        />
                    </div>
                </form>

                <p className="mt-8 text-sm text-gray-600">
                    Don&apos;t you have an account?{' '}
                    <Link href="/signup" className="font-semibold text-primary hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
