'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { apiFetch, setTokens } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-hot-toast';

export default function SignupPage() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { checkAuth } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            toast.error('Password must be at least 8 characters long');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            toast.error('Passwords do not match');
            return;
        }

        if (!acceptedTerms) {
            setError('You must accept the terms of service');
            toast.error('You must accept the terms of service');
            return;
        }

        setIsLoading(true);

        const first_name = firstName.trim();
        const last_name = lastName.trim();

        const { error: apiError, status } = await apiFetch('/api/auth/register/', {
            method: 'POST',
            body: JSON.stringify({
                email,
                password,
                first_name,
                last_name,
                preferred_language: 'en'
            })
        });

        if (apiError || status !== 201) {
            const errorMsg = apiError || 'Failed to register. Please check your information.';
            setError(errorMsg);
            toast.error(errorMsg);
            setIsLoading(false);
            return;
        }

        toast.success('Account created successfully!');
        // Redirect to login on success
        router.push('/login');
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
        toast.error('Backend Google Auth endpoint not yet configured.');
        setIsLoading(false);
        // if (data?.access) { ... }
    };

    const getPasswordScore = (pass: string) => {
        let score = 0;
        if (!pass) return { score: 0, label: '', color: 'bg-gray-200' };
        if (pass.length > 0 && pass.length < 8) return { score: 1, label: 'Weak', color: 'bg-red-500', w: 'w-1/4' };
        score++;
        if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;
        if (pass.length > 12) score++;

        if (score === 1) return { score, label: 'Fair', color: 'bg-yellow-400', w: 'w-2/4' };
        if (score === 2) return { score, label: 'Good', color: 'bg-blue-500', w: 'w-3/4' };
        return { score, label: 'Strong', color: 'bg-green-500', w: 'w-full' };
    };
    const passStrength = getPasswordScore(password);
    return (
        <div className="flex min-h-screen bg-white">
            {/* Left Pane - Dark */}
            <div className="hidden lg:flex w-1/2 bg-secondary flex-col justify-center px-16 relative lg:sticky lg:top-0 h-screen">
                <div className="max-w-md mx-auto z-10">
                    <span className="inline-block px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-semibold tracking-wider mb-6">
                        &#128274; SECURE REGISTRATION
                    </span>
                    <h1 className="text-4xl font-bold text-white leading-tight mb-2">
                        Forging a Safer <br />
                        <span className="text-primary">Digital Frontier.</span>
                    </h1>
                    <p className="text-gray-400 mt-4 leading-relaxed max-w-sm mb-12">
                        Join the national initiative. Equip yourself and your organization with the tools to defend against cyber threats in an evolving digital landscape.
                    </p>

                    <div className="space-y-4">
                        <div className="bg-secondary-hover border border-gray-800 p-5 rounded-2xl flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                &#128302;
                            </div>
                            <div>
                                <h4 className="text-white font-medium">National Defense</h4>
                                <p className="text-sm text-gray-500 mt-1">Contribute to the collective cyber resilience of our critical infrastructure.</p>
                            </div>
                        </div>

                        <div className="bg-secondary-hover border border-gray-800 p-5 rounded-2xl flex items-start gap-4">
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

                    <form className="space-y-5" onSubmit={handleSubmit} method="POST">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                                {error}
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="First Name"
                                placeholder="John"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                                disabled={isLoading}
                                icon={<span className="text-gray-400">&#128100;</span>}
                            />
                            <Input
                                label="Last Name"
                                placeholder="Doe"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                                disabled={isLoading}
                                icon={<span className="text-gray-400">&#128100;</span>}
                            />
                        </div>

                        <Input
                            label="Official Email Address"
                            type="email"
                            placeholder="name@agency.gov"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                            icon={<span className="text-gray-400">&#9993;</span>}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Input
                                    label="Password"
                                    name="password"
                                    type="password"
                                    placeholder="Create a strong password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    showPasswordToggle
                                    icon={<span className="text-gray-400">&#128274;</span>}
                                />
                                {password && (
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div className={`h-full ${passStrength.color} ${passStrength.w} transition-all duration-300`}></div>
                                        </div>
                                        <span className={`text-[10px] font-bold ${passStrength.color.replace('bg-', 'text-')}`}>{passStrength.label}</span>
                                    </div>
                                )}
                            </div>
                            <Input
                                label="Confirm Password"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                showPasswordToggle
                                disabled={isLoading}
                                icon={<span className="text-gray-400">&#128274;</span>}
                            />
                        </div>

                        {/* Security Requirements */}
                        <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl">
                            <h5 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1">
                                &#9432; Security Requirements:
                            </h5>
                            <div className="grid grid-cols-2 gap-y-2 text-xs text-gray-500 transition-colors">
                                <div className={`flex items-center gap-2 ${password.length >= 8 ? 'text-green-600 font-medium' : ''}`}>
                                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] ${password.length >= 8 ? 'bg-green-500 text-white' : 'bg-gray-300 text-transparent'}`}>&#10003;</span> 8+ characters
                                </div>
                                <div className={`flex items-center gap-2 ${/[A-Z]/.test(password) ? 'text-green-600 font-medium' : ''}`}>
                                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] ${/[A-Z]/.test(password) ? 'bg-green-500 text-white' : 'bg-gray-300 text-transparent'}`}>&#10003;</span> 1 uppercase letter
                                </div>
                                <div className={`flex items-center gap-2 ${/[0-9]/.test(password) ? 'text-green-600 font-medium' : ''}`}>
                                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] ${/[0-9]/.test(password) ? 'bg-green-500 text-white' : 'bg-gray-300 text-transparent'}`}>&#10003;</span> 1 number
                                </div>
                                <div className={`flex items-center gap-2 ${/[^A-Za-z0-9]/.test(password) ? 'text-green-600 font-medium' : ''}`}>
                                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] ${/[^A-Za-z0-9]/.test(password) ? 'bg-green-500 text-white' : 'bg-gray-300 text-transparent'}`}>&#10003;</span> 1 special char
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 mt-6">
                            <div className="flex items-center h-5">
                                <input
                                    id="terms"
                                    type="checkbox"
                                    checked={acceptedTerms}
                                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                                    required
                                    disabled={isLoading}
                                    className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary focus:ring-2"
                                />
                            </div>
                            <label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed">
                                I affirm that the information provided is accurate and agree to the <Link href="/about" className="font-semibold text-primary hover:underline">Terms of Service</Link>.
                            </label>
                        </div>

                        <Button type="submit" fullWidth className="mt-6" disabled={isLoading}>
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </Button>

                    </form>

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
                            <div className="flex justify-center flex-col items-center">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => {
                                        setError('Google Sign-In Failed');
                                    }}
                                    useOneTap
                                />
                            </div>
                            <Button variant="social" className="w-full flex justify-center py-2.5 px-4 text-primary text-[10px] md:text-sm">
                                <span className="flex items-center gap-2 font-semibold">
                                    <span className="inline-block w-4 h-4 border border-primary rounded-sm text-center leading-none">🏛</span> GovID
                                </span>
                            </Button>
                        </div>
                    </div>

                    <p className="mt-8 text-center text-sm text-gray-600">
                        Already have a CyberSafe ID?{' '}
                        <Link href="/login" className="font-semibold text-primary hover:underline">
                            Sign in securely
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
