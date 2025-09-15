import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Eye, Receipt, Edit, CheckCircle, XCircle } from 'lucide-react';
import { apiClient } from '../../services/api';
import { formatDate, formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Modal from '../../components/UI/Modal';
import toast from 'react-hot-toast';
import ReceiptForm from '../../components/Receipts/ReceiptForm';

const getStatusColor = (status) => {
  switch (status) {
    case 'approved': return 'bg-green-100 text-green-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const Receipts = () => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: receiptsData, isLoading } = useQuery(
    ['receipts', { status: statusFilter !== 'all' ? statusFilter : '' }],
    () => apiClient.get(`/receipts?status=${statusFilter !== 'all' ? statusFilter : ''}`)
  );

  const createReceiptMutation = useMutation(
    (receiptData) => apiClient.post('/receipts', receiptData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('receipts');
        setIsFormModalOpen(false);
        toast.success('Receipt created successfully');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to create receipt');
      }
    }
  );

  const updateReceiptMutation = useMutation(
    ({ id, ...receiptData }) => apiClient.put(`/receipts/${id}`, receiptData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('receipts');
        setIsFormModalOpen(false);
        toast.success('Receipt updated successfully');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update receipt');
      }
    }
  );
  
  const updateStatusMutation = useMutation(
    ({ id, status }) => apiClient.patch(`/receipts/${id}/status`, { status }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('receipts');
        setIsViewModalOpen(false);
        toast.success('Receipt status updated');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update receipt status');
      }
    }
  );

  const handleOpenCreateForm = () => {
    setSelectedReceipt(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditForm = (receipt) => {
    setSelectedReceipt(receipt);
    setIsFormModalOpen(true);
  };

  const handleViewReceipt = (receipt) => {
    setSelectedReceipt(receipt);
    setIsViewModalOpen(true);
  };

  const handleFormSubmit = (formData) => {
    if (selectedReceipt && selectedReceipt.id) {
      updateReceiptMutation.mutate({ id: selectedReceipt.id, ...formData });
    } else {
      createReceiptMutation.mutate(formData);
    }
  };

  const handleStatusUpdate = (receiptId, newStatus) => {
    updateStatusMutation.mutate({ id: receiptId, status: newStatus });
  };

  if (isLoading) return <LoadingSpinner size="large" className="py-12" />;

  const receipts = receiptsData?.receipts || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Receipt Filing</h1>
          <p className="text-gray-600">Track and manage expense receipts</p>
        </div>
        <button onClick={handleOpenCreateForm} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Receipt
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-auto"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="table-container">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="th-cell text-left">Receipt</th>
              <th className="th-cell text-left">Vendor</th>
              <th className="th-cell text-left">Total</th>
              <th className="th-cell text-left">Category</th>
              <th className="th-cell text-left">Date</th>
              <th className="th-cell text-left">Status</th>
              <th className="th-cell text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {receipts.map((receipt) => (
              <tr key={receipt.id} className="hover:bg-gray-50">
                <td className="td-cell">
                  <div className="flex items-center">
                    <Receipt className="w-8 h-8 text-gray-400 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">{receipt.receiptNumber}</div>
                      <div className="text-sm text-gray-500">by {receipt.uploader?.firstName}</div>
                    </div>
                  </div>
                </td>
                <td className="td-cell">{receipt.vendor}</td>
                <td className="td-cell font-medium">{formatCurrency(receipt.total)}</td>
                <td className="td-cell">
                    <span className="status-badge bg-blue-100 text-blue-800 text-xs">{receipt.category}</span>
                </td>
                <td className="td-cell">{formatDate(receipt.date)}</td>
                <td className="td-cell">
                  <span className={`status-badge ${getStatusColor(receipt.status)}`}>{receipt.status}</span>
                </td>
                <td className="td-cell">
                  <div className="flex space-x-1">
                    <button onClick={() => handleViewReceipt(receipt)} className="icon-button text-blue-600"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => handleOpenEditForm(receipt)} className="icon-button text-gray-600"><Edit className="w-4 h-4" /></button>
                    {receipt.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(receipt.id, 'approved')}
                          className="icon-button text-green-600"
                          title="Approve"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(receipt.id, 'rejected')}
                          className="icon-button text-red-600"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ReceiptFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        receipt={selectedReceipt}
        isLoading={createReceiptMutation.isLoading || updateReceiptMutation.isLoading}
      />

      <ViewReceiptModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        receipt={selectedReceipt}
        onStatusUpdate={handleStatusUpdate}
        isUpdatingStatus={updateStatusMutation.isLoading}
      />
    </div>
  );
};

const ReceiptFormModal = ({ isOpen, onClose, onSubmit, receipt, isLoading }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={receipt ? 'Edit Receipt' : 'Create New Receipt'} size="xxlarge">
    <ReceiptForm
      onSubmit={onSubmit}
      onCancel={onClose}
      initialData={receipt}
      isLoading={isLoading}
    />
  </Modal>
);

const ViewReceiptModal = ({ isOpen, onClose, receipt, onStatusUpdate, isUpdatingStatus }) => {
  if (!receipt) return null;

  const canUpdateStatus = receipt.status === 'pending';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Receipt ${receipt.receiptNumber}`} size="xxlarge">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{receipt.vendor}</h3>
            <p className="text-gray-500">{receipt.receiptNumber}</p>
          </div>
          <span className={`status-badge-lg ${getStatusColor(receipt.status)}`}>
            {receipt.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Date</label>
            <p className="value">{formatDate(receipt.date)}</p>
          </div>
          <div>
            <label className="label">Category</label>
            <p className="value">{receipt.category}</p>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-medium text-gray-800 mb-2">Line Items</h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="th-cell-sm">Description</th>
                  <th className="th-cell-sm text-right">Qty</th>
                  <th className="th-cell-sm text-right">Unit Price</th>
                  <th className="th-cell-sm text-right">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {receipt.lineItems?.map((item, index) => (
                  <tr key={index}>
                    <td className="td-cell-sm">{item.description}</td>
                    <td className="td-cell-sm text-right">{item.quantity}</td>
                    <td className="td-cell-sm text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="td-cell-sm text-right">{formatCurrency(item.quantity * item.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end">
          <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between">
              <span className="label">Subtotal:</span>
              <span className="value">{formatCurrency(receipt.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="label">VAT (15%):</span>
              <span className="value">{formatCurrency(receipt.vat)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span className="label">Total:</span>
              <span className="value">{formatCurrency(receipt.total)}</span>
            </div>
          </div>
        </div>
        
        {receipt.path && 
          <a href={receipt.path} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Full Receipt</a>
        }
      </div>
      {canUpdateStatus && (
        <div className="modal-footer">
          <button
            onClick={() => onStatusUpdate(receipt.id, 'rejected')}
            className="btn-danger mr-2"
            disabled={isUpdatingStatus}
          >
            <XCircle className="w-4 h-4 mr-2" />
            {isUpdatingStatus ? 'Rejecting...' : 'Reject'}
          </button>
          <button
            onClick={() => onStatusUpdate(receipt.id, 'approved')}
            className="btn-success"
            disabled={isUpdatingStatus}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {isUpdatingStatus ? 'Approving...' : 'Approve'}
          </button>
        </div>
      )}
    </Modal>
  );
};

export default Receipts;
