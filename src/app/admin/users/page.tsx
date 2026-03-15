'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';

interface UserData {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    is_active: boolean;
    date_joined?: string;
}

export default function AdminUsersPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<UserData[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState('');
    const [actionError, setActionError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        role: 'user'
    });

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (user?.role !== 'super_admin' && user?.role !== 'org_admin') {
                // Ensure only admins can access this page
                router.push('/dashboard');
            } else {
                fetchUsers();
            }
        }
    }, [isAuthenticated, isLoading, user, router]);

    const fetchUsers = async () => {
        setIsFetching(true);
        setError('');
        const { data, error: apiError, status } = await apiFetch('/api/auth/users/');

        if (apiError || status !== 200) {
            setError(apiError || 'Failed to fetch users');
        } else if (Array.isArray(data)) {
            // Sometimes DRF returns paginated results { count, next, previous, results: [] }
            setUsers(data);
        } else if (data && Array.isArray(data.results)) {
            setUsers(data.results);
        }
        setIsFetching(false);
    };

    const handleOpenModal = (user?: UserData) => {
        setActionError('');
        if (user) {
            setSelectedUser(user);
            setFormData({
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                password: '', // Leave blank for edit unless changing
                role: user.role || 'user'
            });
        } else {
            setSelectedUser(null);
            setFormData({ first_name: '', last_name: '', email: '', password: '', role: 'user' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionError('');
        setIsActionLoading(true);

        const isEditing = !!selectedUser;
        let endpoint = `/api/auth/users/${isEditing ? `${selectedUser.id}/` : ''}`;
        let method = isEditing ? 'PATCH' : 'POST';

        // Role-specific creation endpoints mapped from user requirements
        if (!isEditing) {
            switch (formData.role) {
                case 'course_provider':
                    endpoint = '/api/auth/users/course-providers/';
                    break;
                case 'member':
                    endpoint = '/api/auth/users/members/';
                    break;
                case 'org_admin':
                    endpoint = '/api/auth/users/org-admins/';
                    break;
                case 'super_admin':
                    endpoint = '/api/auth/users/super-admins/';
                    break;
                default:
                    // Regular users
                    endpoint = '/api/auth/users/';
                    break;
            }
        }

        const payload: any = {
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
        };

        if (formData.password) {
            payload.password = formData.password;
        }

        // If editing, we also want to send the role if it was changed
        if (isEditing) {
            payload.role = formData.role;
        }

        const { error: apiError, status } = await apiFetch(endpoint, {
            method,
            body: JSON.stringify(payload)
        });

        if (apiError || (status !== 200 && status !== 201)) {
            setActionError(apiError || `Failed to ${isEditing ? 'update' : 'create'} user.`);
        } else {
            // Success
            fetchUsers();
            handleCloseModal();
        }
        setIsActionLoading(false);
    };

    const handleDeleteUser = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        setError('');

        const { error: apiError, status } = await apiFetch(`/api/auth/users/${id}/`, {
            method: 'DELETE'
        });

        if (apiError || status !== 204) {
            setError(apiError || 'Failed to delete user.');
        } else {
            fetchUsers();
        }
    };

    if (isLoading || isFetching) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user || (user.role !== 'super_admin' && user.role !== 'org_admin')) return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
                        <p className="text-gray-500">Manage all registered users, permissions, and roles.</p>
                    </div>
                    <div>
                        <Button variant="primary" onClick={() => handleOpenModal()}>Add New User</Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-10">
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">
                        {error}
                    </div>
                )}

                {/* User Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-500">
                            <thead className="bg-gray-50 text-gray-700 uppercase font-semibold text-xs border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            No users found.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((u) => (
                                        <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {u.first_name} {u.last_name}
                                            </td>
                                            <td className="px-6 py-4">{u.email}</td>
                                            <td className="px-6 py-4">
                                                <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-medium border border-blue-100 uppercase">
                                                    {u.role ? u.role.replace('_', ' ') : 'USER'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${u.is_active ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                                    {u.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => handleOpenModal(u)} className="text-secondary hover:text-primary font-medium mr-3">Edit</button>
                                                <button onClick={() => handleDeleteUser(u.id)} className="text-red-500 hover:text-red-700 font-medium">Delete</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={selectedUser ? "Edit User" : "Add New User"}
            >
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    {actionError && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                            {actionError}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="First Name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                            required
                            disabled={isActionLoading}
                        />
                        <Input
                            label="Last Name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                            required
                            disabled={isActionLoading}
                        />
                    </div>

                    <Input
                        label="Email Address"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        disabled={isActionLoading}
                    />

                    <Input
                        label={selectedUser ? "New Password (Optional)" : "Password"}
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required={!selectedUser}
                        disabled={isActionLoading}
                    />

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            User Role
                        </label>
                        <select
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200"
                            value={formData.role || 'user'}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            disabled={isActionLoading}
                        >
                            <option value="user">Regular User</option>
                            <option value="member">Member</option>
                            <option value="course_provider">Course Provider</option>
                            <option value="org_admin">Organization Admin</option>
                            <option value="super_admin">Super Admin</option>
                        </select>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={handleCloseModal} disabled={isActionLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={isActionLoading}>
                            {isActionLoading ? 'Saving...' : selectedUser ? 'Save Changes' : 'Create User'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
