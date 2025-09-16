import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Breadcrumbs,
  Link as MuiLink
} from '@mui/material';
import { 
  CloudUpload, 
  NavigateNext,
  Home 
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import FileUpload from '../components/FileUpload';

const Upload = () => {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          separator={<NavigateNext fontSize="small" />} 
          sx={{ mb: 4 }}
        >
          <MuiLink
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'text.secondary',
              textDecoration: 'none',
              '&:hover': { color: 'primary.main' }
            }}
          >
            <Home sx={{ mr: 0.5, fontSize: 18 }} />
            Home
          </MuiLink>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <CloudUpload sx={{ mr: 0.5, fontSize: 18 }} />
            Upload Data
          </Typography>
        </Breadcrumbs>

        {/* Header Section */}
        <Paper
          sx={{
            p: { xs: 4, md: 6 },
            mb: 4,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 4
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: 4,
              background: 'linear-gradient(135deg, #0066cc 0%, #00bcd4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              boxShadow: '0 8px 24px rgba(0, 102, 204, 0.3)'
            }}
          >
            <CloudUpload sx={{ color: 'white', fontSize: 40 }} />
          </Box>
          
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 2,
              background: 'linear-gradient(135deg, #0066cc 0%, #00bcd4 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Upload Research Data
          </Typography>
          
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ 
              maxWidth: 600, 
              mx: 'auto',
              lineHeight: 1.6,
              fontSize: '1.1rem'
            }}
          >
            Upload your marine research files for automated analysis, metadata extraction, 
            and intelligent data management powered by AI
          </Typography>
        </Paper>
        
        {/* Upload Component */}
        <FileUpload />
      </Container>
    </Box>
  );
};

export default Upload;
