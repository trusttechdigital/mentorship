// frontend/src/components/UI/StatusBadge.js
import React from 'react';

const StatusBadge = ({ status, type = 'default', className = '' }) => {
  const getStatusStyles = () => {
    const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    switch (type) {
      case 'invoice':
        switch (status) {
          case 'paid': return `${baseStyles} bg-green-100 text-green-800`;
          case 'pending': return `${baseStyles} bg-yellow-100 text-yellow-800`;
          case 'overdue': return `${baseStyles} bg-red-100 text-red-800`;
          case 'cancelled': return `${baseStyles} bg-gray-100 text-gray-800`;
          default: return `${baseStyles} bg-gray-100 text-gray-800`;
        }
      case 'receipt':
        switch (status) {
          case 'approved': return `${baseStyles} bg-green-100 text-green-800`;
          case 'pending': return `${baseStyles} bg-yellow-100 text-yellow-800`;
          case 'rejected': return `${baseStyles} bg-red-100 text-red-800`;
          default: return `${baseStyles} bg-gray-100 text-gray-800`;
        }
      case 'mentee':
        switch (status) {
          case 'active': return `${baseStyles} bg-green-100 text-green-800`;
          case 'completed': return `${baseStyles} bg-blue-100 text-blue-800`;
          case 'on-hold': return `${baseStyles} bg-yellow-100 text-yellow-800`;
          case 'dropped': return `${baseStyles} bg-red-100 text-red-800`;
          default: return `${baseStyles} bg-gray-100 text-gray-800`;
        }
      case 'stock':
        switch (status) {
          case 'in-stock': return `${baseStyles} bg-green-100 text-green-800`;
          case 'low-stock': return `${baseStyles} bg-yellow-100 text-yellow-800`;
          case 'out-of-stock': return `${baseStyles} bg-red-100 text-red-800`;
          case 'overstock': return `${baseStyles} bg-blue-100 text-blue-800`;
          default: return `${baseStyles} bg-gray-100 text-gray-800`;
        }
      default:
        return `${baseStyles} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <span className={`${getStatusStyles()} ${className}`}>
      {status.replace('-', ' ')}
    </span>
  );
};

export default StatusBadge;
