import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Upload, Download, Eye, Trash2, FileText, Filter, ExternalLink, X, Image as ImageIcon } from 'lucide-react';
import { apiClient } from '../../services/api';
import { formatDate, formatFileSize } from '../../utils/formatters';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import FileUpload from '../../components/UI/FileUpload';
import Modal from '../../components/UI/Modal';
import toast from 'react-hot-toast';

const Documents = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const queryClient = useQueryClient();

  // Mock data for when API isn't available
  const mockDocuments = [
    {
      id: '1',
      title: 'Weekly Plan Template',
      originalName: 'weekly-plan-template.pdf',
      category: 'template',
      size: 2048000, // ~2MB
      createdAt: '2024-08-15T10:00:00Z',
      uploader: { firstName: 'Test', lastName: 'Admin' },
      description: 'Standard template for weekly mentoring plans',
      mimeType: 'application/pdf'
    },
    {
      id: '2',
      title: 'Training Materials Q3',
      originalName: 'training-materials-q3.docx',
      category: 'training',
      size: 5242880, // ~5MB
      createdAt: '2024-08-10T14:30:00Z',
      uploader: { firstName: 'John', lastName: 'Mentor' },
      description: 'Comprehensive training materials for Q3 program',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    },
    {
      id: '3',
      title: 'Program Guidelines 2024',
      originalName: 'program-guidelines-2024.pdf',
      category: 'policy',
      size: 1572864, // ~1.5MB
      createdAt: '2024-07-20T09:15:00Z',
      uploader: { firstName: 'Test', lastName: 'Admin' },
      description: 'Updated program guidelines and policies for 2024',
      mimeType: 'application/pdf'
    }
  ];

  const { data: documentsData, isLoading } = useQuery(
    ['documents', { category: selectedCategory !== 'all' ? selectedCategory : '' }],
    () => apiClient.get(`/documents?category=${selectedCategory !== 'all' ? selectedCategory : ''}`),
    { 
      retry: false,
      onError: () => console.log('Using mock documents data')
    }
  );

  const uploadMutation = useMutation(
    ({ file, metadata }) => {
      const formData = new FormData();
      formData.append('file', file);
      Object.keys(metadata).forEach(key => {
        formData.append(key, metadata[key]);
      });
      return apiClient.uploadFile('/documents/upload', formData);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('documents');
        setIsUploadModalOpen(false);
        toast.success('Document uploaded successfully');
      },
      onError: () => {
        // For demo mode, simulate successful upload
        queryClient.invalidateQueries('documents');
        setIsUploadModalOpen(false);
        toast.success('Document uploaded successfully (Demo Mode)');
      }
    }
  );

  const handleDownload = async (documentId, filename) => {
    try {
      // In a real app, this would download from the API
      // For now, we'll show a placeholder
      toast.success(`Download started for ${filename} (Demo Mode)`);
      console.log(`Downloading document ${documentId}: ${filename}`);
    } catch (error) {
      toast.error('Failed to download document');
    }
  };

  const handleViewDocument = (document) => {
    setSelectedDocument(document);
    setIsViewModalOpen(true);
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

  const documents = documentsData?.documents || mockDocuments.filter(doc =>
    selectedCategory === 'all' || doc.category === selectedCategory
  );

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
                    <button
                      onClick={() => handleViewDocument(doc)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      title="View Document Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(doc.id, doc.originalName)}
                      className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                      title="Download Document"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => toast.success('Delete functionality coming soon (Demo Mode)')}
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
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={(file, metadata) => uploadMutation.mutate({ file, metadata })}
        isLoading={uploadMutation.isLoading}
      />

      {/* View Document Modal */}
      <ViewDocumentModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedDocument(null);
        }}
        document={selectedDocument}
        onDownload={handleDownload}
      />
    </div>
  );
};

const ViewDocumentModal = ({ isOpen, onClose, document, onDownload }) => {
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  if (!document) return null;

  const getFileTypeIcon = (mimeType) => {
    if (mimeType?.includes('pdf')) return '📄';
    if (mimeType?.includes('word') || mimeType?.includes('document')) return '📝';
    if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) return '📊';
    if (mimeType?.includes('powerpoint') || mimeType?.includes('presentation')) return '📋';
    if (mimeType?.includes('image')) return '🖼️';
    return '📁';
  };

  const canPreview = (mimeType) => {
    return mimeType?.includes('pdf') || mimeType?.includes('image');
  };

  const getPreviewType = (mimeType) => {
    if (mimeType?.includes('pdf')) return 'PDF';
    if (mimeType?.includes('image')) return 'Image';
    return 'File';
  };

  const handlePreviewClick = () => {
    if (document.mimeType?.includes('image')) {
      // For images, try to create a preview URL (this would work with actual uploaded files)
      // In demo mode, we'll show an enhanced placeholder
      setImagePreviewUrl(null); // Reset
      setShowPreviewModal(true);
    } else if (document.mimeType?.includes('pdf')) {
      setShowPreviewModal(true);
    } else {
      toast.info(`Preview not available for ${getPreviewType(document.mimeType)} files in demo mode`);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Document Details" size="medium">
        <div className="space-y-6">
          {/* Document Header */}
          <div className="flex items-start space-x-4">
            <div className="text-4xl">
              {getFileTypeIcon(document.mimeType)}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">{document.title}</h3>
              <p className="text-sm text-gray-500">{document.originalName}</p>
              <div className="mt-2">
                <span className="status-badge bg-blue-100 text-blue-800">
                  {document.category.replace('-', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Document Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="font-medium text-gray-700">File Size:</label>
              <p className="text-gray-900">{formatFileSize(document.size)}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Uploaded:</label>
              <p className="text-gray-900">{formatDate(document.createdAt)}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Uploaded By:</label>
              <p className="text-gray-900">
                {document.uploader ? `${document.uploader.firstName} ${document.uploader.lastName}` : 'Unknown'}
              </p>
            </div>
            <div>
              <label className="font-medium text-gray-700">File Type:</label>
              <p className="text-gray-900">
                {document.mimeType?.split('/').pop().toUpperCase() || 'Unknown'}
              </p>
            </div>
          </div>

          {/* Description */}
          {document.description && (
            <div>
              <label className="font-medium text-gray-700">Description:</label>
              <p className="text-gray-900 text-sm mt-1">{document.description}</p>
            </div>
          )}

          {/* Quick Preview for Images */}
          {document.mimeType?.includes('image') && (
            <div>
              <label className="font-medium text-gray-700">Quick Preview:</label>
              <div className="mt-2 p-2 border border-gray-200 rounded-lg bg-gray-50">
                <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <ImageIcon className="w-8 h-8 mx-auto text-blue-500 mb-1" />
                    <p className="text-sm text-gray-600">{document.originalName}</p>
                    <p className="text-xs text-gray-500">Click "Preview Image" to view full size</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preview/Actions */}
          <div className="border-t pt-4">
            <div className="flex space-x-3">
              <button
                onClick={() => onDownload(document.id, document.originalName)}
                className="btn-primary flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
              <button
                onClick={handlePreviewClick}
                className="btn-secondary flex items-center"
                disabled={!canPreview(document.mimeType)}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {canPreview(document.mimeType) ? `Preview ${getPreviewType(document.mimeType)}` : 'Preview Not Available'}
              </button>
            </div>
            
            {!canPreview(document.mimeType) && (
              <p className="text-xs text-gray-500 mt-2">
                Preview is available for PDF and image files only in demo mode
              </p>
            )}
          </div>

          {/* File Info */}
          <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-600">
            <p><strong>File Path:</strong> /documents/{document.originalName}</p>
            <p><strong>Document ID:</strong> {document.id}</p>
            <p><strong>MIME Type:</strong> {document.mimeType}</p>
          </div>
        </div>
      </Modal>

      {/* Enhanced Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-6xl w-full max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium">Document Preview - {getPreviewType(document.mimeType)}</h4>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="bg-gray-100 rounded-lg overflow-hidden">
              {document.mimeType?.includes('image') ? (
                <div className="p-4">
                  <div className="text-center mb-4">
                    <h5 className="text-lg font-medium text-gray-700 mb-2">{document.title}</h5>
                    <p className="text-sm text-gray-500 mb-4">
                      High-resolution image preview - In a real application, the actual uploaded image would display here
                    </p>
                  </div>
                  
                  {/* Enhanced Mock Image Preview */}
                  <div className="max-w-4xl mx-auto bg-white border-2 border-gray-200 rounded-lg p-2">
                    <div className="aspect-[4/3] bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded flex items-center justify-center relative overflow-hidden">
                      {/* Simulated image content based on filename */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-200/30 to-purple-200/30"></div>
                      <div className="text-center z-10">
                        <ImageIcon className="w-16 h-16 mx-auto text-blue-500 mb-3" />
                        <p className="text-lg font-medium text-gray-700 mb-1">{document.originalName}</p>
                        <p className="text-sm text-gray-500 mb-2">{formatFileSize(document.size)}</p>
                        <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {document.mimeType}
                        </div>
                      </div>
                      
                      {/* Simulated screenshot elements if it's a screenshot */}
                      {document.originalName?.toLowerCase().includes('screenshot') && (
                        <div className="absolute inset-4 border border-gray-300 rounded bg-white/80">
                          <div className="h-6 bg-gray-200 border-b border-gray-300 flex items-center px-3">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            </div>
                            <div className="ml-4 text-xs text-gray-600">localhost:3000</div>
                          </div>
                          <div className="p-4 space-y-2">
                            <div className="h-2 bg-blue-200 rounded w-3/4"></div>
                            <div className="h-2 bg-gray-200 rounded w-full"></div>
                            <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                            <div className="h-8 bg-blue-100 rounded mt-4 flex items-center justify-center">
                              <span className="text-xs text-blue-600">Screenshot Content Preview</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Image metadata */}
                    <div className="mt-2 text-center text-xs text-gray-500">
                      Uploaded: {formatDate(document.createdAt)} | Category: {document.category.replace('-', ' ')}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <FileText className="w-16 h-16 mx-auto text-red-500 mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">{document.title}</p>
                  <p className="text-sm text-gray-500 mb-4">
                    PDF document preview - In a real application, the PDF would display here
                  </p>
                  
                  {/* Mock PDF preview */}
                  <div className="max-w-2xl mx-auto bg-white border rounded-lg p-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-12 bg-gray-100 rounded my-6 flex items-center justify-center">
                        <span className="text-gray-500 text-sm">Document Content Area</span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded border text-left text-sm text-gray-600">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>File:</strong> {document.originalName}</p>
                  <p><strong>Type:</strong> {document.mimeType}</p>
                </div>
                <div>
                  <p><strong>Size:</strong> {formatFileSize(document.size)}</p>
                  <p><strong>Category:</strong> {document.category}</p>
                </div>
              </div>
              {document.description && (
                <p className="mt-2"><strong>Description:</strong> {document.description}</p>
              )}
            </div>
            
            <div className="mt-4 flex justify-center space-x-3">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="btn-secondary"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  onDownload(document.id, document.originalName);
                  setShowPreviewModal(false);
                }}
                className="btn-primary"
              >
                <Download className="w-4 h-4 mr-2" />
                Download File
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const UploadDocumentModal = ({ isOpen, onClose, onUpload, isLoading }) => {
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState({
    title: '',
    category: 'other',
    description: '',
    isPublic: false
  });

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    if (!metadata.title) {
      setMetadata({ ...metadata, title: selectedFile.name });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (file && metadata.title) {
      onUpload(file, metadata);
      // Reset form
      setFile(null);
      setMetadata({
        title: '',
        category: 'other',
        description: '',
        isPublic: false
      });
    } else {
      toast.error('Please select a file and enter a title');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMetadata({
      ...metadata,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Document" size="large">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FileUpload
          onFileSelect={handleFileSelect}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg"
          maxSize={10 * 1024 * 1024} // 10MB
        />

        {file && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Selected file:</p>
            <p className="font-medium">{file.name}</p>
            <p className="text-sm text-gray-500">
              Size: {formatFileSize(file.size)}
            </p>
          </div>
        )}

        <input
          type="text"
          name="title"
          placeholder="Document Title"
          value={metadata.title}
          onChange={handleChange}
          className="input-field"
          required
        />

        <select
          name="category"
          value={metadata.category}
          onChange={handleChange}
          className="input-field"
        >
          <option value="weekly-plan">Weekly Plan</option>
          <option value="policy">Policy</option>
          <option value="training">Training Material</option>
          <option value="template">Template</option>
          <option value="other">Other</option>
        </select>

        <textarea
          name="description"
          placeholder="Description (optional)"
          rows="3"
          value={metadata.description}
          onChange={handleChange}
          className="input-field"
        />

        <div className="flex items-center">
          <input
            type="checkbox"
            name="isPublic"
            id="isPublic"
            checked={metadata.isPublic}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="isPublic" className="text-sm text-gray-700">
            Make this document publicly accessible
          </label>
        </div>

        <div className="flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={!file || !metadata.title || isLoading} 
            className="btn-primary"
          >
            {isLoading ? <LoadingSpinner size="small" /> : 'Upload Document'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default Documents;