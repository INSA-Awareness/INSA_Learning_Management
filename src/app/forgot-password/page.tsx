'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { apiFetch } from '@/lib/api';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [resetLink, setResetLink] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setResetLink('');
        setIsLoading(true);

        const { data, error: apiError, status } = await apiFetch('/api/auth/password-reset/', {
            method: 'POST',
            body: JSON.stringify({ email })
        });

        if (apiError || status !== 200) {
            setError(apiError || 'Failed to send password reset request.');
            setIsLoading(false);
            return;
        }

        if (data?.uid && data?.token) {
            setResetLink(`/reset-password?uid=${data.uid}&token=${data.token}`);
        }

        setSuccess(true);
        setIsLoading(false);
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-20 bg-gray-50">
            <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
                <p className="text-sm font-medium text-gray-600 mb-8 max-w-xs mx-auto">
                    Enter your email to receive a password reset link.
                </p>

                <form className="space-y-5 text-left" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                            {error}
                        </div>
                    )}
                    {success && !resetLink && (
                        <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm border border-green-100">
                            Password reset link has been sent to your email.
                        </div>
                    )}
                    {success && resetLink && (
                        <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm border border-green-100 flex flex-col gap-3">
                            <span className="font-medium">Reset token generated successfully.</span>
                            <Link href={resetLink} className="bg-primary hover:bg-primary-hover text-white text-center py-2.5 rounded-lg font-medium transition-colors">
                                Proceed to Reset Password &rarr;
                            </Link>
                        </div>
                    )}

                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="example@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading || !!success}
                    />

                    <Button variant="secondary" type="submit" fullWidth className="py-3 rounded-lg" disabled={isLoading || !!success}>
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                </form>

                <p className="mt-8 text-sm text-gray-600">
                    Remembered your password?{' '}
                    <Link href="/login" className="font-semibold text-primary hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
