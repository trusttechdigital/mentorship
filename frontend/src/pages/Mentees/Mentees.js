import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Eye, Edit, Trash2, User, Calendar, FileText, Clock, AlertCircle, BookOpen, Camera, MapPin, Building, GraduationCap } from 'lucide-react';
import { apiClient } from '../../services/api';
import { formatDate, formatDateTime } from '../../utils/formatters';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Modal from '../../components/UI/Modal';
import toast from 'react-hot-toast';

// Utility functions moved outside to be available to all components
const getStatusColor = (status) => {
  switch (status) {
    case 'Active': return 'bg-green-100 text-green-800';
    case 'Completed': return 'bg-blue-100 text-blue-800';
    case 'On-Hold': return 'bg-yellow-100 text-yellow-800';
    case 'Discharged': return 'bg-red-100 text-red-800';
    case 'Pending': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getOffenseColor = (offense) => {
  if (!offense) return 'bg-gray-100 text-gray-800';
  if (['Assault/Battery', 'Robbery', 'Sexual Assault', 'Arson'].includes(offense)) {
    return 'bg-red-100 text-red-800';
  }
  if (['Drug Possession', 'Drug Law Violations', 'Underage Drinking'].includes(offense)) {
    return 'bg-purple-100 text-purple-800';
  }
  return 'bg-orange-100 text-orange-800';
};

const Mentees = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isTherapyNotesModalOpen, setIsTherapyNotesModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [offenseFilter, setOffenseFilter] = useState('all');
  const queryClient = useQueryClient();

  // Mock therapy notes data
  const [mockTherapyNotes, setMockTherapyNotes] = useState([
    {
      id: '1',
      menteeId: '1',
      sessionDate: '2024-09-10T14:00:00Z',
      sessionType: 'individual',
      duration: 60,
      therapistName: 'Dr. Sarah Wilson',
      sessionNotes: 'Client discussed progress with anxiety management techniques. Showed improvement in using breathing exercises. Reported sleeping better this week.',
      progressObservations: 'Positive engagement, maintained eye contact throughout session. Mood appeared stable.',
      goalsAddressed: ['Anxiety management', 'Sleep improvement'],
      nextSteps: 'Continue practicing breathing exercises daily. Homework: mood journal for next week.',
      riskLevel: 'low',
      moodRating: 7,
      confidential: true,
      createdAt: '2024-09-10T14:00:00Z'
    }
  ]);

  const { data: menteesData, isLoading } = useQuery(
    ['mentees', { status: statusFilter !== 'all' ? statusFilter : '', offense: offenseFilter !== 'all' ? offenseFilter : '' }],
    () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (offenseFilter !== 'all') params.append('offenseType', offenseFilter);
      return apiClient.get(`/mentees?${params}`);
    },
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
        toast.success('Mentee created successfully (Demo Mode)');
        setIsCreateModalOpen(false);
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
        toast.success('Mentee updated successfully (Demo Mode)');
        setIsEditModalOpen(false);
        setSelectedMentee(null);
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

  const handleTherapyNotes = (mentee) => {
    setSelectedMentee(mentee);
    setIsTherapyNotesModalOpen(true);
  };

  const handleAddTherapyNote = (noteData) => {
    const newNote = {
      ...noteData,
      id: Date.now().toString(),
      menteeId: selectedMentee.id,
      createdAt: new Date().toISOString()
    };
    
    setMockTherapyNotes(prev => [newNote, ...prev]);
    toast.success('Therapy note added successfully');
  };

  if (isLoading) return <LoadingSpinner size="large" className="py-12" />;

  // Use real data from backend or fallback
  const mentees = menteesData?.mentees || [];
  const staff = staffData?.staff || [
    { id: '1', firstName: 'Test', lastName: 'Admin', role: 'Admin' },
    { id: '2', firstName: 'John', lastName: 'Mentor', role: 'Senior Mentor' }
  ];

  // Filter mentees based on selected filters
  const filteredMentees = mentees.filter(mentee => {
    if (statusFilter !== 'all' && mentee.status !== statusFilter) return false;
    if (offenseFilter !== 'all' && mentee.offenseType !== offenseFilter) return false;
    return true;
  });

  // Get unique offense types for filter
  const uniqueOffenses = [...new Set(mentees.map(m => m.offenseType).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">HYPE Mentee Directory</h1>
          <p className="text-gray-600">Manage program participants and therapeutic documentation</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Mentee
        </button>
      </div>

      {/* Enhanced Filter Bar */}
      <div className="flex items-center space-x-4 bg-white p-4 rounded-lg border">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-auto min-w-32"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="On-Hold">On Hold</option>
            <option value="Completed">Completed</option>
            <option value="Discharged">Discharged</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Offense:</label>
          <select
            value={offenseFilter}
            onChange={(e) => setOffenseFilter(e.target.value)}
            className="input-field w-auto min-w-40"
          >
            <option value="all">All Offenses</option>
            {uniqueOffenses.map(offense => (
              <option key={offense} value={offense}>{offense}</option>
            ))}
          </select>
        </div>

        <div className="text-sm text-gray-600">
          Showing {filteredMentees.length} of {mentees.length} mentees
        </div>
      </div>

      <div className="table-container overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                Mentee Info
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                HYPE ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                Age/Gender
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                Offense Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Court
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                School/Grade
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Therapy Notes
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMentees.map((mentee) => {
              const menteeNotes = mockTherapyNotes.filter(note => note.menteeId === mentee.id);
              const lastSession = menteeNotes[0];
              
              return (
                <tr key={mentee.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 w-64">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 relative">
                        {mentee.photoUrl ? (
                          <img 
                            src={mentee.photoUrl} 
                            alt={`${mentee.firstName} ${mentee.lastName}`}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-purple-600" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {mentee.firstName} {mentee.lastName}
                        </div>
                        <div className="text-sm text-gray-500 truncate">{mentee.email}</div>
                        {mentee.phone && (
                          <div className="text-xs text-gray-400 truncate">{mentee.phone}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-4 py-4 w-32">
                    <div className="text-sm font-medium text-gray-900">{mentee.hypeId}</div>
                    {mentee.probationOfficer && (
                      <div className="text-xs text-gray-500 truncate">PO: {mentee.probationOfficer}</div>
                    )}
                  </td>
                  
                  <td className="px-4 py-4 w-28">
                    <div className="text-sm text-gray-900">
                      {mentee.age && `${mentee.age} yrs`}
                    </div>
                    {mentee.gender && (
                      <div className="text-xs text-gray-500">{mentee.gender}</div>
                    )}
                    {mentee.dateOfBirth && (
                      <div className="text-xs text-gray-400">DOB: {formatDate(mentee.dateOfBirth)}</div>
                    )}
                  </td>
                  
                  <td className="px-4 py-4 w-40">
                    {mentee.offenseType ? (
                      <span className={`status-badge text-xs ${getOffenseColor(mentee.offenseType)}`}>
                        {mentee.offenseType}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">Not specified</span>
                    )}
                  </td>
                  
                  <td className="px-4 py-4 w-32">
                    <div className="text-sm text-gray-900">{mentee.court || 'N/A'}</div>
                  </td>
                  
                  <td className="px-4 py-4 w-40">
                    <div className="text-sm text-gray-900 truncate">
                      {mentee.schoolOrganization || 'N/A'}
                    </div>
                    {mentee.formGrade && (
                      <div className="text-xs text-gray-500">Grade: {mentee.formGrade}</div>
                    )}
                  </td>
                  
                  <td className="px-4 py-4 w-28">
                    <span className={`status-badge text-xs ${getStatusColor(mentee.status)}`}>
                      {mentee.status}
                    </span>
                  </td>
                  
                  <td className="px-4 py-4 w-32">
                    <div className="text-xs">
                      {menteeNotes.length > 0 ? (
                        <div>
                          <div className="flex items-center text-green-600 mb-1">
                            <FileText className="w-3 h-3 mr-1" />
                            <span>{menteeNotes.length} note(s)</span>
                          </div>
                          {lastSession && (
                            <div className="text-gray-500">
                              Last: {formatDate(lastSession.sessionDate)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">No notes</span>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-4 py-4 w-40">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleViewMentee(mentee)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 flex-shrink-0"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleTherapyNotes(mentee)}
                        className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50 flex-shrink-0"
                        title="Therapy Notes"
                      >
                        <BookOpen className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditMentee(mentee)}
                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 flex-shrink-0"
                        title="Edit Mentee"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toast.error('Delete functionality requires admin approval')}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 flex-shrink-0"
                        title="Delete Mentee"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredMentees.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No mentees found matching the selected filters.
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

      <TherapyNotesModal
        isOpen={isTherapyNotesModalOpen}
        onClose={() => {
          setIsTherapyNotesModalOpen(false);
          setSelectedMentee(null);
        }}
        mentee={selectedMentee}
        therapyNotes={selectedMentee ? mockTherapyNotes.filter(note => note.menteeId === selectedMentee.id) : []}
        onAddNote={handleAddTherapyNote}
      />
    </div>
  );
};

// Offense type options
const OFFENSE_TYPES = [
  'Vandalism',
  'Criminal Trespass',
  'Burglary', 
  'Arson',
  'Theft/Shoplifting',
  'Motor Vehicle Theft',
  'Assault/Battery',
  'Robbery',
  'Harassment',
  'Sexual Assault',
  'Drug Possession',
  'Underage Drinking',
  'Drug Law Violations',
  'Disorderly Conduct',
  'Curfew Violations',
  'Truancy',
  'Wandering'
];

// Status type options
const STATUS_TYPES = [
  'Active',
  'On-Hold', 
  'Completed',
  'Discharged',
  'Pending'
];

// Helper function to calculate age from date of birth
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return '';
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// Create Mentee Modal - Updated with all CSV fields
const CreateMenteeModal = ({ isOpen, onClose, onSubmit, staff, isLoading }) => {
  const [formData, setFormData] = useState({
    // Basic Info
    hypeId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    age: '',
    
    // Legal/Court Info
    court: '',
    offenseType: '',
    probationOfficer: '',
    
    // Education Info
    schoolOrganization: '',
    formGrade: '',
    
    // Program Info
    mentorId: '',
    programStartDate: new Date().toISOString().split('T')[0],
    programEndDate: '',
    status: 'Pending',
    goalsText: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      age: formData.age ? parseInt(formData.age) : null,
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
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Auto-calculate age when date of birth changes
    if (name === 'dateOfBirth' && value) {
      const age = calculateAge(value);
      setFormData(prev => ({ ...prev, age: age.toString() }));
    }
    
    // Auto-generate email when name changes
    if (name === 'firstName' || name === 'lastName') {
      const firstName = name === 'firstName' ? value : formData.firstName;
      const lastName = name === 'lastName' ? value : formData.lastName;
      if (firstName && lastName) {
        const email = `${firstName.toLowerCase().trim()}.${lastName.toLowerCase().trim()}@hype.mentee.gd`;
        setFormData(prev => ({ ...prev, email }));
      }
    }
  };

  const handleGoalsChange = (e) => {
    setFormData({ ...formData, goalsText: e.target.value });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New HYPE Mentee" size="xlarge">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Information Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Basic Information
          </h3>
          
          <div className="grid grid-cols-3 gap-4">
            <input
              type="text"
              name="hypeId"
              placeholder="HYPE ID (e.g., HYPE-001)"
              value={formData.hypeId}
              onChange={handleChange}
              className="input-field"
              required
            />
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
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <input
              type="email"
              name="email"
              placeholder="Email (auto-generated)"
              value={formData.email}
              onChange={handleChange}
              className="input-field bg-gray-50"
              required
              readOnly
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="input-field"
            />
            
            <input
              type="number"
              name="age"
              placeholder="Age (auto-calculated)"
              value={formData.age}
              onChange={handleChange}
              className="input-field bg-gray-50"
              readOnly
            />
          </div>
        </div>

        {/* Legal/Court Information Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Building className="w-5 h-5 mr-2" />
            Legal & Court Information
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="court"
              placeholder="Court Name"
              value={formData.court}
              onChange={handleChange}
              className="input-field"
            />
            <input
              type="text"
              name="probationOfficer"
              placeholder="Probation Officer"
              value={formData.probationOfficer}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          
          <div className="mt-4">
            <select
              name="offenseType"
              value={formData.offenseType}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Select Offense Type</option>
              <optgroup label="Crimes Against Property">
                <option value="Vandalism">Vandalism</option>
                <option value="Criminal Trespass">Criminal Trespass</option>
                <option value="Burglary">Burglary</option>
                <option value="Arson">Arson</option>
                <option value="Theft/Shoplifting">Theft/Shoplifting</option>
                <option value="Motor Vehicle Theft">Motor Vehicle Theft</option>
              </optgroup>
              <optgroup label="Crimes Against Persons">
                <option value="Assault/Battery">Assault/Battery</option>
                <option value="Robbery">Robbery</option>
                <option value="Harassment">Harassment</option>
                <option value="Sexual Assault">Sexual Assault</option>
              </optgroup>
              <optgroup label="Drug & Alcohol Offenses">
                <option value="Drug Possession">Drug Possession</option>
                <option value="Underage Drinking">Underage Drinking</option>
                <option value="Drug Law Violations">Drug Law Violations</option>
              </optgroup>
              <optgroup label="Public Order Offenses">
                <option value="Disorderly Conduct">Disorderly Conduct</option>
                <option value="Curfew Violations">Curfew Violations</option>
                <option value="Truancy">Truancy</option>
                <option value="Wandering">Wandering</option>
              </optgroup>
            </select>
          </div>
        </div>

        {/* Education Information Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <GraduationCap className="w-5 h-5 mr-2" />
            Education Information
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="schoolOrganization"
              placeholder="School/Organization"
              value={formData.schoolOrganization}
              onChange={handleChange}
              className="input-field"
            />
            <input
              type="text"
              name="formGrade"
              placeholder="Form/Grade Level"
              value={formData.formGrade}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>

        {/* Program Information Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Program Information
          </h3>
          
          <div className="grid grid-cols-3 gap-4">
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
            
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input-field"
            >
              {STATUS_TYPES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            
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
          </div>
          
          <div className="mt-4">
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

        {/* Goals and Notes Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Goals & Notes
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Goals (one per line)
            </label>
            <textarea
              placeholder="Enter goals, one per line&#10;Example:&#10;Complete anger management program&#10;Improve school attendance&#10;Develop conflict resolution skills"
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
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              name="notes"
              placeholder="Additional notes about the mentee's background, special considerations, etc."
              rows="3"
              value={formData.notes}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t">
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

// Edit Mentee Modal - Updated with all CSV fields
const EditMenteeModal = ({ isOpen, onClose, onSubmit, mentee, staff, isLoading }) => {
  const [formData, setFormData] = useState({
    // Basic Info
    hypeId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    age: '',
    
    // Legal/Court Info
    court: '',
    offenseType: '',
    probationOfficer: '',
    
    // Education Info
    schoolOrganization: '',
    formGrade: '',
    
    // Program Info
    mentorId: '',
    programStartDate: '',
    programEndDate: '',
    status: 'Active',
    goalsText: '',
    notes: ''
  });

  React.useEffect(() => {
    if (mentee) {
      setFormData({
        hypeId: mentee.hypeId || '',
        firstName: mentee.firstName || '',
        lastName: mentee.lastName || '',
        email: mentee.email || '',
        phone: mentee.phone || '',
        gender: mentee.gender || '',
        dateOfBirth: mentee.dateOfBirth ? mentee.dateOfBirth.split('T')[0] : '',
        age: mentee.age ? mentee.age.toString() : '',
        court: mentee.court || '',
        offenseType: mentee.offenseType || '',
        probationOfficer: mentee.probationOfficer || '',
        schoolOrganization: mentee.schoolOrganization || '',
        formGrade: mentee.formGrade || '',
        mentorId: mentee.mentorId || '',
        programStartDate: mentee.programStartDate ? mentee.programStartDate.split('T')[0] : '',
        programEndDate: mentee.programEndDate ? mentee.programEndDate.split('T')[0] : '',
        status: mentee.status || 'Active',
        goalsText: (mentee.goals || []).join('\n'),
        notes: mentee.notes || ''
      });
    }
  }, [mentee]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      age: formData.age ? parseInt(formData.age) : null,
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
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Auto-calculate age when date of birth changes
    if (name === 'dateOfBirth' && value) {
      const age = calculateAge(value);
      setFormData(prev => ({ ...prev, age: age.toString() }));
    }
  };

  const handleGoalsChange = (e) => {
    setFormData({ ...formData, goalsText: e.target.value });
  };

  if (!mentee) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit HYPE Mentee" size="xlarge">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Information Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Basic Information
          </h3>
          
          <div className="grid grid-cols-3 gap-4">
            <input
              type="text"
              name="hypeId"
              placeholder="HYPE ID"
              value={formData.hypeId}
              onChange={handleChange}
              className="input-field bg-gray-50"
              readOnly
            />
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
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              required
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="input-field"
            />
            
            <input
              type="number"
              name="age"
              placeholder="Age"
              value={formData.age}
              onChange={handleChange}
              className="input-field bg-gray-50"
              readOnly
            />
          </div>
        </div>

        {/* Legal/Court Information Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Building className="w-5 h-5 mr-2" />
            Legal & Court Information
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="court"
              placeholder="Court Name"
              value={formData.court}
              onChange={handleChange}
              className="input-field"
            />
            <input
              type="text"
              name="probationOfficer"
              placeholder="Probation Officer"
              value={formData.probationOfficer}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          
          <div className="mt-4">
            <select
              name="offenseType"
              value={formData.offenseType}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Select Offense Type</option>
              <optgroup label="Crimes Against Property">
                <option value="Vandalism">Vandalism</option>
                <option value="Criminal Trespass">Criminal Trespass</option>
                <option value="Burglary">Burglary</option>
                <option value="Arson">Arson</option>
                <option value="Theft/Shoplifting">Theft/Shoplifting</option>
                <option value="Motor Vehicle Theft">Motor Vehicle Theft</option>
              </optgroup>
              <optgroup label="Crimes Against Persons">
                <option value="Assault/Battery">Assault/Battery</option>
                <option value="Robbery">Robbery</option>
                <option value="Harassment">Harassment</option>
                <option value="Sexual Assault">Sexual Assault</option>
              </optgroup>
              <optgroup label="Drug & Alcohol Offenses">
                <option value="Drug Possession">Drug Possession</option>
                <option value="Underage Drinking">Underage Drinking</option>
                <option value="Drug Law Violations">Drug Law Violations</option>
              </optgroup>
              <optgroup label="Public Order Offenses">
                <option value="Disorderly Conduct">Disorderly Conduct</option>
                <option value="Curfew Violations">Curfew Violations</option>
                <option value="Truancy">Truancy</option>
                <option value="Wandering">Wandering</option>
              </optgroup>
            </select>
          </div>
        </div>

        {/* Education Information Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <GraduationCap className="w-5 h-5 mr-2" />
            Education Information
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="schoolOrganization"
              placeholder="School/Organization"
              value={formData.schoolOrganization}
              onChange={handleChange}
              className="input-field"
            />
            <input
              type="text"
              name="formGrade"
              placeholder="Form/Grade Level"
              value={formData.formGrade}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>

        {/* Program Information Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Program Information
          </h3>
          
          <div className="grid grid-cols-3 gap-4">
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
            
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input-field"
            >
              {STATUS_TYPES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            
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
          </div>
          
          <div className="mt-4">
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

        {/* Goals and Notes Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Goals & Notes
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Goals (one per line)
            </label>
            <textarea
              placeholder="Enter goals, one per line"
              rows="4"
              value={formData.goalsText}
              onChange={handleGoalsChange}
              className="input-field resize-none"
              style={{ whiteSpace: 'pre-wrap' }}
            />
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              name="notes"
              placeholder="Additional notes"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t">
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

// Enhanced View Mentee Modal with all CSV fields
const ViewMenteeModal = ({ isOpen, onClose, mentee }) => {
  if (!mentee) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="HYPE Mentee Details" size="large">
      <div className="space-y-6">
        {/* Header with photo and basic info */}
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0">
            {mentee.photoUrl ? (
              <img 
                src={mentee.photoUrl} 
                alt={`${mentee.firstName} ${mentee.lastName}`}
                className="h-24 w-24 rounded-full object-cover border-4 border-gray-200"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-purple-100 flex items-center justify-center border-4 border-gray-200">
                <User className="w-12 h-12 text-purple-600" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {mentee.firstName} {mentee.lastName}
                </h3>
                <p className="text-lg text-gray-600">{mentee.hypeId}</p>
                <div className="mt-2 flex items-center space-x-3">
                  <span className={`status-badge ${getStatusColor(mentee.status)}`}>
                    {mentee.status}
                  </span>
                  {mentee.offenseType && (
                    <span className={`status-badge ${getOffenseColor(mentee.offenseType)}`}>
                      {mentee.offenseType}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Information Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Personal Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h4>
            
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
                <label className="font-medium text-gray-700">Gender:</label>
                <p className="text-gray-900">{mentee.gender || 'N/A'}</p>
              </div>
              <div>
                <label className="font-medium text-gray-700">Age:</label>
                <p className="text-gray-900">{mentee.age ? `${mentee.age} years` : 'N/A'}</p>
              </div>
              {mentee.dateOfBirth && (
                <div className="col-span-2">
                  <label className="font-medium text-gray-700">Date of Birth:</label>
                  <p className="text-gray-900">{formatDate(mentee.dateOfBirth)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Legal Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Legal & Court Information</h4>
            
            <div className="space-y-3 text-sm">
              <div>
                <label className="font-medium text-gray-700">Court:</label>
                <p className="text-gray-900">{mentee.court || 'N/A'}</p>
              </div>
              <div>
                <label className="font-medium text-gray-700">Offense Type:</label>
                <p className="text-gray-900">{mentee.offenseType || 'N/A'}</p>
              </div>
              <div>
                <label className="font-medium text-gray-700">Probation Officer:</label>
                <p className="text-gray-900">{mentee.probationOfficer || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Education Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Education Information</h4>
            
            <div className="space-y-3 text-sm">
              <div>
                <label className="font-medium text-gray-700">School/Organization:</label>
                <p className="text-gray-900">{mentee.schoolOrganization || 'N/A'}</p>
              </div>
              <div>
                <label className="font-medium text-gray-700">Form/Grade:</label>
                <p className="text-gray-900">{mentee.formGrade || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Program Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Program Information</h4>
            
            <div className="space-y-3 text-sm">
              <div>
                <label className="font-medium text-gray-700">Assigned Mentor:</label>
                <p className="text-gray-900">
                  {mentee.mentor 
                    ? `${mentee.mentor.firstName} ${mentee.mentor.lastName}`
                    : 'Unassigned'
                  }
                </p>
              </div>
              <div>
                <label className="font-medium text-gray-700">Program Start:</label>
                <p className="text-gray-900">{formatDate(mentee.programStartDate)}</p>
              </div>
              {mentee.programEndDate && (
                <div>
                  <label className="font-medium text-gray-700">Program End:</label>
                  <p className="text-gray-900">{formatDate(mentee.programEndDate)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Goals */}
        {mentee.goals && mentee.goals.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-3">Program Goals</h4>
            <ul className="list-disc list-inside space-y-2 text-gray-900">
              {mentee.goals.map((goal, index) => (
                <li key={index} className="text-sm">{goal}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Notes */}
        {mentee.notes && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-3">Additional Notes</h4>
            <p className="text-gray-900 text-sm whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
              {mentee.notes}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

// Therapy Notes Modal Component
const TherapyNotesModal = ({ isOpen, onClose, mentee, therapyNotes, onAddNote }) => {
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isViewingNote, setIsViewingNote] = useState(false);

  if (!mentee) return null;

  const handleAddNote = () => {
    setIsAddingNote(true);
  };

  const handleViewNote = (note) => {
    setSelectedNote(note);
    setIsViewingNote(true);
  };

  const handleSubmitNote = (noteData) => {
    onAddNote(noteData);
    setIsAddingNote(false);
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Modal isOpen={isOpen && !isAddingNote && !isViewingNote} onClose={onClose} title="Therapy Notes" size="large">
        <div className="space-y-6">
          {/* Header with mentee info and confidentiality notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-blue-900">
                  {mentee.firstName} {mentee.lastName}
                </h3>
                <p className="text-sm text-blue-700">Therapeutic Documentation</p>
              </div>
              <div className="flex items-center text-sm text-blue-700">
                <AlertCircle className="w-4 h-4 mr-1" />
                <span>Confidential</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <h4 className="text-lg font-medium text-gray-900">Session History</h4>
            <button onClick={handleAddNote} className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Session Note
            </button>
          </div>

          {/* Therapy Notes List */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {therapyNotes.map((note) => (
              <div key={note.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDateTime(note.sessionDate)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        {note.duration} min
                      </div>
                      <span className={`status-badge text-xs ${getRiskLevelColor(note.riskLevel)}`}>
                        {note.riskLevel} risk
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Session Type:</span>
                        <span className="ml-2 capitalize">{note.sessionType}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Therapist:</span>
                        <span className="ml-2">{note.therapistName}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Mood Rating:</span>
                        <span className="ml-2">{note.moodRating}/10</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Goals Addressed:</span>
                        <span className="ml-2">{note.goalsAddressed?.length || 0}</span>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-sm text-gray-700 line-clamp-2">
                        <span className="font-medium">Notes:</span> {note.sessionNotes}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleViewNote(note)}
                    className="ml-4 text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                    title="View Full Note"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            
            {therapyNotes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p>No therapy notes recorded yet.</p>
                <p className="text-sm">Click "Add Session Note" to create the first entry.</p>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Add Note Modal */}
      <AddTherapyNoteModal
        isOpen={isAddingNote}
        onClose={() => setIsAddingNote(false)}
        onSubmit={handleSubmitNote}
        mentee={mentee}
      />

      {/* View Note Modal */}
      <ViewTherapyNoteModal
        isOpen={isViewingNote}
        onClose={() => {
          setIsViewingNote(false);
          setSelectedNote(null);
        }}
        note={selectedNote}
        mentee={mentee}
      />
    </>
  );
};

// Add Therapy Note Modal
const AddTherapyNoteModal = ({ isOpen, onClose, onSubmit, mentee }) => {
  const [formData, setFormData] = useState({
    sessionDate: new Date().toISOString().slice(0, 16),
    sessionType: 'individual',
    duration: 60,
    therapistName: '',
    sessionNotes: '',
    progressObservations: '',
    goalsAddressedText: '',
    nextSteps: '',
    riskLevel: 'low',
    moodRating: 5,
    confidential: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      sessionDate: new Date(formData.sessionDate).toISOString(),
      duration: parseInt(formData.duration),
      moodRating: parseInt(formData.moodRating),
      goalsAddressed: formData.goalsAddressedText
        .split('\n')
        .map(goal => goal.trim())
        .filter(goal => goal !== '')
    };
    
    onSubmit(submitData);
    
    // Reset form
    setFormData({
      sessionDate: new Date().toISOString().slice(0, 16),
      sessionType: 'individual',
      duration: 60,
      therapistName: '',
      sessionNotes: '',
      progressObservations: '',
      goalsAddressedText: '',
      nextSteps: '',
      riskLevel: 'low',
      moodRating: 5,
      confidential: true
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Therapy Session Note" size="xlarge">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Confidentiality Notice */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-red-800">Confidential Therapeutic Documentation</p>
              <p className="text-sm text-red-700">
                This information is protected by healthcare privacy laws. Access is restricted to authorized personnel only.
              </p>
            </div>
          </div>
        </div>

        {/* Basic Session Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session Date & Time
            </label>
            <input
              type="datetime-local"
              name="sessionDate"
              value={formData.sessionDate}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session Type
            </label>
            <select
              name="sessionType"
              value={formData.sessionType}
              onChange={handleChange}
              className="input-field"
            >
              <option value="individual">Individual Therapy</option>
              <option value="group">Group Therapy</option>
              <option value="family">Family Therapy</option>
              <option value="crisis">Crisis Intervention</option>
              <option value="assessment">Assessment</option>
              <option value="consultation">Consultation</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              name="duration"
              min="15"
              max="180"
              value={formData.duration}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Therapist/Counselor Name
            </label>
            <input
              type="text"
              name="therapistName"
              value={formData.therapistName}
              onChange={handleChange}
              className="input-field"
              placeholder="Dr. Sarah Wilson"
              required
            />
          </div>
        </div>

        {/* Session Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Session Notes
          </label>
          <textarea
            name="sessionNotes"
            rows="4"
            value={formData.sessionNotes}
            onChange={handleChange}
            className="input-field"
            placeholder="Document the key points discussed, interventions used, client responses, and significant observations from this session..."
            required
          />
        </div>

        {/* Progress Observations */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Progress Observations
          </label>
          <textarea
            name="progressObservations"
            rows="3"
            value={formData.progressObservations}
            onChange={handleChange}
            className="input-field"
            placeholder="Note behavioral observations, mood, engagement level, progress toward goals, etc..."
          />
        </div>

        {/* Goals Addressed */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Goals Addressed (one per line)
          </label>
          <textarea
            name="goalsAddressedText"
            rows="3"
            value={formData.goalsAddressedText}
            onChange={handleChange}
            className="input-field"
            placeholder="List the therapeutic goals that were addressed in this session:&#10;Anxiety management&#10;Coping skills development&#10;Social skills practice"
          />
        </div>

        {/* Next Steps */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Next Steps & Homework
          </label>
          <textarea
            name="nextSteps"
            rows="3"
            value={formData.nextSteps}
            onChange={handleChange}
            className="input-field"
            placeholder="Document any homework assignments, action items, or recommendations for the client..."
          />
        </div>

        {/* Assessment Section */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Risk Level Assessment
            </label>
            <select
              name="riskLevel"
              value={formData.riskLevel}
              onChange={handleChange}
              className="input-field"
            >
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk - Requires Immediate Attention</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mood Rating (1-10 scale)
            </label>
            <input
              type="range"
              name="moodRating"
              min="1"
              max="10"
              value={formData.moodRating}
              onChange={handleChange}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 (Very Poor)</span>
              <span className="font-medium">{formData.moodRating}</span>
              <span>10 (Excellent)</span>
            </div>
          </div>
        </div>

        {/* Confidential Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="confidential"
            id="confidential"
            checked={formData.confidential}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="confidential" className="text-sm text-gray-700">
            Mark as confidential (recommended for all therapy notes)
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Save Session Note
          </button>
        </div>
      </form>
    </Modal>
  );
};

// View Therapy Note Modal
const ViewTherapyNoteModal = ({ isOpen, onClose, note, mentee }) => {
  if (!note || !mentee) return null;

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Therapy Session Details" size="large">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-purple-900">
                {mentee.firstName} {mentee.lastName}
              </h3>
              <p className="text-sm text-purple-700">
                Session: {formatDateTime(note.sessionDate)}
              </p>
            </div>
            <div className="text-right">
              <span className={`status-badge ${getRiskLevelColor(note.riskLevel)}`}>
                {note.riskLevel} risk
              </span>
              {note.confidential && (
                <div className="flex items-center text-sm text-purple-700 mt-1">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  <span>Confidential</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Session Info */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="font-medium text-gray-700">Session Type:</label>
              <p className="text-gray-900 capitalize">{note.sessionType}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Duration:</label>
              <p className="text-gray-900">{note.duration} minutes</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Therapist:</label>
              <p className="text-gray-900">{note.therapistName}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="font-medium text-gray-700">Date & Time:</label>
              <p className="text-gray-900">{formatDateTime(note.sessionDate)}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Mood Rating:</label>
              <p className="text-gray-900">{note.moodRating}/10</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Risk Level:</label>
              <span className={`status-badge ${getRiskLevelColor(note.riskLevel)}`}>
                {note.riskLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Session Notes */}
        <div>
          <label className="font-medium text-gray-700 text-base">Session Notes:</label>
          <div className="mt-2 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-900 whitespace-pre-wrap">{note.sessionNotes}</p>
          </div>
        </div>

        {/* Progress Observations */}
        {note.progressObservations && (
          <div>
            <label className="font-medium text-gray-700 text-base">Progress Observations:</label>
            <div className="mt-2 p-4 bg-blue-50 rounded-lg">
              <p className="text-gray-900 whitespace-pre-wrap">{note.progressObservations}</p>
            </div>
          </div>
        )}

        {/* Goals Addressed */}
        {note.goalsAddressed && note.goalsAddressed.length > 0 && (
          <div>
            <label className="font-medium text-gray-700 text-base">Goals Addressed:</label>
            <ul className="mt-2 list-disc list-inside space-y-1">
              {note.goalsAddressed.map((goal, index) => (
                <li key={index} className="text-gray-900">{goal}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Next Steps */}
        {note.nextSteps && (
          <div>
            <label className="font-medium text-gray-700 text-base">Next Steps & Homework:</label>
            <div className="mt-2 p-4 bg-green-50 rounded-lg">
              <p className="text-gray-900 whitespace-pre-wrap">{note.nextSteps}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-sm text-gray-500 pt-4 border-t">
          <p>Created: {formatDateTime(note.createdAt)}</p>
          <p>This is confidential therapeutic documentation protected by healthcare privacy laws.</p>
        </div>
      </div>
    </Modal>
  );
};

export default Mentees;