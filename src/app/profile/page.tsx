'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [profileData, setProfileData] = useState<any>({});
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState('');
    const [profileError, setProfileError] = useState('');

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        } else if (isAuthenticated) {
            fetchProfile();
        }
    }, [isAuthenticated, authLoading, router]);

    const fetchProfile = async () => {
        setIsLoadingProfile(true);
        const { data, status } = await apiFetch('/api/auth/user/background-profile/');
        if (status === 200 && data) {
            setProfileData(data);
        } else if (status === 404) {
            // Profile not created yet
            setProfileData({
                phone_number: '',
                nationality: '',
                region: '',
                age_range: '',
                gender: '',
                education_level: '',
                field_of_study: '',
                institution_name: '',
                employment_status: '',
                employer_name: '',
                unemployment_description: '',
                professional_experience: '',
                enrollment_motivation: '',
                referral_source: '',
                is_information_confirmed: true
            });
        }
        setIsLoadingProfile(false);
    };

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
        setProfileData((prev: any) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileError('');
        setProfileSuccess('');
        setIsSavingProfile(true);

        const method = profileData.id ? 'PUT' : 'POST';
        const { error, status } = await apiFetch('/api/auth/user/background-profile/', {
            method: method,
            body: JSON.stringify(profileData)
        });

        if (error || (status !== 200 && status !== 201)) {
            setProfileError(error || 'Failed to update profile.');
        } else {
            setProfileSuccess('Profile updated successfully.');
            // Re-fetch to get any ID if we POSTed
            await fetchProfile();
        }
        setIsSavingProfile(false);
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');
        setIsSavingPassword(true);

        const { error, status } = await apiFetch('/api/auth/change-password/', {
            method: 'PUT',
            body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
        });

        if (error || status !== 200) {
            setPasswordError(error || 'Failed to change password. Make sure old password is correct.');
        } else {
            setPasswordSuccess('Password changed successfully.');
            setOldPassword('');
            setNewPassword('');
        }
        setIsSavingPassword(false);
    };

    if (authLoading || isLoadingProfile) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-10">
                <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-100">
                    <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-xl font-bold text-gray-900">Background Profile</h2>
                        <p className="text-sm text-gray-500 mt-1">Update your professional and demographic information.</p>
                    </div>
                    <form className="p-6 space-y-6" onSubmit={handleProfileSubmit}>
                        {profileError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{profileError}</div>}
                        {profileSuccess && <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm">{profileSuccess}</div>}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Phone Number" name="phone_number" value={profileData.phone_number || ''} onChange={handleProfileChange} />

                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                                <select name="nationality" value={profileData.nationality || ''} onChange={handleProfileChange} className="block w-full rounded-md border border-gray-300 py-2.5 px-3 text-sm shadow-sm focus:border-primary focus:ring-primary">
                                    <option value="">Select...</option>
                                    <option value="ethiopia">Ethiopia</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                                <select name="region" value={profileData.region || ''} onChange={handleProfileChange} className="block w-full rounded-md border border-gray-300 py-2.5 px-3 text-sm shadow-sm focus:border-primary focus:ring-primary">
                                    <option value="">Select...</option>
                                    <option value="addis_ababa">Addis Ababa</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                <select name="gender" value={profileData.gender || ''} onChange={handleProfileChange} className="block w-full rounded-md border border-gray-300 py-2.5 px-3 text-sm shadow-sm focus:border-primary focus:ring-primary">
                                    <option value="">Select...</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>

                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Education Level</label>
                                <select name="education_level" value={profileData.education_level || ''} onChange={handleProfileChange} className="block w-full rounded-md border border-gray-300 py-2.5 px-3 text-sm shadow-sm focus:border-primary focus:ring-primary">
                                    <option value="">Select...</option>
                                    <option value="high_school">High School</option>
                                    <option value="bachelor">Bachelor&apos;s</option>
                                    <option value="master">Master&apos;s</option>
                                    <option value="phd">PhD</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <Input label="Field of Study" name="field_of_study" value={profileData.field_of_study || ''} onChange={handleProfileChange} />
                            <Input label="Institution Name" name="institution_name" value={profileData.institution_name || ''} onChange={handleProfileChange} />

                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Employment Status</label>
                                <select name="employment_status" value={profileData.employment_status || ''} onChange={handleProfileChange} className="block w-full rounded-md border border-gray-300 py-2.5 px-3 text-sm shadow-sm focus:border-primary focus:ring-primary">
                                    <option value="">Select...</option>
                                    <option value="full_time">Full Time</option>
                                    <option value="part_time">Part Time</option>
                                    <option value="unemployed">Unemployed</option>
                                </select>
                            </div>

                            <Input label="Employer Name" name="employer_name" value={profileData.employer_name || ''} onChange={handleProfileChange} />
                            <Input label="Professional Experience" name="professional_experience" value={profileData.professional_experience || ''} onChange={handleProfileChange} />
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input type="checkbox" id="is_info" name="is_information_confirmed" checked={profileData.is_information_confirmed || false} onChange={handleProfileChange} className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" />
                            <label htmlFor="is_info" className="text-sm text-gray-700">I confirm this information is accurate.</label>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={isSavingProfile}>
                                {isSavingProfile ? 'Saving...' : 'Save Profile'}
                            </Button>
                        </div>
                    </form>
                </div>

                <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-100">
                    <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
                        <p className="text-sm text-gray-500 mt-1">Ensure your account is using a long, random password to stay secure.</p>
                    </div>
                    <form className="p-6 space-y-6" onSubmit={handlePasswordSubmit}>
                        {passwordError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{passwordError}</div>}
                        {passwordSuccess && <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm">{passwordSuccess}</div>}

                        <div className="max-w-md space-y-5">
                            <Input label="Current Password" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
                            <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                        </div>

                        <div className="flex pt-2">
                            <Button variant="secondary" type="submit" disabled={isSavingPassword}>
                                {isSavingPassword ? 'Updating...' : 'Update Password'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
