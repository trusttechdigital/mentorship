import React, { useState } from 'react';
import { Lock, CheckCircle } from 'lucide-react';
import Modal from './Modal';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const PasswordChangeModal = ({ isOpen, onClose, required = false }) => {
  const { changePassword, user } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (formData.newPassword === formData.currentPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    try {
      setIsLoading(true);
      await changePassword(formData.currentPassword, formData.newPassword);
      
      // Clear form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Close modal after success
      if (!required) {
        onClose();
      }
      
    } catch (error) {
      // Error handling is done in the changePassword function
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!required) {
      onClose();
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={required ? "Password Change Required" : "Change Password"}
      size="medium"
    >
      {required && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <Lock className="w-5 h-5 text-yellow-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Security Requirement
              </p>
              <p className="text-sm text-yellow-700">
                You must change your password before accessing the system.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Password
          </label>
          <input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            className="input-field"
            placeholder="Enter your current password"
            required
            autoComplete="current-password"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className="input-field"
            placeholder="Enter your new password"
            minLength="6"
            required
            autoComplete="new-password"
          />
          <p className="text-xs text-gray-500 mt-1">
            Must be at least 6 characters long
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm New Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="input-field"
            placeholder="Confirm your new password"
            required
            autoComplete="new-password"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          {!required && (
            <button 
              type="button" 
              onClick={handleClose}
              className="btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
          )}
          <button 
            type="submit" 
            disabled={isLoading}
            className="btn-primary flex items-center"
          >
            {isLoading ? (
              'Changing...'
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Change Password
              </>
            )}
          </button>
        </div>
      </form>

      {required && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Contact your administrator if you need assistance.
          </p>
        </div>
      )}
    </Modal>
  );
};

export default PasswordChangeModal;