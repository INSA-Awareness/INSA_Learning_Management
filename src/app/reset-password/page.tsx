'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { apiFetch } from '@/lib/api';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const uid = searchParams.get('uid');
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // If uid or token is missing, show error
    if (!uid || !token) {
        return (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100 mb-6 font-medium text-left">
                Invalid or missing password reset link. Please make sure you clicked the full link in your email.
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);

        const { error: apiError, status } = await apiFetch('/api/auth/password-reset/confirm/', {
            method: 'POST',
            body: JSON.stringify({ uid, token, new_password: password })
        });

        if (apiError || status !== 200) {
            setError(apiError || 'Failed to reset password. The link might have expired.');
            setIsLoading(false);
            return;
        }

        setSuccess(true);
        setIsLoading(false);
    };

    if (success) {
        return (
            <div className="text-center">
                <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm border border-green-100 mb-6 font-medium">
                    Your password has been reset successfully.
                </div>
                <Button variant="secondary" type="button" fullWidth className="py-3 rounded-lg" onClick={() => router.push('/login')}>
                    Sign in with your new password
                </Button>
            </div>
        );
    }

    return (
        <form className="space-y-5 text-left" onSubmit={handleSubmit}>
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                    {error}
                </div>
            )}

            <Input
                label="New Password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
            />

            <Input
                label="Confirm New Password"
                type="password"
                placeholder="At least 8 characters"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
            />

            <Button variant="secondary" type="submit" fullWidth className="py-3 rounded-lg" disabled={isLoading}>
                {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-20 bg-gray-50">
            <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Password</h1>
                <p className="text-sm font-medium text-gray-600 mb-8 max-w-xs mx-auto">
                    Please enter your new password below.
                </p>

                <Suspense fallback={<div className="text-gray-500">Loading...</div>}>
                    <ResetPasswordForm />
                </Suspense>

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
