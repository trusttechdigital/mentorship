import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, User, Shield, UserCheck, Search, Key } from 'lucide-react';
import api from '../../services/api';
import { formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Modal from '../../components/UI/Modal';
import ConfirmDialog from '../../components/UI/ConfirmDialog';
import toast from 'react-hot-toast';
import StaffPasswordModal from '../../components/Staff/StaffPasswordModal';

const StaffProfiles = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSetPasswordModalOpen, setIsSetPasswordModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const queryClient = useQueryClient();
  const { id: staffIdFromUrl } = useParams();
  const navigate = useNavigate();

  // FIX: Extract the data properly from axios response
  const { data: staffResponse, isLoading } = useQuery(
    ['staff', { search: searchTerm }],
    () => api.get(`/staff?search=${searchTerm}`),
    { 
      retry: false,
    }
  );

  // This query is ONLY for fetching a single user when the ID is in the URL
  useQuery(
    ['staff', staffIdFromUrl],
    () => api.get(`/staff/${staffIdFromUrl}`),
    {
      enabled: !!staffIdFromUrl,
      onSuccess: (response) => {
        // FIX: Access the nested data
        handleViewStaff(response.data.staff);
      },
      onError: () => {
        toast.error("Could not find staff member.");
        navigate('/staff');
      }
    }
  );

  const createStaffMutation = useMutation(
    (data) => api.post('/staff', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('staff');
        closeAllModals();
        toast.success('Staff member created successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create staff member');
      }
    }
  );

  const updateStaffMutation = useMutation(
    ({ id, data }) => api.put(`/staff/${id}`, data),

    {
      onSuccess: () => {
        queryClient.invalidateQueries('staff');
        closeAllModals();
        toast.success('Staff member updated successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update staff member');
      }
    }
  );

  const deleteStaffMutation = useMutation(
    (id) => api.delete(`/staff/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('staff');
        toast.success('Staff member deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete staff member');
      }
    }
  );

  const closeAllModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsViewModalOpen(false);
    setIsSetPasswordModalOpen(false);
    setSelectedStaff(null);
    setStaffToDelete(null);
    setIsDeleteDialogOpen(false);
    if (staffIdFromUrl) {
      navigate('/staff', { replace: true });
    }
  };

  const handleCreateStaff = (staffData) => {
    createStaffMutation.mutate(staffData);
  };

  const handleEditStaff = (staff) => {
    setSelectedStaff(staff);
    setIsEditModalOpen(true);
  };

    const handleUpdateStaff = (staffData) => {
    // The API endpoint for updating a staff member requires the user's ID, not the staff profile's ID.
    updateStaffMutation.mutate({ id: selectedStaff.id, data: staffData });
  };

  const handleViewStaff = (staff) => {
    setSelectedStaff(staff);
    setIsViewModalOpen(true);
  };

  const handleDeleteClick = (staff) => {
    setStaffToDelete(staff);
    setIsDeleteDialogOpen(true);
  };

  const handleSetPasswordClick = (staff) => {
    setSelectedStaff(staff);
    setIsSetPasswordModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (staffToDelete) {
      deleteStaffMutation.mutate(staffToDelete.id);
    }
    closeAllModals();
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-5 h-5 text-red-600" />;
      case 'coordinator':
        return <UserCheck className="w-5 h-5 text-purple-600" />;
      case 'mentor':
        return <User className="w-5 h-5 text-blue-600" />;
      default:
        return <User className="w-5 h-5 text-gray-600" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'coordinator': return 'bg-purple-100 text-purple-800';
      case 'mentor': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) return <LoadingSpinner size="large" className="py-12" />;

  // FIX: Properly access the nested staff array
  const staff = staffResponse?.data?.staff || [];

  const filteredStaff = staff.filter(member =>
    member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Profiles</h1>
          <p className="text-gray-600">Manage team members and mentors</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Staff Member
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search staff members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 input-field"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center">
            <User className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600">Total Staff</p>
              <p className="text-xl font-bold text-blue-900">{filteredStaff.length}</p>
            </div>
          </div>
        </div>
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-600">Admins</p>
              <p className="text-xl font-bold text-red-900">
                {filteredStaff.filter(s => s.role === 'admin').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card bg-purple-50 border-purple-200">
          <div className="flex items-center">
            <UserCheck className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-600">Coordinators</p>
              <p className="text-xl font-bold text-purple-900">
                {filteredStaff.filter(s => s.role === 'coordinator').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center">
            <User className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-600">Mentors</p>
              <p className="text-xl font-bold text-green-900">
                {filteredStaff.filter(s => s.role === 'mentor').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Staff Member
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mentees
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hire Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStaff.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        {getRoleIcon(member.role)}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {member.firstName} {member.lastName}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`status-badge ${getRoleColor(member.role)} flex items-center`}>
                    {getRoleIcon(member.role)}
                    <span className="ml-1 capitalize">{member.role}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate max-w-xs">
                  {member.department || 'Not assigned'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {member.mentees?.length || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(member.hireDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`status-badge ${
                    member.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {member.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewStaff(member)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditStaff(member)}
                      className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                      title="Edit Staff"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleSetPasswordClick(member)}
                      className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50"
                      title="Set Password"
                    >
                      <Key className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(member)}
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                      title="Delete Staff"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredStaff.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No staff members found. Add your first team member!
          </div>
        )}
      </div>

      <CreateStaffModal
        isOpen={isCreateModalOpen}
        onClose={closeAllModals}
        onSubmit={handleCreateStaff}
        isLoading={createStaffMutation.isLoading}
      />

      <EditStaffModal
        isOpen={isEditModalOpen}
        onClose={closeAllModals}
        onSubmit={handleUpdateStaff}
        staff={selectedStaff}
        isLoading={updateStaffMutation.isLoading}
      />

      <ViewStaffModal
        isOpen={isViewModalOpen}
        onClose={closeAllModals}
        staff={selectedStaff}
      />

      <StaffPasswordModal
        isOpen={isSetPasswordModalOpen}
        onClose={closeAllModals}
        staffId={selectedStaff?.id}
        staffName={selectedStaff ? `${selectedStaff.firstName} ${selectedStaff.lastName}` : ''}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeAllModals}
        onConfirm={handleDeleteConfirm}
        title="Delete Staff Member"
        message={`Are you sure you want to delete ${staffToDelete?.firstName} ${staffToDelete?.lastName}? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

// Modal components remain the same
const CreateStaffModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', role: 'mentor',
    department: '', hireDate: new Date().toISOString().split('T')[0], bio: '', skillsText: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      skills: formData.skillsText.split('\n').map(skill => skill.trim()).filter(skill => skill !== '')
    };
    onSubmit(submitData);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Staff Member" size="large">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} className="input-field" required />
          <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} className="input-field" required />
        </div>
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="input-field" required />
        <div className="grid grid-cols-2 gap-4">
          <input type="text" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} className="input-field" />
          <select name="role" value={formData.role} onChange={handleChange} className="input-field" required>
            <option value="mentor">Mentor</option> <option value="coordinator">Coordinator</option> <option value="admin">Admin</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input type="text" name="department" placeholder="Department" value={formData.department} onChange={handleChange} className="input-field" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
            <input type="date" name="hireDate" value={formData.hireDate} onChange={handleChange} className="input-field" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Skills (one per line)</label>
          <textarea name="skillsText" placeholder="Enter skills, one per line..." rows="4" value={formData.skillsText} onChange={handleChange} className="input-field resize-none" />
        </div>
        <textarea name="bio" placeholder="Bio" rows="3" value={formData.bio} onChange={handleChange} className="input-field" />
        <div className="flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={isLoading} className="btn-primary">{isLoading ? <LoadingSpinner size="small" /> : 'Add Staff'}</button>
        </div>
      </form>
    </Modal>
  );
};

const EditStaffModal = ({ isOpen, onClose, onSubmit, staff, isLoading }) => {
  const [formData, setFormData] = useState({});

  React.useEffect(() => {
    if (staff) {
      setFormData({
        ...staff,
        hireDate: staff.hireDate ? staff.hireDate.split('T')[0] : '',
        skillsText: (staff.skills || []).join('\n'),
        isActive: staff.isActive !== undefined ? staff.isActive : true
      });
    }
  }, [staff]);

    const handleSubmit = (e) => {
    e.preventDefault();
    // Manually construct the payload with only the editable fields
    // to prevent sending back extraneous data like `userAccount` or `mentees`.
    const submitData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      department: formData.department,
      hireDate: formData.hireDate,
      bio: formData.bio,
      isActive: formData.isActive,
      skills: formData.skillsText.split('\n').map(s => s.trim()).filter(Boolean),
    };
    onSubmit(submitData);
  };


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  if (!staff) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Staff Member" size="large">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input type="text" name="firstName" value={formData.firstName || ''} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input type="text" name="lastName" value={formData.lastName || ''} onChange={handleChange} className="input-field" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="input-field" required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="text" name="phone" value={formData.phone || ''} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select name="role" value={formData.role || 'mentor'} onChange={handleChange} className="input-field" required>
              <option value="mentor">Mentor</option>
              <option value="coordinator">Coordinator</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input type="text" name="department" value={formData.department || ''} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
            <input type="date" name="hireDate" value={formData.hireDate || ''} onChange={handleChange} className="input-field" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Skills (one per line)</label>
          <textarea name="skillsText" value={formData.skillsText || ''} onChange={handleChange} rows="4" className="input-field resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea name="bio" value={formData.bio || ''} onChange={handleChange} rows="3" className="input-field" />
        </div>
        <div className="flex items-center">
          <input type="checkbox" name="isActive" id="isActiveEdit" checked={formData.isActive || false} onChange={handleChange} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
          <label htmlFor="isActiveEdit" className="ml-2 block text-sm text-gray-900">Active staff member</label>
        </div>
        <div className="flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={isLoading} className="btn-primary">{isLoading ? <LoadingSpinner size="small" /> : 'Update Staff'}</button>
        </div>
      </form>
    </Modal>
  );
};

const ViewStaffModal = ({ isOpen, onClose, staff }) => {
  if (!staff) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Staff Member Details" size="large">
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                {staff.role === 'admin' && <Shield className="w-8 h-8 text-red-600" />}
                {staff.role === 'coordinator' && <UserCheck className="w-8 h-8 text-purple-600" />}
                {staff.role === 'mentor' && <User className="w-8 h-8 text-blue-600" />}
            </div>
            <div>
                <h3 className="text-lg font-bold text-gray-900">{staff.firstName} {staff.lastName}</h3>
                <p className="text-gray-600 capitalize">{staff.role}</p>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="font-medium text-gray-700">Email:</p><p>{staff.email}</p></div>
          <div><p className="font-medium text-gray-700">Phone:</p><p>{staff.phone || 'N/A'}</p></div>
          <div><p className="font-medium text-gray-700">Department:</p><p>{staff.department || 'N/A'}</p></div>
          <div><p className="font-medium text-gray-700">Hire Date:</p><p>{formatDate(staff.hireDate)}</p></div>
        </div>
         {staff.skills && staff.skills.length > 0 && (
          <div>
            <label className="font-medium text-gray-700">Skills:</label>
            <div className="flex flex-wrap gap-1 mt-1">
              {staff.skills.map((skill, index) => (
                <span key={index} className="status-badge bg-gray-100 text-gray-800">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        {staff.bio && (
          <div>
            <label className="font-medium text-gray-700">Bio:</label>
            <p className="text-gray-900 text-sm mt-1">{staff.bio}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default StaffProfiles;
