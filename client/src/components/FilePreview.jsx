import React, { useState, useEffect } from 'react';
import { getFileData, downloadFile } from '../services/api';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
  Chip,
  Stack,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  Close,
  Download,
  Fullscreen,
  FullscreenExit,
  Refresh,
  TableChart,
  Image as ImageIcon,
  Description,
  DataObject,
  TextFields
} from '@mui/icons-material';

const FilePreviewModal = ({ open, onClose, file }) => {
  const [fullscreen, setFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileData, setFileData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Load actual file data when modal opens
  useEffect(() => {
    if (open && file?.id) {
      loadFileData();
    } else {
      // Reset state when modal closes
      setFileData(null);
      setError(null);
      setActiveTab(0);
    }
  }, [open, file]);

  const loadFileData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📖 Loading file data for:', file.id);
      const response = await getFileData(file.id);
      setFileData(response.fileData);
      console.log('✅ File data loaded:', response.fileData);
    } catch (error) {
      console.error('❌ Failed to load file data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      await downloadFile(file.id, file.originalName || file.name);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderCSVData = (data) => (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Chip 
          icon={<TableChart />} 
          label={`${data.totalRows.toLocaleString()} rows`} 
          color="primary" 
          variant="filled"
        />
        <Chip 
          icon={<TableChart />} 
          label={`${data.totalColumns} columns`} 
          color="secondary" 
          variant="filled"
        />
        <Chip 
          label={`Size: ${formatFileSize(data.totalRows * data.totalColumns * 50)}`} 
          color="info" 
          variant="outlined"
        />
      </Stack>
      
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: fullscreen ? '70vh' : '500px' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', fontWeight: 'bold' }}>
                  #
                </TableCell>
                {data.headers.map((header, index) => (
                  <TableCell 
                    key={index}
                    sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', fontWeight: 'bold', minWidth: 120 }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.data.map((row, index) => (
                <TableRow key={index} hover sx={{ '&:nth-of-type(odd)': { bgcolor: 'grey.50' } }}>
                  <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {index + 1}
                  </TableCell>
                  {data.headers.map((header, cellIndex) => (
                    <TableCell key={cellIndex} sx={{ maxWidth: 200 }}>
                      <Typography variant="body2" noWrap title={row[header]}>
                        {row[header] || '-'}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {data.totalRows > data.data.length && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Showing {data.data.length.toLocaleString()} of {data.totalRows.toLocaleString()} total rows. 
            Download the complete file to view all data.
          </Typography>
        </Alert>
      )}
    </Box>
  );

  const renderExcelData = (data) => (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {data.sheets.map((sheet, index) => (
            <Tab 
              key={index} 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TableChart />
                  <Typography variant="body2">
                    {sheet.name} ({sheet.totalRows} rows)
                  </Typography>
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>
      
      {data.sheets[activeTab] && (
        <Box>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Chip 
              label={`${data.sheets[activeTab].totalRows.toLocaleString()} rows`} 
              color="primary" 
              variant="filled"
            />
            <Chip 
              label={`${data.sheets[activeTab].totalColumns} columns`} 
              color="secondary" 
              variant="filled"
            />
            <Chip 
              label={`Sheet: ${data.sheets[activeTab].name}`} 
              color="info" 
              variant="outlined"
            />
          </Stack>
          
          <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: fullscreen ? '60vh' : '450px' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: 'success.light', color: 'success.contrastText', fontWeight: 'bold' }}>
                      #
                    </TableCell>
                    {data.sheets[activeTab].headers.map((header, index) => (
                      <TableCell 
                        key={index}
                        sx={{ bgcolor: 'success.light', color: 'success.contrastText', fontWeight: 'bold', minWidth: 120 }}
                      >
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.sheets[activeTab].data.map((row, index) => (
                    <TableRow key={index} hover sx={{ '&:nth-of-type(odd)': { bgcolor: 'grey.50' } }}>
                      <TableCell sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        {index + 1}
                      </TableCell>
                      {data.sheets[activeTab].headers.map((header, cellIndex) => (
                        <TableCell key={cellIndex} sx={{ maxWidth: 200 }}>
                          <Typography variant="body2" noWrap title={row[header]}>
                            {row[header] || '-'}
                          </Typography>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}
    </Box>
  );

  const renderImageData = (data) => (
    <Box sx={{ textAlign: 'center', py: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Chip 
          icon={<ImageIcon />} 
          label={`Size: ${formatFileSize(data.size)}`} 
          color="primary" 
          variant="outlined"
          sx={{ mr: 1 }}
        />
        <Chip 
          label={`Type: ${data.mimeType}`} 
          color="secondary" 
          variant="outlined"
        />
      </Box>
      
      <Paper elevation={3} sx={{ display: 'inline-block', p: 2, borderRadius: 3 }}>
        <img
          src={data.dataUrl}
          alt="File preview"
          style={{
            maxWidth: '100%',
            maxHeight: fullscreen ? '70vh' : '500px',
            borderRadius: 8,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}
        />
      </Paper>
    </Box>
  );

  const renderJSONData = (data) => (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Chip 
          icon={<DataObject />} 
          label={`Size: ${formatFileSize(data.size)}`} 
          color="warning" 
          variant="filled"
        />
        <Chip 
          label="JSON Format" 
          color="info" 
          variant="outlined"
        />
      </Stack>
      
      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="warning.main">
            📄 JSON Content
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ 
            backgroundColor: '#f8f9fa', 
            border: '1px solid #e9ecef',
            borderRadius: 2,
            maxHeight: fullscreen ? '60vh' : '500px',
            overflow: 'auto'
          }}>
            <pre style={{ 
              margin: 0,
              padding: '16px',
              whiteSpace: 'pre-wrap', 
              fontSize: '13px',
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
              lineHeight: 1.5,
              color: '#212529'
            }}>
              {data.formatted}
            </pre>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  const renderTextData = (data) => (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Chip 
          icon={<TextFields />} 
          label={`${data.lines.length} lines`} 
          color="primary" 
          variant="filled"
        />
        <Chip 
          label={`${data.wordCount.toLocaleString()} words`} 
          color="secondary" 
          variant="filled"
        />
        <Chip 
          label={`${formatFileSize(data.charCount)} characters`} 
          color="info" 
          variant="outlined"
        />
      </Stack>
      
      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary.main">
            📄 Text Content
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ 
            backgroundColor: '#f8f9fa', 
            border: '1px solid #e9ecef',
            borderRadius: 2,
            maxHeight: fullscreen ? '60vh' : '500px',
            overflow: 'auto'
          }}>
            <pre style={{
              margin: 0,
              padding: '16px',
              whiteSpace: 'pre-wrap',
              fontSize: '14px',
              fontFamily: 'Georgia, serif',
              lineHeight: 1.6,
              color: '#212529'
            }}>
              {data.content}
            </pre>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  const renderPDFData = (data) => (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Chip 
          icon={<Description />} 
          label={`${data.pages} pages`} 
          color="error" 
          variant="filled"
        />
        <Chip 
          label="PDF Document" 
          color="info" 
          variant="outlined"
        />
      </Stack>
      
      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="error.main">
            📄 Extracted Text Content
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Alert severity="info" sx={{ mb: 2 }}>
            This is the text content extracted from the PDF document
          </Alert>
          <Box sx={{ 
            backgroundColor: '#f8f9fa', 
            border: '1px solid #e9ecef',
            borderRadius: 2,
            maxHeight: fullscreen ? '60vh' : '500px',
            overflow: 'auto'
          }}>
            <pre style={{
              margin: 0,
              padding: '16px',
              whiteSpace: 'pre-wrap',
              fontSize: '14px',
              fontFamily: 'Georgia, serif',
              lineHeight: 1.6,
              color: '#212529'
            }}>
              {data.text}
            </pre>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  const renderFileContent = () => {
    if (loading) {
      return (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          py: 8,
          minHeight: 300
        }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6" color="primary" gutterBottom>
            Loading File Data...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Reading file from database path and processing content
          </Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Failed to Load File Data
          </Typography>
          <Typography sx={{ mb: 2 }}>
            {error}
          </Typography>
          <Button 
            startIcon={<Refresh />} 
            onClick={loadFileData} 
            variant="contained"
            size="small"
          >
            Retry Loading
          </Button>
        </Alert>
      );
    }

    if (!fileData) {
      return (
        <Alert severity="info">
          <Typography variant="h6" gutterBottom>
            No File Data Available
          </Typography>
          <Typography>
            File information is not accessible or the file type is not supported for preview.
          </Typography>
        </Alert>
      );
    }

    // Render based on file type
    switch (fileData.type) {
      case 'csv':
        return renderCSVData(fileData);
      case 'excel':
        return renderExcelData(fileData);
      case 'image':
        return renderImageData(fileData);
      case 'json':
        return renderJSONData(fileData);
      case 'text':
        return renderTextData(fileData);
      case 'pdf':
        return renderPDFData(fileData);
      default:
        return (
          <Alert severity="warning">
            <Typography variant="h6" gutterBottom>
              Preview Not Available
            </Typography>
            <Typography>
              This file type ({fileData.type}) cannot be previewed in the browser. 
              Please download the file to view its contents.
            </Typography>
          </Alert>
        );
    }
  };

  if (!file) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={fullscreen}
      PaperProps={{
        sx: { 
          borderRadius: fullscreen ? 0 : 3,
          minHeight: '70vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'primary.light', 
        color: 'primary.contrastText',
        borderRadius: fullscreen ? 0 : '12px 12px 0 0'
      }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
              📁 File Preview
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
              {file.originalName || file.name}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <IconButton 
              onClick={() => setFullscreen(!fullscreen)}
              sx={{ color: 'primary.contrastText' }}
              size="large"
            >
              {fullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
            <IconButton 
              onClick={onClose}
              sx={{ color: 'primary.contrastText' }}
              size="large"
            >
              <Close />
            </IconButton>
          </Stack>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3, minHeight: fullscreen ? '80vh' : '500px' }}>
        {renderFileContent()}
      </DialogContent>

      <DialogActions sx={{ 
        p: 2, 
        bgcolor: 'grey.50',
        borderRadius: fullscreen ? 0 : '0 0 12px 12px'
      }}>
        <Button 
          onClick={onClose} 
          color="primary" 
          size="large"
        >
          Close Preview
        </Button>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={handleDownload}
          color="primary"
          size="large"
          sx={{ fontWeight: 600 }}
        >
          Download File
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilePreviewModal;
