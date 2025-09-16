import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  LinearProgress,
  IconButton,
  Fade,
  Zoom,
  Avatar,
  Stack,
  Button,
  Tooltip,
  Badge
} from '@mui/material';
import { 
  ExpandMore,
  Close,
  Fullscreen,
  FullscreenExit,
  Download,
  Share,
  Visibility,
  Analytics,
  DataObject,
  Image,
  PictureAsPdf,
  Description,
  Archive,
  Map,
  Science,
  Error as ErrorIcon,
  CheckCircle,
  Warning,
  TrendingUp,
  Storage,
  Code,
  TableChart,
  InsertChart,
  Dashboard,
  DataUsage
} from '@mui/icons-material';

const FilePreviewModal = ({ open, onClose, file }) => {
  const [fullscreen, setFullscreen] = useState(false);
  const { extractedMetadata } = file || {};

  const handleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const StatCard = ({ icon, label, value, color = 'primary', subtitle }) => (
    <Card
      sx={{
        background: `linear-gradient(135deg, rgba(${color === 'primary' ? '0, 102, 204' : 
          color === 'success' ? '76, 175, 80' : 
          color === 'warning' ? '255, 152, 0' : 
          color === 'info' ? '33, 150, 243' : 
          color === 'error' ? '244, 67, 54' : '156, 39, 176'}, 0.08) 0%, rgba(255, 255, 255, 0.95) 100%)`,
        borderRadius: 4,
        border: `1px solid rgba(${color === 'primary' ? '0, 102, 204' : 
          color === 'success' ? '76, 175, 80' : 
          color === 'warning' ? '255, 152, 0' : 
          color === 'info' ? '33, 150, 243' : 
          color === 'error' ? '244, 67, 54' : '156, 39, 176'}, 0.15)`,
        height: '100%',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 25px rgba(${color === 'primary' ? '0, 102, 204' : 
            color === 'success' ? '76, 175, 80' : 
            color === 'warning' ? '255, 152, 0' : 
            color === 'info' ? '33, 150, 243' : 
            color === 'error' ? '244, 67, 54' : '156, 39, 176'}, 0.2)`
        }
      }}
    >
      <CardContent sx={{ textAlign: 'center', p: 2 }}>
        <Avatar
          sx={{
            bgcolor: `${color}.main`,
            width: 48,
            height: 48,
            mx: 'auto',
            mb: 2,
            boxShadow: `0 4px 15px rgba(${color === 'primary' ? '0, 102, 204' : 
              color === 'success' ? '76, 175, 80' : 
              color === 'warning' ? '255, 152, 0' : 
              color === 'info' ? '33, 150, 243' : 
              color === 'error' ? '244, 67, 54' : '156, 39, 176'}, 0.3)`
          }}
        >
          {icon}
        </Avatar>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const EnhancedAccordion = ({ icon, title, subtitle, children, defaultExpanded = false, severity = 'primary', badge }) => (
    <Fade in={true}>
      <Accordion 
        defaultExpanded={defaultExpanded}
        sx={{
          mb: 2,
          borderRadius: '16px !important',
          border: `2px solid rgba(${severity === 'primary' ? '0, 102, 204' : 
            severity === 'success' ? '76, 175, 80' : 
            severity === 'warning' ? '255, 152, 0' : 
            severity === 'info' ? '33, 150, 243' : 
            severity === 'error' ? '244, 67, 54' : '156, 39, 176'}, 0.15)`,
          '&:before': { display: 'none' },
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          '&.Mui-expanded': {
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)'
          },
          overflow: 'hidden'
        }}
      >
        <AccordionSummary 
          expandIcon={<ExpandMore sx={{ color: `${severity}.main`, fontSize: 32 }} />}
          sx={{ 
            minHeight: 88,
            borderRadius: '16px 16px 0 0',
            background: `linear-gradient(135deg, rgba(${severity === 'primary' ? '0, 102, 204' : 
              severity === 'success' ? '76, 175, 80' : 
              severity === 'warning' ? '255, 152, 0' : 
              severity === 'info' ? '33, 150, 243' : 
              severity === 'error' ? '244, 67, 54' : '156, 39, 176'}, 0.08) 0%, rgba(255, 255, 255, 0.98) 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, rgba(${severity === 'primary' ? '0, 102, 204' : 
                severity === 'success' ? '76, 175, 80' : 
                severity === 'warning' ? '255, 152, 0' : 
                severity === 'info' ? '33, 150, 243' : 
                severity === 'error' ? '244, 67, 54' : '156, 39, 176'}, 0.12) 0%, rgba(255, 255, 255, 0.98) 100%)`
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Badge badgeContent={badge} color={severity} sx={{ mr: 3 }}>
              <Avatar
                sx={{
                  bgcolor: `${severity}.main`,
                  width: 56,
                  height: 56,
                  boxShadow: `0 6px 16px rgba(${severity === 'primary' ? '0, 102, 204' : 
                    severity === 'success' ? '76, 175, 80' : 
                    severity === 'warning' ? '255, 152, 0' : 
                    severity === 'info' ? '33, 150, 243' : 
                    severity === 'error' ? '244, 67, 54' : '156, 39, 176'}, 0.3)`
                }}
              >
                {icon}
              </Avatar>
            </Badge>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: `${severity}.main`, fontSize: '1.3rem' }}>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 4, bgcolor: 'rgba(255, 255, 255, 0.9)' }}>
          {children}
        </AccordionDetails>
      </Accordion>
    </Fade>
  );

  if (!file) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullscreen}
      maxWidth={fullscreen ? false : 'xl'}
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: fullscreen ? 0 : 4,
          maxHeight: fullscreen ? '100vh' : '90vh',
          width: fullscreen ? '100vw' : '95vw',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 20%, #f1f5f9 100%)',
        }
      }}
    >
      {/* Enhanced Dialog Title */}
      <DialogTitle
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
          borderBottom: '2px solid rgba(0, 102, 204, 0.1)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #0066cc 0%, #00bcd4 50%, #4fc3f7 100%)'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 56,
                height: 56,
                mr: 2,
                boxShadow: '0 8px 24px rgba(0, 102, 204, 0.3)'
              }}
            >
              <DataUsage sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                Dataset Analysis
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 500 }}>
                {file.name}
              </Typography>
            </Box>
          </Box>
          
          <Stack direction="row" spacing={1}>
            <Tooltip title="Download Dataset">
              <IconButton
                sx={{
                  bgcolor: 'success.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'success.dark', transform: 'scale(1.1)' }
                }}
              >
                <Download />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share Analysis">
              <IconButton
                sx={{
                  bgcolor: 'info.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'info.dark', transform: 'scale(1.1)' }
                }}
              >
                <Share />
              </IconButton>
            </Tooltip>
            <Tooltip title={fullscreen ? "Exit Fullscreen" : "Fullscreen"}>
              <IconButton onClick={handleFullscreen}>
                {fullscreen ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Close">
              <IconButton onClick={onClose}>
                <Close />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3, bgcolor: 'transparent' }}>
        {!extractedMetadata ? (
          <Zoom in={true}>
            <Alert 
              severity="info" 
              icon={<Analytics sx={{ fontSize: 32 }} />}
              sx={{ 
                borderRadius: 4,
                border: '2px solid rgba(33, 150, 243, 0.2)',
                bgcolor: 'rgba(33, 150, 243, 0.05)',
                backdropFilter: 'blur(10px)',
                p: 3
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Processing Dataset Analysis
              </Typography>
              <Typography variant="body1">
                The dataset is currently being analyzed. Please wait while we extract metadata and perform data analysis.
              </Typography>
              <LinearProgress sx={{ mt: 2, borderRadius: 2, height: 6 }} />
            </Alert>
          </Zoom>
        ) : (
          <>
            {/* Dataset Overview Header */}
            <Paper
              sx={{
                p: 4,
                mb: 3,
                borderRadius: 4,
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
                border: '2px solid rgba(0, 102, 204, 0.1)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, color: 'primary.main', textAlign: 'center' }}>
                Dataset Overview
              </Typography>
              
              <Stack direction="row" spacing={3} justifyContent="center" sx={{ mb: 3 }}>
                <Chip 
                  icon={<Storage />}
                  label={`Size: ${formatFileSize(file.size)}`} 
                  variant="filled"
                  color="primary"
                  sx={{ fontWeight: 600, fontSize: '1rem', py: 1, px: 2 }}
                />
                <Chip 
                  icon={<Code />}
                  label={`Type: ${file.type}`} 
                  variant="filled"
                  color="info"
                  sx={{ fontWeight: 600, fontSize: '1rem', py: 1, px: 2 }}
                />
                <Chip 
                  icon={<DataObject />}
                  label={`Category: ${file.category?.replace('_', ' ') || 'Other'}`} 
                  variant="filled"
                  color="secondary"
                  sx={{ fontWeight: 600, fontSize: '1rem', py: 1, px: 2 }}
                />
              </Stack>
              
              {file.description && (
                <Paper sx={{ p: 3, bgcolor: 'rgba(0, 102, 204, 0.05)', borderRadius: 3, border: '1px solid rgba(0, 102, 204, 0.1)' }}>
                  <Typography variant="h6" sx={{ fontStyle: 'italic', textAlign: 'center', color: 'text.primary' }}>
                    "{file.description}"
                  </Typography>
                </Paper>
              )}
            </Paper>

            {/* CSV Information */}
            {extractedMetadata.csvInfo && !extractedMetadata.csvInfo.error && (
              <EnhancedAccordion 
                icon={<TableChart />}
                title="CSV Dataset Analysis"
                subtitle={`Complete analysis of ${extractedMetadata.csvInfo.rows?.toLocaleString()} rows and ${extractedMetadata.csvInfo.columns} columns`}
                severity="success"
                badge={extractedMetadata.csvInfo.columns}
                defaultExpanded={true}
              >
                {/* Key Statistics */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={3}>
                    <StatCard 
                      icon={<TrendingUp />}
                      label="Total Rows"
                      value={extractedMetadata.csvInfo.rows?.toLocaleString()}
                      color="success"
                      subtitle="Data entries"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <StatCard 
                      icon={<DataObject />}
                      label="Columns"
                      value={extractedMetadata.csvInfo.columns}
                      color="info"
                      subtitle="Data fields"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <StatCard 
                      icon={<Analytics />}
                      label="Data Points"
                      value={(extractedMetadata.csvInfo.rows * extractedMetadata.csvInfo.columns)?.toLocaleString()}
                      color="warning"
                      subtitle="Total values"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <StatCard 
                      icon={<InsertChart />}
                      label="Analysis Ready"
                      value="100%"
                      color="primary"
                      subtitle="Processing complete"
                    />
                  </Grid>
                </Grid>

                {/* Column Information */}
                <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'rgba(76, 175, 80, 0.05)' }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                    <DataObject sx={{ mr: 1, color: 'success.main' }} /> Column Structure ({extractedMetadata.csvInfo.headers?.length} fields)
                  </Typography>
                  <Grid container spacing={1}>
                    {extractedMetadata.csvInfo.headers?.map((header, index) => (
                      <Grid item key={index}>
                        <Chip 
                          label={header} 
                          variant="outlined"
                          color="success"
                          sx={{ 
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 }
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
                
                {/* Data Types */}
                {extractedMetadata.csvInfo.columnTypes && (
                  <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'rgba(33, 150, 243, 0.05)' }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                      <Code sx={{ mr: 1, color: 'info.main' }} /> Data Type Analysis
                    </Typography>
                    <Grid container spacing={1}>
                      {Object.entries(extractedMetadata.csvInfo.columnTypes).map(([column, type]) => (
                        <Grid item key={column}>
                          <Chip 
                            label={`${column}: ${type}`}
                            color={type === 'numeric' ? 'success' : type === 'date' ? 'info' : 'default'}
                            variant="filled"
                            sx={{ fontWeight: 600, fontSize: '0.9rem' }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                )}
                
                {/* Data Preview */}
                {extractedMetadata.csvInfo.sampleData && extractedMetadata.csvInfo.sampleData.length > 0 && (
                  <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
                    <Box sx={{ p: 3, bgcolor: 'primary.main' }}>
                      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', color: 'white', fontWeight: 600 }}>
                        <Visibility sx={{ mr: 1 }} /> Dataset Preview (First {extractedMetadata.csvInfo.sampleData.length} rows)
                      </Typography>
                    </Box>
                    <TableContainer sx={{ maxHeight: 500 }}>
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ bgcolor: 'grey.100', fontWeight: 700, minWidth: 60 }}>
                              #
                            </TableCell>
                            {extractedMetadata.csvInfo.headers?.map((header, index) => (
                              <TableCell 
                                key={index} 
                                sx={{ 
                                  bgcolor: 'grey.100', 
                                  fontWeight: 700,
                                  fontSize: '0.9rem',
                                  minWidth: 120
                                }}
                              >
                                {header}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {extractedMetadata.csvInfo.sampleData.map((row, index) => (
                            <TableRow 
                              key={index} 
                              hover
                              sx={{ 
                                '&:nth-of-type(odd)': { bgcolor: 'rgba(0, 102, 204, 0.02)' },
                                '&:hover': { bgcolor: 'rgba(0, 102, 204, 0.08)' }
                              }}
                            >
                              <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                                {index + 1}
                              </TableCell>
                              {extractedMetadata.csvInfo.headers?.map((header, cellIndex) => (
                                <TableCell key={cellIndex} sx={{ fontSize: '0.85rem' }}>
                                  {row[header] || '-'}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                )}
              </EnhancedAccordion>
            )}

            {/* Excel Information */}
            {extractedMetadata.excelInfo && !extractedMetadata.excelInfo.error && (
              <EnhancedAccordion 
                icon={<Description />}
                title="Excel Workbook Analysis"
                subtitle={`Multi-sheet analysis with ${extractedMetadata.excelInfo.totalSheets} worksheets`}
                severity="info"
                badge={extractedMetadata.excelInfo.totalSheets}
                defaultExpanded={true}
              >
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={6}>
                    <StatCard 
                      icon={<Description />}
                      label="Total Sheets"
                      value={extractedMetadata.excelInfo.totalSheets}
                      color="info"
                      subtitle="Worksheets detected"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <StatCard 
                      icon={<CheckCircle />}
                      label="Analysis Status"
                      value="Complete"
                      color="success"
                      subtitle="All sheets processed"
                    />
                  </Grid>
                </Grid>

                {extractedMetadata.excelInfo.sheets?.map((sheet, index) => (
                  <Paper 
                    key={index} 
                    sx={{ 
                      p: 4, 
                      mb: 3, 
                      borderRadius: 4,
                      bgcolor: 'rgba(33, 150, 243, 0.03)',
                      border: '2px solid rgba(33, 150, 243, 0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 40px rgba(33, 150, 243, 0.15)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar sx={{ bgcolor: 'info.main', mr: 3, width: 56, height: 56 }}>
                        <TableChart sx={{ fontSize: 28 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'info.main' }}>
                          Sheet: {sheet.name}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                          {sheet.rowCount?.toLocaleString()} rows × {sheet.columnCount} columns
                        </Typography>
                      </Box>
                    </Box>
                    {sheet.headers && sheet.headers.length > 0 && (
                      <Box>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                          Column Headers ({sheet.headers.length} fields):
                        </Typography>
                        <Grid container spacing={1}>
                          {sheet.headers.slice(0, 15).map((header, i) => (
                            <Grid item key={i}>
                              <Chip 
                                label={header} 
                                size="small" 
                                variant="outlined"
                                color="info"
                                sx={{ fontWeight: 500 }}
                              />
                            </Grid>
                          ))}
                          {sheet.headers.length > 15 && (
                            <Grid item>
                              <Chip 
                                label={`+${sheet.headers.length - 15} more`}
                                size="small"
                                color="primary"
                                sx={{ fontWeight: 600 }}
                              />
                            </Grid>
                          )}
                        </Grid>
                      </Box>
                    )}
                  </Paper>
                ))}
              </EnhancedAccordion>
            )}

            {/* Continue with other data types following the same enhanced pattern... */}

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
              <Alert 
                severity="error" 
                icon={<ErrorIcon sx={{ fontSize: 32 }} />}
                sx={{ 
                  mt: 3,
                  borderRadius: 4,
                  border: '2px solid rgba(244, 67, 54, 0.2)',
                  bgcolor: 'rgba(244, 67, 54, 0.05)',
                  backdropFilter: 'blur(10px)',
                  p: 3
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Processing Issues Detected
                </Typography>
                <Stack spacing={2}>
                  {extractedMetadata.csvInfo?.error && (
                    <Typography variant="body1">
                      <strong>CSV Analysis:</strong> {extractedMetadata.csvInfo.error}
                    </Typography>
                  )}
                  {extractedMetadata.excelInfo?.error && (
                    <Typography variant="body1">
                      <strong>Excel Analysis:</strong> {extractedMetadata.excelInfo.error}
                    </Typography>
                  )}
                  {/* Add other error types */}
                </Stack>
              </Alert>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: 'rgba(248, 250, 252, 0.8)', borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
        <Button 
          onClick={onClose} 
          variant="outlined" 
          size="large"
          sx={{ fontWeight: 600 }}
        >
          Close Analysis
        </Button>
        <Button 
          variant="contained" 
          size="large"
          startIcon={<Analytics />}
          sx={{ fontWeight: 600 }}
        >
          Generate Report
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilePreviewModal;
