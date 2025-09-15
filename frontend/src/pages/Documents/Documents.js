import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Upload, Download, Eye, Trash2, FileText, Filter, ExternalLink } from 'lucide-react';
import { apiClient } from '../../services/api';
import { formatDate, formatFileSize } from '../../utils/formatters';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import FileUpload from '../../components/UI/FileUpload';
import Modal from '../../components/UI/Modal';
import toast from 'react-hot-toast';

const Documents = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const queryClient = useQueryClient();

  const { data: documentsData, isLoading } = useQuery(
    ['documents', { category: selectedCategory !== 'all' ? selectedCategory : '' }],
    () => apiClient.get(`/documents?category=${selectedCategory !== 'all' ? selectedCategory : ''}`)
  );

  const uploadMutation = useMutation(
    (formData) => apiClient.uploadFile('/documents/upload', formData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('documents');
        setIsUploadModalOpen(false);
        toast.success('Document uploaded successfully');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to upload document');
      }
    }
  );

  const handleUpload = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);
    formData.append('category', 'other'); // Default category

    uploadMutation.mutate(formData);
  };

  const categories = [
    { value: 'all', label: 'All Documents' },
    { value: 'weekly-plan', label: 'Weekly Plans' },
    { value: 'policy', label: 'Policies' },
    { value: 'training', label: 'Training Materials' },
    { value: 'template', label: 'Templates' },
    { value: 'other', label: 'Other' }
  ];

  if (isLoading) return <LoadingSpinner size="large" className="py-12" />;

  const documents = documentsData?.documents || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shared Documents</h1>
          <p className="text-gray-600">Manage and share files with your team</p>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="btn-primary"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center space-x-4">
        <Filter className="w-5 h-5 text-gray-400" />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="input-field w-auto"
        >
          {categories.map(category => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      <div className="table-container">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Document
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Uploaded
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Uploaded By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FileText className="w-8 h-8 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {doc.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {doc.originalName}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="status-badge bg-blue-100 text-blue-800">
                    {doc.category.replace('-', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatFileSize(doc.size)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(doc.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {doc.uploader ? `${doc.uploader.firstName} ${doc.uploader.lastName}` : 'Unknown'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <a
                      href={doc.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      title="View Document"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                    <a
                      href={doc.path}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                      title="Download Document"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button 
                      onClick={() => toast.error('Delete functionality coming soon')}
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                      title="Delete Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {documents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No documents found. Upload your first document!
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Document"
      >
        <FileUpload
          onUpload={handleUpload}
          fileTypes=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg"
          maxSize={10 * 1024 * 1024} // 10MB
          folder="documents"
        />
      </Modal>
    </div>
  );
};

export default Documents;
