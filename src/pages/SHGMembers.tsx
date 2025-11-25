import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import {
  fetchSHGMembers,
  createSHGMember,
  updateSHGMember,
  deleteSHGMember,
  clearError,
} from '../store/shgMemberSlice';
import type { RootState, AppDispatch } from '../store/store';
import type { SHGMember, CreateSHGMemberInput, UpdateSHGMemberInput, MemberRole } from '../store/shgMemberSlice';
import type { SHG } from '../store/shgSlice';
import { getApiUrl, API_ENDPOINTS } from '../store/config';

const SHGMembers: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const shgIdParam = searchParams.get('shgId');
  
  const { members, loading, error } = useSelector((state: RootState) => state.shgMembers);
  const { user } = useSelector((state: RootState) => state.auth);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<SHGMember | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedSHGId, setSelectedSHGId] = useState<string>(shgIdParam || '');
  const [uploadingDocs, setUploadingDocs] = useState<Record<string, boolean>>({});
  const [shgSearchQuery, setShgSearchQuery] = useState<string>('');
  const [allSHGs, setAllSHGs] = useState<SHG[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<CreateSHGMemberInput>({
    shgId: shgIdParam || '',
    name: '',
    phoneNumber: '',
    role: 'member',
    aadharCardFront: '',
    aadharCardBack: '',
    panCard: '',
    voidIdCard: '',
    homeRentalAgreement: '',
  });

  // Fetch all SHGs for dropdown (with high limit to get all)
  useEffect(() => {
    if (user && (user.role === 'owner' || user.role === 'front_desk' || user.role === 'field_officer')) {
      const fetchAllSHGs = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;

          // Fetch all SHGs with a high limit
          const response = await fetch(getApiUrl(`${API_ENDPOINTS.SHGS}?page=1&limit=1000`), {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const result = await response.json();
            setAllSHGs(result.data.shgs);
          }
        } catch (err) {
          console.error('Error fetching all SHGs:', err);
        }
      };

      fetchAllSHGs();
      
      if (selectedSHGId) {
        dispatch(fetchSHGMembers(selectedSHGId));
      }
    }
  }, [dispatch, user, selectedSHGId]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleFileUpload = async (file: File, _docType: string): Promise<string> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(getApiUrl(API_ENDPOINTS.FILES.UPLOAD), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload file');
    }

    const result = await response.json();
    return result.data.url;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please upload an image (JPEG, PNG, GIF, WebP) or PDF.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size too large. Maximum size is 5MB.');
      return;
    }

    setUploadingDocs({ ...uploadingDocs, [docType]: true });
    try {
      const url = await handleFileUpload(file, docType);
      setFormData({ ...formData, [docType]: url });
    } catch (err: any) {
      alert(`Error uploading ${docType}: ${err.message}`);
    } finally {
      setUploadingDocs({ ...uploadingDocs, [docType]: false });
    }
  };

  const handleAdd = () => {
    if (!selectedSHGId) {
      alert('Please select an SHG first');
      return;
    }
    setSelectedMember(null);
    setFormData({
      shgId: selectedSHGId,
      name: '',
      phoneNumber: '',
      role: 'member',
      aadharCardFront: '',
      aadharCardBack: '',
      panCard: '',
      voidIdCard: '',
      homeRentalAgreement: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (member: SHGMember) => {
    setSelectedMember(member);
    setFormData({
      shgId: member.shgId,
      name: member.name,
      phoneNumber: member.phoneNumber,
      role: member.role,
      aadharCardFront: member.aadharCardFront,
      aadharCardBack: member.aadharCardBack,
      panCard: member.panCard,
      voidIdCard: member.voidIdCard,
      homeRentalAgreement: member.homeRentalAgreement || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedMember) {
        const { shgId, ...updateData } = formData;
        await dispatch(updateSHGMember({ id: selectedMember.id, data: updateData as UpdateSHGMemberInput })).unwrap();
      } else {
        await dispatch(createSHGMember(formData)).unwrap();
      }
      setIsModalOpen(false);
      setSelectedMember(null);
      if (selectedSHGId) {
        dispatch(fetchSHGMembers(selectedSHGId));
      }
    } catch (err) {
      console.error('Error saving member:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteSHGMember(id)).unwrap();
      setDeleteConfirm(null);
      if (selectedSHGId) {
        dispatch(fetchSHGMembers(selectedSHGId));
      }
    } catch (err) {
      console.error('Error deleting member:', err);
    }
  };

  const getRoleBadgeColor = (role: MemberRole) => {
    switch (role) {
      case 'pratini1':
        return 'bg-purple-100 text-purple-800';
      case 'pratini2':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = (role: MemberRole) => {
    switch (role) {
      case 'pratini1':
        return 'Pratini 1';
      case 'pratini2':
        return 'Pratini 2';
      default:
        return 'Member';
    }
  };

  if (user && user.role !== 'owner' && user.role !== 'front_desk' && user.role !== 'field_officer') {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">You don't have permission to access this page.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">SHG Members</h1>
            <p className="mt-1 text-sm text-gray-500">Manage SHG members and their documents</p>
          </div>
          {(user?.role === 'owner' || user?.role === 'front_desk') && (
            <button
              onClick={handleAdd}
              disabled={!selectedSHGId}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Member
            </button>
          )}
        </div>

        {/* SHG Selector with Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-900 mb-3">Select SHG</label>
          <div className="relative" ref={dropdownRef}>
            {/* Selected SHG Display / Search Input */}
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-indigo-500 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {selectedSHGId ? (
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {allSHGs.find(s => s.id === selectedSHGId)?.shgName || 'Select an SHG'}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {allSHGs.find(s => s.id === selectedSHGId)?.branch}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <svg
                        className="h-5 w-5 text-gray-400 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span className="text-gray-500">Search or select an SHG...</span>
                    </div>
                  )}
                </div>
                <svg
                  className={`h-5 w-5 text-gray-400 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-hidden">
                {/* Search Input */}
                <div className="p-3 border-b border-gray-200 bg-gray-50">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by name, branch, or address..."
                      value={shgSearchQuery}
                      onChange={(e) => setShgSearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      autoFocus
                    />
                    <svg
                      className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {shgSearchQuery && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShgSearchQuery('');
                        }}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Results Count */}
                {shgSearchQuery && (
                  <div className="px-4 py-2 bg-indigo-50 border-b border-indigo-100">
                    <p className="text-xs font-medium text-indigo-700">
                      {allSHGs.filter((shg) => {
                        const query = shgSearchQuery.toLowerCase();
                        return (
                          shg.shgName.toLowerCase().includes(query) ||
                          shg.branch.toLowerCase().includes(query) ||
                          shg.shgAddress.toLowerCase().includes(query)
                        );
                      }).length} of {allSHGs.length} SHGs found
                    </p>
                  </div>
                )}

                {/* SHG List */}
                <div className="overflow-y-auto max-h-64">
                  {allSHGs
                    .filter((shg) => {
                      if (!shgSearchQuery) return true;
                      const query = shgSearchQuery.toLowerCase();
                      return (
                        shg.shgName.toLowerCase().includes(query) ||
                        shg.branch.toLowerCase().includes(query) ||
                        shg.shgAddress.toLowerCase().includes(query)
                      );
                    })
                    .length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      No SHGs found matching your search
                    </div>
                  ) : (
                    allSHGs
                      .filter((shg) => {
                        if (!shgSearchQuery) return true;
                        const query = shgSearchQuery.toLowerCase();
                        return (
                          shg.shgName.toLowerCase().includes(query) ||
                          shg.branch.toLowerCase().includes(query) ||
                          shg.shgAddress.toLowerCase().includes(query)
                        );
                      })
                      .map((shg) => (
                        <div
                          key={shg.id}
                          onClick={() => {
                            setSelectedSHGId(shg.id);
                            setIsDropdownOpen(false);
                            setShgSearchQuery('');
                            dispatch(fetchSHGMembers(shg.id));
                          }}
                          className={`px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors ${
                            selectedSHGId === shg.id
                              ? 'bg-indigo-50 border-indigo-200'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">{shg.shgName}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                <span className="inline-flex items-center mr-3">
                                  <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  {shg.branch}
                                </span>
                                <span className="inline-flex items-center">
                                  <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                  </svg>
                                  {shg.numberOfMembers} members
                                </span>
                              </div>
                              {shg.shgAddress && (
                                <div className="text-xs text-gray-400 mt-1 truncate">{shg.shgAddress}</div>
                              )}
                            </div>
                            {selectedSHGId === shg.id && (
                              <svg className="h-5 w-5 text-indigo-600 ml-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Members Table */}
        {selectedSHGId && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : members.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No members found. Add your first member to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {members.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{member.phoneNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(member.role)}`}>
                            {getRoleDisplayName(member.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {member.aadharCardFront && (
                              <a href={member.aadharCardFront} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline">
                                Aadhar Front
                              </a>
                            )}
                            {member.aadharCardBack && (
                              <a href={member.aadharCardBack} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline">
                                Aadhar Back
                              </a>
                            )}
                            {member.panCard && (
                              <a href={member.panCard} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline">
                                PAN
                              </a>
                            )}
                            {member.voidIdCard && (
                              <a href={member.voidIdCard} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline">
                                Void ID
                              </a>
                            )}
                            {member.homeRentalAgreement && (
                              <a href={member.homeRentalAgreement} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline">
                                Rental Agreement
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {(user?.role === 'owner' || user?.role === 'front_desk') && (
                            <>
                              <button
                                onClick={() => handleEdit(member)}
                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                              >
                                Edit
                              </button>
                              {user?.role === 'owner' && (
                                <button
                                  onClick={() => setDeleteConfirm(member.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </button>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="fixed inset-0 bg-opacity-75 backdrop-blur-sm z-[101]" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-gray-100 border border-gray-400 rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto z-[102]">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {selectedMember ? 'Edit Member' : 'Add Member'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as MemberRole })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="member">Member</option>
                    <option value="pratini1">Pratini 1</option>
                    <option value="pratini2">Pratini 2</option>
                  </select>
                </div>

                {/* Document Uploads */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium text-gray-900">Documents</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Aadhar Card Front (Optional)</label>
                      <input
                        ref={(el) => { fileInputRefs.current['aadharCardFront'] = el; }}
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileChange(e, 'aadharCardFront')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {uploadingDocs.aadharCardFront && <p className="text-xs text-gray-500 mt-1">Uploading...</p>}
                      {formData.aadharCardFront && (
                        <a href={formData.aadharCardFront} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline mt-1 block">
                          View uploaded file
                        </a>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Aadhar Card Back (Optional)</label>
                      <input
                        ref={(el) => { fileInputRefs.current['aadharCardBack'] = el; }}
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileChange(e, 'aadharCardBack')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {uploadingDocs.aadharCardBack && <p className="text-xs text-gray-500 mt-1">Uploading...</p>}
                      {formData.aadharCardBack && (
                        <a href={formData.aadharCardBack} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline mt-1 block">
                          View uploaded file
                        </a>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">PAN Card (Optional)</label>
                      <input
                        ref={(el) => { fileInputRefs.current['panCard'] = el; }}
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileChange(e, 'panCard')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {uploadingDocs.panCard && <p className="text-xs text-gray-500 mt-1">Uploading...</p>}
                      {formData.panCard && (
                        <a href={formData.panCard} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline mt-1 block">
                          View uploaded file
                        </a>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Void ID Card (Optional)</label>
                      <input
                        ref={(el) => { fileInputRefs.current['voidIdCard'] = el; }}
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileChange(e, 'voidIdCard')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {uploadingDocs.voidIdCard && <p className="text-xs text-gray-500 mt-1">Uploading...</p>}
                      {formData.voidIdCard && (
                        <a href={formData.voidIdCard} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline mt-1 block">
                          View uploaded file
                        </a>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Home Rental Agreement (Optional)</label>
                      <input
                        ref={(el) => { fileInputRefs.current['homeRentalAgreement'] = el; }}
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileChange(e, 'homeRentalAgreement')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {uploadingDocs.homeRentalAgreement && <p className="text-xs text-gray-500 mt-1">Uploading...</p>}
                      {formData.homeRentalAgreement && (
                        <a href={formData.homeRentalAgreement} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline mt-1 block">
                          View uploaded file
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {selectedMember ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm z-[101]" onClick={() => setDeleteConfirm(null)}></div>
            <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md z-[102]">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Delete</h2>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this member? This action cannot be undone.</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SHGMembers;

