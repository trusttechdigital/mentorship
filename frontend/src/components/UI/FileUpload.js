import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Alert, Box, Button, LinearProgress, Typography } from '@mui/material';

const FileUpload = ({ onUpload, fileTypes, maxSize, folder }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > maxSize) {
        setError(`File size should not exceed ${maxSize / 1024 / 1024}MB`);
        return;
      }

      setUploading(true);
      setError(null);

      try {
        await onUpload(file, folder);
      } catch (err) {
        setError(err.message || 'Upload failed');
      } finally {
        setUploading(false);
      }
    }
  }, [onUpload, maxSize, folder]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: fileTypes,
    multiple: false,
  });

  return (
    <Box
      {...getRootProps()}
      sx={{
        border: '2px dashed',
        borderColor: isDragActive ? 'primary.main' : 'grey.400',
        borderRadius: 1,
        p: 4,
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: isDragActive ? 'action.hover' : 'transparent',
      }}
    >
      <input {...getInputProps()} />
      <Typography>Drag 'n' drop some files here, or click to select files</Typography>
      {uploading && <LinearProgress sx={{ mt: 2 }} />}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Box>
  );
};

export default FileUpload;
