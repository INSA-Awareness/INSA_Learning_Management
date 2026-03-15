'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const SELECT_CLS = "block w-full rounded-md border border-gray-300 py-2.5 px-3 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none bg-white";

function SelectField({ label, name, value, onChange, options }: {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
}) {
    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <select name={name} value={value} onChange={onChange} className={SELECT_CLS}>
                <option value="">Select...</option>
                {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
        </div>
    );
}

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
            setProfileData({
                phone_number: '', nationality: '', region: '', age_range: '',
                gender: '', education_level: '', field_of_study: '', institution_name: '',
                employment_status: '', employer_name: '', unemployment_description: '',
                professional_experience: '', enrollment_motivation: '', referral_source: '',
                is_information_confirmed: true
            });
        }
        setIsLoadingProfile(false);
    };

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
        setProfileData((prev: any) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileError(''); setProfileSuccess(''); setIsSavingProfile(true);
        const method = profileData.id ? 'PUT' : 'POST';
        const { error, status } = await apiFetch('/api/auth/user/background-profile/', {
            method, body: JSON.stringify(profileData)
        });
        if (error || (status !== 200 && status !== 201)) {
            setProfileError(error || 'Failed to update profile.');
        } else {
            setProfileSuccess('Profile updated successfully.');
            await fetchProfile();
        }
        setIsSavingProfile(false);
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(''); setPasswordSuccess(''); setIsSavingPassword(true);
        const { error, status } = await apiFetch('/api/auth/change-password/', {
            method: 'PUT',
            body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
        });
        if (error || status !== 200) {
            setPasswordError(error || 'Failed to change password. Make sure old password is correct.');
        } else {
            setPasswordSuccess('Password changed successfully.');
            setOldPassword(''); setNewPassword('');
        }
        setIsSavingPassword(false);
    };

    if (authLoading || isLoadingProfile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-10">
                {/* Background Profile */}
                <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-100">
                    <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-xl font-bold text-gray-900">Background Profile</h2>
                        <p className="text-sm text-gray-500 mt-1">Update your professional and demographic information.</p>
                    </div>
                    <form className="p-6 space-y-6" onSubmit={handleProfileSubmit}>
                        {profileError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">{profileError}</div>}
                        {profileSuccess && <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm border border-green-100">{profileSuccess}</div>}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Phone Number" name="phone_number" value={profileData.phone_number || ''} onChange={handleProfileChange} required />

                            <SelectField
                                label="Nationality" name="nationality" value={profileData.nationality || ''} onChange={handleProfileChange}
                                options={[{ value: 'ET', label: 'Ethiopian' }, { value: 'other', label: 'Other' }]}
                            />

                            <SelectField
                                label="Region" name="region" value={profileData.region || ''} onChange={handleProfileChange}
                                options={[
                                    { value: 'addis_ababa', label: 'Addis Ababa' },
                                    { value: 'afar', label: 'Afar' },
                                    { value: 'amhara', label: 'Amhara' },
                                    { value: 'benishangul_gumuz', label: 'Benishangul-Gumuz' },
                                    { value: 'dire_dawa', label: 'Dire Dawa' },
                                    { value: 'gambella', label: 'Gambella' },
                                    { value: 'harari', label: 'Harari' },
                                    { value: 'oromia', label: 'Oromia' },
                                    { value: 'sidama', label: 'Sidama' },
                                    { value: 'somali', label: 'Somali' },
                                    { value: 'snnpr', label: 'SNNPR' },
                                    { value: 'tigray', label: 'Tigray' },
                                    { value: 'other', label: 'Other' },
                                ]}
                            />

                            <SelectField
                                label="Age Range" name="age_range" value={profileData.age_range || ''} onChange={handleProfileChange}
                                options={[
                                    { value: 'under_18', label: 'Under 18' },
                                    { value: '18_24', label: '18–24' },
                                    { value: '25_34', label: '25–34' },
                                    { value: '35_44', label: '35–44' },
                                    { value: '45_54', label: '45–54' },
                                    { value: '55_plus', label: '55+' },
                                ]}
                            />

                            <SelectField
                                label="Gender" name="gender" value={profileData.gender || ''} onChange={handleProfileChange}
                                options={[
                                    { value: 'male', label: 'Male' },
                                    { value: 'female', label: 'Female' },
                                    { value: 'prefer_not_to_say', label: 'Prefer not to say' },
                                ]}
                            />

                            <SelectField
                                label="Education Level" name="education_level" value={profileData.education_level || ''} onChange={handleProfileChange}
                                options={[
                                    { value: 'high_school', label: 'High School' },
                                    { value: 'bachelor', label: "Bachelor's Degree" },
                                    { value: 'master', label: "Master's Degree" },
                                    { value: 'phd', label: 'PhD' },
                                    { value: 'other', label: 'Other' },
                                ]}
                            />

                            <SelectField
                                label="Field of Study" name="field_of_study" value={profileData.field_of_study || ''} onChange={handleProfileChange}
                                options={[
                                    { value: 'agriculture', label: 'Agriculture' },
                                    { value: 'arts', label: 'Arts' },
                                    { value: 'business', label: 'Business' },
                                    { value: 'cs_it', label: 'Computer Science & IT' },
                                    { value: 'education', label: 'Education' },
                                    { value: 'engineering', label: 'Engineering' },
                                    { value: 'humanities', label: 'Humanities' },
                                    { value: 'law', label: 'Law' },
                                    { value: 'medicine', label: 'Medicine' },
                                    { value: 'natural_science', label: 'Natural Science' },
                                    { value: 'social_science', label: 'Social Science' },
                                    { value: 'other', label: 'Other' },
                                ]}
                            />

                            <Input label="Institution Name" name="institution_name" value={profileData.institution_name || ''} onChange={handleProfileChange} />

                            <SelectField
                                label="Employment Status" name="employment_status" value={profileData.employment_status || ''} onChange={handleProfileChange}
                                options={[
                                    { value: 'full_time', label: 'Full-time Employee' },
                                    { value: 'part_time', label: 'Part-time Employee' },
                                    { value: 'freelancer', label: 'Freelancer' },
                                    { value: 'entrepreneur', label: 'Entrepreneur' },
                                    { value: 'student', label: 'Student' },
                                    { value: 'unemployed', label: 'Unemployed' },
                                    { value: 'other', label: 'Other' },
                                ]}
                            />

                            <Input label="Employer Name" name="employer_name" value={profileData.employer_name || ''} onChange={handleProfileChange} />

                            <SelectField
                                label="Professional Experience" name="professional_experience" value={profileData.professional_experience || ''} onChange={handleProfileChange}
                                options={[
                                    { value: 'none', label: 'No Experience' },
                                    { value: '1_3', label: '1–3 Years' },
                                    { value: '3_5', label: '3–5 Years' },
                                    { value: '5_10', label: '5–10 Years' },
                                    { value: '10_plus', label: '10+ Years' },
                                ]}
                            />

                            <SelectField
                                label="Enrollment Motivation" name="enrollment_motivation" value={profileData.enrollment_motivation || ''} onChange={handleProfileChange}
                                options={[
                                    { value: 'new_job', label: 'Start a new job' },
                                    { value: 'promotion', label: 'Get promotion or raise' },
                                    { value: 'new_skill', label: 'Learn new skill' },
                                    { value: 'advanced_degree', label: 'Prepare for advanced degree' },
                                    { value: 'start_business', label: 'Start business' },
                                    { value: 'interest', label: 'General interest' },
                                    { value: 'internship', label: 'Internship preparation' },
                                    { value: 'other', label: 'Other' },
                                ]}
                            />

                            <SelectField
                                label="Referral Source" name="referral_source" value={profileData.referral_source || ''} onChange={handleProfileChange}
                                options={[
                                    { value: 'social_media', label: 'Social Media' },
                                    { value: 'friend_family', label: 'Friend or Family' },
                                    { value: 'employer', label: 'Employer' },
                                    { value: 'search_engine', label: 'Search Engine' },
                                    { value: 'government', label: 'Government Communication' },
                                    { value: 'other', label: 'Other' },
                                ]}
                            />
                        </div>

                        {profileData.employment_status === 'unemployed' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Unemployment Description</label>
                                <textarea
                                    name="unemployment_description"
                                    value={profileData.unemployment_description || ''}
                                    onChange={(e) => setProfileData((prev: any) => ({ ...prev, unemployment_description: e.target.value }))}
                                    className="block w-full rounded-md border border-gray-300 py-2.5 px-3 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-y min-h-[80px]"
                                    placeholder="Briefly describe your situation..."
                                />
                            </div>
                        )}

                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox" id="is_info" name="is_information_confirmed"
                                checked={profileData.is_information_confirmed || false}
                                onChange={handleProfileChange}
                                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <label htmlFor="is_info" className="text-sm text-gray-700">I confirm this information is accurate.</label>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button variant="secondary" type="submit" disabled={isSavingProfile}>
                                {isSavingProfile ? 'Saving...' : 'Save Profile'}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Gamification Stats */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex gap-8 items-center">
                    <div className="text-center">
                        <span className="block text-2xl font-bold text-primary">1,250</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Awareness Points</span>
                    </div>
                    <div className="h-10 w-px bg-gray-100"></div>
                    <div className="flex-1 flex gap-3 overflow-x-auto pb-2">
                        <div className="px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg text-xs font-bold whitespace-nowrap border border-yellow-100 flex items-center gap-2">
                            🏅 Phishing Hunter
                        </div>
                        <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold whitespace-nowrap border border-blue-100 flex items-center gap-2">
                            🛡️ Password Shield
                        </div>
                        <div className="px-3 py-1.5 bg-gray-50 text-gray-400 rounded-lg text-xs font-bold whitespace-nowrap border border-gray-100 flex items-center gap-2 italic">
                            🔒 Locked: Secure Citizen
                        </div>
                    </div>
                </div>

                {/* Change Password */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
                        <p className="text-sm text-gray-500 mt-1">Ensure your account is using a long, random password to stay secure.</p>
                    </div>
                    <form className="p-6 space-y-6" onSubmit={handlePasswordSubmit}>
                        {passwordError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">{passwordError}</div>}
                        {passwordSuccess && <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm border border-green-100">{passwordSuccess}</div>}
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
