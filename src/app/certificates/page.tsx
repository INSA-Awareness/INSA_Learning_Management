'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';

interface Certificate {
    id: string;
    enrollment?: string;
    certificate_id?: string;
    issued_at?: string;
}

export default function CertificatesPage() {
    const { isAuthenticated, isLoading: authLoading, user } = useAuth();
    const router = useRouter(); // Initialized useRouter
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [isLoadingCertificates, setIsLoadingCertificates] = useState(true); // Renamed isLoading to isLoadingCertificates
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState(''); // Added searchTerm state
    const [page, setPage] = useState(1); // Added page state
    const [totalCount, setTotalCount] = useState(0); // Added totalCount state
    const pageSize = 8; // Added pageSize constant

    useEffect(() => {
        if (!authLoading) { // Changed from !isLoading to !authLoading to match original context
            if (!isAuthenticated) {
                router.push('/login');
            } else {
                fetchCertificates();
            }
        }
    }, [isAuthenticated, authLoading, router, page, searchTerm]); // Added router, page, searchTerm to dependencies

    const fetchCertificates = async () => {
        setIsLoadingCertificates(true); // Changed to setIsLoadingCertificates
        setError(''); // Added setError('')
        const query = new URLSearchParams({
            page: page.toString(),
            page_size: pageSize.toString(),
            search: searchTerm,
            ordering: '-issued_at'
        }).toString();

        const { data, error: apiError, status } = await apiFetch(`/api/v1/certificates/?${query}`); // Updated apiFetch call with query

        if (apiError || status !== 200) { // Added status check
            setError(apiError || 'Failed to fetch certificates');
        } else if (data?.results && Array.isArray(data.results)) {
            setCertificates(data.results);
            setTotalCount(data.count || 0); // Set totalCount
        } else if (Array.isArray(data)) {
            setCertificates(data);
            setTotalCount(data.length); // Set totalCount for non-paginated data
        }
        setIsLoadingCertificates(false); // Changed to setIsLoadingCertificates
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        try {
            return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    if (authLoading || isLoadingCertificates) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-6 lg:px-12 py-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Certificates</h1>
                        <p className="text-gray-500">View and download your earned cybersecurity certifications.</p>
                    </div>
                    <div className="flex-1 max-w-md">
                        <Input
                            placeholder="Search certificates by ID..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        />
                    </div>
                </div>
            </div>

            {isLoadingCertificates ? (
                <div className="max-w-5xl mx-auto px-6 lg:px-12 py-20 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : error ? (
                <div className="max-w-5xl mx-auto px-6 lg:px-12 py-10">
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">{error}</div>
                </div>
            ) : (
                <div className="max-w-5xl mx-auto px-6 lg:px-12 pt-10">
                    {certificates.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="text-gray-400 mb-4">
                                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">No Certificates Found</h3>
                            <p className="text-gray-500 max-w-xs mx-auto">Complete training modules to earn your cybersecurity certifications.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                                {certificates.map(cert => (
                                    <div key={cert.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 truncate">
                                                    Certificate ID: {cert.certificate_id?.split('-')[0].toUpperCase() || 'Cybersecurity Verification'}
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-0.5">
                                                    Issued to: <span className="font-medium text-gray-700">{user?.first_name} {user?.last_name}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Issue Date</p>
                                                <p className="text-sm font-semibold text-gray-900">{formatDate(cert.issued_at)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Certificate ID</p>
                                                <p className="text-sm font-mono text-gray-600 truncate max-w-[120px]" title={cert.certificate_id}>{cert.certificate_id || '—'}</p>
                                            </div>
                                        </div>

                                        <div className="mt-6">
                                            <button className="w-full py-2.5 bg-gray-50 text-gray-700 font-bold rounded-lg border border-gray-200 hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center justify-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                Download PDF
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="mt-6 mb-20 flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
                                <span className="text-sm text-gray-500">Showing {certificates.length} of {totalCount} results</span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page <= 1 || isLoadingCertificates}
                                        onClick={() => setPage(p => p - 1)}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={certificates.length < pageSize && (page * pageSize) >= totalCount || isLoadingCertificates}
                                        onClick={() => setPage(p => p + 1)}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
