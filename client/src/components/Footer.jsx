import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  Avatar,
  Divider,
  IconButton,
  Stack
} from '@mui/material';
import {
  Waves,
  GitHub,
  Email,
  Science,
  LinkedIn,
  Twitter
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: 'Home', path: '/' },
    { label: 'Upload Data', path: '/upload' },
    { label: 'About Platform', path: '/about' }
  ];

  const features = [
    'AI-powered metadata extraction',
    'Multi-format file support',
    'Real-time data processing',
    'Geographic data detection',
    'Scientific pattern recognition',
    'Quality assessment metrics'
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'grey.900',
        color: 'white',
        py: { xs: 6, md: 8 },
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={6}>
          {/* Brand Section */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    mr: 2,
                    width: 48,
                    height: 48
                  }}
                >
                  <Waves />
                </Avatar>
                <Typography variant="h5" fontWeight={700}>
                  AquaNexus
                </Typography>
              </Box>
              
              <Typography 
                variant="body1" 
                color="grey.400" 
                sx={{ mb: 3, lineHeight: 1.7, fontSize: '1rem' }}
              >
                Advanced marine research data management platform designed for scientists 
                and researchers worldwide. Powered by AI for intelligent data analysis.
              </Typography>
              
              <Typography variant="body2" color="grey.500" sx={{ fontStyle: 'italic' }}>
                🚀 Built for hackathons, designed for impact
              </Typography>
            </Box>

            {/* Social Links */}
            <Stack direction="row" spacing={1}>
              <IconButton 
                sx={{ 
                  color: 'grey.400',
                  '&:hover': { color: 'primary.light', bgcolor: 'grey.800' }
                }}
              >
                <GitHub />
              </IconButton>
              <IconButton 
                sx={{ 
                  color: 'grey.400',
                  '&:hover': { color: 'primary.light', bgcolor: 'grey.800' }
                }}
              >
                <LinkedIn />
              </IconButton>
              <IconButton 
                sx={{ 
                  color: 'grey.400',
                  '&:hover': { color: 'primary.light', bgcolor: 'grey.800' }
                }}
              >
                <Email />
              </IconButton>
            </Stack>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} md={3}>
            <Typography 
              variant="h6" 
              fontWeight={600} 
              sx={{ mb: 3, color: 'white' }}
            >
              Platform
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {quickLinks.map((link, index) => (
                <Link 
                  key={index}
                  component={RouterLink}
                  to={link.path}
                  sx={{
                    color: 'grey.400',
                    textDecoration: 'none',
                    fontSize: '1rem',
                    transition: 'color 0.2s ease',
                    '&:hover': { 
                      color: 'primary.light',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Features */}
          <Grid item xs={12} md={5}>
            <Typography 
              variant="h6" 
              fontWeight={600} 
              sx={{ mb: 3, color: 'white' }}
            >
              Key Features
            </Typography>
            <Grid container spacing={1}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Typography 
                    variant="body2" 
                    color="grey.400"
                    sx={{ 
                      mb: 1.5,
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Box
                      sx={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        mr: 2,
                        flexShrink: 0
                      }}
                    />
                    {feature}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        <Divider sx={{ my: 6, bgcolor: 'grey.800' }} />

        {/* Bottom Section */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3
          }}
        >
          <Typography variant="body2" color="grey.500" sx={{ fontSize: '0.9rem' }}>
            © {currentYear} AquaNexus. Built with ❤️ for marine research innovation.
          </Typography>
          
          <Stack 
            direction="row" 
            spacing={3}
            sx={{ 
              flexWrap: 'wrap',
              justifyContent: { xs: 'center', md: 'flex-end' }
            }}
          >
            <Typography variant="body2" color="grey.500" sx={{ display: 'flex', alignItems: 'center' }}>
              🚀 Hackathon Project
            </Typography>
            <Typography variant="body2" color="grey.500" sx={{ display: 'flex', alignItems: 'center' }}>
              🌊 Ocean Research
            </Typography>
            <Typography variant="body2" color="grey.500" sx={{ display: 'flex', alignItems: 'center' }}>
              🔬 AI-Powered
            </Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
