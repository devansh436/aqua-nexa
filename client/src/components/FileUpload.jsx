import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import { uploadFile, getFileStatus, checkHealth } from "../services/api";
import FilePreview from "./FilePreview";
import UploadProgress from "./UploadProgress";
import {
  CloudUploadIcon,
  CheckCircleIcon,
  ErrorIcon,
  PendingIcon,
  VisibilityIcon,
  DeleteIcon,
  RefreshIcon,
  ImageIcon,
  FileIcon,
} from "./icons";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Stack,
  Avatar,
  Tooltip,
} from "@mui/material";

function FileUpload() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("other");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [previewDialog, setPreviewDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [serverHealth, setServerHealth] = useState("checking");

  // Check server health on component mount
  React.useEffect(() => {
    checkServerHealth();
  }, []);

  const checkServerHealth = async () => {
    try {
      await checkHealth();
      setServerHealth("connected");
      toast.success("✅ Connected to server!");
    } catch (error) {
      setServerHealth("disconnected");
      toast.error(
        "❌ Cannot connect to server. Please check if backend is running on port 5000."
      );
    }
  };

  // Enhanced categories with all supported formats
  const categories = [
    {
      value: "ocean_data",
      label: "🌊 Ocean Data",
      description: "Temperature, salinity, current data",
    },
    {
      value: "satellite_imagery",
      label: "🛰️ Satellite Imagery",
      description: "Remote sensing data",
    },
    {
      value: "research_data",
      label: "🔬 Research Data",
      description: "Scientific datasets",
    },
    {
      value: "documents",
      label: "📄 Documents",
      description: "Reports, papers, documentation",
    },
    {
      value: "other",
      label: "📁 Other",
      description: "General files",
    },
  ];

  // File type icon mapping
  const getFileIcon = (fileType) => {
    if (fileType?.startsWith("image/")) return <ImageIcon color="primary" />;
    if (fileType?.includes("pdf")) return <FileIcon color="error" />;
    if (fileType?.includes("excel") || fileType?.includes("csv"))
      return <FileIcon color="success" />;
    if (fileType?.includes("word")) return <FileIcon color="info" />;
    if (fileType?.includes("json")) return <FileIcon color="warning" />;
    if (fileType?.includes("zip") || fileType?.includes("archive"))
      return <FileIcon color="secondary" />;
    return <FileIcon color="action" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Handle file upload
  const handleUpload = async (files) => {
    if (serverHealth !== "connected") {
      toast.error("Please ensure the server is running before uploading files");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = files.map(async (file, index) => {
        const metadata = {
          category: selectedCategory,
          description: description,
          tags: tags,
        };

        try {
          setUploadProgress((prev) => prev + 90 / files.length);

          const response = await uploadFile(file, metadata);

          const newFile = {
            id: response.fileId || Date.now() + index,
            name: file.name,
            size: file.size,
            type: file.type,
            category: selectedCategory,
            description: description,
            tags: tags,
            status: "completed",
            uploadDate: new Date().toISOString(),
            extractedMetadata: response.metadata,
            preview: file.type.startsWith("image/")
              ? URL.createObjectURL(file)
              : null,
            file: file,
          };

          setUploadedFiles((prev) => [...prev, newFile]);
          toast.success(`✅ ${file.name} uploaded successfully!`);

          return newFile;
        } catch (error) {
          console.error(`Upload failed for ${file.name}:`, error);

          const failedFile = {
            id: Date.now() + index,
            name: file.name,
            size: file.size,
            type: file.type,
            category: selectedCategory,
            status: "failed",
            error: error.message,
            uploadDate: new Date().toISOString(),
          };

          setUploadedFiles((prev) => [...prev, failedFile]);
          toast.error(`❌ Failed to upload ${file.name}: ${error.message}`);

          return failedFile;
        }
      });

      await Promise.all(uploadPromises);
      setUploadProgress(100);

      // Reset form
      setDescription("");
      setTags("");
      setSelectedCategory("other");
    } catch (error) {
      console.error("Upload process failed:", error);
      toast.error("Upload process failed");
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  // Dropzone configuration
  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach((rejection) => {
          toast.error(
            `❌ ${rejection.file.name}: ${rejection.errors[0].message}`
          );
        });
      }

      if (acceptedFiles.length > 0) {
        handleUpload(acceptedFiles);
      }
    },
    [selectedCategory, description, tags, serverHealth]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        "image/*": [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".webp"],
        "application/vnd.ms-excel": [".xls"],
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
          ".xlsx",
        ],
        "text/csv": [".csv"],
        "application/pdf": [".pdf"],
        "application/msword": [".doc"],
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          [".docx"],
        "text/plain": [".txt"],
        "application/json": [".json"],
        "application/xml": [".xml"],
        "application/zip": [".zip"],
        "application/x-netcdf": [".nc"],
      },
      maxSize: 500 * 1024 * 1024, // 500MB
      multiple: true,
    });

  // Handle preview
  const handlePreview = (file) => {
    setSelectedFile(file);
    setPreviewDialog(true);
  };

  // Handle file deletion
  const handleDeleteFile = (fileId) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
    toast.info("File removed from list");
  };

  // Server health status component
  const ServerHealthStatus = () => (
    <Box sx={{ mb: 2 }}>
      <Alert
        severity={
          serverHealth === "connected"
            ? "success"
            : serverHealth === "disconnected"
            ? "error"
            : "info"
        }
        action={
          <IconButton size="small" onClick={checkServerHealth}>
            <RefreshIcon />
          </IconButton>
        }
      >
        {serverHealth === "connected" && "✅ Server connected"}
        {serverHealth === "disconnected" &&
          "❌ Server disconnected - Please start the backend server on port 5000"}
        {serverHealth === "checking" && "🔄 Checking server connection..."}
      </Alert>
    </Box>
  );

  return (
    <Box sx={{ p: 3, maxWidth: "100%", margin: "0 auto" }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: "bold", mb: 3, color: "black" }}
      >
        📁 File Upload Center
      </Typography>

      <ServerHealthStatus />

      <Grid container spacing={3}>
        {/* Upload Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Upload Configuration
            </Typography>

            <Stack spacing={2} sx={{ mb: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      <Box>
                        <Typography variant="body1">
                          {category.label}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          component="div"
                        >
                          {category.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Description (Optional)"
                multiline
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your file..."
              />

              <TextField
                label="Tags (Optional)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Enter tags separated by commas..."
              />
            </Stack>

            {/* Dropzone */}
            <Paper
              {...getRootProps()}
              elevation={isDragActive ? 8 : 1}
              sx={{
                p: 4,
                textAlign: "center",
                cursor: "pointer",
                border: "2px dashed",
                borderColor: isDragReject
                  ? "error.main"
                  : isDragActive
                  ? "primary.main"
                  : "grey.300",
                bgcolor: isDragReject
                  ? "error.light"
                  : isDragActive
                  ? "primary.light"
                  : "grey.50",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "primary.light",
                  borderColor: "primary.main",
                },
              }}
            >
              <input {...getInputProps()} />
              <CloudUploadIcon
                sx={{ fontSize: 48, color: "primary.main", mb: 2 }}
              />

              {isDragReject ? (
                <Typography color="error">
                  Some files will be rejected
                </Typography>
              ) : isDragActive ? (
                <Typography variant="h6" color="primary">
                  Drop files here...
                </Typography>
              ) : (
                <>
                  <Typography variant="h6" gutterBottom>
                    Drag & Drop Files Here
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    or click to select files
                  </Typography>
                </>
              )}

              {/* Fixed: Use component="div" to avoid p > div nesting */}
              <Typography
                variant="caption"
                display="block"
                sx={{ mt: 2 }}
                component="div"
              >
                <strong>Supported formats:</strong> Images (JPG, PNG, GIF, BMP,
                TIFF, WebP), Spreadsheets (CSV, XLSX, XLS), Documents (PDF, DOC,
                DOCX, TXT), Data (JSON, XML), Archives (ZIP), Scientific
                (NetCDF)
              </Typography>
              <Typography
                variant="caption"
                display="block"
                color="primary"
                component="div"
              >
                <strong>Maximum file size: 500MB per file</strong>
              </Typography>
            </Paper>

            {uploading && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Uploading... {Math.round(uploadProgress)}%
                </Typography>
                <LinearProgress variant="determinate" value={uploadProgress} />
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Uploaded Files Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              📋 Uploaded Files ({uploadedFiles.length})
            </Typography>

            {uploadedFiles.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <FileIcon sx={{ fontSize: 64, color: "grey.400", mb: 2 }} />
                <Typography color="text.secondary">
                  No files uploaded yet
                </Typography>
              </Box>
            ) : (
              <List sx={{ maxHeight: 600, overflowY: "auto" }}>
                {uploadedFiles.map((file, index) => (
                  <React.Fragment key={file.id}>
                    <ListItem sx={{ py: 2 }}>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: "grey.100" }}>
                          {getFileIcon(file.type)}
                        </Avatar>
                      </ListItemIcon>

                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              noWrap
                              sx={{ maxWidth: 200 }}
                            >
                              {file.name}
                            </Typography>
                            <Chip
                              size="small"
                              label={file.status}
                              color={
                                file.status === "completed"
                                  ? "success"
                                  : "error"
                              }
                              icon={
                                file.status === "completed" ? (
                                  <CheckCircleIcon />
                                ) : (
                                  <ErrorIcon />
                                )
                              }
                            />
                          </Box>
                        }
                        secondary={
                          <Stack spacing={0.5}>
                            {/* Fixed: Use component="div" for Typography containing complex content */}
                            <Typography variant="caption" component="div">
                              Size: {formatFileSize(file.size)} • Category:{" "}
                              {file.category?.replace("_", " ")} •
                              {new Date(file.uploadDate).toLocaleString()}
                            </Typography>
                            {file.error && (
                              <Typography
                                variant="caption"
                                color="error"
                                component="div"
                              >
                                Error: {file.error}
                              </Typography>
                            )}
                          </Stack>
                        }
                      />

                      <ListItemSecondaryAction>
                        <Stack direction="row" spacing={1}>
                          {file.status === "completed" && (
                            <Tooltip title="Preview File">
                              <IconButton
                                size="small"
                                onClick={() => handlePreview(file)}
                                color="primary"
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Remove from List">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteFile(file.id)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < uploadedFiles.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* File Preview Modal */}
      <FilePreview
        open={previewDialog}
        onClose={() => {
          setPreviewDialog(false);
          setSelectedFile(null);
        }}
        file={selectedFile}
      />
    </Box>
  );
}

export default FileUpload;
