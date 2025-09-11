import React from 'react';
import { Upload } from 'lucide-react';
import { formatFileSize } from '../../utils/formatters';
import toast from 'react-hot-toast';

const FileUpload = ({ onFileSelect, accept, maxSize = 10 * 1024 * 1024, className = '' }) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > maxSize) {
        toast.error(`File too large. Maximum size: ${formatFileSize(maxSize)}`);
        return;
      }
      onFileSelect(file);
    }
  };

  return (
    <div className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 ${className}`}>
      <input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-sm text-gray-600">
          <span className="font-medium text-blue-600 hover:text-blue-500">
            Click to upload
          </span>{' '}
          or drag and drop
        </p>
        <p className="text-xs text-gray-500">
          Max file size: {formatFileSize(maxSize)}
        </p>
      </label>
    </div>
  );
};

export default FileUpload;