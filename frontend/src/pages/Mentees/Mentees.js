import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Eye, Edit, Trash2, User, Calendar } from 'lucide-react';
import { apiClient } from '../../services/api';
import { formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Modal from '../../components/UI/Modal';
import toast from 'react-hot-toast';

const Mentees = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();

  // Mock data
  const mockMentees = [
    { 
      id: '1', 
      firstName: 'John', 
      lastName: 'Smith', 
      email: 'john.smith@student.com', 
      phone: '+1 (555) 111-2222',
      programStartDate: '2024-01-15',
      programEndDate: null,
      status: 'active',
      goals: ['Complete certification program', 'Develop leadership skills'],
      notes: 'Enthusiastic learner with strong technical background.',
      mentor: { firstName: 'Test', lastName: 'Admin' }
    },
    { 
      id: '2', 
      firstName: 'Jane', 
      lastName: 'Doe', 
      email: 'jane.doe@student.com', 
      phone: '+1 (555) 333-4444',
      programStartDate: '2023-11-01',
      programEndDate: '2024-05-01',
      status: 'completed',
      goals: ['Career transition', 'Network building'],
      notes: 'Successfully transitioned to new role.',
      mentor: { firstName: 'John', lastName: 'Mentor' }
    }
  ];

  const mockStaff = [
    { id: '1', firstName: 'Test', lastName: 'Admin', role: 'Admin' },
    { id: '2', firstName: 'John', lastName: 'Mentor', role: 'Senior Mentor' }
  ];

  const { data: menteesData, isLoading } = useQuery(
    ['mentees', { status: statusFilter !== 'all' ? statusFilter : '' }],
    () => apiClient.get(`/mentees?status=${statusFilter !== 'all' ? statusFilter : ''}`),
    { 
      retry: false,
      onError: () => console.log('Using mock mentees data')
    }
  );

  const { data: staffData } = useQuery('staff', () => apiClient.get('/staff'), {
    retry: false,
    onError: () => console.log('Using mock staff data')
  });

  const createMenteeMutation = useMutation(
    (data) => apiClient.post('/mentees', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('mentees');
        setIsCreateModalOpen(false);
        toast.success('Mentee created successfully');
      },
      onError: () => {
        toast.error('Failed to create mentee - API not available');
      }
    }
  );

  const updateMenteeMutation = useMutation(
    ({ id, data }) => apiClient.put(`/mentees/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('mentees');
        setIsEditModalOpen(false);
        setSelectedMentee(null);
        toast.success('Mentee updated successfully');
      },
      onError: () => {
        toast.error('Failed to update mentee - API not available');
      }
    }
  );

  const handleCreateMentee = (formData) => {
    createMenteeMutation.mutate(formData);
  };

  const handleEditMentee = (mentee) => {
    setSelectedMentee(mentee);
    setIsEditModalOpen(true);
  };

  const handleUpdateMentee = (formData) => {
    updateMenteeMutation.mutate({ id: selectedMentee.id, data: formData });
  };

  const handleViewMentee = (mentee) => {
    setSelectedMentee(mentee);
    setIsViewModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      case 'dropped': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) return <LoadingSpinner size="large" className="py-12" />;

  const mentees = menteesData?.mentees || mockMentees.filter(mentee => 
    statusFilter === 'all' || mentee.status === statusFilter
  );
  const staff = staffData?.staff || mockStaff;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mentee Directory</h1>
          <p className="text-gray-600">Manage program participants</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Mentee
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center space-x-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-auto"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="on-hold">On Hold</option>
          <option value="dropped">Dropped</option>
        </select>
      </div>

      <div className="table-container">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mentee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mentor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Start Date
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
            {mentees.map((mentee) => (
              <tr key={mentee.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {mentee.firstName} {mentee.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{mentee.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {mentee.mentor 
                    ? `${mentee.mentor.firstName} ${mentee.mentor.lastName}`
                    : 'Unassigned'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                    {formatDate(mentee.programStartDate)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`status-badge ${getStatusColor(mentee.status)}`}>
                    {mentee.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewMentee(mentee)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditMentee(mentee)}
                      className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                      title="Edit Mentee"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toast.error('Delete functionality coming soon')}
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                      title="Delete Mentee"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {mentees.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No mentees found. Add your first program participant!
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateMenteeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateMentee}
        staff={staff}
        isLoading={createMenteeMutation.isLoading}
      />

      <EditMenteeModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedMentee(null);
        }}
        onSubmit={handleUpdateMentee}
        mentee={selectedMentee}
        staff={staff}
        isLoading={updateMenteeMutation.isLoading}
      />

      <ViewMenteeModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedMentee(null);
        }}
        mentee={selectedMentee}
      />
    </div>
  );
};

// FIXED CreateMenteeModal Component
const CreateMenteeModal = ({ isOpen, onClose, onSubmit, staff, isLoading }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    mentorId: '',
    programStartDate: new Date().toISOString().split('T')[0],
    programEndDate: '',
    goalsText: '', // CHANGED: Store raw text instead of array
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      mentorId: formData.mentorId || null,
      // FIX: Handle empty dates properly
      programEndDate: formData.programEndDate || null,
      goals: formData.goalsText
        .split('\n')
        .map(goal => goal.trim())
        .filter(goal => goal !== '')
    };
    onSubmit(submitData);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // CHANGED: Simple text change handler - no processing
  const handleGoalsChange = (e) => {
    setFormData({ ...formData, goalsText: e.target.value });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Mentee" size="large">
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
            name="mentorId"
            value={formData.mentorId}
            onChange={handleChange}
            className="input-field"
          >
            <option value="">Select Mentor (optional)</option>
            {staff.map(member => (
              <option key={member.id} value={member.id}>
                {member.firstName} {member.lastName} - {member.role}
              </option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Program Start Date
            </label>
            <input
              type="date"
              name="programStartDate"
              value={formData.programStartDate}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Program End Date (optional)
            </label>
            <input
              type="date"
              name="programEndDate"
              value={formData.programEndDate}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Goals (one per line)
          </label>
          <textarea
            placeholder="Enter goals, one per line&#10;Example:&#10;Complete certification program&#10;Develop leadership skills&#10;Build professional network"
            rows="4"
            value={formData.goalsText}
            onChange={handleGoalsChange}
            className="input-field resize-none"
            style={{ whiteSpace: 'pre-wrap' }}
          />
          <p className="text-xs text-gray-500 mt-1">
            Press Enter to create new lines. Each line will become a separate goal.
          </p>
        </div>
        
        <textarea
          name="notes"
          placeholder="Additional Notes"
          rows="3"
          value={formData.notes}
          onChange={handleChange}
          className="input-field"
        />
        
        <div className="flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? <LoadingSpinner size="small" /> : 'Add Mentee'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// FIXED EditMenteeModal Component
const EditMenteeModal = ({ isOpen, onClose, onSubmit, mentee, staff, isLoading }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    mentorId: '',
    programStartDate: '',
    programEndDate: '',
    status: 'active',
    goalsText: '', // CHANGED: Store raw text instead of array
    notes: ''
  });

  React.useEffect(() => {
    if (mentee) {
      setFormData({
        firstName: mentee.firstName || '',
        lastName: mentee.lastName || '',
        email: mentee.email || '',
        phone: mentee.phone || '',
        mentorId: mentee.mentorId || '',
        programStartDate: mentee.programStartDate ? mentee.programStartDate.split('T')[0] : '',
        programEndDate: mentee.programEndDate ? mentee.programEndDate.split('T')[0] : '',
        status: mentee.status || 'active',
        // CHANGED: Convert goals array back to text for editing
        goalsText: (mentee.goals || []).join('\n'),
        notes: mentee.notes || ''
      });
    }
  }, [mentee]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      mentorId: formData.mentorId || null,
      programEndDate: formData.programEndDate || null,
      goals: formData.goalsText
        .split('\n')
        .map(goal => goal.trim())
        .filter(goal => goal !== '')
    };
    onSubmit(submitData);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // CHANGED: Simple text change handler - no processing
  const handleGoalsChange = (e) => {
    setFormData({ ...formData, goalsText: e.target.value });
  };

  if (!mentee) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Mentee" size="large">
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
            name="mentorId"
            value={formData.mentorId}
            onChange={handleChange}
            className="input-field"
          >
            <option value="">Select Mentor (optional)</option>
            {staff.map(member => (
              <option key={member.id} value={member.id}>
                {member.firstName} {member.lastName} - {member.role}
              </option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Program Start Date
            </label>
            <input
              type="date"
              name="programStartDate"
              value={formData.programStartDate}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Program End Date
            </label>
            <input
              type="date"
              name="programEndDate"
              value={formData.programEndDate}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input-field"
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
              <option value="dropped">Dropped</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Goals (one per line)
          </label>
          <textarea
            placeholder="Enter goals, one per line&#10;Example:&#10;Complete certification program&#10;Develop leadership skills&#10;Build professional network"
            rows="4"
            value={formData.goalsText}
            onChange={handleGoalsChange}
            className="input-field resize-none"
            style={{ whiteSpace: 'pre-wrap' }}
          />
          <p className="text-xs text-gray-500 mt-1">
            Press Enter to create new lines. Each line will become a separate goal.
          </p>
        </div>
        
        <textarea
          name="notes"
          placeholder="Additional Notes"
          rows="3"
          value={formData.notes}
          onChange={handleChange}
          className="input-field"
        />
        
        <div className="flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? <LoadingSpinner size="small" /> : 'Update Mentee'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ViewMenteeModal remains unchanged
const ViewMenteeModal = ({ isOpen, onClose, mentee }) => {
  if (!mentee) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mentee Details" size="medium">
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center">
            <User className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {mentee.firstName} {mentee.lastName}
            </h3>
            <span className={`status-badge ${
              mentee.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : mentee.status === 'completed'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {mentee.status}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label className="font-medium text-gray-700">Email:</label>
            <p className="text-gray-900">{mentee.email}</p>
          </div>
          <div>
            <label className="font-medium text-gray-700">Phone:</label>
            <p className="text-gray-900">{mentee.phone || 'N/A'}</p>
          </div>
          <div>
            <label className="font-medium text-gray-700">Mentor:</label>
            <p className="text-gray-900">
              {mentee.mentor 
                ? `${mentee.mentor.firstName} ${mentee.mentor.lastName}`
                : 'Unassigned'
              }
            </p>
          </div>
          <div>
            <label className="font-medium text-gray-700">Start Date:</label>
            <p className="text-gray-900">{formatDate(mentee.programStartDate)}</p>
          </div>
          {mentee.programEndDate && (
            <div>
              <label className="font-medium text-gray-700">End Date:</label>
              <p className="text-gray-900">{formatDate(mentee.programEndDate)}</p>
            </div>
          )}
        </div>
        
        {mentee.goals && mentee.goals.length > 0 && (
          <div>
            <label className="font-medium text-gray-700">Goals:</label>
            <ul className="list-disc list-inside text-gray-900 text-sm mt-1 space-y-1">
              {mentee.goals.map((goal, index) => (
                <li key={index}>{goal}</li>
              ))}
            </ul>
          </div>
        )}
        
        {mentee.notes && (
          <div>
            <label className="font-medium text-gray-700">Notes:</label>
            <p className="text-gray-900 text-sm mt-1">{mentee.notes}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default Mentees;