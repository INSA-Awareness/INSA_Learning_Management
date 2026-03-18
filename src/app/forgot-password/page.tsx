'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { apiFetch } from '@/lib/api';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const { data, error: apiError, status } = await apiFetch('/api/auth/password-reset/', {
            method: 'POST',
            body: JSON.stringify({ email })
        });

        if (apiError || status !== 200) {
            setError(apiError || 'Failed to generate reset token.');
            toast.error(apiError || 'Failed to generate reset token.');
            setIsLoading(false);
            return;
        }

        toast.success('Reset token generated');
        setIsLoading(false);

        if (data?.uid && data?.token) {
            router.push(`/reset-password?uid=${data.uid}&token=${data.token}`);
        } else {
            router.push('/reset-password');
        }
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

                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="example@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                    />

                    <Button variant="secondary" type="submit" fullWidth className="py-3 rounded-lg" disabled={isLoading}>
                        {isLoading ? 'Generating...' : 'Generate Reset Token'}
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
