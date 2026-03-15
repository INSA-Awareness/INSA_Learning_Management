'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

interface HeaderProps {
    rightAction?: React.ReactNode;
}

const adminGroups = [
    {
        label: 'Content',
        links: [
            { label: 'Courses', href: '/admin/courses' },
            { label: 'Modules', href: '/admin/modules' },
            { label: 'Lessons', href: '/admin/lessons' },
            { label: 'Videos', href: '/admin/videos' },
            { label: 'Articles', href: '/admin/articles' },
            { label: 'Resources', href: '/admin/resources' },
        ]
    },
    {
        label: 'Users & Orgs',
        links: [
            { label: 'Users', href: '/admin/users' },
            { label: 'Organizations', href: '/admin/organizations' },
            { label: 'Memberships', href: '/admin/memberships' },
            { label: 'Training Requests', href: '/admin/training-requests' },
            { label: 'Payment Approvals', href: '/admin/payment-approvals' },
        ]
    },
    {
        label: 'Engagement',
        links: [
            { label: 'Campaigns', href: '/admin/campaigns' },
            { label: 'Assessments', href: '/admin/assessments' },
            { label: 'Reports', href: '/admin/reports' },
            { label: 'Alerts', href: '/admin/alerts' },
        ]
    }
];

const NavDropdown: React.FC<{ label: string, links: { label: string, href: string }[], active: boolean }> = ({ label, links, active }) => {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    return (
        <div
            className="relative group"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <button
                className={`flex items-center gap-1 hover:text-primary transition-colors py-2 ${active ? 'text-primary font-semibold' : ''}`}
            >
                {label}
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 mt-0 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-[60]">
                    {links.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center px-4 py-2 text-sm hover:bg-gray-50 hover:text-primary transition-colors ${pathname === link.href ? 'text-primary font-semibold' : 'text-gray-700'}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export const Header: React.FC<HeaderProps> = ({ rightAction }) => {
    const { user, isAuthenticated, logout } = useAuth();
    const pathname = usePathname();

    const isAdmin = user?.role === 'super_admin' || user?.role === 'org_admin';

    return (
        <header className="w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:px-12 sticky top-0 z-50">
            <div className="flex items-center gap-2">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center border border-gray-200">
                        <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        </div>
                    </div>
                    <span className="font-bold text-lg text-gray-900 tracking-tight">CyberSafe Nation</span>
                </Link>
            </div>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                {/* Standard Learner Links - Hiddden for Admin */}
                {!isAdmin && (
                    <>
                        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                        {isAuthenticated && <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>}
                        <Link href="/training" className="hover:text-primary transition-colors">Training</Link>
                        <Link href="/resources" className="hover:text-primary transition-colors">Resources</Link>
                        <Link href="/tools" className="hover:text-primary transition-colors">Tools</Link>
                        <Link href="/alerts" className="hover:text-primary transition-colors">Alerts</Link>
                        <Link href="/campaigns" className="hover:text-primary transition-colors">Campaigns</Link>
                        {isAuthenticated && <Link href="/certificates" className="hover:text-primary transition-colors">Certificates</Link>}
                        {isAuthenticated && <Link href="/notifications" className="hover:text-primary transition-colors">Notifications</Link>}
                        <Link href="/about" className="hover:text-primary transition-colors">About</Link>
                        <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
                    </>
                )}

                {/* Admin Categorized Dropdowns */}
                {isAuthenticated && isAdmin && (
                    <>
                        <Link href="/admin" className={`hover:text-primary transition-colors ${pathname === '/admin' ? 'text-primary font-bold' : ''}`}>Admin Dashboard</Link>
                        {adminGroups.map(group => (
                            <NavDropdown
                                key={group.label}
                                label={group.label}
                                links={group.links}
                                active={group.links.some(l => pathname?.startsWith(l.href))}
                            />
                        ))}
                    </>
                )}
            </nav>

            <div className="flex items-center gap-4">
                {rightAction || (
                    isAuthenticated ? (
                        <div className="flex items-center gap-4">
                            <Link href="/profile" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">Profile</Link>
                            <button onClick={logout} className="text-sm font-medium text-primary hover:transition-colors border border-primary px-4 py-1.5 rounded-full cursor-pointer">
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
