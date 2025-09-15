import React, { useState, useEffect } from 'react';
import { X, Plus, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const ReceiptForm = ({ onSubmit, onCancel, initialData, isLoading }) => {
  const [vendor, setVendor] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('other');
  const [status, setStatus] = useState('pending');
  const [file, setFile] = useState(null);
  const [lineItems, setLineItems] = useState([{
    description: '',
    quantity: 1,
    unitPrice: ''
  }]);
  const [subtotal, setSubtotal] = useState(0);
  const [vat, setVat] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (initialData) {
      setVendor(initialData.vendor || '');
      setDate(initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
      setCategory(initialData.category || 'other');
      setStatus(initialData.status || 'pending');
      setLineItems(initialData.lineItems && initialData.lineItems.length > 0 ? initialData.lineItems : [{ description: '', quantity: 1, unitPrice: '' }]);
    }
  }, [initialData]);

  useEffect(() => {
    const newSubtotal = lineItems.reduce((acc, item) => acc + (parseFloat(item.quantity) * parseFloat(item.unitPrice) || 0), 0);
    const newVat = newSubtotal * 0.15; // 15% VAT
    const newTotal = newSubtotal + newVat;
    setSubtotal(newSubtotal);
    setVat(newVat);
    setTotal(newTotal);
  }, [lineItems]);

  const handleLineItemChange = (index, field, value) => {
    const updatedLineItems = [...lineItems];
    updatedLineItems[index][field] = value;
    setLineItems(updatedLineItems);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unitPrice: '' }]);
  };

  const removeLineItem = (index) => {
    const updatedLineItems = lineItems.filter((_, i) => i !== index);
    setLineItems(updatedLineItems);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!vendor || !date || !category) {
      return toast.error('Please fill in Vendor, Date, and Category.');
    }
    if (lineItems.some(item => !item.description || !item.quantity || !item.unitPrice)) {
      return toast.error('Please complete all line item fields.');
    }
    
    const formData = new FormData();
    formData.append('vendor', vendor);
    formData.append('date', date);
    formData.append('category', category);
    formData.append('status', status);
    formData.append('lineItems', JSON.stringify(lineItems));
    formData.append('subtotal', subtotal);
    formData.append('vat', vat);
    formData.append('total', total);
    if (file) {
      formData.append('file', file);
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input type="text" placeholder="Vendor" value={vendor} onChange={(e) => setVendor(e.target.value)} className="input-field" required />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field" required />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
          <option value="office-supplies">Office Supplies</option>
          <option value="travel">Travel</option>
          <option value="meals">Meals & Entertainment</option>
          <option value="training">Training</option>
          <option value="equipment">Equipment</option>
          <option value="utilities">Utilities</option>
          <option value="other">Other</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field">
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      
      <div className="space-y-4">
          <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">Receipt Document</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                          <span>Upload a file</span>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
              </div>
          </div>
          {file && <p className="text-sm text-gray-500">Selected file: {file.name}</p>}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-800">Line Items</h3>
        {lineItems.map((item, index) => (
          <div key={index} className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
            <input
              type="text"
              placeholder="Description"
              value={item.description}
              onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
              className="input-field flex-grow"
              required
            />
            <input
              type="number"
              placeholder="Qty"
              value={item.quantity}
              onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
              className="input-field w-20"
              required
              min="0"
            />
            <input
              type="number"
              placeholder="Unit Price"
              value={item.unitPrice}
              onChange={(e) => handleLineItemChange(index, 'unitPrice', e.target.value)}
              className="input-field w-24"
              required
              step="0.01"
              min="0"
            />
            {lineItems.length > 1 && (
              <button type="button" onClick={() => removeLineItem(index)} className="text-red-500 hover:text-red-700">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addLineItem} className="btn-secondary btn-sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Line Item
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg text-right">
        <div className="space-y-1 text-sm font-medium">
          <div className="flex justify-end items-center">
            <span className="text-gray-600 w-24">Subtotal:</span>
            <span className="text-gray-900">{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-end items-center">
            <span className="text-gray-600 w-24">VAT (15%):</span>
            <span className="text-gray-900">{vat.toFixed(2)}</span>
          </div>
          <div className="flex justify-end items-center text-lg">
            <span className="text-gray-600 w-24">Total:</span>
            <span className="text-gray-900 font-bold">{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={isLoading} className="btn-primary">
          {isLoading ? 'Saving...' : 'Save Receipt'}
        </button>
      </div>
    </form>
  );
};

export default ReceiptForm;
