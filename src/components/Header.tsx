'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
    rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ rightAction }) => {
    const { user, isAuthenticated, logout } = useAuth();

    return (
        <header className="w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:px-12 sticky top-0 z-50">
            <div className="flex items-center gap-2">
                <Link href="/" className="flex items-center gap-2">
                    {/* Mock Logo Icon */}
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center border border-gray-200">
                        <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        </div>
                    </div>
                    <span className="font-bold text-lg text-gray-900 tracking-tight">CyberSafe Nation</span>
                </Link>
            </div>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                {!isAuthenticated && <Link href="/" className="hover:text-primary transition-colors">Home</Link>}
                {isAuthenticated && <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>}
                {isAuthenticated && (user?.role === 'super_admin' || user?.role === 'org_admin') && (
                    <Link href="/admin/users" className="hover:text-primary transition-colors">Admin Panel</Link>
                )}
                <Link href="/training" className="hover:text-primary transition-colors">Training</Link>
                <Link href="/resources" className="hover:text-primary transition-colors">Resources</Link>
                <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
                <Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
            </nav>

            <div className="flex items-center gap-4">
                {rightAction || (
                    isAuthenticated ? (
                        <div className="flex items-center gap-4">
                            <Link href="/profile" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">Profile</Link>
                            <button onClick={logout} className="text-sm font-medium text-primary hover:underline transition-colors border border-primary px-4 py-1.5 rounded-full">
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link href="/login" className="text-sm font-medium bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-full transition-colors shadow-sm">
                            Sign In
                        </Link>
                    )
                )}
            </div>
        </header>
    );
};
