import React from 'react';
import { 
  Box, 
  LinearProgress, 
  Typography, 
  Paper, 
  Avatar,
  Grid
} from '@mui/material';
import { CloudUpload, Speed, Timer } from '@mui/icons-material';

const UploadProgress = ({ progress, fileName, uploadSpeed }) => {
  const getProgressColor = () => {
    if (progress < 30) return 'error';
    if (progress < 70) return 'warning';
    return 'success';
  };

  const formatSpeed = (speed) => {
    if (!speed) return 'Calculating...';
    if (speed > 1024) return `${(speed / 1024).toFixed(1)} MB/s`;
    return `${speed.toFixed(1)} KB/s`;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        border: '2px solid',
        borderColor: `${getProgressColor()}.200`,
        bgcolor: `${getProgressColor()}.50`,
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Animation */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: `-${100 - progress}%`,
          width: '100%',
          height: '100%',
          background: `linear-gradient(90deg, transparent 0%, ${getProgressColor()}.100 50%, transparent 100%)`,
          transition: 'left 0.3s ease',
          zIndex: 0
        }}
      />
      
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={3} alignItems="center">
          {/* Icon & Main Info */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar 
                sx={{ 
                  bgcolor: `${getProgressColor()}.main`,
                  mr: 3,
                  width: 56,
                  height: 56,
                  boxShadow: `0 4px 12px ${getProgressColor()}.300`
                }}
              >
                <CloudUpload sx={{ fontSize: 28 }} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="h6" 
                  fontWeight={600} 
                  color={`${getProgressColor()}.main`}
                  sx={{ mb: 0.5 }}
                >
                  Uploading File...
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontWeight: 500 }}
                >
                  {fileName ? `"${fileName}"` : 'Processing your data'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          {/* Progress Stats */}
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                <Speed sx={{ mr: 1, color: `${getProgressColor()}.main`, fontSize: 20 }} />
                <Typography 
                  variant="h4" 
                  fontWeight={700} 
                  color={`${getProgressColor()}.main`}
                >
                  {Math.round(progress)}%
                </Typography>
              </Box>
              {uploadSpeed && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                  <Timer sx={{ mr: 1, color: 'text.secondary', fontSize: 16 }} />
                  <Typography variant="body2" color="text.secondary">
                    {formatSpeed(uploadSpeed)}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
        
        {/* Progress Bar */}
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 12,
            borderRadius: 6,
            bgcolor: `${getProgressColor()}.100`,
            mb: 2,
            '& .MuiLinearProgress-bar': {
              borderRadius: 6,
              bgcolor: `${getProgressColor()}.main`,
              background: `linear-gradient(90deg, ${getProgressColor()}.main 0%, ${getProgressColor()}.light 100%)`
            }
          }}
        />
        
        {/* Status Message */}
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ textAlign: 'center', fontStyle: 'italic' }}
        >
          Please don't close this window while uploading. Processing will begin automatically.
        </Typography>
      </Box>
    </Paper>
  );
};

export default UploadProgress;
