import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Chip,
  Divider,
  Breadcrumbs,
  Link as MuiLink
} from '@mui/material';
import {
  Science,
  Speed,
  Security,
  Analytics,
  AutoAwesome,
  CheckCircle,
  Waves,
  Biotech,
  Storage,
  NavigateNext,
  Home,
  Info
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const About = () => {
  const features = [
    {
      icon: <AutoAwesome sx={{ fontSize: 32 }} />,
      title: 'AI-Powered Analysis',
      description: 'Automatic metadata extraction using advanced machine learning and OCR technology for comprehensive data insights'
    },
    {
      icon: <Speed sx={{ fontSize: 32 }} />,
      title: 'Lightning Fast Processing',
      description: 'Real-time file processing with instant feedback, status updates, and progress tracking for seamless workflow'
    },
    {
      icon: <Security sx={{ fontSize: 32 }} />,
      title: 'Enterprise Security',
      description: 'Bank-grade security with organized, searchable data management, version control, and secure access controls'
    },
    {
      icon: <Analytics sx={{ fontSize: 32 }} />,
      title: 'Rich Analytics',
      description: 'Comprehensive data insights with geographic mapping, temporal analysis, and scientific pattern recognition'
    }
  ];

  const capabilities = [
    'Ocean temperature, salinity, and current data processing (NetCDF, CSV formats)',
    'Fish species identification and population data analysis with AI recognition',
    'Otolith image analysis with advanced OCR text extraction and measurements',
    'eDNA sequence data processing and genetic pattern identification',
    'Research document analysis, indexing, and intelligent content extraction',
    'Automatic geographic coordinate extraction and interactive mapping',
    'Quality assessment, data validation, and completeness scoring',
    'Multi-format support with seamless conversion and standardization'
  ];

  const techSpecs = [
    {
      icon: <Storage sx={{ fontSize: 24 }} />,
      title: 'Storage & Processing',
      specs: ['500MB max file size', '15+ file formats', 'Real-time processing', 'Cloud storage']
    },
    {
      icon: <Biotech sx={{ fontSize: 24 }} />,
      title: 'AI & Analytics',
      specs: ['OCR text extraction', 'Species recognition', 'Geographic detection', 'Pattern analysis']
    },
    {
      icon: <Science sx={{ fontSize: 24 }} />,
      title: 'Research Ready',
      specs: ['Metadata standards', 'Quality metrics', 'Export capabilities', 'Version control']
    }
  ];

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
            <Info sx={{ mr: 0.5, fontSize: 18 }} />
            About Platform
          </Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 10 }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              fontWeight: 700,
              mb: 4,
              background: 'linear-gradient(135deg, #0066cc 0%, #00bcd4 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            About AquaNexus
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ 
              maxWidth: 800, 
              mx: 'auto', 
              lineHeight: 1.6,
              fontSize: '1.3rem',
              fontWeight: 400
            }}
          >
            Advanced marine research data management platform built for scientists, researchers, 
            and marine biologists to streamline their data workflow and accelerate discoveries.
          </Typography>
        </Box>

        {/* Mission Statement */}
        <Paper
          sx={{
            p: { xs: 4, md: 8 },
            mb: 10,
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Background decoration */}
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(0, 102, 204, 0.1) 0%, rgba(0, 188, 212, 0.1) 100%)',
              zIndex: 0
            }}
          />
          
          <Grid container spacing={6} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
            <Grid item xs={12} md={4}>
              <Avatar
                sx={{
                  width: { xs: 100, md: 120 },
                  height: { xs: 100, md: 120 },
                  mx: { xs: 'auto', md: 0 },
                  background: 'linear-gradient(135deg, #0066cc 0%, #00bcd4 100%)',
                  mb: { xs: 4, md: 0 },
                  boxShadow: '0 12px 24px rgba(0, 102, 204, 0.3)'
                }}
              >
                <Waves sx={{ fontSize: { xs: 50, md: 60 } }} />
              </Avatar>
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography 
                variant="h4" 
                fontWeight={700} 
                sx={{ mb: 3, color: 'text.primary' }}
              >
                Our Mission
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontSize: '1.2rem', 
                  lineHeight: 1.7, 
                  mb: 3,
                  color: 'text.secondary'
                }}
              >
                To empower marine researchers with intelligent data management tools that accelerate 
                scientific discovery and promote ocean conservation through better data accessibility, 
                analysis, and collaborative research capabilities.
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontSize: '1.2rem', 
                  lineHeight: 1.7,
                  color: 'text.secondary'
                }}
              >
                We believe that efficient, AI-powered data management is crucial for advancing marine science 
                and protecting our oceans for future generations through data-driven insights and discoveries.
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Key Features */}
        <Box sx={{ mb: 10 }}>
          <Typography
            variant="h3"
            sx={{
              fontSize: { xs: '2rem', md: '2.75rem' },
              fontWeight: 700,
              textAlign: 'center',
              mb: 8,
              color: 'text.primary'
            }}
          >
            Key Features & Capabilities
          </Typography>
          
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
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 16px 32px rgba(0, 0, 0, 0.12)',
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                      <Avatar
                        sx={{
                          bgcolor: 'primary.main',
                          width: 64,
                          height: 64,
                          mr: 3,
                          boxShadow: '0 8px 24px rgba(0, 102, 204, 0.3)'
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
        </Box>

        {/* Capabilities & Tech Specs */}
        <Grid container spacing={8}>
          {/* Platform Capabilities */}
          <Grid item xs={12} md={6}>
            <Typography 
              variant="h4" 
              fontWeight={700} 
              sx={{ mb: 4, color: 'text.primary' }}
            >
              Platform Capabilities
            </Typography>
            
            <List sx={{ p: 0 }}>
              {capabilities.map((capability, index) => (
                <ListItem 
                  key={index} 
                  sx={{ 
                    px: 0, 
                    py: 2,
                    alignItems: 'flex-start'
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary={capability}
                    primaryTypographyProps={{
                      variant: 'body1',
                      sx: { lineHeight: 1.6, fontSize: '1rem' }
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
          
          {/* Technical Specifications */}
          <Grid item xs={12} md={6}>
            <Typography 
              variant="h4" 
              fontWeight={700} 
              sx={{ mb: 4, color: 'text.primary' }}
            >
              Technical Specifications
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {techSpecs.map((spec, index) => (
                <Paper 
                  key={index}
                  sx={{ 
                    p: 4, 
                    bgcolor: 'grey.50',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        mr: 2,
                        width: 48,
                        height: 48
                      }}
                    >
                      {spec.icon}
                    </Avatar>
                    <Typography variant="h6" fontWeight={600} color="text.primary">
                      {spec.title}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {spec.specs.map((item, itemIndex) => (
                      <Chip 
                        key={itemIndex}
                        label={item} 
                        size="small"
                        sx={{
                          bgcolor: 'primary.50',
                          color: 'primary.main',
                          fontWeight: 500,
                          borderRadius: 2
                        }}
                      />
                    ))}
                  </Box>
                </Paper>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default About;
