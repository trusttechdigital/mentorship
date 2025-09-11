import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Eye, Edit, DollarSign, Calendar, CheckCircle, Clock, AlertTriangle, Trash2 } from 'lucide-react';
import { apiClient } from '../../services/api';
import { formatDate, formatCurrency, formatDateForInput } from '../../utils/formatters';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Modal from '../../components/UI/Modal';
import toast from 'react-hot-toast';

const Invoices = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();

  // Mock data with VAT (Grenada 15%)
  const mockInvoices = [
    {
      id: '1',
      invoiceNumber: 'INV-175691595997360',
      vendor: 'Office Supply Co.',
      issueDate: '2024-08-15T10:00:00Z',
      dueDate: '2024-09-15T10:00:00Z',
      status: 'pending',
      description: 'Monthly office supplies order',
      notes: 'Standard monthly order for Q3',
      createdBy: { firstName: 'Test', lastName: 'Admin' },
      lineItems: [
        { id: 1, description: 'Printer Paper (A4)', quantity: 10, unitPrice: 12.50, total: 125.00 },
        { id: 2, description: 'Blue Ink Pens', quantity: 20, unitPrice: 2.75, total: 55.00 },
        { id: 3, description: 'Staplers', quantity: 3, unitPrice: 18.50, total: 55.50 },
        { id: 4, description: 'File Folders', quantity: 50, unitPrice: 0.45, total: 22.50 }
      ],
      subtotal: 258.00,
      vatRate: 15,
      vat: 38.70,
      amount: 296.70
    },
    {
      id: '2',
      invoiceNumber: 'INV-175691595997361',
      vendor: 'Tech Solutions Ltd',
      issueDate: '2024-08-10T14:30:00Z',
      dueDate: '2024-08-25T14:30:00Z',
      status: 'paid',
      description: 'Software licensing renewal',
      notes: 'Annual software license renewal',
      createdBy: { firstName: 'John', lastName: 'Mentor' },
      paidDate: '2024-08-24T10:00:00Z',
      lineItems: [
        { id: 1, description: 'Microsoft Office 365 (10 licenses)', quantity: 1, unitPrice: 1200.00, total: 1200.00 }
      ],
      subtotal: 1200.00,
      vatRate: 15,
      vat: 180.00,
      amount: 1380.00
    }
  ];

  const getCurrentUser = () => {
    return {
      firstName: 'Test',
      lastName: 'Admin'
    };
  };

  const currentUser = getCurrentUser();

  const { data: invoicesData, isLoading } = useQuery(
    ['invoices', { status: statusFilter !== 'all' ? statusFilter : '' }],
    () => apiClient.get(`/invoices?status=${statusFilter !== 'all' ? statusFilter : ''}`),
    { 
      retry: false,
      onError: () => console.log('Using mock invoices data')
    }
  );

  const createInvoiceMutation = useMutation(
    (data) => {
      const newInvoice = {
        ...data,
        id: Date.now().toString(),
        invoiceNumber: `INV-${Date.now()}`,
        status: 'pending',
        createdBy: currentUser
      };
      mockInvoices.unshift(newInvoice);
      return Promise.resolve(newInvoice);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('invoices');
        setIsCreateModalOpen(false);
        toast.success('Invoice created successfully');
      },
      onError: () => {
        toast.error('Failed to create invoice');
      }
    }
  );

  const handleCreateInvoice = (invoiceData) => {
    createInvoiceMutation.mutate(invoiceData);
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setIsViewModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4" />;
      default: return null;
    }
  };

  if (isLoading) return <LoadingSpinner size="large" className="py-12" />;

  let invoices = invoicesData?.invoices || mockInvoices;
  invoices = invoices.filter(invoice => statusFilter === 'all' || invoice.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoice Tracking</h1>
          <p className="text-gray-600">Manage vendor payments and invoices (VAT 15%)</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Invoice
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
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <div className="table-container">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vendor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount (incl. VAT)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
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
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <DollarSign className="w-8 h-8 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.invoiceNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(invoice.issueDate)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {invoice.vendor}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {invoice.lineItems?.length || 0} items
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    XCD ${parseFloat(invoice.amount || 0).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Subtotal: XCD ${invoice.subtotal?.toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(invoice.dueDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`status-badge ${getStatusColor(invoice.status)} flex items-center`}>
                    {getStatusIcon(invoice.status)}
                    <span className="ml-1">{invoice.status}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewInvoice(invoice)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      title="View Invoice"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Invoice Modal with VAT */}
      <CreateInvoiceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateInvoice}
        isLoading={createInvoiceMutation.isLoading}
      />

      {/* View Invoice Modal */}
      <ViewInvoiceModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
      />
    </div>
  );
};

// Create Invoice Modal with VAT (15% default for Grenada)
const CreateInvoiceModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    vendor: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    description: '',
    notes: '',
    vatRate: 15 // Grenada VAT rate
  });

  const [lineItems, setLineItems] = useState([
    { id: 1, description: '', quantity: 1, unitPrice: 0, total: 0 }
  ]);

  const calculateItemTotal = (quantity, unitPrice) => {
    return (parseFloat(quantity) || 0) * (parseFloat(unitPrice) || 0);
  };

  const updateLineItem = (id, field, value) => {
    const updatedItems = lineItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = calculateItemTotal(updatedItem.quantity, updatedItem.unitPrice);
        }
        return updatedItem;
      }
      return item;
    });
    setLineItems(updatedItems);
  };

  const addLineItem = () => {
    const newId = Math.max(...lineItems.map(item => item.id)) + 1;
    setLineItems([...lineItems, {
      id: newId,
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    }]);
  };

  const removeLineItem = (id) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const subtotal = lineItems.reduce((sum, item) => sum + (item.total || 0), 0);
  const vat = subtotal * (formData.vatRate / 100);
  const total = subtotal + vat;

  const handleSubmit = (e) => {
    e.preventDefault();
    const invoiceData = {
      ...formData,
      lineItems,
      subtotal,
      vat,
      amount: total
    };
    onSubmit(invoiceData);
    
    // Reset form
    setFormData({
      vendor: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      description: '',
      notes: '',
      vatRate: 15
    });
    setLineItems([{ id: 1, description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Invoice" size="xlarge">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vendor and VAT Rate */}
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="vendor"
            placeholder="Vendor Name"
            value={formData.vendor}
            onChange={handleChange}
            className="input-field"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">VAT Rate (%)</label>
            <select
              name="vatRate"
              value={formData.vatRate}
              onChange={handleChange}
              className="input-field"
            >
              <option value={15}>15% (Standard Grenada VAT)</option>
              <option value={0}>0% (VAT Exempt)</option>
              <option value={10}>10% (Reduced Rate)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
            <input
              type="date"
              name="issueDate"
              value={formData.issueDate}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
        </div>

        {/* Line Items */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Line Items</h3>
            <button
              type="button"
              onClick={addLineItem}
              className="btn-secondary text-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </button>
          </div>

          <div className="space-y-3">
            {lineItems.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded-lg">
                <div className="col-span-5">
                  <input
                    type="text"
                    placeholder="Item description"
                    value={item.description}
                    onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                    className="input-field text-sm"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    placeholder="Qty"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(item.id, 'quantity', e.target.value)}
                    className="input-field text-sm"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    placeholder="Unit Price (XCD)"
                    step="0.01"
                    min="0"
                    value={item.unitPrice}
                    onChange={(e) => updateLineItem(item.id, 'unitPrice', e.target.value)}
                    className="input-field text-sm"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <div className="text-sm font-medium text-gray-900 p-2 bg-white rounded border">
                    XCD ${item.total.toFixed(2)}
                  </div>
                </div>
                <div className="col-span-1">
                  {lineItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLineItem(item.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Totals with VAT */}
          <div className="mt-4 bg-gray-100 p-4 rounded-lg">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">XCD ${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT ({formData.vatRate}%):</span>
                <span className="font-medium">XCD ${vat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total (incl. VAT):</span>
                <span>XCD ${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description and Notes */}
        <textarea
          name="description"
          placeholder="Invoice Description"
          rows="2"
          value={formData.description}
          onChange={handleChange}
          className="input-field"
          required
        />

        <textarea
          name="notes"
          placeholder="Additional Notes (optional)"
          rows="2"
          value={formData.notes}
          onChange={handleChange}
          className="input-field"
        />

        <div className="flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? <LoadingSpinner size="small" /> : 'Create Invoice'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// View Invoice Modal with VAT display
const ViewInvoiceModal = ({ isOpen, onClose, invoice }) => {
  if (!invoice) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invoice Details" size="large">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{invoice.invoiceNumber}</h3>
            <p className="text-gray-600">{invoice.vendor}</p>
          </div>
          <span className={`status-badge ${
            invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 
            invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {invoice.status}
          </span>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label className="font-medium text-gray-700">Issue Date:</label>
            <p className="text-gray-900">{formatDate(invoice.issueDate)}</p>
          </div>
          <div>
            <label className="font-medium text-gray-700">Due Date:</label>
            <p className="text-gray-900">{formatDate(invoice.dueDate)}</p>
          </div>
        </div>

        {/* Line Items */}
        {invoice.lineItems && invoice.lineItems.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Items</h4>
            <div className="table-container">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoice.lineItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.description}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">XCD ${item.unitPrice.toFixed(2)}</td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">XCD ${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Invoice Totals with VAT */}
            <div className="mt-4 bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">XCD ${invoice.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT ({invoice.vatRate || 15}%):</span>
                  <span className="font-medium">XCD ${invoice.vat?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total (incl. VAT):</span>
                  <span>XCD ${invoice.amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Description and Notes */}
        {invoice.description && (
          <div>
            <label className="font-medium text-gray-700">Description:</label>
            <p className="text-gray-900 text-sm mt-1">{invoice.description}</p>
          </div>
        )}

        {invoice.notes && (
          <div>
            <label className="font-medium text-gray-700">Notes:</label>
            <p className="text-gray-900 text-sm mt-1">{invoice.notes}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default Invoices;