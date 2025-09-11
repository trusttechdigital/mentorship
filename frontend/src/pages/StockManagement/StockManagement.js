import React, { useState } from 'react';
import { Package, Plus, Search, AlertTriangle, TrendingUp, Edit, Trash2, Eye } from 'lucide-react';
import Modal from '../../components/UI/Modal';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

// Move getStockStatus function outside component to make it globally accessible
const getStockStatus = (quantity, minQuantity, maxQuantity) => {
  if (quantity <= minQuantity) {
    return { status: 'Low Stock', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
  } else if (maxQuantity && quantity >= maxQuantity) {
    return { status: 'Overstock', color: 'bg-blue-100 text-blue-800', icon: TrendingUp };
  } else if (quantity <= minQuantity * 1.5) {
    return { status: 'Medium', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle };
  }
  return { status: 'In Stock', color: 'bg-green-100 text-green-800', icon: Package };
};

const StockManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Enhanced mock stock data
  const [stockItems, setStockItems] = useState([
    {
      id: '1',
      name: 'Office Supplies Kit',
      sku: 'OSK-001',
      category: 'Office',
      quantity: 25,
      minQuantity: 10,
      maxQuantity: 50,
      unitPrice: 15.99,
      totalValue: 399.75,
      supplier: 'Office Depot',
      location: 'Storage Room A',
      lastUpdated: '2024-08-15',
      description: 'Complete office supplies including pens, papers, staples'
    },
    {
      id: '2', 
      name: 'Training Materials Set',
      sku: 'TMS-002',
      category: 'Training',
      quantity: 8,
      minQuantity: 15,
      maxQuantity: 30,
      unitPrice: 45.00,
      totalValue: 360.00,
      supplier: 'Educational Resources Ltd',
      location: 'Training Center',
      lastUpdated: '2024-08-10',
      description: 'Comprehensive training materials for mentorship programs'
    },
    {
      id: '3',
      name: 'Computer Equipment',
      sku: 'CE-003',
      category: 'Technology',
      quantity: 12,
      minQuantity: 5,
      maxQuantity: 20,
      unitPrice: 899.99,
      totalValue: 10799.88,
      supplier: 'Tech Solutions Inc',
      location: 'IT Storage',
      lastUpdated: '2024-08-20',
      description: 'Laptops and tablets for staff and training purposes'
    },
    {
      id: '4',
      name: 'Cleaning Supplies',
      sku: 'CS-004',
      category: 'Maintenance',
      quantity: 3,
      minQuantity: 10,
      maxQuantity: 25,
      unitPrice: 25.50,
      totalValue: 76.50,
      supplier: 'CleanCorp',
      location: 'Maintenance Room',
      lastUpdated: '2024-08-18',
      description: 'Sanitizers, disinfectants, and cleaning materials'
    }
  ]);

  // Filter items
  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'low' && item.quantity <= item.minQuantity) ||
                         (statusFilter === 'normal' && item.quantity > item.minQuantity && item.quantity < item.maxQuantity) ||
                         (statusFilter === 'overstock' && item.quantity >= item.maxQuantity);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const lowStockItems = stockItems.filter(item => item.quantity <= item.minQuantity);
  const totalValue = stockItems.reduce((sum, item) => sum + item.totalValue, 0);
  const categories = [...new Set(stockItems.map(item => item.category))];

  const handleCreateItem = (formData) => {
    setIsLoading(true);
    setTimeout(() => {
      const newItem = {
        ...formData,
        id: Date.now().toString(),
        totalValue: formData.quantity * formData.unitPrice,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      setStockItems([...stockItems, newItem]);
      setIsCreateModalOpen(false);
      setIsLoading(false);
      toast.success('Stock item added successfully');
    }, 1000);
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleUpdateItem = (formData) => {
    setIsLoading(true);
    setTimeout(() => {
      setStockItems(stockItems.map(item => 
        item.id === selectedItem.id 
          ? { ...item, ...formData, totalValue: formData.quantity * formData.unitPrice, lastUpdated: new Date().toISOString().split('T')[0] }
          : item
      ));
      setIsEditModalOpen(false);
      setSelectedItem(null);
      setIsLoading(false);
      toast.success('Stock item updated successfully');
    }, 1000);
  };

  const handleViewItem = (item) => {
    setSelectedItem(item);
    setIsViewModalOpen(true);
  };

  const handleRestock = (item) => {
    setSelectedItem(item);
    setIsRestockModalOpen(true);
  };

  const handleRestockSubmit = (restockData) => {
    setIsLoading(true);
    setTimeout(() => {
      setStockItems(stockItems.map(item => 
        item.id === selectedItem.id 
          ? { 
              ...item, 
              quantity: restockData.operation === 'add' 
                ? item.quantity + restockData.quantity
                : restockData.operation === 'subtract'
                ? Math.max(0, item.quantity - restockData.quantity)
                : restockData.quantity,
              lastUpdated: new Date().toISOString().split('T')[0]
            }
          : item
      ));
      setIsRestockModalOpen(false);
      setSelectedItem(null);
      setIsLoading(false);
      toast.success('Stock updated successfully');
    }, 1000);
  };

  const handleDeleteItem = (itemId, itemName) => {
    if (window.confirm(`Are you sure you want to delete "${itemName}"?`)) {
      setStockItems(stockItems.filter(item => item.id !== itemId));
      toast.success('Stock item deleted successfully');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
          <p className="text-gray-600">Track inventory and supplies</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600">Total Items</p>
              <p className="text-xl font-bold text-blue-900">{stockItems.length}</p>
            </div>
          </div>
        </div>

        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-600">Low Stock</p>
              <p className="text-xl font-bold text-red-900">{lowStockItems.length}</p>
            </div>
          </div>
        </div>

        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-600">Total Value</p>
              <p className="text-xl font-bold text-green-900">XCD ${totalValue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="card bg-purple-50 border-purple-200">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-600">Categories</p>
              <p className="text-xl font-bold text-purple-900">{categories.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search stock items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 w-64"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input-field w-auto"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-auto"
        >
          <option value="all">All Status</option>
          <option value="low">Low Stock</option>
          <option value="normal">Normal Stock</option>
          <option value="overstock">Overstock</option>
        </select>
      </div>

      {/* Stock Table */}
      <div className="table-container">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unit Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Value
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
            {filteredItems.map((item) => {
              const { status, color, icon: StatusIcon } = getStockStatus(item.quantity, item.minQuantity, item.maxQuantity);
              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Package className="w-8 h-8 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Updated: {item.lastUpdated}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="status-badge bg-blue-100 text-blue-800">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex flex-col">
                      <span className="font-medium">{item.quantity}</span>
                      <span className="text-xs text-gray-500">
                        Min: {item.minQuantity} | Max: {item.maxQuantity || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    XCD ${item.unitPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    XCD ${item.totalValue.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`status-badge ${color} flex items-center`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleViewItem(item)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditItem(item)}
                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                        title="Edit Item"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRestock(item)}
                        className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50"
                        title="Restock"
                      >
                        <Package className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id, item.name)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Delete Item"
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

        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No stock items found.
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateItemModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateItem}
        isLoading={isLoading}
      />

      <EditItemModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedItem(null);
        }}
        onSubmit={handleUpdateItem}
        item={selectedItem}
        isLoading={isLoading}
      />

      <ViewItemModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        onEdit={handleEditItem}
        onRestock={handleRestock}
      />

      <RestockModal
        isOpen={isRestockModalOpen}
        onClose={() => {
          setIsRestockModalOpen(false);
          setSelectedItem(null);
        }}
        onSubmit={handleRestockSubmit}
        item={selectedItem}
        isLoading={isLoading}
      />
    </div>
  );
};

// Modal Components
const CreateItemModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    quantity: '',
    minQuantity: '',
    maxQuantity: '',
    unitPrice: '',
    supplier: '',
    location: '',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      quantity: parseInt(formData.quantity),
      minQuantity: parseInt(formData.minQuantity),
      maxQuantity: formData.maxQuantity ? parseInt(formData.maxQuantity) : null,
      unitPrice: parseFloat(formData.unitPrice)
    });
    setFormData({
      name: '',
      sku: '',
      category: '',
      quantity: '',
      minQuantity: '',
      maxQuantity: '',
      unitPrice: '',
      supplier: '',
      location: '',
      description: ''
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Stock Item" size="large">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Item Name"
            value={formData.name}
            onChange={handleChange}
            className="input-field"
            required
          />
          <input
            type="text"
            name="sku"
            placeholder="SKU Code"
            value={formData.sku}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
            className="input-field"
            required
          />
          <input
            type="number"
            name="quantity"
            placeholder="Initial Quantity"
            min="0"
            value={formData.quantity}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <input
            type="number"
            name="minQuantity"
            placeholder="Minimum Stock"
            min="0"
            value={formData.minQuantity}
            onChange={handleChange}
            className="input-field"
            required
          />
          <input
            type="number"
            name="maxQuantity"
            placeholder="Maximum Stock (optional)"
            min="0"
            value={formData.maxQuantity}
            onChange={handleChange}
            className="input-field"
          />
          <input
            type="number"
            name="unitPrice"
            placeholder="Unit Price (XCD)"
            step="0.01"
            min="0"
            value={formData.unitPrice}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="supplier"
            placeholder="Supplier"
            value={formData.supplier}
            onChange={handleChange}
            className="input-field"
          />
          <input
            type="text"
            name="location"
            placeholder="Storage Location"
            value={formData.location}
            onChange={handleChange}
            className="input-field"
          />
        </div>
        
        <textarea
          name="description"
          placeholder="Description"
          rows="3"
          value={formData.description}
          onChange={handleChange}
          className="input-field"
        />
        
        <div className="flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? <LoadingSpinner size="small" /> : 'Add Item'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const EditItemModal = ({ isOpen, onClose, onSubmit, item, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    quantity: '',
    minQuantity: '',
    maxQuantity: '',
    unitPrice: '',
    supplier: '',
    location: '',
    description: ''
  });

  React.useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        sku: item.sku || '',
        category: item.category || '',
        quantity: item.quantity || '',
        minQuantity: item.minQuantity || '',
        maxQuantity: item.maxQuantity || '',
        unitPrice: item.unitPrice || '',
        supplier: item.supplier || '',
        location: item.location || '',
        description: item.description || ''
      });
    }
  }, [item]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      quantity: parseInt(formData.quantity),
      minQuantity: parseInt(formData.minQuantity),
      maxQuantity: formData.maxQuantity ? parseInt(formData.maxQuantity) : null,
      unitPrice: parseFloat(formData.unitPrice)
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!item) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Stock Item" size="large">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Item Name"
            value={formData.name}
            onChange={handleChange}
            className="input-field"
            required
          />
          <input
            type="text"
            name="sku"
            placeholder="SKU Code"
            value={formData.sku}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
            className="input-field"
            required
          />
          <input
            type="number"
            name="quantity"
            placeholder="Current Quantity"
            min="0"
            value={formData.quantity}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <input
            type="number"
            name="minQuantity"
            placeholder="Minimum Stock"
            min="0"
            value={formData.minQuantity}
            onChange={handleChange}
            className="input-field"
            required
          />
          <input
            type="number"
            name="maxQuantity"
            placeholder="Maximum Stock (optional)"
            min="0"
            value={formData.maxQuantity}
            onChange={handleChange}
            className="input-field"
          />
          <input
            type="number"
            name="unitPrice"
            placeholder="Unit Price (XCD)"
            step="0.01"
            min="0"
            value={formData.unitPrice}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="supplier"
            placeholder="Supplier"
            value={formData.supplier}
            onChange={handleChange}
            className="input-field"
          />
          <input
            type="text"
            name="location"
            placeholder="Storage Location"
            value={formData.location}
            onChange={handleChange}
            className="input-field"
          />
        </div>
        
        <textarea
          name="description"
          placeholder="Description"
          rows="3"
          value={formData.description}
          onChange={handleChange}
          className="input-field"
        />
        
        <div className="flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? <LoadingSpinner size="small" /> : 'Update Item'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const ViewItemModal = ({ isOpen, onClose, item, onEdit, onRestock }) => {
  if (!item) return null;

  const { status, color } = getStockStatus(item.quantity, item.minQuantity, item.maxQuantity);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Stock Item Details" size="medium">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
            <Package className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-medium text-gray-900">{item.name}</h3>
            <p className="text-gray-600">SKU: {item.sku}</p>
            <span className={`status-badge ${color} mt-1`}>
              {status}
            </span>
          </div>
        </div>
        
        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label className="font-medium text-gray-700">Category:</label>
            <p className="text-gray-900">{item.category}</p>
          </div>
          <div>
            <label className="font-medium text-gray-700">Current Quantity:</label>
            <p className="text-gray-900 font-medium">{item.quantity}</p>
          </div>
          <div>
            <label className="font-medium text-gray-700">Minimum Stock:</label>
            <p className="text-gray-900">{item.minQuantity}</p>
          </div>
          <div>
            <label className="font-medium text-gray-700">Maximum Stock:</label>
            <p className="text-gray-900">{item.maxQuantity || 'Not set'}</p>
          </div>
          <div>
            <label className="font-medium text-gray-700">Unit Price:</label>
            <p className="text-gray-900">XCD ${item.unitPrice.toFixed(2)}</p>
          </div>
          <div>
            <label className="font-medium text-gray-700">Total Value:</label>
            <p className="text-gray-900 font-medium">XCD ${item.totalValue.toFixed(2)}</p>
          </div>
          <div>
            <label className="font-medium text-gray-700">Supplier:</label>
            <p className="text-gray-900">{item.supplier || 'N/A'}</p>
          </div>
          <div>
            <label className="font-medium text-gray-700">Location:</label>
            <p className="text-gray-900">{item.location || 'N/A'}</p>
          </div>
          <div className="col-span-2">
            <label className="font-medium text-gray-700">Last Updated:</label>
            <p className="text-gray-900">{item.lastUpdated}</p>
          </div>
        </div>
        
        {/* Description */}
        {item.description && (
          <div>
            <label className="font-medium text-gray-700">Description:</label>
            <p className="text-gray-900 text-sm mt-1">{item.description}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3 pt-4 border-t">
          <button
            onClick={() => {
              onEdit(item);
              onClose();
            }}
            className="btn-primary flex-1"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Item
          </button>
          <button
            onClick={() => {
              onRestock(item);
              onClose();
            }}
            className="btn-secondary flex-1"
          >
            <Package className="w-4 h-4 mr-2" />
            Restock
          </button>
        </div>
      </div>
    </Modal>
  );
};

const RestockModal = ({ isOpen, onClose, onSubmit, item, isLoading }) => {
  const [restockData, setRestockData] = useState({
    quantity: '',
    operation: 'add',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...restockData,
      quantity: parseInt(restockData.quantity)
    });
    setRestockData({
      quantity: '',
      operation: 'add',
      notes: ''
    });
  };

  const handleChange = (e) => {
    setRestockData({ ...restockData, [e.target.name]: e.target.value });
  };

  if (!item) return null;

  const getNewQuantity = () => {
    const qty = parseInt(restockData.quantity) || 0;
    switch (restockData.operation) {
      case 'set':
        return qty;
      case 'add':
        return item.quantity + qty;
      case 'subtract':
        return Math.max(0, item.quantity - qty);
      default:
        return item.quantity;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Stock" size="medium">
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900">{item.name}</h3>
        <p className="text-sm text-gray-600">SKU: {item.sku}</p>
        <p className="text-sm text-gray-600">
          Current Stock: <span className="font-medium">{item.quantity}</span>
        </p>
        <p className="text-sm text-gray-600">
          Minimum Stock: <span className="font-medium">{item.minQuantity}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Operation
          </label>
          <select
            name="operation"
            value={restockData.operation}
            onChange={handleChange}
            className="input-field"
          >
            <option value="add">Add Stock</option>
            <option value="subtract">Remove Stock</option>
            <option value="set">Set Exact Amount</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <input
            type="number"
            name="quantity"
            min="0"
            value={restockData.quantity}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>

        {restockData.quantity && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              New stock level will be: <span className="font-semibold">{getNewQuantity()}</span>
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optional)
          </label>
          <textarea
            name="notes"
            placeholder="Reason for stock adjustment..."
            rows="2"
            value={restockData.notes}
            onChange={handleChange}
            className="input-field"
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? <LoadingSpinner size="small" /> : 'Update Stock'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default StockManagement;