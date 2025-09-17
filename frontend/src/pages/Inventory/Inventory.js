import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Edit, Package, AlertTriangle, TrendingUp, TrendingDown, Search, Eye, Trash2 } from 'lucide-react';
import api from '../../services/api'; // Corrected import
import { formatCurrency, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Modal from '../../components/UI/Modal';
import ConfirmDialog from '../../components/UI/ConfirmDialog';
import toast from 'react-hot-toast';

const Inventory = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const queryClient = useQueryClient();

  const { data: inventoryData, isLoading } = useQuery(
    ['inventory', { 
      category: categoryFilter !== 'all' ? categoryFilter : '',
      lowStock: stockFilter === 'low',
      search: searchTerm
    }],
    () => {
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (stockFilter === 'low') params.append('lowStock', 'true');
      if (searchTerm) params.append('search', searchTerm);
      return api.get(`/inventory?${params}`); // Corrected usage
    },
    { 
      retry: false,
      onError: () => console.log('Using mock inventory data')
    }
  );

  const createItemMutation = useMutation(
    (data) => api.post('/inventory', data), // Corrected usage
    {
      onSuccess: () => {
        queryClient.invalidateQueries('inventory');
        setIsCreateModalOpen(false);
        toast.success('Inventory item created successfully');
      },
      onError: () => {
        queryClient.invalidateQueries('inventory');
        setIsCreateModalOpen(false);
        toast.success('Inventory item created successfully (Demo Mode)');
      }
    }
  );

  const updateItemMutation = useMutation(
    ({ id, data }) => api.put(`/inventory/${id}`, data), // Corrected usage
    {
      onSuccess: () => {
        queryClient.invalidateQueries('inventory');
        setIsEditModalOpen(false);
        setSelectedItem(null);
        toast.success('Inventory item updated successfully');
      },
      onError: () => {
        toast.error('Failed to update inventory item - API not available');
      }
    }
  );

  const updateStockMutation = useMutation(
    ({ id, quantity, operation }) => 
      api.patch(`/inventory/${id}/stock`, { quantity, operation }), // Corrected usage
    {
      onSuccess: () => {
        queryClient.invalidateQueries('inventory');
        setIsStockModalOpen(false);
        setSelectedItem(null);
        toast.success('Stock updated successfully');
      },
      onError: () => {
        toast.error('Failed to update stock - API not available');
      }
    }
  );

  const deleteItemMutation = useMutation(
    (id) => api.delete(`/inventory/${id}`), // Corrected usage
    {
      onSuccess: () => {
        queryClient.invalidateQueries('inventory');
        toast.success('Inventory item deleted successfully');
      },
      onError: () => {
        toast.error('Failed to delete inventory item - API not available');
      }
    }
  );

  const handleCreateItem = (formData) => {
    createItemMutation.mutate(formData);
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleUpdateItem = (formData) => {
    updateItemMutation.mutate({ id: selectedItem.id, data: formData });
  };

  const handleViewItem = (item) => {
    setSelectedItem(item);
    setIsViewModalOpen(true);
  };

  const handleStockUpdate = (item) => {
    setSelectedItem(item);
    setIsStockModalOpen(true);
  };

  const handleStockSubmit = (stockData) => {
    updateStockMutation.mutate({
      id: selectedItem.id,
      ...stockData
    });
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      deleteItemMutation.mutate(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  const getStockStatus = (item) => {
    if (item.quantity <= 0) return { status: 'out-of-stock', color: 'bg-red-100 text-red-800', icon: <AlertTriangle className="w-4 h-4" /> };
    if (item.quantity <= item.minStock) return { status: 'low-stock', color: 'bg-yellow-100 text-yellow-800', icon: <TrendingDown className="w-4 h-4" /> };
    if (item.maxStock && item.quantity >= item.maxStock) return { status: 'overstock', color: 'bg-blue-100 text-blue-800', icon: <TrendingUp className="w-4 h-4" /> };
    return { status: 'in-stock', color: 'bg-green-100 text-green-800', icon: <Package className="w-4 h-4" /> };
  };

  const getUniqueCategories = () => {
    if (!inventoryData?.inventory) {
      return [...new Set(mockInventory.map(item => item.category))].sort();
    }
    const categories = [...new Set(inventoryData.inventory.map(item => item.category))];
    return categories.sort();
  };

  if (isLoading) return <LoadingSpinner size="large" className="py-12" />;

  // Filter and search inventory
  let inventory = inventoryData?.inventory || mockInventory;
  
  inventory = inventory.filter(item => {
    // Category filter
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    
    // Stock filter
    if (stockFilter === 'low' && item.quantity > item.minStock) return false;
    if (stockFilter === 'out' && item.quantity > 0) return false;
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        item.itemName.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower) ||
        item.sku?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const categories = getUniqueCategories();

  // Calculate stats
  const stats = {
    totalItems: inventory.length,
    lowStock: inventory.filter(item => item.quantity <= item.minStock).length,
    outOfStock: inventory.filter(item => item.quantity === 0).length,
    wellStocked: inventory.filter(item => item.quantity > item.minStock).length,
    totalValue: inventory.reduce((sum, item) => sum + (item.quantity * (item.unitPrice || 0)), 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
          <p className="text-gray-600">Monitor and manage inventory levels</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Total Items</p>
              <p className="text-2xl font-bold text-blue-900">{stats.totalItems}</p>
            </div>
          </div>
        </div>

        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-500 rounded-lg">
              <TrendingDown className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-yellow-600">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.lowStock}</p>
            </div>
          </div>
        </div>

        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-500 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-red-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-900">{stats.outOfStock}</p>
            </div>
          </div>
        </div>

        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-500 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Well Stocked</p>
              <p className="text-2xl font-bold text-green-900">{stats.wellStocked}</p>
            </div>
          </div>
        </div>

        <div className="card bg-purple-50 border-purple-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-600">Total Value</p>
              <p className="text-2xl font-bold text-purple-900">{formatCurrency ? formatCurrency(stats.totalValue) : `$${stats.totalValue.toFixed(2)}`}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 input-field w-64"
          />
        </div>
        
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input-field w-auto"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="input-field w-auto"
        >
          <option value="all">All Stock Levels</option>
          <option value="low">Low Stock Only</option>
          <option value="out">Out of Stock Only</option>
        </select>
      </div>

      <div className="table-container">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Min/Max Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unit Price
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
            {inventory.map((item) => {
              const stockStatus = getStockStatus(item);
              const totalValue = item.quantity * (item.unitPrice || 0);
              
              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Package className="w-8 h-8 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.itemName}
                        </div>
                        {item.description && (
                          <div className="text-sm text-gray-500">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="status-badge bg-blue-100 text-blue-800">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.sku || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.quantity}
                    </div>
                    {item.unitPrice && (
                      <div className="text-sm text-gray-500">
                        Value: {formatCurrency ? formatCurrency(totalValue) : `$${totalValue.toFixed(2)}`}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>Min: {item.minStock}</div>
                    {item.maxStock && (
                      <div className="text-xs text-gray-500">
                        Max: {item.maxStock}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.unitPrice ? (formatCurrency ? formatCurrency(item.unitPrice) : `$${item.unitPrice.toFixed(2)}`) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`status-badge ${stockStatus.color} flex items-center`}>
                      {stockStatus.icon}
                      <span className="ml-1">{stockStatus.status.replace('-', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewItem(item)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStockUpdate(item)}
                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                        title="Update Stock"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditItem(item)}
                        className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50"
                        title="Edit Item"
                      >
                        <Package className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(item)}
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
        {inventory.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No inventory items found. Add your first item!
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateItemModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateItem}
        isLoading={createItemMutation.isLoading}
      />

      <EditItemModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedItem(null);
        }}
        onSubmit={handleUpdateItem}
        item={selectedItem}
        isLoading={updateItemMutation.isLoading}
      />

      <ViewItemModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
      />

      <StockUpdateModal
        isOpen={isStockModalOpen}
        onClose={() => {
          setIsStockModalOpen(false);
          setSelectedItem(null);
        }}
        onSubmit={handleStockSubmit}
        item={selectedItem}
        isLoading={updateStockMutation.isLoading}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Inventory Item"
        message={`Are you sure you want to delete "${itemToDelete?.itemName}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

// Modal Components
const CreateItemModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    category: '',
    quantity: '',
    minStock: '',
    maxStock: '',
    unitPrice: '',
    supplier: '',
    location: '',
    sku: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      quantity: parseInt(formData.quantity) || 0,
      minStock: parseInt(formData.minStock) || 0,
      maxStock: formData.maxStock ? parseInt(formData.maxStock) : null,
      unitPrice: formData.unitPrice ? parseFloat(formData.unitPrice) : null
    };
    onSubmit(submitData);
    setFormData({
      itemName: '',
      description: '',
      category: '',
      quantity: '',
      minStock: '',
      maxStock: '',
      unitPrice: '',
      supplier: '',
      location: '',
      sku: ''
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Inventory Item" size="large">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="itemName"
            placeholder="Item Name"
            value={formData.itemName}
            onChange={handleChange}
            className="input-field"
            required
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>
        
        <textarea
          name="description"
          placeholder="Description (optional)"
          rows="2"
          value={formData.description}
          onChange={handleChange}
          className="input-field"
        />
        
        <div className="grid grid-cols-3 gap-4">
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
          <input
            type="number"
            name="minStock"
            placeholder="Minimum Stock"
            min="0"
            value={formData.minStock}
            onChange={handleChange}
            className="input-field"
            required
          />
          <input
            type="number"
            name="maxStock"
            placeholder="Maximum Stock (optional)"
            min="0"
            value={formData.maxStock}
            onChange={handleChange}
            className="input-field"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            name="unitPrice"
            placeholder="Unit Price (optional)"
            step="0.01"
            min="0"
            value={formData.unitPrice}
            onChange={handleChange}
            className="input-field"
          />
          <input
            type="text"
            name="sku"
            placeholder="SKU (optional)"
            value={formData.sku}
            onChange={handleChange}
            className="input-field"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="supplier"
            placeholder="Supplier (optional)"
            value={formData.supplier}
            onChange={handleChange}
            className="input-field"
          />
          <input
            type="text"
            name="location"
            placeholder="Location (optional)"
            value={formData.location}
            onChange={handleChange}
            className="input-field"
          />
        </div>
        
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
    itemName: '',
    description: '',
    category: '',
    minStock: '',
    maxStock: '',
    unitPrice: '',
    supplier: '',
    location: '',
    sku: '',
    isActive: true
  });

  React.useEffect(() => {
    if (item) {
      setFormData({
        itemName: item.itemName || '',
        description: item.description || '',
        category: item.category || '',
        minStock: item.minStock || '',
        maxStock: item.maxStock || '',
        unitPrice: item.unitPrice || '',
        supplier: item.supplier || '',
        location: item.location || '',
        sku: item.sku || '',
        isActive: item.isActive !== undefined ? item.isActive : true
      });
    }
  }, [item]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      minStock: parseInt(formData.minStock) || 0,
      maxStock: formData.maxStock ? parseInt(formData.maxStock) : null,
      unitPrice: formData.unitPrice ? parseFloat(formData.unitPrice) : null
    };
    onSubmit(submitData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  if (!item) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Inventory Item" size="large">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="itemName"
            placeholder="Item Name"
            value={formData.itemName}
            onChange={handleChange}
            className="input-field"
            required
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>
        
        <textarea
          name="description"
          placeholder="Description (optional)"
          rows="2"
          value={formData.description}
          onChange={handleChange}
          className="input-field"
        />
        
        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            name="minStock"
            placeholder="Minimum Stock"
            min="0"
            value={formData.minStock}
            onChange={handleChange}
            className="input-field"
            required
          />
          <input
            type="number"
            name="maxStock"
            placeholder="Maximum Stock (optional)"
            min="0"
            value={formData.maxStock}
            onChange={handleChange}
            className="input-field"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            name="unitPrice"
            placeholder="Unit Price (optional)"
            step="0.01"
            min="0"
            value={formData.unitPrice}
            onChange={handleChange}
            className="input-field"
          />
          <input
            type="text"
            name="sku"
            placeholder="SKU (optional)"
            value={formData.sku}
            onChange={handleChange}
            className="input-field"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="supplier"
            placeholder="Supplier (optional)"
            value={formData.supplier}
            onChange={handleChange}
            className="input-field"
          />
          <input
            type="text"
            name="location"
            placeholder="Location (optional)"
            value={formData.location}
            onChange={handleChange}
            className="input-field"
          />
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            id="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="isActive" className="text-sm text-gray-700">
            Active item
          </label>
        </div>
        
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

const ViewItemModal = ({ isOpen, onClose, item }) => {
  if (!item) return null;

  const stockStatus = item.quantity <= 0 ? { status: 'out-of-stock', color: 'bg-red-100 text-red-800' } :
                     item.quantity <= item.minStock ? { status: 'low-stock', color: 'bg-yellow-100 text-yellow-800' } :
                     item.maxStock && item.quantity >= item.maxStock ? { status: 'overstock', color: 'bg-blue-100 text-blue-800' } :
                     { status: 'in-stock', color: 'bg-green-100 text-green-800' };

  const totalValue = item.quantity * (item.unitPrice || 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Inventory Item Details" size="medium">
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Package className="w-12 h-12 text-blue-600" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">{item.itemName}</h3>
            <span className={`status-badge ${stockStatus.color}`}>
              {stockStatus.status.replace('-', ' ')}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label className="font-medium text-gray-700">Category:</label>
            <p className="text-gray-900">{item.category}</p>
          </div>
          <div>
            <label className="font-medium text-gray-700">SKU:</label>
            <p className="text-gray-900">{item.sku || 'N/A'}</p>
          </div>
          <div>
            <label className="font-medium text-gray-700">Current Stock:</label>
            <p className="text-gray-900 font-medium">{item.quantity}</p>
          </div>
          <div>
            <label className="font-medium text-gray-700">Min/Max Stock:</label>
            <p className="text-gray-900">{item.minStock} / {item.maxStock || 'N/A'}</p>
          </div>
          <div>
            <label className="font-medium text-gray-700">Unit Price:</label>
            <p className="text-gray-900">{item.unitPrice ? (formatCurrency ? formatCurrency(item.unitPrice) : `$${item.unitPrice.toFixed(2)}`) : 'N/A'}</p>
          </div>
          <div>
            <label className="font-medium text-gray-700">Total Value:</label>
            <p className="text-gray-900 font-medium">{formatCurrency ? formatCurrency(totalValue) : `$${totalValue.toFixed(2)}`}</p>
          </div>
          <div>
            <label className="font-medium text-gray-700">Supplier:</label>
            <p className="text-gray-900">{item.supplier || 'N/A'}</p>
          </div>
          <div>
            <label className="font-medium text-gray-700">Location:</label>
            <p className="text-gray-900">{item.location || 'N/A'}</p>
          </div>
          <div>
            <label className="font-medium text-gray-700">Status:</label>
            <span className={`status-badge ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {item.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div>
            <label className="font-medium text-gray-700">Last Updated:</label>
            <p className="text-gray-900">{formatDate ? formatDate(item.updatedAt) : new Date(item.updatedAt).toLocaleDateString('en-GB')}</p>
          </div>
        </div>
        
        {item.description && (
          <div>
            <label className="font-medium text-gray-700">Description:</label>
            <p className="text-gray-900 text-sm mt-1">{item.description}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

const StockUpdateModal = ({ isOpen, onClose, onSubmit, item, isLoading }) => {
  const [updateData, setUpdateData] = useState({
    quantity: '',
    operation: 'add'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...updateData,
      quantity: parseInt(updateData.quantity)
    });
    setUpdateData({ quantity: '', operation: 'add' });
  };

  const handleChange = (e) => {
    setUpdateData({ ...updateData, [e.target.name]: e.target.value });
  };

  if (!item) return null;

  const getNewQuantity = () => {
    const qty = parseInt(updateData.quantity) || 0;
    switch (updateData.operation) {
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
        <h3 className="font-medium text-gray-900">{item.itemName}</h3>
        <p className="text-sm text-gray-600">
          Current Stock: <span className="font-medium">{item.quantity}</span>
        </p>
        <p className="text-sm text-gray-600">
          Minimum Stock: <span className="font-medium">{item.minStock}</span>
        </p>
        {item.maxStock && (
          <p className="text-sm text-gray-600">
            Maximum Stock: <span className="font-medium">{item.maxStock}</span>
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Operation
          </label>
          <select
            name="operation"
            value={updateData.operation}
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
            value={updateData.quantity}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>

        {updateData.quantity && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              New stock level will be: <span className="font-semibold">{getNewQuantity()}</span>
            </p>
            {getNewQuantity() <= item.minStock && (
              <p className="text-sm text-yellow-600 mt-1">
                ⚠️ This will result in low stock
              </p>
            )}
            {item.maxStock && getNewQuantity() >= item.maxStock && (
              <p className="text-sm text-orange-600 mt-1">
                ⚠️ This will result in overstock
              </p>
            )}
          </div>
        )}
        
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

export default Inventory;