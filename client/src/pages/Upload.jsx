import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Breadcrumbs,
  Link as MuiLink,
  Chip,
  Divider
} from '@mui/material';
import { 
  CloudUpload, 
  NavigateNext,
  Home,
  DataObject,
  Security,
  Speed,
  AutoAwesome
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import FileUpload from '../components/FileUpload';

const Upload = () => {
  return (
    <Box 
      sx={{ 
        bgcolor: 'background.default', 
        minHeight: '100vh', 
        py: 4,
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 20%, #f1f5f9 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '300px',
          background: 'linear-gradient(135deg, rgba(0, 102, 204, 0.03) 0%, rgba(0, 188, 212, 0.05) 100%)',
          zIndex: 0
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Enhanced Breadcrumbs */}
        <Paper
          sx={{
            p: 2,
            mb: 4,
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}
        >
          <Breadcrumbs 
            separator={<NavigateNext fontSize="small" sx={{ color: 'primary.main' }} />}
          >
            <MuiLink
              component={Link}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: 'text.secondary',
                textDecoration: 'none',
                px: 2,
                py: 1,
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': { 
                  color: 'primary.main',
                  bgcolor: 'rgba(0, 102, 204, 0.08)',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              <Home sx={{ mr: 1, fontSize: 18 }} />
              Home
            </MuiLink>
            <Chip
              icon={<CloudUpload sx={{ fontSize: 18 }} />}
              label="Upload Data"
              variant="filled"
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                fontWeight: 600,
                '& .MuiChip-icon': { color: 'white' }
              }}
            />
          </Breadcrumbs>
        </Paper>

        {/* Enhanced Header Section */}
        <Paper
          sx={{
            p: { xs: 4, md: 6 },
            mb: 4,
            textAlign: 'center',
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: 4,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #0066cc 0%, #00bcd4 50%, #4fc3f7 100%)',
            }
          }}
        >
          {/* Animated Icon Container */}
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: '20px',
              background: 'linear-gradient(145deg, #0066cc 0%, #00bcd4 50%, #4fc3f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              boxShadow: '0 15px 35px rgba(0, 102, 204, 0.4), 0 5px 15px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px) scale(1.05)',
                boxShadow: '0 20px 40px rgba(0, 102, 204, 0.5), 0 10px 20px rgba(0, 0, 0, 0.15)'
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                inset: '-2px',
                background: 'linear-gradient(45deg, #0066cc, #00bcd4, #4fc3f7, #0066cc)',
                borderRadius: '22px',
                opacity: 0,
                zIndex: -1,
                transition: 'opacity 0.3s ease',
                animation: 'rotate 3s linear infinite',
              },
              '&:hover::after': {
                opacity: 0.7
              },
              '@keyframes rotate': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' }
              }
            }}
          >
            <CloudUpload sx={{ color: 'white', fontSize: 48 }} />
          </Box>
          
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: 2,
              background: 'linear-gradient(145deg, #0066cc 0%, #00bcd4 50%, #4fc3f7 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '2.2rem', md: '2.8rem' },
              letterSpacing: '-0.02em',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          >
            Upload Research Data
          </Typography>
          
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ 
              maxWidth: 650, 
              mx: 'auto',
              lineHeight: 1.7,
              fontSize: '1.15rem',
              mb: 4,
              fontWeight: 400
            }}
          >
            Upload your marine research files for automated analysis, metadata extraction, 
            and intelligent data management powered by AI
          </Typography>

          {/* Feature Pills */}
          <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}>
            {[
              { icon: <AutoAwesome />, label: 'AI Powered' },
              { icon: <Security />, label: 'Secure Upload' },
              { icon: <Speed />, label: 'Fast Processing' },
              { icon: <DataObject />, label: 'Metadata Extraction' }
            ].map((feature, index) => (
              <Chip
                key={index}
                icon={feature.icon}
                label={feature.label}
                variant="outlined"
                sx={{
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  bgcolor: 'rgba(0, 102, 204, 0.05)',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(0, 102, 204, 0.3)'
                  }
                }}
              />
            ))}
          </Box>
        </Paper>

        {/* Decorative Divider */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Divider sx={{ mb: 2 }}>
            <Chip 
              label="Start Uploading" 
              sx={{ 
                bgcolor: 'rgba(0, 102, 204, 0.1)', 
                color: 'primary.main',
                fontWeight: 600,
                px: 3
              }} 
            />
          </Divider>
        </Box>
        
        {/* Enhanced Upload Component Container */}
        <Box
          sx={{
            filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.1))',
            transform: 'perspective(1000px)',
            '&:hover': {
              transform: 'perspective(1000px) translateY(-5px)',
              transition: 'transform 0.3s ease'
            }
          }}
        >
          <FileUpload />
        </Box>
      </Container>
    </Box>
  );
};

export default Upload;
