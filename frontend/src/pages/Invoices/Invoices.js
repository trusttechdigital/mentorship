import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Eye, DollarSign, Edit, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { apiClient } from '../../services/api';
import { formatDate, formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Modal from '../../components/UI/Modal';
import toast from 'react-hot-toast';
import InvoiceForm from '../../components/Invoices/InvoiceForm';

const getStatusColor = (status) => {
  switch (status) {
    case 'paid':
    case 'approved': 
        return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    case 'overdue': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'paid':
    case 'approved':
        return <CheckCircle className="w-4 h-4" />;
    case 'pending': return <Clock className="w-4 h-4" />;
    case 'rejected':
    case 'overdue': 
        return <AlertTriangle className="w-4 h-4" />;
    default: return null;
  }
};

const Invoices = () => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: invoicesData, isLoading } = useQuery(
    ['invoices', { status: statusFilter !== 'all' ? statusFilter : '' }],
    () => apiClient.get(`/invoices?status=${statusFilter !== 'all' ? statusFilter : ''}`)
  );

  const createInvoiceMutation = useMutation(
    (invoiceData) => apiClient.post('/invoices', invoiceData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('invoices');
        setIsFormModalOpen(false);
        toast.success('Invoice created successfully');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to create invoice');
      }
    }
  );

  const updateInvoiceMutation = useMutation(
    ({ id, ...invoiceData }) => apiClient.put(`/invoices/${id}`, invoiceData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('invoices');
        setIsFormModalOpen(false);
        toast.success('Invoice updated successfully');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update invoice');
      }
    }
  );

  const updateStatusMutation = useMutation(
    ({ id, status }) => apiClient.patch(`/invoices/${id}/status`, { status }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('invoices');
        setIsViewModalOpen(false);
        toast.success('Invoice status updated');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update invoice status');
      }
    }
  );

  const handleOpenCreateForm = () => {
    setSelectedInvoice(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditForm = (invoice) => {
    setSelectedInvoice(invoice);
    setIsFormModalOpen(true);
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setIsViewModalOpen(true);
  };

  const handleFormSubmit = (formData) => {
    if (selectedInvoice) {
      updateInvoiceMutation.mutate({ id: selectedInvoice.id, ...formData });
    } else {
      createInvoiceMutation.mutate(formData);
    }
  };

  const handleStatusUpdate = (invoiceId, newStatus) => {
    updateStatusMutation.mutate({ id: invoiceId, status: newStatus });
  };

  if (isLoading) return <LoadingSpinner size="large" className="py-12" />;

  const invoices = invoicesData?.invoices || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoice Tracking</h1>
          <p className="text-gray-600">Manage vendor payments and invoices</p>
        </div>
        <button
          onClick={handleOpenCreateForm}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Invoice
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
          <option value="paid">Paid</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <div className="table-container">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="th-cell">Invoice</th>
              <th className="th-cell">Vendor</th>
              <th className="th-cell">Total</th>
              <th className="th-cell">Due Date</th>
              <th className="th-cell">Status</th>
              <th className="th-cell">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="td-cell">
                  <div className="flex items-center">
                    <DollarSign className="w-8 h-8 text-gray-400 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">{invoice.invoiceNumber}</div>
                      <div className="text-sm text-gray-500">{formatDate(invoice.issueDate)}</div>
                    </div>
                  </div>
                </td>
                <td className="td-cell">{invoice.vendor}</td>
                <td className="td-cell font-medium">{formatCurrency(invoice.total)}</td>
                <td className="td-cell">{formatDate(invoice.dueDate)}</td>
                <td className="td-cell">
                  <span className={`status-badge ${getStatusColor(invoice.status)}`}>
                    {getStatusIcon(invoice.status)}
                    <span className="ml-1">{invoice.status}</span>
                  </span>
                </td>
                <td className="td-cell">
                  <div className="flex space-x-1">
                    <button onClick={() => handleViewInvoice(invoice)} className="icon-button text-blue-600"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => handleOpenEditForm(invoice)} className="icon-button text-gray-600"><Edit className="w-4 h-4" /></button>
                    {invoice.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(invoice.id, 'approved')}
                          className="icon-button text-green-600"
                          title="Approve"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(invoice.id, 'rejected')}
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

      <InvoiceFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        invoice={selectedInvoice}
        isLoading={createInvoiceMutation.isLoading || updateInvoiceMutation.isLoading}
      />

      <ViewInvoiceModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        invoice={selectedInvoice}
        onStatusUpdate={handleStatusUpdate}
        isUpdatingStatus={updateStatusMutation.isLoading}
      />
    </div>
  );
};

const InvoiceFormModal = ({ isOpen, onClose, onSubmit, invoice, isLoading }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={invoice ? 'Edit Invoice' : 'Create New Invoice'} size="xxlarge">
    <InvoiceForm
      onSubmit={onSubmit}
      onCancel={onClose}
      initialData={invoice}
      isLoading={isLoading}
    />
  </Modal>
);

const ViewInvoiceModal = ({ isOpen, onClose, invoice, onStatusUpdate, isUpdatingStatus }) => {
  if (!invoice) return null;
  
  const canUpdateStatus = invoice.status === 'pending';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Invoice ${invoice.invoiceNumber}`} size="xxlarge">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{invoice.vendor}</h3>
            <p className="text-gray-500">{invoice.invoiceNumber}</p>
          </div>
          <span className={`status-badge-lg ${getStatusColor(invoice.status)}`}>
            {invoice.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Issue Date</label>
            <p className="value">{formatDate(invoice.issueDate)}</p>
          </div>
          <div>
            <label className="label">Due Date</label>
            <p className="value">{formatDate(invoice.dueDate)}</p>
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
                {invoice.lineItems?.map((item, index) => (
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
              <span className="value">{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="label">VAT (15%):</span>
              <span className="value">{formatCurrency(invoice.vat)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span className="label">Total:</span>
              <span className="value">{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>
        
        {invoice.filePath && 
          <a href={invoice.filePath} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Full Invoice</a>
        }
      </div>
      {canUpdateStatus && (
        <div className="modal-footer">
          <button
            onClick={() => onStatusUpdate(invoice.id, 'rejected')}
            className="btn-danger mr-2"
            disabled={isUpdatingStatus}
          >
            <XCircle className="w-4 h-4 mr-2" />
            {isUpdatingStatus ? 'Rejecting...' : 'Reject'}
          </button>
          <button
            onClick={() => onStatusUpdate(invoice.id, 'approved')}
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

export default Invoices;
