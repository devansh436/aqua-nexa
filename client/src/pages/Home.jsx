import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  CloudUpload,
  Science,
  Analytics,
  Storage,
  ArrowForward,
  Waves,
  Biotech,
  TrendingUp,
  AutoAwesome,
  Speed,
  Security
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const features = [
    {
      icon: <CloudUpload sx={{ fontSize: 32 }} />,
      title: 'Smart Upload',
      description: 'Drag & drop ocean data files with automatic format detection and validation',
      color: '#0066cc'
    },
    {
      icon: <Science sx={{ fontSize: 32 }} />,
      title: 'AI Analysis',
      description: 'Extract metadata, species data, and coordinates automatically using AI',
      color: '#10b981'
    },
    {
      icon: <Analytics sx={{ fontSize: 32 }} />,
      title: 'Rich Preview',
      description: 'View comprehensive data summaries, charts, and geographic information',
      color: '#f59e0b'
    },
    {
      icon: <Storage sx={{ fontSize: 32 }} />,
      title: 'Secure Storage',
      description: 'Organized, searchable database with version control and backup',
      color: '#ef4444'
    }
  ];

  const dataTypes = [
    {
      title: 'Ocean Data',
      description: 'Temperature, salinity, currents',
      formats: 'NetCDF, CSV',
      icon: <Waves sx={{ fontSize: 40 }} />,
      color: '#0066cc',
      gradient: 'linear-gradient(135deg, #0066cc 0%, #0080ff 100%)'
    },
    {
      title: 'Fish Data',
      description: 'Species counts, catch data',
      formats: 'CSV, Excel',
      icon: <Science sx={{ fontSize: 40 }} />,
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
    },
    {
      title: 'Otolith Images',
      description: 'Fish ear bone microscopy',
      formats: 'JPG, PNG, TIFF',
      icon: <Biotech sx={{ fontSize: 40 }} />,
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
    }
  ];

  const stats = [
    { label: 'Species Tracked', value: '1,247', icon: '🐟' },
    { label: 'Datasets Processed', value: '456', icon: '📊' },
    { label: 'Research Locations', value: '89', icon: '🗺️' },
    { label: 'Processing Speed', value: '98%', icon: '⚡' }
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0066cc 0%, #00bcd4 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Animated Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(255,255,255,0.3) 2px, transparent 2px),
              radial-gradient(circle at 75% 75%, rgba(255,255,255,0.3) 2px, transparent 2px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                {/* Badge */}
                <Chip
                  label="🚀 AI-Powered Research Platform"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                    color: 'white',
                    fontWeight: 600,
                    mb: 4,
                    px: 2,
                    py: 0.5,
                    fontSize: '0.9rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                />
                
                {/* Main Heading */}
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                    fontWeight: 800,
                    mb: 3,
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em'
                  }}
                >
                  Ocean Research
                  <br />
                  <Box
                    component="span"
                    sx={{
                      background: 'linear-gradient(45deg, #ffffff 30%, #e0f7fa 90%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      display: 'inline-block'
                    }}
                  >
                    Data Platform
                  </Box>
                </Typography>
                
                {/* Subtitle */}
                <Typography
                  variant="h5"
                  sx={{
                    mb: 5,
                    opacity: 0.9,
                    fontWeight: 400,
                    lineHeight: 1.6,
                    maxWidth: { md: '90%' }
                  }}
                >
                  Upload, analyze, and manage marine research data with AI-powered 
                  metadata extraction and intelligent insights for breakthrough discoveries.
                </Typography>
                
                {/* CTA Buttons */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    gap: 3, 
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'stretch', sm: 'center' }
                  }}
                >
                  <Button
                    component={Link}
                    to="/upload"
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    sx={{
                      bgcolor: 'white',
                      color: 'primary.main',
                      fontWeight: 600,
                      py: 2,
                      px: 4,
                      fontSize: '1.1rem',
                      borderRadius: 3,
                      textTransform: 'none',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                      '&:hover': {
                        bgcolor: 'grey.50',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.16)'
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    Start Uploading Data
                  </Button>
                  
                  <Button
                    component={Link}
                    to="/about"
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      color: 'white',
                      fontWeight: 600,
                      py: 2,
                      px: 4,
                      fontSize: '1.1rem',
                      borderRadius: 3,
                      textTransform: 'none',
                      borderWidth: 2,
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 2
                      }
                    }}
                  >
                    Learn More
                  </Button>
                </Box>
              </Box>
            </Grid>
            
            {/* Hero Dashboard */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: { xs: 'none', md: 'block' },
                  position: 'relative'
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    bgcolor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Avatar
                      sx={{
                        bgcolor: 'success.main',
                        width: 56,
                        height: 56,
                        mr: 2
                      }}
                    >
                      <TrendingUp />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" color="text.primary" fontWeight={600}>
                        Live Analytics Dashboard
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Real-time data processing insights
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Grid container spacing={2}>
                    {stats.map((stat, index) => (
                      <Grid item xs={6} key={index}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <Typography variant="h4" fontWeight={700} color="primary.main">
                            {stat.icon} {stat.value}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {stat.label}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '2.75rem' },
              fontWeight: 700,
              mb: 3,
              color: 'text.primary'
            }}
          >
            Powerful Features
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ 
              maxWidth: 600, 
              mx: 'auto',
              lineHeight: 1.6,
              fontSize: '1.2rem'
            }}
          >
            Everything you need to manage marine research data efficiently and effectively
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                sx={{
                  height: '100%',
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
                    borderColor: feature.color
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                    <Avatar
                      sx={{
                        bgcolor: feature.color,
                        width: 64,
                        height: 64,
                        mr: 3,
                        boxShadow: `0 8px 24px ${feature.color}40`
                      }}
                    >
                      {feature.icon}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="h5" 
                        fontWeight={700}
                        sx={{ mb: 2, color: 'text.primary' }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ lineHeight: 1.7, fontSize: '1rem' }}
                      >
                        {feature.description}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Data Types Section */}
      <Box sx={{ bgcolor: 'grey.50', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '2.75rem' },
                fontWeight: 700,
                mb: 3,
                color: 'text.primary'
              }}
            >
              Supported Data Types
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ 
                maxWidth: 600, 
                mx: 'auto',
                lineHeight: 1.6,
                fontSize: '1.2rem'
              }}
            >
              Upload various types of marine research data with automatic format detection and validation
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {dataTypes.map((type, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 16px 32px rgba(0, 0, 0, 0.12)',
                      '&::before': {
                        opacity: 1
                      }
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: type.gradient,
                      opacity: 0,
                      transition: 'opacity 0.3s ease'
                    }
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Avatar
                      sx={{
                        background: type.gradient,
                        width: 80,
                        height: 80,
                        mx: 'auto',
                        mb: 3,
                        boxShadow: `0 8px 24px ${type.color}30`
                      }}
                    >
                      {type.icon}
                    </Avatar>
                    
                    <Typography 
                      variant="h5" 
                      fontWeight={700} 
                      sx={{ mb: 2, color: 'text.primary' }}
                    >
                      {type.title}
                    </Typography>
                    
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mb: 3, lineHeight: 1.6 }}
                    >
                      {type.description}
                    </Typography>
                    
                    <Chip
                      label={type.formats}
                      sx={{
                        fontWeight: 600,
                        bgcolor: `${type.color}15`,
                        color: type.color,
                        borderRadius: 2,
                        px: 1
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Paper
          sx={{
            background: 'linear-gradient(135deg, #0066cc 0%, #00bcd4 100%)',
            color: 'white',
            p: { xs: 6, md: 8 },
            textAlign: 'center',
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Background Pattern */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              backgroundImage: `
                radial-gradient(circle at 30% 20%, rgba(255,255,255,0.3) 2px, transparent 2px),
                radial-gradient(circle at 70% 80%, rgba(255,255,255,0.3) 2px, transparent 2px)
              `,
              backgroundSize: '80px 80px'
            }}
          />
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '2rem', md: '2.5rem' },
                fontWeight: 700,
                mb: 3,
                lineHeight: 1.2
              }}
            >
              Ready to Transform Your Research?
            </Typography>
            
            <Typography
              variant="h6"
              sx={{
                mb: 5,
                opacity: 0.9,
                maxWidth: 600,
                mx: 'auto',
                lineHeight: 1.6,
                fontSize: '1.2rem'
              }}
            >
              Upload your first dataset and experience the power of AI-driven 
              marine research data management and analysis.
            </Typography>
            
            <Button
              component={Link}
              to="/upload"
              variant="contained"
              size="large"
              endIcon={<AutoAwesome />}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                fontWeight: 600,
                py: 2,
                px: 5,
                fontSize: '1.2rem',
                borderRadius: 3,
                textTransform: 'none',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                '&:hover': {
                  bgcolor: 'grey.50',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.16)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              Upload Data Now
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Home;
