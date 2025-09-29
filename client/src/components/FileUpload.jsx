import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import { uploadFile, getUnifiedDatasets, exportUnifiedDataset } from "../services/api";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  CloudUpload,
  Visibility,
  Download,
  DataObject,
  UnfoldMore,
  Science,
} from "@mui/icons-material";

function UnifiedDatasetUpload() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("other");
  const [description, setDescription] = useState("");
  const [unifiedData, setUnifiedData] = useState([]);
  const [showUnifiedDialog, setShowUnifiedDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  // Marine research categories
  const categories = [
    {
      value: "fish_data",
      label: "🐟 Fish Dataset",
      description: "Species, length, weight, abundance data",
      expectedColumns: ["species", "length_cm", "weight_g", "abundance", "age", "location", "date", "time"]
    },
    {
      value: "ocean_data", 
      label: "🌊 Ocean Dataset",
      description: "Temperature, salinity, pH, oxygen data",
      expectedColumns: ["temperature", "salinity", "dissolved_oxygen", "pH", "depth_m", "turbidity", "location", "date", "time"]
    },
    {
      value: "otolith_image",
      label: "🔬 Otolith Images",
      description: "Fish ear bone microscopy images",
      expectedColumns: ["image_file", "location", "date", "time"]
    },
    {
      value: "eDNA_data",
      label: "🧬 eDNA Dataset", 
      description: "Environmental DNA sequences",
      expectedColumns: ["sequence_id", "matched_species", "location", "date", "time"]
    },
    {
      value: "other",
      label: "📁 Other",
      description: "General marine research data",
      expectedColumns: []
    }
  ];

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach((rejection) => {
          toast.error(`❌ ${rejection.file.name}: ${rejection.errors[0].message}`);
        });
      }

      if (acceptedFiles.length > 0) {
        handleUpload(acceptedFiles);
      }
    },
    [selectedCategory, description]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "image/*": [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".webp"],
      "application/json": [".json"]
    },
    maxSize: 500 * 1024 * 1024, // 500MB
    multiple: true,
  });

  const handleUpload = async (files) => {
    setUploading(true);
    
    try {
      const uploadPromises = files.map(async (file) => {
        const metadata = {
          category: selectedCategory,
          description: description,
        };

        try {
          const response = await uploadFile(file, metadata);
          const newFile = {
            id: response.fileId,
            name: file.name,
            size: file.size,
            type: file.type,
            category: selectedCategory,
            description: description,
            status: "completed",
            uploadDate: new Date().toISOString(),
          };

          setUploadedFiles((prev) => [...prev, newFile]);
          toast.success(`✅ ${file.name} uploaded and processed successfully!`);
          return newFile;
        } catch (error) {
          console.error(`Upload failed for ${file.name}:`, error);
          toast.error(`❌ Failed to upload ${file.name}: ${error.message}`);
          return null;
        }
      });

      await Promise.all(uploadPromises);
      
      // Reset form
      setDescription("");
      setSelectedCategory("other");
      
    } catch (error) {
      console.error("Upload process failed:", error);
      toast.error("Upload process failed");
    } finally {
      setUploading(false);
    }
  };

  const handleViewUnifiedData = async () => {
    setLoading(true);
    try {
      const response = await getUnifiedDatasets();
      setUnifiedData(response.data || []);
      setShowUnifiedDialog(true);
      toast.success(`📊 Loaded ${response.count || 0} unified records`);
    } catch (error) {
      console.error("Failed to load unified data:", error);
      toast.error("Failed to load unified datasets");
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async (format = 'csv') => {
    try {
      const response = await exportUnifiedDataset(format);
      
      if (format === 'csv') {
        // Create and download CSV file
        const blob = new Blob([response], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'unified_marine_dataset.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success("📥 CSV export downloaded successfully!");
      } else {
        // JSON export
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'unified_marine_dataset.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success("📥 JSON export downloaded successfully!");
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export unified dataset");
    }
  };

  const selectedCategoryInfo = categories.find(cat => cat.value === selectedCategory);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        🌊 Unified Marine Dataset Platform
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Upload fish data, ocean conditions, otolith images, and eDNA sequences. 
        The system will automatically extract metadata, standardize formats, and create unified datasets.
      </Typography>

      {/* Upload Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              📁 Upload Configuration
            </Typography>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Dataset Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Dataset Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    <Box>
                      <Typography variant="body1">{category.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {category.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedCategoryInfo && selectedCategoryInfo.expectedColumns.length > 0 && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Expected columns for {selectedCategoryInfo.label}:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selectedCategoryInfo.expectedColumns.map((col) => (
                    <Chip key={col} label={col} size="small" variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}

            <TextField
              fullWidth
              margin="normal"
              label="Description"
              multiline
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your dataset..."
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          {/* Dropzone */}
          <Paper
            {...getRootProps()}
            sx={{
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.300',
              bgcolor: isDragActive ? 'primary.light' : 'background.paper',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'primary.light'
              }
            }}
          >
            <input {...getInputProps()} />
            <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            
            {isDragActive ? (
              <Typography variant="h6">Drop files here...</Typography>
            ) : (
              <>
                <Typography variant="h6" gutterBottom>
                  Drag & Drop Marine Research Files
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  or click to select files
                </Typography>
              </>
            )}
            
            <Typography variant="caption" display="block" sx={{ mt: 2 }}>
              Supported: CSV, Excel, Images (JPG, PNG, TIFF), JSON<br/>
              Maximum size: 500MB per file
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {uploading && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography>🔄 Processing files and creating unified datasets...</Typography>
        </Box>
      )}

      {/* Action Buttons */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<DataObject />}
          onClick={handleViewUnifiedData}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'View Unified Datasets'}
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={() => handleExportData('csv')}
        >
          Export CSV
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={() => handleExportData('json')}
        >
          Export JSON
        </Button>
      </Box>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Paper sx={{ mt: 3, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            📋 Uploaded Files ({uploadedFiles.length})
          </Typography>
          
          <List>
            {uploadedFiles.map((file, index) => (
              <React.Fragment key={file.id}>
                <ListItem>
                  <ListItemText
                    primary={file.name}
                    secondary={
                      <Box>
                        <Typography component="span" variant="body2">
                          Size: {(file.size / 1024 / 1024).toFixed(2)} MB • 
                          Category: {file.category} • 
                          Status: {file.status}
                        </Typography>
                      </Box>
                    }
                  />
                  <Chip 
                    label={file.category.replace('_', ' ')} 
                    color="primary" 
                    size="small" 
                  />
                </ListItem>
                {index < uploadedFiles.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {/* Unified Data Dialog */}
      <Dialog 
        open={showUnifiedDialog} 
        onClose={() => setShowUnifiedDialog(false)}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle>
          🔬 Unified Marine Datasets ({unifiedData.length} records)
        </DialogTitle>
        <DialogContent>
          {unifiedData.length > 0 ? (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Location</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Fish Species</TableCell>
                    <TableCell>Ocean Temp (°C)</TableCell>
                    <TableCell>Salinity</TableCell>
                    <TableCell>Otolith Features</TableCell>
                    <TableCell>eDNA Species</TableCell>
                    <TableCell>Source Files</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {unifiedData.slice(0, 50).map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>{record.location}</TableCell>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>{record.time}</TableCell>
                      <TableCell>{record.fish?.species || 'N/A'}</TableCell>
                      <TableCell>{record.ocean?.temperature || 'N/A'}</TableCell>
                      <TableCell>{record.ocean?.salinity || 'N/A'}</TableCell>
                      <TableCell>
                        {record.otolith_features?.circularity ? 
                          `C: ${record.otolith_features.circularity}` : 'N/A'}
                      </TableCell>
                      <TableCell>{record.eDNA?.matched_species || 'N/A'}</TableCell>
                      <TableCell>
                        {record.metadata_refs?.length || 0} files
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography>No unified datasets found. Upload some data files first.</Typography>
          )}
          
          {unifiedData.length > 50 && (
            <Typography variant="caption" sx={{ mt: 2, display: 'block' }}>
              Showing first 50 records of {unifiedData.length} total records.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUnifiedDialog(false)}>Close</Button>
          <Button 
            variant="contained" 
            onClick={() => handleExportData('csv')}
            startIcon={<Download />}
          >
            Export All Data
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UnifiedDatasetUpload;
