import React, { useState } from 'react';
import Modal from '../../components/UI/Modal';
import { formatDateTime } from '../../utils/formatters';
import { Plus, Eye, Calendar, Clock, AlertCircle, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const getRiskLevelColor = (level) => {
  switch (level) {
    case 'high': return 'bg-red-100 text-red-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const TherapyNotesModal = ({ isOpen, onClose, mentee, therapyNotes = [], onAddNote, isAddingNote, isLoadingNotes }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  if (!mentee) return null;

  const handleAddNoteClick = () => setIsAddModalOpen(true);
  const handleViewNoteClick = (note) => setSelectedNote(note);
  const handleCloseAddModal = () => setIsAddModalOpen(false);
  const handleCloseViewModal = () => setSelectedNote(null);

  const handleNoteSubmit = (noteData) => {
    onAddNote(noteData, { onSuccess: handleCloseAddModal });
  };

  const isAnythingOpen = isOpen && !isAddModalOpen && !selectedNote;

  return (
    <>
      <Modal isOpen={isAnythingOpen} onClose={onClose} title="Therapy Notes" size="large">
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-900">{mentee.firstName} {mentee.lastName}</h3>
            <p className="text-sm text-blue-700">Therapeutic Documentation</p>
          </div>

          <div className="flex justify-between items-center">
            <h4 className="text-lg font-medium text-gray-900">Session History</h4>
            <button onClick={handleAddNoteClick} className="btn-primary"><Plus className="w-4 h-4 mr-2" />Add Session Note</button>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {isLoadingNotes ? <LoadingSpinner /> : 
              therapyNotes.length > 0 ? therapyNotes.map((note) => (
                <div key={note.id} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer" onClick={() => handleViewNoteClick(note)}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap space-x-3 mb-2">
                        <div className="flex items-center text-sm text-gray-600"><Calendar className="w-4 h-4 mr-1" />{formatDateTime(note.sessionDate)}</div>
                        <div className="flex items-center text-sm text-gray-600"><Clock className="w-4 h-4 mr-1" />{note.duration} min</div>
                        <span className={`status-badge text-xs ${getRiskLevelColor(note.riskLevel)}`}>{note.riskLevel} risk</span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2"><span className="font-medium">Notes:</span> {note.sessionNotes}</p>
                    </div>
                    <Eye className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" />
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p>No therapy notes recorded yet.</p>
                </div>
              )
            }
          </div>
        </div>
      </Modal>

      <AddTherapyNoteModal isOpen={isAddModalOpen} onClose={handleCloseAddModal} onSubmit={handleNoteSubmit} isLoading={isAddingNote} />
      {selectedNote && <ViewTherapyNoteModal isOpen={!!selectedNote} onClose={handleCloseViewModal} note={selectedNote} mentee={mentee} />}
    </>
  );
};

const SESSION_TYPES = ['Individual Therapy', 'Group Therapy', 'Family Therapy', 'Crisis Management', 'Mentoring Session', 'Intake/Assessment'];

const getLocalDateTimeString = (date) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().slice(0, 16);
};

const AddTherapyNoteModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    sessionDate: getLocalDateTimeString(new Date()),
    sessionType: SESSION_TYPES[0],
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
    const submitData = { ...formData, goalsAddressed: formData.goalsAddressedText.split('\n').filter(g => g.trim() !== '') };
    onSubmit(submitData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Therapy Session Note" size="xlarge">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <p className="text-sm text-red-800">This is confidential therapeutic documentation. Access is restricted.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="form-label">Session Date & Time</label><input type="datetime-local" name="sessionDate" value={formData.sessionDate} onChange={handleChange} className="input-field" required /></div>
            <div><label className="form-label">Session Type</label><select name="sessionType" value={formData.sessionType} onChange={handleChange} className="input-field">{SESSION_TYPES.map(type => <option key={type} value={type}>{type}</option>)}</select></div>
            <div><label className="form-label">Duration (minutes)</label><input type="number" name="duration" value={formData.duration} onChange={handleChange} className="input-field" required /></div>
            <div><label className="form-label">Therapist Name</label><input type="text" name="therapistName" value={formData.therapistName} onChange={handleChange} className="input-field" placeholder="e.g., Dr. Jane Doe" required /></div>
        </div>

        <div><label className="form-label">Session Notes</label><textarea name="sessionNotes" rows="4" value={formData.sessionNotes} onChange={handleChange} className="input-field" placeholder="Document key points, interventions, client responses..." required></textarea></div>
        <div><label className="form-label">Progress Observations</label><textarea name="progressObservations" rows="3" value={formData.progressObservations} onChange={handleChange} className="input-field" placeholder="Behavioral observations, mood, engagement level..."></textarea></div>
        <div><label className="form-label">Goals Addressed (one per line)</label><textarea name="goalsAddressedText" rows="3" value={formData.goalsAddressedText} onChange={handleChange} className="input-field" placeholder="Anxiety management, depression coping skills..."></textarea></div>
        <div><label className="form-label">Next Steps & Homework</label><textarea name="nextSteps" rows="3" value={formData.nextSteps} onChange={handleChange} className="input-field" placeholder="Practice deep breathing exercises, complete thought journal..."></textarea></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="form-label">Risk Level Assessment</label><select name="riskLevel" value={formData.riskLevel} onChange={handleChange} className="input-field"><option value="low">Low Risk</option><option value="medium">Medium Risk</option><option value="high">High Risk</option></select></div>
            <div>
                <label className="form-label">How are they feeling? <span className='font-bold'>{formData.moodRating}/10</span></label>
                <input type="range" name="moodRating" min="1" max="10" value={formData.moodRating} onChange={handleChange} className="w-full" />
                <div className="flex justify-between text-xs text-gray-500 mt-1"><span>1 (Very Poor)</span><span>5 (Neutral)</span><span>10 (Excellent)</span></div>
            </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary ml-5 whitespace-nowrap px-6" disabled={isLoading}>{isLoading ? <LoadingSpinner size='small'/> : 'Save Session Note'}</button>
        </div>
      </form>
    </Modal>
  );
};


// Modal for viewing a single note
const ViewTherapyNoteModal = ({ isOpen, onClose, note, mentee }) => {
  if (!note || !mentee) return null;

  const DetailItem = ({label, children}) => (
    <div>
        <h4 className="text-base font-semibold text-gray-800 border-b pb-2 mb-2">{label}</h4>
        <div className="text-gray-700 text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded-md">{children || 'N/A'}</div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Therapy Session Details" size="xlarge">
      <div className="space-y-6">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-purple-900">{mentee.firstName} {mentee.lastName}</h3>
            <p className="text-sm text-purple-700">Session: {formatDateTime(note.sessionDate)}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className='p-2 bg-gray-100 rounded-lg'><p className='text-xs text-gray-600'>Mood</p><p className='font-bold text-lg'>{note.moodRating}/10</p></div>
            <div className='p-2 bg-gray-100 rounded-lg'><p className='text-xs text-gray-600'>Duration</p><p className='font-bold text-lg'>{note.duration} min</p></div>
            <div className='p-2 bg-gray-100 rounded-lg'><p className='text-xs text-gray-600'>Type</p><p className='font-bold text-lg capitalize'>{note.sessionType}</p></div>
            <div className={`p-2 rounded-lg ${getRiskLevelColor(note.riskLevel)}`}><p className='text-xs'>Risk</p><p className='font-bold text-lg capitalize'>{note.riskLevel}</p></div>
        </div>
        
        <DetailItem label="Session Notes">{note.sessionNotes}</DetailItem>
        <DetailItem label="Progress Observations">{note.progressObservations}</DetailItem>
        <DetailItem label="Goals Addressed"><ul className="list-disc list-inside">{note.goalsAddressed && note.goalsAddressed.length > 0 ? note.goalsAddressed.map((g, i) => <li key={i}>{g}</li>) : 'N/A'}</ul></DetailItem>
        <DetailItem label="Next Steps & Homework">{note.nextSteps}</DetailItem>
        
        <div className="text-xs text-gray-500 pt-4 border-t">Created by {note.therapistName} on {formatDateTime(note.createdAt)}</div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn-secondary">Close</button>
        </div>
      </div>
    </Modal>
  );
};

export default TherapyNotesModal;
