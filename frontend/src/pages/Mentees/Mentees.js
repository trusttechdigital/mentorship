import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, BookOpen, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import api from '../../services/api'; // Corrected import
import { formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Modal from '../../components/UI/Modal';
import toast from 'react-hot-toast';
import TherapyNotesModal from './TherapyNotesModal';

// --- Reusable Utility Functions ---
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

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return '';
  try {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    if (isNaN(age)) return '';
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  } catch (error) {
    return '';
  }
};


// --- Main Mentees Component ---
const Mentees = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isTherapyNotesModalOpen, setIsTherapyNotesModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [offenseFilter, setOffenseFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const queryClient = useQueryClient();
  const { id: menteeIdFromUrl } = useParams();
  const navigate = useNavigate();

  // --- Data Fetching ---
  const { data: menteesData, isLoading: isLoadingMentees } = useQuery('mentees', () => api.get('/mentees?limit=1000'), { retry: 1 });
  const { data: therapyNotesData, isLoading: isLoadingNotes } = useQuery(
    ['therapyNotes', selectedMentee?.id],
    () => api.get(`/therapy-notes?menteeId=${selectedMentee.id}`),
    { enabled: !!selectedMentee && isTherapyNotesModalOpen, retry: 1 }
  );
  
  // This query is ONLY for fetching a single user when the ID is in the URL
  useQuery(
    ['mentees', menteeIdFromUrl],
    () => api.get(`/mentees/${menteeIdFromUrl}`),
    {
        enabled: !!menteeIdFromUrl,
        onSuccess: (data) => {
            openModal(setIsViewModalOpen, data.mentee);
        },
        onError: () => {
            toast.error("Could not find mentee.");
            navigate('/mentees');
        }
    }
  );

  // --- Mutations ---
  const useMenteeMutation = (mutationFn, successToast, isUpdate = false) => useMutation(mutationFn, {
    onSuccess: (data, variables) => {
      if (isUpdate) {
        queryClient.setQueryData('mentees', (oldData) => {
            const updatedMentees = oldData.mentees.map(mentee => 
                mentee.id === variables.id ? { ...mentee, ...variables.data } : mentee
            );
            return { ...oldData, mentees: updatedMentees };
        });
      } else {
        queryClient.invalidateQueries('mentees');
      }
      toast.success(successToast);
      closeAllModals();
    },
    onError: (error) => toast.error(error.message || 'An error occurred'),
  });

  const createMenteeMutation = useMenteeMutation((data) => api.post('/mentees', data), 'Mentee created successfully!');
  const updateMenteeMutation = useMenteeMutation(({ id, data }) => api.put(`/mentees/${id}`, data), 'Mentee updated successfully!', true);

  const addTherapyNoteMutation = useMutation((noteData) => api.post('/therapy-notes', noteData), {
    onSuccess: () => {
      queryClient.invalidateQueries(['therapyNotes', selectedMentee.id]);
      toast.success('Therapy note added successfully!');
    },
    onError: (error) => toast.error(error.message || 'Failed to add note.'),
  });

  const uploadPhotoMutation = useMutation(
    ({ id, formData }) => api.uploadFile(`/mentees/${id}/upload-photo`, formData),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('mentees');
        toast.success('Photo uploaded successfully!');
      },
      onError: (error) => {
        console.error('Upload error:', error);
        toast.error(error.response?.data?.message || error.message || 'Failed to upload photo.');
      },
    }
  );

  // --- Event Handlers ---
  const openModal = (modalSetter, mentee = null) => {
    setSelectedMentee(mentee);
    modalSetter(true);
  };

  const closeAllModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsViewModalOpen(false);
    setIsTherapyNotesModalOpen(false);
    setSelectedMentee(null);
    if (menteeIdFromUrl) {
      navigate('/mentees', { replace: true });
    }
  };

  const handleAddNote = (noteData, { onSuccess }) => {
    const payload = { ...noteData, menteeId: selectedMentee.id };
    addTherapyNoteMutation.mutate(payload, { onSuccess });
  };

  const handlePhotoUpload = (file) => {
    if (!selectedMentee) return;
    const formData = new FormData();
    formData.append('photo', file);
    uploadPhotoMutation.mutate({ id: selectedMentee.id, formData });
  };

  // --- Filtering & Pagination ---
  const allMentees = menteesData?.mentees || [];
  const filteredMentees = allMentees.filter(mentee => (statusFilter === 'all' || mentee.status === statusFilter) && (offenseFilter === 'all' || mentee.offenseType === offenseFilter));
  const paginatedMentees = filteredMentees.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const uniqueOffenses = [...new Set(allMentees.map(m => m.offenseType).filter(Boolean))];
  const totalPages = Math.ceil(filteredMentees.length / ITEMS_PER_PAGE);

  if (isLoadingMentees) return <LoadingSpinner size="large" className="py-12" />;

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">HYPE Mentee Directory</h1>
                <p className="text-gray-600">Manage program participants and their documentation.</p>
            </div>
            <button onClick={() => openModal(setIsCreateModalOpen)} className="btn-primary mt-3 sm:mt-0"><Plus className="w-4 h-4 mr-2" />Add Mentee</button>
        </div>

        <div className="bg-white p-4 rounded-lg border flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
            <div className="flex items-center space-x-2"><label className="text-sm font-medium">Status:</label><select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="input-field w-auto"><option value="all">All</option>{['Pending', 'Active', 'On-Hold', 'Completed', 'Discharged'].map(s => <option key={s} value={s}>{s}</option>)}</select></div>
            <div className="flex items-center space-x-2"><label className="text-sm font-medium">Offense:</label><select value={offenseFilter} onChange={e => { setOffenseFilter(e.target.value); setCurrentPage(1); }} className="input-field w-auto"><option value="all">All</option>{uniqueOffenses.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
        </div>

        <div className="table-container overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50"><tr>{['Mentee Info', 'HYPE ID', 'Status', 'School & Grade', 'Probation Officer', 'Actions'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>)}</tr></thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedMentees.map((mentee) => (
                        <tr key={mentee.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{mentee.firstName} {mentee.lastName}</div></td>
                            <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{mentee.hypeId}</div><div className="text-sm text-gray-500">Age: {mentee.age || 'N/A'}</div></td>
                            <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(mentee.status)}`}>{mentee.status}</span></td>
                            <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{mentee.schoolOrganization || 'N/A'}</div><div className="text-sm text-gray-500">Grade: {mentee.formGrade || 'N/A'}</div></td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mentee.probationOfficer || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium"><div className="flex items-center space-x-3">
                                <button onClick={() => openModal(setIsViewModalOpen, mentee)} className="text-blue-600 hover:text-blue-900" title="View"><Eye size={18} /></button>
                                <button onClick={() => openModal(setIsEditModalOpen, mentee)} className="text-green-600 hover:text-green-900" title="Edit"><Edit size={18} /></button>
                                <button onClick={() => openModal(setIsTherapyNotesModalOpen, mentee)} className="text-purple-600 hover:text-purple-900" title="Therapy Notes"><BookOpen size={18} /></button>
                                <button onClick={() => toast.error('Delete is disabled')} className="text-red-600 hover:text-red-900" title="Delete"><Trash2 size={18} /></button>
                            </div></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {filteredMentees.length === 0 && <div className="text-center py-8 text-gray-500">No mentees found.</div>}
        </div>

        {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} count={filteredMentees.length} />}

        {isCreateModalOpen && <MenteeModal isOpen={isCreateModalOpen} onClose={closeAllModals} onSubmit={createMenteeMutation.mutate} isLoading={createMenteeMutation.isLoading} title="Add New Mentee" />}
        {isEditModalOpen && <MenteeModal isOpen={isEditModalOpen} onClose={closeAllModals} onSubmit={(data) => updateMenteeMutation.mutate({ id: selectedMentee.id, data })} onUploadPhoto={handlePhotoUpload} isUploading={uploadPhotoMutation.isLoading} isLoading={updateMenteeMutation.isLoading} mentee={selectedMentee} title="Edit Mentee" />}
        {isViewModalOpen && <ViewMenteeModal isOpen={isViewModalOpen} onClose={closeAllModals} mentee={selectedMentee} />}
        {isTherapyNotesModalOpen && <TherapyNotesModal isOpen={isTherapyNotesModalOpen} onClose={closeAllModals} mentee={selectedMentee} therapyNotes={therapyNotesData?.notes || []} isLoadingNotes={isLoadingNotes} onAddNote={handleAddNote} isAddingNote={addTherapyNoteMutation.isLoading} />}
    </div>
  );
};

// --- Sub-Components ---
const Pagination = ({ currentPage, totalPages, onPageChange, count }) => (
    <div className="flex justify-between items-center pt-4 border-t">
        <p className='text-sm text-gray-700'>Showing 1 to {Math.min(currentPage * 10, count)} of {count} results</p>
        <div className="flex items-center space-x-2">
            <button onClick={() => onPageChange(c => c - 1)} disabled={currentPage === 1} className="btn-secondary flex items-center"><ChevronLeft size={16} className="mr-1"/>Prev</button>
            <span>{currentPage} of {totalPages}</span>
            <button onClick={() => onPageChange(c => c + 1)} disabled={currentPage === totalPages} className="btn-secondary flex items-center">Next<ChevronRight size={16} className="ml-1"/></button>
        </div>
    </div>
);

const MenteeModal = ({ isOpen, onClose, onSubmit, mentee = {}, title, isLoading, onUploadPhoto, isUploading }) => {
  const [formData, setFormData] = useState({});
  const fileInputRef = useRef(null);
  const isEditMode = !!mentee.id;
  
  useEffect(() => {
    setFormData({ ...mentee, dateOfBirth: mentee.dateOfBirth ? new Date(mentee.dateOfBirth).toISOString().split('T')[0] : '' });
  }, [mentee]);

  const handleSubmit = (e) => { 
    e.preventDefault(); 
    const { photoUrl, ...submitData } = formData; // Exclude photoUrl from form submission
    onSubmit(submitData);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value, ...(name === 'dateOfBirth' && { age: calculateAge(value) }) }));
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) onUploadPhoto(file);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="3xl">
      <form onSubmit={handleSubmit} className="flex space-x-8">
        {isEditMode && (
          <div className="w-1/3 flex flex-col items-center">
            <div className="relative group w-40 h-40">
              {mentee.photoUrl ? (
                <img 
                  className="h-full w-full rounded-full object-cover transition-all duration-300 group-hover:brightness-50"
                  src={mentee.photoUrl} 
                  alt={`${mentee.firstName} ${mentee.lastName}`}
                />
              ) : (
                <div className="h-full w-full rounded-full bg-teal-500 flex items-center justify-center">
                  <span className="text-white text-lg font-bold">{mentee.firstName.charAt(0)}{mentee.lastName.charAt(0)}</span>
                </div>
              )}
              <button 
                type="button" 
                onClick={() => fileInputRef.current.click()}
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 rounded-full transition-opacity duration-300">
                <Camera size={24}/>
              </button>
            </div>
            <button type="button" onClick={() => fileInputRef.current.click()} className="btn-secondary mt-4 text-sm">
              <Camera size={16} className="mr-2"/>
              {mentee.photoUrl ? 'Change Photo' : 'Upload Photo'}
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/jpeg, image/png, image/webp"/>
            {isUploading && <div className="mt-2 flex items-center"><LoadingSpinner size='small'/><span className='ml-2'>Uploading...</span></div>}
          </div>
        )}
        <div className={isEditMode ? "w-2/3 space-y-4" : "w-full space-y-4"}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input name="hypeId" placeholder="HYPE ID" value={formData.hypeId || ''} onChange={handleChange} className="input-field" required/>
            <input name="firstName" placeholder="First Name" value={formData.firstName || ''} onChange={handleChange} className="input-field" required/>
            <input name="lastName" placeholder="Last Name" value={formData.lastName || ''} onChange={handleChange} className="input-field" required/>
          </div>
          <input name="email" type="email" placeholder="Email Address" value={formData.email || ''} onChange={handleChange} className="input-field"/>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="date" name="dateOfBirth" value={formData.dateOfBirth || ''} onChange={handleChange} className="input-field"/>
            <input name="age" placeholder="Age" value={formData.age || ''} onChange={handleChange} className="input-field bg-gray-100" readOnly/>
            <select name="gender" value={formData.gender || ''} onChange={handleChange} className="input-field">
                <option value="">Select Gender</option><option value="Male">Male</option><option value="Female">Female</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="schoolOrganization" placeholder="School / Organization" value={formData.schoolOrganization || ''} onChange={handleChange} className="input-field"/>
            <input name="formGrade" placeholder="Grade / Form" value={formData.formGrade || ''} onChange={handleChange} className="input-field"/>
          </div>
          <input name="probationOfficer" placeholder="Probation Officer" value={formData.probationOfficer || ''} onChange={handleChange} className="input-field"/>
          <select name="status" value={formData.status || 'Pending'} onChange={handleChange} className="input-field">
            {['Pending', 'Active', 'On-Hold', 'Completed', 'Discharged'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={isLoading || isUploading}>{isLoading ? <LoadingSpinner size='small'/> : title.split(' ')[0]}</button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

const ViewMenteeModal = ({ isOpen, onClose, mentee }) => {
  if (!mentee) return null;
  const InfoItem = ({ label, value }) => <div className='py-2'><p className="text-sm text-gray-500">{label}</p><p className="text-base text-gray-900">{value || 'N/A'}</p></div>;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${mentee.firstName} ${mentee.lastName}`} size="2xl">
      <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
        <div className="w-full md:w-1/3 flex-shrink-0 flex justify-center">
          {mentee.photoUrl ? (
            <img className="h-40 w-40 rounded-full object-cover" src={mentee.photoUrl} alt="Mentee" />
          ) : (
            <div className="h-40 w-40 rounded-full bg-teal-500 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">{mentee.firstName.charAt(0)}{mentee.lastName.charAt(0)}</span>
            </div>
          )}
        </div>
        <div className="w-full md:w-2/3 grid grid-cols-2 gap-x-8 gap-y-4">
          <InfoItem label="HYPE ID" value={mentee.hypeId} />
          <InfoItem label="Status" value={<span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(mentee.status)}`}>{mentee.status}</span>} />
          <InfoItem label="Date of Birth" value={mentee.dateOfBirth ? formatDate(mentee.dateOfBirth) : 'N/A'} />
          <InfoItem label="Age" value={mentee.age} />
          <InfoItem label="Gender" value={mentee.gender} />
          <InfoItem label="Email" value={mentee.email} />
          <InfoItem label="School / Org" value={mentee.schoolOrganization} />
          <InfoItem label="Grade / Form" value={mentee.formGrade} />
          <InfoItem label="Probation Officer" value={mentee.probationOfficer} />
        </div>
      </div>
    </Modal>
  );
};

export default Mentees;
