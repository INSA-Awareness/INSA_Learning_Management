'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ConfirmModal } from './ConfirmModal';

interface HeaderProps {
    rightAction?: React.ReactNode;
}

const adminGroups = [
    {
        label: 'Content',
        roles: ['super_admin', 'course_provider'],
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
        roles: ['super_admin', 'org_admin'],
        links: [
            { label: 'Users', href: '/admin/users' },
            { label: 'Organizations', href: '/admin/organizations', roles: ['super_admin'] },
            { label: 'Training Requests', href: '/admin/training-requests' },
            { label: 'Payment Approvals', href: '/admin/payment-approvals', roles: ['super_admin'] },
        ]
    },
    {
        label: 'Engagement',
        roles: ['super_admin', 'org_admin', 'course_provider'],
        links: [
            { label: 'Campaigns', href: '/admin/campaigns', roles: ['super_admin', 'org_admin'] },
            { label: 'Assessments', href: '/admin/assessments', roles: ['super_admin', 'course_provider'] },
            { label: 'Reports', href: '/admin/reports', roles: ['super_admin', 'org_admin'] },
            { label: 'Alerts', href: '/admin/alerts', roles: ['super_admin'] },
            { label: 'Awareness Tools', href: '/admin/awareness-tools', roles: ['super_admin'] },
            { label: 'Audit Logs', href: '/admin/audit-logs', roles: ['super_admin'] },
        ]
    }
];

const NavLink = ({ href, children, exact = false }: { href: string, children: React.ReactNode, exact?: boolean }) => {
    const pathname = usePathname();
    const isActive = exact ? pathname === href : (pathname === href || pathname?.startsWith(href + '/'));

    return (
        <Link href={href} className={`relative py-2 hover:text-primary transition-colors ${isActive ? 'text-primary font-bold' : ''}`}>
            {children}
            {isActive && (
                <motion.div
                    layoutId="navbar-underline"
                    className="absolute left-0 right-0 -bottom-1 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            )}
        </Link>
    );
};

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
                className={`flex items-center gap-1 hover:text-primary transition-colors py-2 relative ${active ? 'text-primary font-bold' : ''}`}
            >
                {label}
                {active && (
                    <motion.div
                        layoutId="navbar-underline"
                        className="absolute left-0 right-0 -bottom-1 h-0.5 bg-primary rounded-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                )}
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
    const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);

    const isSystemAdmin = user?.role === 'super_admin';
    const isOrgAdmin = user?.role === 'org_admin';
    const isCourseProvider = user?.role === 'course_provider';
    const isAnyAdmin = isSystemAdmin || isOrgAdmin || isCourseProvider;

    const handleLogout = () => {
        setIsLogoutModalOpen(true);
    };

    const confirmLogout = () => {
        logout();
        setIsLogoutModalOpen(false);
    };

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
                {!isAnyAdmin && (
                    <>
                        {!isAuthenticated && <NavLink href="/" exact>Home</NavLink>}
                        {isAuthenticated && <NavLink href="/dashboard">Dashboard</NavLink>}
                        <NavLink href="/courses">Courses</NavLink>
                        <NavLink href="/resources">Resources</NavLink>
                        <NavLink href="/tools">Tools</NavLink>
                        <NavLink href="/alerts">Alerts</NavLink>
                        <NavLink href="/campaigns">Campaigns</NavLink>
                        {isAuthenticated && <NavLink href="/certificates">Certificates</NavLink>}
                        {isAuthenticated && <NavLink href="/notifications">Notifications</NavLink>}
                    </>
                )}

                {/* Admin Categorized Dropdowns */}
                {isAuthenticated && isAnyAdmin && (
                    <>
                        <Link href="/admin" className={`relative py-2 hover:text-primary transition-colors ${pathname === '/admin' ? 'text-primary font-bold' : ''}`}>
                            {user.role === 'super_admin' ? 'Admin Dashboard' : user.role === 'org_admin' ? 'Org Dashboard' : 'Provider Dashboard'}
                            {pathname === '/admin' && (
                                <motion.div
                                    layoutId="navbar-underline"
                                    className="absolute left-0 right-0 -bottom-1 h-0.5 bg-primary rounded-full"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </Link>
                        {adminGroups
                            .filter(group => !group.roles || group.roles.includes(user.role))
                            .map(group => {
                                const filteredLinks = group.links.filter(link => !link.roles || link.roles.includes(user.role));
                                if (filteredLinks.length === 0) return null;

                                return (
                                    <NavDropdown
                                        key={group.label}
                                        label={group.label}
                                        links={filteredLinks}
                                        active={filteredLinks.some(l => pathname?.startsWith(l.href))}
                                    />
                                );
                            })
                        }
                    </>
                )}
            </nav>

            <div className="flex items-center gap-4">
                {rightAction || (
                    isAuthenticated ? (
                        <div className="flex items-center gap-4">
                            <Link href="/profile" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">Profile</Link>
                            <button onClick={handleLogout} className="text-sm font-medium text-primary hover:transition-colors border border-primary px-4 py-1.5 rounded-full cursor-pointer">
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
            <ConfirmModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={confirmLogout}
                title="Log Out"
                message="Are you sure you want to log out of your account?"
                confirmText="Log Out"
                variant="danger"
            />
        </header>
    );
};
