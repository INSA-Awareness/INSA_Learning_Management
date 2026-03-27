'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getTrainingRequests, apiFetch, TrainingRequest, approveTrainingRequest, rejectTrainingRequest } from '@/lib/api';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Input } from '@/components/Input';
import { CloudinaryUpload } from '@/components/CloudinaryUpload';

// Removed local TrainingRequest interface to use the one from @/lib/api

export default function AdminTrainingRequestsPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [requests, setRequests] = useState<TrainingRequest[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        description: '',
        attachment_url: '',
        organization: ''
    });
    const [organizations, setOrganizations] = useState<any[]>([]);

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) router.push('/login');
            else if (user?.role !== 'super_admin' && user?.role !== 'org_admin') router.push('/dashboard');
            else {
                fetchAll();
                fetchOrganizations();
            }
        }
    }, [isAuthenticated, isLoading, user, router]);

    const fetchOrganizations = async () => {
        const { data } = await apiFetch('/api/v1/organizations/');
        if (data?.results) setOrganizations(data.results);
        else if (Array.isArray(data)) setOrganizations(data);
    };

    const fetchAll = async () => {
        setIsFetching(true);
        setError('');

        // Attempt to find the organization ID if the user is an org_admin
        // This helps the backend filter the results correctly if it doesn't do it automatically
        const orgId = user?.role === 'org_admin'
            ? ((user as any).organization_id || (user as any).organization || (organizations.length === 1 ? organizations[0].id : undefined))
            : undefined;

        const params: any = {};
        if (orgId) params.organization = orgId;

        const { data, error: e } = await getTrainingRequests(params);
        if (e) {
            setError(e);
        } else if (data) {
            const allRequests = data.results || (Array.isArray(data) ? data : []);
            setRequests(allRequests);
        }
        setIsFetching(false);
    };

    // Re-fetch when organizations are loaded for org_admin to ensure proper filtering
    useEffect(() => {
        if (organizations.length > 0 && user?.role === 'org_admin' && !requests.length) {
            fetchAll();
        }
    }, [organizations]);

    const handleApprove = async (id: string) => {
        setActionLoading(id);
        const { error: e, status } = await approveTrainingRequest(id);
        if (e || (status !== 200 && status !== 201)) setError(e || 'Failed to approve request.');
        else fetchAll();
        setActionLoading(null);
    };

    const handleReject = async (id: string) => {
        setActionLoading(id);
        const { error: e, status } = await rejectTrainingRequest(id);
        if (e || (status !== 200 && status !== 201)) setError(e || 'Failed to reject request.');
        else fetchAll();
        setActionLoading(null);
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading('create');

        const payload: any = {
            description: formData.description,
            organization: formData.organization,
            attachment_url: formData.attachment_url || undefined
        };

            ...payload,
        r_context: {
        user?.id,
            : user?.role,
            org_id_from_user: (user as any).organization_id || (user as any).organization,
                available_orgs_count: organizations.length,
                    first_org_id: organizations[0]?.id



        data, error: err, status
    } = await apiFetch('/api/v1/training-requests/', {
        'POST',
        ON.stringify(payload)
y;

|| status !== 201) {
        (err || (data ? JSON.stringify(data) : 'Failed to create training request.'));

        ateModalOpen(false);
        ata({ description: '', attachment_url: '', organization: '' });
        ();

        nLoading(null);
    };

    isLoading || isFetching) return <div className="flex justify-center items-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    !user || (user.role !== 'super_admin' && user.role !== 'org_admin')) return null;

    rn(
        className = "min-h-screen bg-gray-50 pb-20" >
        className="bg-white border-b border-gray-200" >
    className="max-w-7xl mx-auto px-6 lg:px-12 py-8 flex justify-between items-center" >
                >
    className="text-3xl font-bold text-gray-900 mb-1" > Training Requests</h1 >
    lassName="text-gray-500" > Review and approve organizational training requests.</p >
    v >
                >
    r?.role !== 'super_admin' && (
        ton variant = "primary" onClick = {() => setIsCreateModalOpen(true)}> Submit New Request</Button >

            v >
            v >
            v >
            className="max-w-7xl mx-auto px-6 lg:px-12 mt-10" >
                or && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">{error}</div>}
className = "space-y-4" >
    uests.length === 0 ? (
        className = "bg-white rounded-xl border border-gray-200 p-16 text-center" >
        className= "text-4xl mb-4" >📋</div >
            lassName="font-medium text-gray-900" > No training requests yet.</p >
                lassName="text-gray-500 text-sm mt-1" > Organizations can submit training requests from their portal.</p >
                    v >
                    requests.map(req => (
                        key = { req.id } className = "bg-white rounded-xl border border-gray-200 p-6" >
                        className="flex items-start justify-between gap-4" >
                    className="flex-1" >
                    className="flex items-center gap-3 mb-2" >
                    className="font-semibold text-gray-900" > { req.title || `Training Request` }</h3 >
                    n className = {`px-2 py-0.5 rounded-full text-xs font-semibold ${req.status === 'approved' ? 'bg-green-50 text-green-700' :
                        status === 'rejected' ? 'bg-red-50 text-red-700' :
                            yellow - 50 text - yellow - 700'

                                .status || 'pending'}
                        an >
                        v >
                                .description && <p className="text-sm text-gray-600 mb-3">{req.description}</p>}
                                .attachment_url && (
                            className = "mb-4" >
                                        
                                            ={ req.attachment_url }
                                            et = "_blank"
                                            "noopener noreferrer"
                                            sName = "inline-flex items-center gap-2 text-xs font-medium text-primary hover:underline bg-primary/5 px-2.5 py-1.5 rounded-lg border border-primary/10 transition-colors"
                                        
                                            n >📎</span > View Attachment
                                        
                                    v >

                        className="flex items-center gap-4 text-xs text-gray-400" >
                                    .organization_name && <span>Organization: <strong>{req.organization_name}</strong></span>}
                                    .created_at && <span>{new Date(req.created_at).toLocaleDateString()}</span>}
                        v >
                        v >
                        q.status === 'pending' || !req.status) && user?.role === 'super_admin' && (
                        className = "flex gap-2 shrink-0" >
                        ton
                                        ant = "primary"
bled = {!!actionLoading}
ick = {() => handleApprove(req.id)}

ionLoading === req.id ? '...' : 'Approve'}
tton >
    ton
ant = "outline"
sName = "text-red-500 hover:text-red-700 border-red-200 hover:border-red-300"
bled = {!!actionLoading}
ick = {() => handleReject(req.id)}

ct
tton >
    v >

    v >
    v >

    v >
    v >

    al
en = { isCreateModalOpen }
ose = {() => setIsCreateModalOpen(false)}
e = "Submit Training Request"
        
            m onSubmit = { handleCreateSubmit } className = "space-y-4" >
                >
    el className = "block text-sm font-semibold text-gray-700 mb-1" >
        nization
bel >
    ect
sName = "w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200"
e = { formData.organization }
ange = {(e) => setFormData({ ...formData, organization: e.target.value })}
ired
                    
                        ion value = "" > Select Organization</option >
    anizations.map(org => (
        ion key = { org.id } value = { org.id } > { org.name }</option >

        lect >
        v >

                >
    el className = "block text-sm font-semibold text-gray-700 mb-1" >
    ription
                    bel >
        tarea
                        sName = "w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200 min-h-[120px]"
                        eholder = "Describe the training requirements..."
                        e = { formData.description }
                        ange = {(e) => setFormData({ ...formData, description: e.target.value })}
        ired
                    
                v >

        className="space-y-1" >
    el className = "block text-sm font-semibold text-gray-700 mb-1" >
    orting Document(Optional PDF)
                    bel >
        udinaryUpload
                        loadSuccess = {(url) => setFormData({ ...formData, attachment_url: url })}

        mData.attachment_url && (
            lassName = "text-[10px] text-green-600 font-medium" > File uploaded successfully ✓</p >

            v >

    className="pt-4 flex justify-end gap-3" >
    ton type = "button" variant = "outline" onClick = {() => setIsCreateModalOpen(false)} disabled = {!!actionLoading}>
    el
                    tton >
        ton type = "submit" variant = "primary" disabled = {!!actionLoading}>
            ionLoading === 'create' ? 'Submitting...' : 'Submit Request'}
        tton >
        v >
        rm >
        dal >
        v >

}
