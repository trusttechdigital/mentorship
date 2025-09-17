import React, { useState, useEffect } from 'react';
import Modal from '../UI/Modal';
import LoadingSpinner from '../UI/LoadingSpinner';
import toast from 'react-hot-toast';
import api from '../../services/api'; // Corrected import
import { useMutation, useQueryClient } from 'react-query';

const StaffPasswordModal = ({ isOpen, onClose, staffId, staffName }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setConfirmPassword('');
      setErrors({});
    }
  }, [isOpen]);

  const setPasswordMutation = useMutation(
    (newPassword) => api.put(`/staff/${staffId}/set-password`, { password: newPassword }), // Corrected usage
    {
      onSuccess: () => {
        toast.success(`Password for ${staffName} set successfully!`);
        queryClient.invalidateQueries('staff');
        onClose();
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.message || 'Failed to set password.';
        toast.error(errorMessage);
        setErrors({ general: errorMessage });
      },
    }
  );

  const validateForm = () => {
    const newErrors = {};
    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long.';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setPasswordMutation.mutate(password);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Set Password for ${staffName}`} size="small">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            disabled={setPasswordMutation.isLoading}
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input-field"
            disabled={setPasswordMutation.isLoading}
          />
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
        </div>
        {errors.general && <p className="text-red-500 text-sm mt-1">{errors.general}</p>}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={setPasswordMutation.isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={setPasswordMutation.isLoading}
          >
            {setPasswordMutation.isLoading ? <LoadingSpinner size="small" /> : 'Set Password'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default StaffPasswordModal;