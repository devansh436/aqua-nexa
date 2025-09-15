import React from 'react';
import { Box, LinearProgress, Typography, Paper } from '@mui/material';

const UploadProgress = ({ progress, fileName }) => {
  return (
    <Paper elevation={2} sx={{ p: 2, bgcolor: 'primary.50' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
          🚀 Uploading {fileName && `"${fileName}"`}...
        </Typography>
        <Box sx={{ ml: 'auto' }}>
          <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
            {Math.round(progress)}%
          </Typography>
        </Box>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={progress} 
        sx={{ 
          height: 8, 
          borderRadius: 4,
          bgcolor: 'grey.200',
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
            background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)'
          }
        }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
        Please don't close this window while uploading...
      </Typography>
    </Paper>
  );
};

export default UploadProgress;
