import React from 'react';
import Link from 'next/link';

interface HeaderProps {
    rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ rightAction }) => {
    return (
        <header className="w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:px-12 sticky top-0 z-50">
            <div className="flex items-center gap-2">
                <Link href="/" className="flex items-center gap-2">
                    {/* Mock Logo Icon */}
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center border border-gray-200">
                        <div className="w-4 h-4 rounded-full border-2 border-brand-red flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-brand-red rounded-full" />
                        </div>
                    </div>
                    <span className="font-bold text-lg text-gray-900 tracking-tight">CyberSafe Nation</span>
                </Link>
            </div>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                <Link href="/" className="hover:text-brand-red transition-colors">Home</Link>
                <Link href="/training" className="hover:text-brand-red transition-colors">Training</Link>
                <Link href="/resources" className="hover:text-brand-red transition-colors">Resources</Link>
                <Link href="/about" className="hover:text-brand-red transition-colors">About Us</Link>
                <Link href="/contact" className="hover:text-brand-red transition-colors">Contact Us</Link>
            </nav>

            <div className="flex items-center">
                {rightAction || (
                    <Link href="/login" className="text-sm font-medium bg-brand-red hover:bg-[#b01e1e] text-white px-5 py-2.5 rounded-full transition-colors shadow-sm">
                        Sign In
                    </Link>
                )}
            </div>
        </header>
    );
};
