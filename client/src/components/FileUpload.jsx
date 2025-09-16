import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { uploadFile, getFileStatus, checkHealth } from '../services/api';
import FilePreview from './FilePreview';
import UploadProgress from './UploadProgress';
import { CloudUploadIcon, CheckCircleIcon, ErrorIcon, PendingIcon, VisibilityIcon, DeleteIcon, RefreshIcon, ImageIcon, FileIcon } from './icons';

function FileUpload() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('other');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [previewDialog, setPreviewDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [serverHealth, setServerHealth] = useState('checking');

  // Check server health on component mount
  React.useEffect(() => {
    checkServerHealth();
  }, []);

  const checkServerHealth = async () => {
    try {
      await checkHealth();
      setServerHealth('connected');
      toast.success('✅ Connected to server!');
    } catch (error) {
      setServerHealth('disconnected');
      toast.error('❌ Cannot connect to server. Please check if backend is running on port 5000.');
    }
  };

  // Enhanced categories with all supported formats
  const categories = [
    {
      value: 'ocean_data',
      label: '🌊 Ocean Data',
      description: 'Temperature, salinity, current data',
      icon: <FileIcon />,
      accepts: '.nc,.csv,.xlsx,.json'
    },
    {
      value: 'fish_data',
      label: '🐟 Fish Data',
      description: 'Species counts, catch data',
      icon: <FileIcon />,
      accepts: '.csv,.xlsx,.json'
    },
    {
      value: 'otolith_image',
      label: '🔬 Otolith Images',
      description: 'Fish ear bone microscopy',
      icon: <ImageIcon />,
      accepts: '.jpg,.jpeg,.png,.tiff,.bmp'
    },
    {
      value: 'research_table',
      label: '📊 Research Tables',
      description: 'Data tables from images/documents',
      icon: <FileIcon />,
      accepts: '.jpg,.jpeg,.png,.pdf'
    },
    {
      value: 'document',
      label: '📄 Documents',
      description: 'Research papers, reports',
      icon: <FileIcon />,
      accepts: '.pdf,.doc,.docx,.txt'
    },
    {
      value: 'scientific_data',
      label: '🧪 Scientific Data',
      description: 'JSON, XML, NetCDF files',
      icon: <FileIcon />,
      accepts: '.json,.xml,.nc,.h5,.mat'
    },
    {
      value: 'other',
      label: '📁 Other',
      description: 'All supported file types',
      icon: <FileIcon />,
      accepts: '*'
    }
  ];

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (serverHealth !== 'connected') {
      toast.error('❌ Server not connected. Please check backend connection.');
      return;
    }

    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(file => {
        toast.error(`File ${file.file.name} rejected: ${file.errors[0]?.message || 'Unknown error'}`);
      });
    }

    if (acceptedFiles.length > 0) {
      acceptedFiles.forEach(file => {
        handleFileUpload(file);
      });
    }
  }, [selectedCategory, description, tags, serverHealth]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: getAcceptedTypes(),
    maxSize: 500 * 1024 * 1024, // 500MB
    multiple: true,
    disabled: uploading || serverHealth !== 'connected'
  });

  function getAcceptedTypes() {
    const selectedCat = categories.find(cat => cat.value === selectedCategory);
    if (!selectedCat || selectedCat.accepts === '*') {
      return {
        'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.tiff', '.webp'],
        'text/csv': ['.csv'],
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        'application/vnd.ms-excel': ['.xls'],
        'application/pdf': ['.pdf'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'text/plain': ['.txt'],
        'application/json': ['.json'],
        'application/xml': ['.xml'],
        'text/xml': ['.xml'],
        'application/zip': ['.zip'],
        'application/x-netcdf': ['.nc']
      };
    }

    const extensions = selectedCat.accepts.split(',');
    const mimeTypes = {};
    
    extensions.forEach(ext => {
      switch (ext.trim()) {
        case '.jpg':
        case '.jpeg':
        case '.png':
        case '.gif':
        case '.bmp':
        case '.tiff':
        case '.webp':
          mimeTypes['image/*'] = mimeTypes['image/*'] || [];
          mimeTypes['image/*'].push(ext.trim());
          break;
        case '.csv':
          mimeTypes['text/csv'] = ['.csv'];
          break;
        case '.xlsx':
          mimeTypes['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'] = ['.xlsx'];
          break;
        case '.xls':
          mimeTypes['application/vnd.ms-excel'] = ['.xls'];
          break;
        case '.pdf':
          mimeTypes['application/pdf'] = ['.pdf'];
          break;
        case '.doc':
          mimeTypes['application/msword'] = ['.doc'];
          break;
        case '.docx':
          mimeTypes['application/vnd.openxmlformats-officedocument.wordprocessingml.document'] = ['.docx'];
          break;
        case '.txt':
          mimeTypes['text/plain'] = ['.txt'];
          break;
        case '.json':
          mimeTypes['application/json'] = ['.json'];
          break;
        case '.xml':
          mimeTypes['application/xml'] = ['.xml'];
          mimeTypes['text/xml'] = ['.xml'];
          break;
        case '.zip':
          mimeTypes['application/zip'] = ['.zip'];
          break;
        case '.nc':
          mimeTypes['application/x-netcdf'] = ['.nc'];
          break;
      }
    });
    
    return mimeTypes;
  }

  const handleFileUpload = async (file) => {
    if (uploading) {
      toast.warning('Please wait for current upload to complete');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    
    try {
      console.log(`🚀 Starting upload: ${file.name} (${file.size} bytes)`);
      
      const metadata = {
        category: selectedCategory,
        description: description.trim(),
        tags: tags.trim()
      };

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await uploadFile(file, metadata);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        const newFile = {
          id: response.fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          category: selectedCategory,
          status: 'processing',
          uploadDate: new Date(),
          description,
          tags: tags.split(',').map(t => t.trim()).filter(t => t),
          detectedType: response.fileInfo.detectedType
        };

        setUploadedFiles(prev => [newFile, ...prev]);
        toast.success(`✅ ${file.name} uploaded successfully! Detected as: ${response.fileInfo.detectedType}`);

        // Poll for processing status
        pollFileStatus(response.fileId);

        // Clear form
        setDescription('');
        setTags('');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(`❌ Upload failed: ${error.message}`);
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  const pollFileStatus = async (fileId) => {
    const maxPolls = 60; // 10 minutes maximum (10s intervals)
    let pollCount = 0;
    
    const poll = async () => {
      try {
        const response = await getFileStatus(fileId);
        
        setUploadedFiles(prev =>
          prev.map(file =>
            file.id === fileId
              ? {
                  ...file,
                  status: response.file.processingStatus,
                  extractedMetadata: response.file.extractedMetadata,
                  validationErrors: response.file.validationErrors
                }
              : file
          )
        );

        if (response.file.processingStatus === 'completed') {
          toast.success(`🎉 Processing completed for ${response.file.originalName}`);
          return;
        }

        if (response.file.processingStatus === 'failed') {
          toast.error(`❌ Processing failed for ${response.file.originalName}`);
          return;
        }

        if (pollCount < maxPolls && response.file.processingStatus === 'processing') {
          pollCount++;
          setTimeout(poll, 10000); // Poll every 10 seconds
        } else if (pollCount >= maxPolls) {
          toast.warning(`⏰ Processing timeout for ${response.file.originalName}`);
        }
      } catch (error) {
        console.error('Error polling file status:', error);
      }
    };

    poll();
  };

  const handlePreview = (file) => {
    setSelectedFile(file);
    setPreviewDialog(true);
  };

  const handleDeleteFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    toast.info('🗑️ File removed from list');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'failed':
        return <Error color="error" />;
      case 'processing':
      default:
        return <PendingIcon color="warning" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'processing':
      default:
        return 'warning';
    }
  };

  const getFileTypeIcon = (detectedType) => {
    switch (detectedType) {
      case 'image':
        return <Image color="primary" />;
      case 'csv':
        return <TableChart color="success" />;
      case 'excel':
        return <TableChart color="info" />;
      case 'pdf':
        return <PictureAsPdf color="error" />;
      case 'word':
        return <Description color="primary" />;
      case 'json':
      case 'xml':
        return <Code color="secondary" />;
      case 'archive':
        return <Archive color="warning" />;
      default:
        return <InsertDriveFile />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getServerStatusChip = () => {
    switch (serverHealth) {
      case 'connected':
        return <Chip label="🟢 Server Connected" color="success" size="small" />;
      case 'disconnected':
        return <Chip label="🔴 Server Disconnected" color="error" size="small" />;
      default:
        return <Chip label="🟡 Checking Connection" color="warning" size="small" />;
    }
  };

  return (
    <div className="upload">
      {/* Server Status & Stats */}
      <div className="card mb-4">
        <div className="flex items-center gap-4">
          <div className={`upload__status-chip upload__status-chip--${serverHealth}`}>
            {serverHealth === 'connected' && '🟢 Server Connected'}
            {serverHealth === 'disconnected' && '🔴 Server Disconnected'}
            {serverHealth === 'checking' && '🟡 Checking Connection'}
          </div>
          
          <button 
            className="button button--secondary flex items-center gap-2"
            onClick={checkServerHealth}
          >
            <RefreshIcon />
            Check Connection
          </button>
          
          <div className="ml-auto text-sm text-secondary">
            Total Files Uploaded: <span className="font-semibold">{uploadedFiles.length}</span>
          </div>
        </div>
      </div>

      {/* Upload Configuration */}
      <div className="card mb-4">
        <h2 className="text-xl font-semibold mb-4">
          📝 Upload Configuration
        </h2>
        
        <div className="grid gap-4">
          <div className="w-full">
            <label htmlFor="category" className="upload-form__label">
              Select Data Category
            </label>
            <select
              id="category"
              className="upload-form__select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label} - {cat.description}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="description" className="upload-form__label">
                Description
              </label>
              <textarea
                id="description"
                className="upload-form__input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of your data..."
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="tags" className="upload-form__label">
                Tags
              </label>
              <input
                id="tags"
                type="text"
                className="upload-form__input"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="tag1, tag2, tag3..."
              />
              <span className="text-sm text-secondary mt-1 block">
                Comma-separated tags for organization
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* File Drop Zone */}
      <div
        {...getRootProps()}
        className={`upload-zone ${isDragActive ? 'upload-zone--active' : ''} ${
          uploading || serverHealth !== 'connected' ? 'opacity-60 cursor-not-allowed' : ''
        }`}
      >
        <input {...getInputProps()} />
        
        {serverHealth !== 'connected' ? (
          <div className="text-center">
            <div className="upload-zone__icon text-error">
              <ErrorIcon />
            </div>
            <h3 className="upload-zone__title text-error">
              ❌ Server Not Connected
            </h3>
            <p className="upload-zone__text">
              Please start the backend server on port 5000
            </p>
          </div>
        ) : uploading ? (
          <div className="text-center">
            <div className="upload-zone__icon text-primary">
              <CloudUploadIcon />
            </div>
            <h3 className="upload-zone__title">
              🚀 Uploading...
            </h3>
            <p className="upload-zone__text">
              Please wait while your file is being processed
            </p>
          </div>
        ) : isDragActive ? (
          <div className="text-center">
            <div className="upload-zone__icon text-primary">
              <CloudUploadIcon />
            </div>
            <h3 className="upload-zone__title">
              Drop your files here! 🎯
            </h3>
          </div>
        ) : (
          <div className="text-center">
            <div className="upload-zone__icon">
              <CloudUploadIcon />
            </div>
            <h3 className="upload-zone__title">
              Drag & drop files here, or click to browse
            </h3>
            <p className="upload-zone__text">
              <strong>Supported formats:</strong> Images (JPG, PNG, GIF, BMP, TIFF, WebP), 
              Spreadsheets (CSV, XLSX, XLS), Documents (PDF, DOC, DOCX, TXT), 
              Data (JSON, XML), Archives (ZIP), Scientific (NetCDF)
            </p>
            <p className="upload-zone__text">
              Maximum file size: <strong>500MB per file</strong>
            </p>
            {selectedCategory !== 'other' && (
              <div className="upload-form__chip">
                Selected category accepts: {categories.find(c => c.value === selectedCategory)?.accepts}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="mb-4">
          <UploadProgress progress={uploadProgress} />
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">
            📁 Uploaded Files ({uploadedFiles.length})
          </h2>
          
          <div className="file-list">
            {uploadedFiles.map((file, index) => (
              <div key={file.id} className="file-card">
                <div className="file-card__header">
                  <div className="text-primary">
                    {file.detectedType === 'image' ? <ImageIcon /> : <FileIcon />}
                  </div>
                  
                  <div className="file-card__title">
                    {getStatusIcon(file.status)}
                    {file.name}
                  </div>
                  
                  <div className={`file-card__status file-card__status--${file.status}`}>
                    {file.status}
                  </div>
                  
                  {file.detectedType && (
                    <div className="file-card__tag">
                      {file.detectedType.toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="file-card__meta">
                  📦 {formatFileSize(file.size)} • 📁 {file.category.replace('_', ' ')} •
                  📅 {file.uploadDate.toLocaleString()}
                </div>
                
                {file.description && (
                  <div className="file-card__description">
                    📝 {file.description}
                  </div>
                )}
                
                {file.tags && file.tags.length > 0 && (
                  <div className="file-card__tags">
                    {file.tags.map((tag, tagIndex) => (
                      <div key={tagIndex} className="file-card__tag">
                        {tag}
                      </div>
                    ))}
                  </div>
                )}
                
                {file.validationErrors && file.validationErrors.length > 0 && (
                  <div className="alert alert--error mt-2">
                    {file.validationErrors.map(err => err.message).join(', ')}
                  </div>
                )}
                
                {file.extractedMetadata && file.status === 'completed' && (
                  <div className="file-card__tags mt-2">
                    {file.extractedMetadata.extractedText?.text && (
                      <div className="file-card__tag file-card__tag--info">
                        Text extracted ({file.extractedMetadata.extractedText.confidence}% confidence)
                      </div>
                    )}
                    
                    {file.extractedMetadata.csvInfo && (
                      <div className="file-card__tag file-card__tag--success">
                        CSV: {file.extractedMetadata.csvInfo.rows} rows, {file.extractedMetadata.csvInfo.columns} columns
                      </div>
                    )}
                    
                    {file.extractedMetadata.excelInfo && (
                      <div className="file-card__tag file-card__tag--info">
                        Excel: {file.extractedMetadata.excelInfo.totalSheets} sheets
                      </div>
                    )}
                    
                    {file.extractedMetadata.imageInfo && (
                      <div className="file-card__tag file-card__tag--warning">
                        Image: {file.extractedMetadata.imageInfo.width}×{file.extractedMetadata.imageInfo.height}px, {file.extractedMetadata.imageInfo.format}
                      </div>
                    )}
                    
                    {file.extractedMetadata.pdfInfo && (
                      <div className="file-card__tag file-card__tag--error">
                        PDF: {file.extractedMetadata.pdfInfo.pages} pages, {file.extractedMetadata.pdfInfo.wordCount} words
                      </div>
                    )}
                  </div>
                )}

                <div className="file-card__actions">
                  {file.status === 'completed' && (
                    <button
                      onClick={() => handlePreview(file)}
                      className="button--icon button--preview"
                    >
                      <VisibilityIcon />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDeleteFile(file.id)}
                    className="button--icon button--delete"
                  >
                    <DeleteIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {previewDialog && (
        <dialog open className="modal">
          <div className="modal__overlay" onClick={() => setPreviewDialog(false)} />
          <div className="modal__content">
            <div className="modal__header">
              <h2 className="modal__title">📄 File Preview</h2>
              <button 
                className="modal__close"
                onClick={() => setPreviewDialog(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            <div className="modal__body">
              {selectedFile && (
                <FilePreview file={selectedFile} />
              )}
            </div>
            <div className="modal__footer">
              <button 
                className="button button--secondary"
                onClick={() => setPreviewDialog(false)}
              >
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default FileUpload;