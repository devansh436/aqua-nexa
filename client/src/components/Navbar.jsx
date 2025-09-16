import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Container,
  Fade
} from '@mui/material';
import {
  Menu as MenuIcon,
  CloudUpload,
  Home,
  Info,
  Waves,
  Close
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  const menuItems = [
    { label: 'Home', path: '/', icon: <Home sx={{ fontSize: 20 }} /> },
    { label: 'Upload Data', path: '/upload', icon: <CloudUpload sx={{ fontSize: 20 }} /> },
    { label: 'About', path: '/about', icon: <Info sx={{ fontSize: 20 }} /> }
  ];

  const isActive = (path) => location.pathname === path;

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        bgcolor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ px: 0, py: 1 }}>
          {/* Logo Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box
              component={Link}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.02)'
                }
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #0066cc 0%, #00bcd4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                  boxShadow: '0 4px 12px rgba(0, 102, 204, 0.3)'
                }}
              >
                <Waves sx={{ color: 'white', fontSize: 26 }} />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  color: 'text.primary',
                  fontWeight: 800,
                  fontSize: '1.5rem',
                  background: 'linear-gradient(135deg, #0066cc 0%, #00bcd4 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em'
                }}
              >
                AquaNexus
              </Typography>
            </Box>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  startIcon={item.icon}
                  sx={{
                    color: isActive(item.path) ? 'primary.main' : 'text.primary',
                    fontWeight: isActive(item.path) ? 600 : 500,
                    bgcolor: isActive(item.path) ? 'primary.50' : 'transparent',
                    px: 3,
                    py: 1.5,
                    borderRadius: 3,
                    textTransform: 'none',
                    fontSize: '1rem',
                    minWidth: 'auto',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: isActive(item.path) ? 'primary.100' : 'grey.50',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleMobileMenuOpen}
              sx={{ 
                color: 'text.primary',
                bgcolor: 'grey.50',
                borderRadius: 2,
                '&:hover': {
                  bgcolor: 'grey.100'
                }
              }}
            >
              {Boolean(mobileMenuAnchor) ? <Close /> : <MenuIcon />}
            </IconButton>
          )}

          {/* Mobile Menu */}
          <Menu
            anchorEl={mobileMenuAnchor}
            open={Boolean(mobileMenuAnchor)}
            onClose={handleMobileMenuClose}
            TransitionComponent={Fade}
            PaperProps={{
              sx: {
                borderRadius: 3,
                mt: 1,
                minWidth: 220,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                border: '1px solid',
                borderColor: 'divider'
              }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {menuItems.map((item) => (
              <MenuItem
                key={item.path}
                component={Link}
                to={item.path}
                onClick={handleMobileMenuClose}
                sx={{
                  color: isActive(item.path) ? 'primary.main' : 'text.primary',
                  fontWeight: isActive(item.path) ? 600 : 500,
                  py: 2,
                  px: 3,
                  mx: 1,
                  my: 0.5,
                  borderRadius: 2,
                  bgcolor: isActive(item.path) ? 'primary.50' : 'transparent',
                  '&:hover': {
                    bgcolor: isActive(item.path) ? 'primary.100' : 'grey.50'
                  }
                }}
              >
                <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                  {item.icon}
                </Box>
                {item.label}
              </MenuItem>
            ))}
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
