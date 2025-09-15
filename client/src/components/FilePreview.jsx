import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  List,
  ListItem,
  ListItemText,
  LinearProgress
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';

const FilePreview = ({ file }) => {
  const { extractedMetadata } = file;

  if (!extractedMetadata) {
    return (
      <Alert severity="info">
        No metadata extracted yet. File might still be processing.
      </Alert>
    );
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      {/* Basic File Information */}
      <Card sx={{ mb: 2, bgcolor: 'primary.50' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            📄 File Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Name:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>{file.name}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Size:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {formatFileSize(file.size)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Type:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>{file.type}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Category:</Typography>
              <Chip 
                label={file.category?.replace('_', ' ') || 'Other'} 
                size="small" 
                color="primary"
                variant="outlined"
              />
            </Grid>
            {file.description && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Description:</Typography>
                <Typography variant="body1">{file.description}</Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* CSV Information */}
      {extractedMetadata.csvInfo && !extractedMetadata.csvInfo.error && (
        <Accordion>
          <AccordionSummary 
            expandIcon={<ExpandMore />}
            sx={{ bgcolor: 'success.50' }}
          >
            <Typography variant="h6" color="success.main">
              📊 CSV Data Analysis
            </Typography>
            <Chip 
              label={`${extractedMetadata.csvInfo.rows} rows × ${extractedMetadata.csvInfo.columns} columns`}
              size="small"
              sx={{ ml: 2 }}
            />
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Column Headers:</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {extractedMetadata.csvInfo.headers.map((header, index) => (
                  <Chip 
                    key={index} 
                    label={header} 
                    size="small" 
                    variant="outlined"
                    color="primary"
                  />
                ))}
              </Box>
              
              {extractedMetadata.csvInfo.columnTypes && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Column Types:</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {Object.entries(extractedMetadata.csvInfo.columnTypes).map(([column, type]) => (
                      <Chip 
                        key={column}
                        label={`${column}: ${type}`}
                        size="small"
                        color={type === 'numeric' ? 'success' : type === 'date' ? 'info' : 'default'}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
            
            {extractedMetadata.csvInfo.sampleData && extractedMetadata.csvInfo.sampleData.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>Sample Data Preview:</Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        {extractedMetadata.csvInfo.headers.map((header, index) => (
                          <TableCell key={index} sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600 }}>
                            {header}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {extractedMetadata.csvInfo.sampleData.map((row, index) => (
                        <TableRow key={index} hover>
                          {extractedMetadata.csvInfo.headers.map((header, cellIndex) => (
                            <TableCell key={cellIndex}>{row[header] || '-'}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      )}

      {/* Excel Information */}
      {extractedMetadata.excelInfo && !extractedMetadata.excelInfo.error && (
        <Accordion>
          <AccordionSummary 
            expandIcon={<ExpandMore />}
            sx={{ bgcolor: 'info.50' }}
          >
            <Typography variant="h6" color="info.main">
              📊 Excel Analysis
            </Typography>
            <Chip 
              label={`${extractedMetadata.excelInfo.totalSheets} sheets`}
              size="small"
              sx={{ ml: 2 }}
            />
          </AccordionSummary>
          <AccordionDetails>
            {extractedMetadata.excelInfo.sheets.map((sheet, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Sheet: {sheet.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {sheet.rowCount} rows × {sheet.columnCount} columns
                </Typography>
                {sheet.headers && sheet.headers.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" gutterBottom>Headers:</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {sheet.headers.slice(0, 10).map((header, i) => (
                        <Chip key={i} label={header} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                )}
                {index < extractedMetadata.excelInfo.sheets.length - 1 && <Divider sx={{ mt: 2 }} />}
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
      )}

      {/* Image Information with OCR */}
      {extractedMetadata.imageInfo && (
        <Accordion>
          <AccordionSummary 
            expandIcon={<ExpandMore />}
            sx={{ bgcolor: 'warning.50' }}
          >
            <Typography variant="h6" color="warning.main">
              🖼️ Image Analysis
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Dimensions:</Typography>
                <Typography variant="h6" color="primary">
                  {extractedMetadata.imageInfo.width} × {extractedMetadata.imageInfo.height}px
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Format:</Typography>
                <Typography variant="h6" color="primary">
                  {extractedMetadata.imageInfo.format?.toUpperCase()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Channels:</Typography>
                <Typography variant="body1">{extractedMetadata.imageInfo.channels}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Color Space:</Typography>
                <Typography variant="body1">{extractedMetadata.imageInfo.colorSpace}</Typography>
              </Grid>
            </Grid>

            {/* OCR Results */}
            {extractedMetadata.extractedText && (
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  🔤 OCR Text Extraction
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Confidence: {extractedMetadata.extractedText.confidence}% | 
                    Words: {extractedMetadata.extractedText.wordCount} | 
                    Has Text: {extractedMetadata.extractedText.hasText ? 'Yes' : 'No'}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={extractedMetadata.extractedText.confidence} 
                    sx={{ mt: 1 }}
                    color={extractedMetadata.extractedText.confidence > 80 ? 'success' : 
                           extractedMetadata.extractedText.confidence > 60 ? 'warning' : 'error'}
                  />
                </Box>
                
                {extractedMetadata.extractedText.text && (
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {extractedMetadata.extractedText.text.substring(0, 500)}
                      {extractedMetadata.extractedText.text.length > 500 && '...'}
                    </Typography>
                  </Paper>
                )}
              </Box>
            )}

            {/* Table Data Detection */}
            {extractedMetadata.tableData && extractedMetadata.tableData.detected && (
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  📋 Detected Table Structure
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {extractedMetadata.tableData.rows} rows × {extractedMetadata.tableData.columns} columns
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 200 }}>
                  <Table size="small">
                    <TableBody>
                      {extractedMetadata.tableData.data.slice(0, 5).map((row, index) => (
                        <TableRow key={index}>
                          {row.map((cell, cellIndex) => (
                            <TableCell key={cellIndex} sx={{ fontSize: '0.75rem' }}>
                              {cell}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      )}

      {/* PDF Information */}
      {extractedMetadata.pdfInfo && !extractedMetadata.pdfInfo.error && (
        <Accordion>
          <AccordionSummary 
            expandIcon={<ExpandMore />}
            sx={{ bgcolor: 'error.50' }}
          >
            <Typography variant="h6" color="error.main">
              📄 PDF Analysis
            </Typography>
            <Chip 
              label={`${extractedMetadata.pdfInfo.pages} pages`}
              size="small"
              sx={{ ml: 2 }}
            />
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">Pages:</Typography>
                <Typography variant="h6" color="primary">{extractedMetadata.pdfInfo.pages}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">Words:</Typography>
                <Typography variant="h6" color="primary">{extractedMetadata.pdfInfo.wordCount}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">Text Length:</Typography>
                <Typography variant="h6" color="primary">{extractedMetadata.pdfInfo.textLength}</Typography>
              </Grid>
            </Grid>
            
            {extractedMetadata.pdfInfo.extractedText && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>Text Preview:</Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.50', maxHeight: 200, overflow: 'auto' }}>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {extractedMetadata.pdfInfo.extractedText}
                  </Typography>
                </Paper>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      )}

      {/* Word Document Information */}
      {extractedMetadata.wordInfo && !extractedMetadata.wordInfo.error && (
        <Accordion>
          <AccordionSummary 
            expandIcon={<ExpandMore />}
            sx={{ bgcolor: 'info.50' }}
          >
            <Typography variant="h6" color="info.main">
              📝 Word Document Analysis
            </Typography>
            <Chip 
              label={`${extractedMetadata.wordInfo.wordCount} words`}
              size="small"
              sx={{ ml: 2 }}
            />
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Format:</Typography>
                <Typography variant="body1">{extractedMetadata.wordInfo.format}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Word Count:</Typography>
                <Typography variant="body1">{extractedMetadata.wordInfo.wordCount}</Typography>
              </Grid>
            </Grid>
            
            {extractedMetadata.wordInfo.extractedText && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>Text Preview:</Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.50', maxHeight: 200, overflow: 'auto' }}>
                  <Typography variant="body2">
                    {extractedMetadata.wordInfo.extractedText}
                  </Typography>
                </Paper>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      )}

      {/* JSON Information */}
      {extractedMetadata.jsonInfo && extractedMetadata.jsonInfo.isValidJSON && (
        <Accordion>
          <AccordionSummary 
            expandIcon={<ExpandMore />}
            sx={{ bgcolor: 'secondary.50' }}
          >
            <Typography variant="h6" color="secondary.main">
              🔧 JSON Analysis
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">Structure:</Typography>
                <Typography variant="body1">{extractedMetadata.jsonInfo.structure}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">Depth:</Typography>
                <Typography variant="body1">{extractedMetadata.jsonInfo.depth}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">Has Arrays:</Typography>
                <Typography variant="body1">{extractedMetadata.jsonInfo.hasArrays ? 'Yes' : 'No'}</Typography>
              </Grid>
            </Grid>
            
            {extractedMetadata.jsonInfo.keys && extractedMetadata.jsonInfo.keys.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Keys:</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {extractedMetadata.jsonInfo.keys.map((key, index) => (
                    <Chip key={index} label={key} size="small" variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      )}

      {/* Archive Information */}
      {extractedMetadata.archiveInfo && !extractedMetadata.archiveInfo.error && (
        <Accordion>
          <AccordionSummary 
            expandIcon={<ExpandMore />}
            sx={{ bgcolor: 'success.50' }}
          >
            <Typography variant="h6" color="success.main">
              🗃️ Archive Analysis
            </Typography>
            <Chip 
              label={`${extractedMetadata.archiveInfo.totalFiles} files`}
              size="small"
              sx={{ ml: 2 }}
            />
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">Total Files:</Typography>
                <Typography variant="h6" color="primary">{extractedMetadata.archiveInfo.totalFiles}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">Directories:</Typography>
                <Typography variant="h6" color="primary">{extractedMetadata.archiveInfo.directories}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">Compression:</Typography>
                <Typography variant="h6" color="primary">{extractedMetadata.archiveInfo.compressionRatio}%</Typography>
              </Grid>
            </Grid>
            
            {extractedMetadata.archiveInfo.files && extractedMetadata.archiveInfo.files.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>Files (First 10):</Typography>
                <List dense>
                  {extractedMetadata.archiveInfo.files.slice(0, 10).map((file, index) => (
                    <ListItem key={index}>
                      <ListItemText 
                        primary={file.name}
                        secondary={`${formatFileSize(file.size)} • ${file.extension || 'No extension'}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      )}

      {/* Geographic Data */}
      {extractedMetadata.geoData && extractedMetadata.geoData.hasGeoData && (
        <Accordion>
          <AccordionSummary 
            expandIcon={<ExpandMore />}
            sx={{ bgcolor: 'secondary.50' }}
          >
            <Typography variant="h6" color="secondary.main">
              🗺️ Geographic Information
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Coordinates:</Typography>
                <Typography variant="h6" color="secondary" sx={{ fontFamily: 'monospace' }}>
                  {extractedMetadata.geoData.coordinates.coordinates[1].toFixed(6)}°N, 
                  {extractedMetadata.geoData.coordinates.coordinates[0].toFixed(6)}°E
                </Typography>
              </Grid>
              {extractedMetadata.geoData.location && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Location:</Typography>
                  <Typography variant="body1">{extractedMetadata.geoData.location}</Typography>
                </Grid>
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Scientific Patterns */}
      {extractedMetadata.scientificPatterns && extractedMetadata.scientificPatterns.found && (
        <Accordion>
          <AccordionSummary 
            expandIcon={<ExpandMore />}
            sx={{ bgcolor: 'warning.50' }}
          >
            <Typography variant="h6" color="warning.main">
              🔬 Scientific Patterns Detected
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {Object.entries(extractedMetadata.scientificPatterns.patterns).map(([type, patterns]) => (
              <Box key={type} sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ textTransform: 'capitalize' }}>
                  {type.replace(/([A-Z])/g, ' $1')}:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {patterns.slice(0, 5).map((pattern, index) => (
                    <Chip key={index} label={pattern} size="small" variant="outlined" />
                  ))}
                  {patterns.length > 5 && (
                    <Chip label={`+${patterns.length - 5} more`} size="small" color="primary" />
                  )}
                </Box>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
      )}

      {/* Processing Errors */}
      {(extractedMetadata.csvInfo?.error || 
        extractedMetadata.imageInfo?.error || 
        extractedMetadata.pdfInfo?.error ||
        extractedMetadata.excelInfo?.error ||
        extractedMetadata.wordInfo?.error ||
        extractedMetadata.jsonInfo?.error ||
        extractedMetadata.xmlInfo?.error ||
        extractedMetadata.archiveInfo?.error ||
        extractedMetadata.genericInfo?.error) && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Processing Errors:</Typography>
          {extractedMetadata.csvInfo?.error && <Typography variant="body2">CSV: {extractedMetadata.csvInfo.error}</Typography>}
          {extractedMetadata.imageInfo?.error && <Typography variant="body2">Image: {extractedMetadata.imageInfo.error}</Typography>}
          {extractedMetadata.pdfInfo?.error && <Typography variant="body2">PDF: {extractedMetadata.pdfInfo.error}</Typography>}
          {extractedMetadata.excelInfo?.error && <Typography variant="body2">Excel: {extractedMetadata.excelInfo.error}</Typography>}
          {extractedMetadata.wordInfo?.error && <Typography variant="body2">Word: {extractedMetadata.wordInfo.error}</Typography>}
          {extractedMetadata.jsonInfo?.error && <Typography variant="body2">JSON: {extractedMetadata.jsonInfo.error}</Typography>}
          {extractedMetadata.xmlInfo?.error && <Typography variant="body2">XML: {extractedMetadata.xmlInfo.error}</Typography>}
          {extractedMetadata.archiveInfo?.error && <Typography variant="body2">Archive: {extractedMetadata.archiveInfo.error}</Typography>}
          {extractedMetadata.genericInfo?.error && <Typography variant="body2">Generic: {extractedMetadata.genericInfo.error}</Typography>}
        </Alert>
      )}
    </Box>
  );
};

export default FilePreview;
