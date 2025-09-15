import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Divider,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  CloudUpload,
  CheckCircle,
  Error,
  Pending,
  Visibility,
  Delete,
  Refresh,
  ExpandMore,
  Image,
  TableChart,
  InsertDriveFile,
  Science,
  PictureAsPdf,
  Description,
  DataObject,
  Archive,
  Code
} from '@mui/icons-material';
import { uploadFile, getFileStatus, checkHealth } from '../services/api';
import FilePreview from './FilePreview';
import UploadProgress from './UploadProgress';

const FileUpload = () => {
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
      icon: <Science />,
      accepts: '.nc,.csv,.xlsx,.json'
    },
    {
      value: 'fish_data',
      label: '🐟 Fish Data',
      description: 'Species counts, catch data',
      icon: <TableChart />,
      accepts: '.csv,.xlsx,.json'
    },
    {
      value: 'otolith_image',
      label: '🔬 Otolith Images',
      description: 'Fish ear bone microscopy',
      icon: <Image />,
      accepts: '.jpg,.jpeg,.png,.tiff,.bmp'
    },
    {
      value: 'research_table',
      label: '📊 Research Tables',
      description: 'Data tables from images/documents',
      icon: <TableChart />,
      accepts: '.jpg,.jpeg,.png,.pdf'
    },
    {
      value: 'document',
      label: '📄 Documents',
      description: 'Research papers, reports',
      icon: <PictureAsPdf />,
      accepts: '.pdf,.doc,.docx,.txt'
    },
    {
      value: 'scientific_data',
      label: '🧪 Scientific Data',
      description: 'JSON, XML, NetCDF files',
      icon: <DataObject />,
      accepts: '.json,.xml,.nc,.h5,.mat'
    },
    {
      value: 'other',
      label: '📁 Other',
      description: 'All supported file types',
      icon: <InsertDriveFile />,
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
        return <CheckCircle color="success" />;
      case 'failed':
        return <Error color="error" />;
      case 'processing':
      default:
        return <Pending color="warning" />;
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
    <Box sx={{ p: 3 }}>
      {/* Server Status & Stats */}
      <Card sx={{ mb: 3, bgcolor: 'primary.50' }}>
        <CardContent>
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              {getServerStatusChip()}
            </Grid>
            <Grid item>
              <Button
                onClick={checkServerHealth}
                size="small"
                variant="outlined"
                startIcon={<Refresh />}
              >
                Check Connection
              </Button>
            </Grid>
            <Grid item sx={{ ml: 'auto' }}>
              <Typography variant="body2" color="text.secondary">
                Total Files Uploaded: <strong>{uploadedFiles.length}</strong>
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Upload Configuration */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📝 Upload Configuration
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Select Data Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Select Data Category"
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.value} value={cat.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {cat.icon}
                        <Box>
                          <Typography variant="body1">{cat.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {cat.description} • {cat.accepts}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of your data..."
                multiline
                maxRows={3}
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="tag1, tag2, tag3..."
                helperText="Comma-separated tags for organization"
                size="small"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* File Drop Zone */}
      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          mb: 3,
          textAlign: 'center',
          cursor: uploading || serverHealth !== 'connected' ? 'not-allowed' : 'pointer',
          bgcolor: isDragActive ? 'primary.50' : 'background.paper',
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'divider',
          transition: 'all 0.3s ease',
          opacity: uploading || serverHealth !== 'connected' ? 0.6 : 1,
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'primary.50'
          }
        }}
      >
        <input {...getInputProps()} />
        
        {serverHealth !== 'connected' ? (
          <Box>
            <Error sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
            <Typography variant="h6" color="error">
              ❌ Server Not Connected
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please start the backend server on port 5000
            </Typography>
          </Box>
        ) : uploading ? (
          <Box>
            <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" color="primary">
              🚀 Uploading...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while your file is being processed
            </Typography>
          </Box>
        ) : isDragActive ? (
          <Box>
            <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" color="primary">
              Drop your files here! 🎯
            </Typography>
          </Box>
        ) : (
          <Box>
            <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Drag & drop files here, or click to browse
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              <strong>Supported formats:</strong> Images (JPG, PNG, GIF, BMP, TIFF, WebP), 
              Spreadsheets (CSV, XLSX, XLS), Documents (PDF, DOC, DOCX, TXT), 
              Data (JSON, XML), Archives (ZIP), Scientific (NetCDF)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Maximum file size: <strong>500MB per file</strong>
            </Typography>
            {selectedCategory !== 'other' && (
              <Chip 
                label={`Selected category accepts: ${categories.find(c => c.value === selectedCategory)?.accepts}`}
                size="small"
                sx={{ mt: 1 }}
              />
            )}
          </Box>
        )}
      </Paper>

      {/* Upload Progress */}
      {uploading && (
        <Box sx={{ mb: 3 }}>
          <UploadProgress progress={uploadProgress} />
        </Box>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📁 Uploaded Files ({uploadedFiles.length})
            </Typography>
            
            <List>
              {uploadedFiles.map((file, index) => (
                <React.Fragment key={file.id}>
                  <ListItem sx={{ alignItems: 'flex-start' }}>
                    <ListItemIcon sx={{ mt: 1 }}>
                      {getFileTypeIcon(file.detectedType)}
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          {getStatusIcon(file.status)}
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {file.name}
                          </Typography>
                          <Chip
                            label={file.status}
                            size="small"
                            color={getStatusColor(file.status)}
                          />
                          {file.detectedType && (
                            <Chip
                              label={file.detectedType.toUpperCase()}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            📦 {formatFileSize(file.size)} • 📁 {file.category.replace('_', ' ')} •
                            📅 {file.uploadDate.toLocaleString()}
                          </Typography>
                          
                          {file.description && (
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              📝 {file.description}
                            </Typography>
                          )}
                          
                          {file.tags && file.tags.length > 0 && (
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                              {file.tags.map((tag, tagIndex) => (
                                <Chip key={tagIndex} label={tag} size="small" variant="outlined" />
                              ))}
                            </Box>
                          )}
                          
                          {file.validationErrors && file.validationErrors.length > 0 && (
                            <Alert severity="error" sx={{ mt: 1 }}>
                              {file.validationErrors.map(err => err.message).join(', ')}
                            </Alert>
                          )}
                          
                          {file.extractedMetadata && file.status === 'completed' && (
                            <Box sx={{ mt: 1 }}>
                              {file.extractedMetadata.extractedText?.text && (
                                <Chip 
                                  label={`Text extracted (${file.extractedMetadata.extractedText.confidence}% confidence)`}
                                  size="small"
                                  color="info"
                                  sx={{ mr: 1, mb: 0.5 }}
                                />
                              )}
                              
                              {file.extractedMetadata.csvInfo && (
                                <Chip 
                                  label={`CSV: ${file.extractedMetadata.csvInfo.rows} rows, ${file.extractedMetadata.csvInfo.columns} columns`}
                                  size="small"
                                  color="success"
                                  sx={{ mr: 1, mb: 0.5 }}
                                />
                              )}
                              
                              {file.extractedMetadata.excelInfo && (
                                <Chip 
                                  label={`Excel: ${file.extractedMetadata.excelInfo.totalSheets} sheets`}
                                  size="small"
                                  color="info"
                                  sx={{ mr: 1, mb: 0.5 }}
                                />
                              )}
                              
                              {file.extractedMetadata.imageInfo && (
                                <Chip 
                                  label={`Image: ${file.extractedMetadata.imageInfo.width}×${file.extractedMetadata.imageInfo.height}px, ${file.extractedMetadata.imageInfo.format}`}
                                  size="small"
                                  color="warning"
                                  sx={{ mr: 1, mb: 0.5 }}
                                />
                              )}
                              
                              {file.extractedMetadata.pdfInfo && (
                                <Chip 
                                  label={`PDF: ${file.extractedMetadata.pdfInfo.pages} pages, ${file.extractedMetadata.pdfInfo.wordCount} words`}
                                  size="small"
                                  color="error"
                                  sx={{ mr: 1, mb: 0.5 }}
                                />
                              )}
                              
                              {file.extractedMetadata.geoData?.hasGeoData && (
                                <Chip 
                                  label="🗺️ Geographic data detected"
                                  size="small"
                                  color="secondary"
                                  sx={{ mr: 1, mb: 0.5 }}
                                />
                              )}
                              
                              {file.extractedMetadata.scientificPatterns?.found && (
                                <Chip 
                                  label="🔬 Scientific patterns found"
                                  size="small"
                                  color="primary"
                                  sx={{ mr: 1, mb: 0.5 }}
                                />
                              )}
                            </Box>
                          )}
                        </Box>
                      }
                    />
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {file.status === 'completed' && (
                        <Button
                          onClick={() => handlePreview(file)}
                          size="small"
                          variant="outlined"
                          startIcon={<Visibility />}
                        >
                          Preview
                        </Button>
                      )}
                      
                      <IconButton
                        onClick={() => handleDeleteFile(file.id)}
                        size="small"
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </ListItem>
                  
                  {index < uploadedFiles.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* File Preview Dialog */}
      <Dialog
        open={previewDialog}
        onClose={() => setPreviewDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          📄 File Preview & Metadata
        </DialogTitle>
        <DialogContent>
          {selectedFile && (
            <FilePreview file={selectedFile} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FileUpload;
