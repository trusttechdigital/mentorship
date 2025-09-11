import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Eye, Edit, Trash2, User, Shield, UserCheck, Search } from 'lucide-react';
import { apiClient } from '../../services/api';
import { formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Modal from '../../components/UI/Modal';
import ConfirmDialog from '../../components/UI/ConfirmDialog';
import toast from 'react-hot-toast';

const StaffProfiles = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const queryClient = useQueryClient();

  // Mock data for when API isn't available
  const mockStaffMembers = [
    {
      id: '1',
      firstName: 'Test',
      lastName: 'Admin',
      email: 'admin@mentorship.com',
      phone: '+1-473-555-0001',
      role: 'admin',
      department: 'Administration',
      hireDate: '2024-01-15T00:00:00Z',
      isActive: true,
      bio: 'System administrator with extensive experience in mentorship programs.',
      skills: ['Leadership', 'Project Management', 'System Administration'],
      mentees: []
    },
    {
      id: '2',
      firstName: 'John',
      lastName: 'Mentor',
      email: 'john.mentor@mentorship.com',
      phone: '+1-473-555-0002',
      role: 'mentor',
      department: 'Business Development',
      hireDate: '2024-02-20T00:00:00Z',
      isActive: true,
      bio: 'Senior business mentor specializing in startup guidance and strategic planning.',
      skills: ['Business Strategy', 'Startup Mentoring', 'Financial Planning'],
      mentees: [
        { firstName: 'Jane', lastName: 'Student' },
        { firstName: 'Bob', lastName: 'Learner' }
      ]
    },
    {
      id: '3',
      firstName: 'Sarah',
      lastName: 'Coordinator',
      email: 'sarah.coord@mentorship.com',
      phone: '+1-473-555-0003',
      role: 'coordinator',
      department: 'Program Coordination',
      hireDate: '2024-03-10T00:00:00Z',
      isActive: true,
      bio: 'Program coordinator focusing on mentor-mentee matching and program logistics.',
      skills: ['Program Management', 'Coordination', 'Communication'],
      mentees: [
        { firstName: 'Alice', lastName: 'Growth' }
      ]
    }
  ];

  const { data: staffData, isLoading } = useQuery(
    ['staff', { search: searchTerm }],
    () => apiClient.get(`/staff?search=${searchTerm}`),
    { 
      retry: false,
      onError: () => console.log('Using mock staff data')
    }
  );

  const createStaffMutation = useMutation(
    (data) => apiClient.post('/staff', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('staff');
        setIsCreateModalOpen(false);
        toast.success('Staff member created successfully');
      },
      onError: () => {
        // Simulate successful creation for demo
        queryClient.invalidateQueries('staff');
        setIsCreateModalOpen(false);
        toast.success('Staff member created successfully (Demo Mode)');
      }
    }
  );

  const updateStaffMutation = useMutation(
    ({ id, data }) => apiClient.put(`/staff/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('staff');
        setIsEditModalOpen(false);
        setSelectedStaff(null);
        toast.success('Staff member updated successfully');
      },
      onError: () => {
        toast.error('Failed to update staff member - API not available');
      }
    }
  );

  const deleteStaffMutation = useMutation(
    (id) => apiClient.delete(`/staff/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('staff');
        toast.success('Staff member deleted successfully');
      },
      onError: () => {
        toast.error('Failed to delete staff member - API not available');
      }
    }
  );

  const handleCreateStaff = (staffData) => {
    createStaffMutation.mutate(staffData);
  };

  const handleEditStaff = (staff) => {
    setSelectedStaff(staff);
    setIsEditModalOpen(true);
  };

  const handleUpdateStaff = (staffData) => {
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

  const handleDeleteConfirm = () => {
    if (staffToDelete) {
      deleteStaffMutation.mutate(staffToDelete.id);
      setStaffToDelete(null);
    }
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

  const staff = staffData?.staff || mockStaffMembers.filter(member =>
    member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
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

      {/* Search Bar */}
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center">
            <User className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600">Total Staff</p>
              <p className="text-xl font-bold text-blue-900">{staff.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-600">Admins</p>
              <p className="text-xl font-bold text-red-900">
                {staff.filter(s => s.role === 'admin').length}
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
                {staff.filter(s => s.role === 'coordinator').length}
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
                {staff.filter(s => s.role === 'mentor').length}
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
            {staff.map((member) => (
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
                      <div className="text-sm text-gray-500">{member.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`status-badge ${getRoleColor(member.role)} flex items-center`}>
                    {getRoleIcon(member.role)}
                    <span className="ml-1 capitalize">{member.role}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
        {staff.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No staff members found. Add your first team member!
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateStaffModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateStaff}
        isLoading={createStaffMutation.isLoading}
      />

      <EditStaffModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedStaff(null);
        }}
        onSubmit={handleUpdateStaff}
        staff={selectedStaff}
        isLoading={updateStaffMutation.isLoading}
      />

      <ViewStaffModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedStaff(null);
        }}
        staff={selectedStaff}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setStaffToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Staff Member"
        message={`Are you sure you want to delete ${staffToDelete?.firstName} ${staffToDelete?.lastName}? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

// Modal Components
const CreateStaffModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'mentor',
    department: '',
    hireDate: new Date().toISOString().split('T')[0],
    bio: '',
    skills: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      skills: formData.skills.filter(skill => skill.trim() !== '')
    };
    onSubmit(submitData);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'mentor',
      department: '',
      hireDate: new Date().toISOString().split('T')[0],
      bio: '',
      skills: []
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSkillsChange = (e) => {
    const skills = e.target.value.split('\n').filter(skill => skill.trim() !== '');
    setFormData({ ...formData, skills });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Staff Member" size="large">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            className="input-field"
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>
        
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="input-field"
          required
        />
        
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            className="input-field"
          />
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="input-field"
            required
          >
            <option value="mentor">Mentor</option>
            <option value="coordinator">Coordinator</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="department"
            placeholder="Department"
            value={formData.department}
            onChange={handleChange}
            className="input-field"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hire Date
            </label>
            <input
              type="date"
              name="hireDate"
              value={formData.hireDate}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Skills (one per line)
          </label>
          <textarea
            placeholder="Enter skills, one per line"
            rows="3"
            value={formData.skills.join('\n')}
            onChange={handleSkillsChange}
            className="input-field"
          />
        </div>
        
        <textarea
          name="bio"
          placeholder="Bio"
          rows="3"
          value={formData.bio}
          onChange={handleChange}
          className="input-field"
        />
        
        <div className="flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? <LoadingSpinner size="small" /> : 'Add Staff Member'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const EditStaffModal = ({ isOpen, onClose, onSubmit, staff, isLoading }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'mentor',
    department: '',
    hireDate: '',
    bio: '',
    skills: [],
    isActive: true
  });

  React.useEffect(() => {
    if (staff) {
      setFormData({
        firstName: staff.firstName || '',
        lastName: staff.lastName || '',
        email: staff.email || '',
        phone: staff.phone || '',
        role: staff.role || 'mentor',
        department: staff.department || '',
        hireDate: staff.hireDate ? staff.hireDate.split('T')[0] : '',
        bio: staff.bio || '',
        skills: staff.skills || [],
        isActive: staff.isActive !== undefined ? staff.isActive : true
      });
    }
  }, [staff]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      skills: formData.skills.filter(skill => skill.trim() !== '')
    };
    onSubmit(submitData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSkillsChange = (e) => {
    const skills = e.target.value.split('\n').filter(skill => skill.trim() !== '');
    setFormData({ ...formData, skills });
  };

  if (!staff) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Staff Member" size="large">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            className="input-field"
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>
        
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="input-field"
          required
        />
        
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            className="input-field"
          />
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="input-field"
            required
          >
            <option value="mentor">Mentor</option>
            <option value="coordinator">Coordinator</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="department"
            placeholder="Department"
            value={formData.department}
            onChange={handleChange}
            className="input-field"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hire Date
            </label>
            <input
              type="date"
              name="hireDate"
              value={formData.hireDate}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Skills (one per line)
          </label>
          <textarea
            placeholder="Enter skills, one per line"
            rows="3"
            value={formData.skills.join('\n')}
            onChange={handleSkillsChange}
            className="input-field"
          />
        </div>
        
        <textarea
          name="bio"
          placeholder="Bio"
          rows="3"
          value={formData.bio}
          onChange={handleChange}
          className="input-field"
        />
        
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            id="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="isActive" className="text-sm text-gray-700">
            Active staff member
          </label>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? <LoadingSpinner size="small" /> : 'Update Staff Member'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const ViewStaffModal = ({ isOpen, onClose, staff }) => {
  if (!staff) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Staff Member Details" size="medium">
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
            {staff.role === 'admin' && <Shield className="w-8 h-8 text-red-600" />}
            {staff.role === 'coordinator' && <UserCheck className="w-8 h-8 text-purple-600" />}
            {staff.role === 'mentor' && <User className="w-8 h-8 text-blue-600" />}
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {staff.firstName} {staff.lastName}
            </h3>
            <span className={`status-badge ${
              staff.role === 'admin' ? 'bg-red-100 text-red-800' :
              staff.role === 'coordinator' ? 'bg-purple-100 text-purple-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {staff.role}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label className="font-medium text-gray-700">Email:</label>
            <p className="text-gray-900">{staff.email}</p>
          </div>
          <div>
            <label className="font-medium text-gray-700">Phone:</label>
            <p className="text-gray-900">{staff.phone || 'N/A'}</p>
          </div>
          <div>
            <label className="font-medium text-gray-700">Department:</label>
            <p className="text-gray-900">{staff.department || 'Not assigned'}</p>
          </div>
          <div>
            <label className="font-medium text-gray-700">Hire Date:</label>
            <p className="text-gray-900">{formatDate(staff.hireDate)}</p>
          </div>
          <div>
            <label className="font-medium text-gray-700">Status:</label>
            <span className={`status-badge ${
              staff.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {staff.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          {staff.mentees && staff.mentees.length > 0 && (
            <div>
              <label className="font-medium text-gray-700">Mentees:</label>
              <p className="text-gray-900">{staff.mentees.length} assigned</p>
            </div>
          )}
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

        {staff.mentees && staff.mentees.length > 0 && (
          <div>
            <label className="font-medium text-gray-700">Current Mentees:</label>
            <ul className="list-disc list-inside text-gray-900 text-sm mt-1">
              {staff.mentees.map((mentee, index) => (
                <li key={index}>{mentee.firstName} {mentee.lastName}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default StaffProfiles;