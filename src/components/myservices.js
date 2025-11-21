'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Menu,
  MenuItem,

  Fab,
  CircularProgress,
  Chip,
  Button,
  createTheme,
  ThemeProvider,
} from '@mui/material';
import { MoreVert, Add, Person } from '@mui/icons-material';
import { format } from 'date-fns';
import Header from './Header';

const baseUrl = 'https://yoketrip.in';

const theme = createTheme({
  palette: {
    primary: { main: '#388e3c', contrastText: '#fff' },
    secondary: { main: '#f50057' },
    background: { default: '#f5f5f5' },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h6: { fontWeight: 500 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
          },
        },
      },
    },
  },
});

function MyServicesScreen(props) {
  const { 
    isLoggedIn, 
    setIsLoggedIn, 
    handleNavClick, 
    toggleDrawer, 
    handleLogout, 
    isChatRoute 
  } = props;
  const navigate = useNavigate();
  const [spots, setSpots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [hostType, setHostType] = useState('Eco Host'); // Placeholder; fetch from API or localStorage

  useEffect(() => {
    fetchMySpots();
    // Fetch host type (example: from API or localStorage)
    const fetchedHostType = localStorage.getItem('host_type') || 'Eco Host'; // Replace with API call if needed
    setHostType(fetchedHostType);
  }, []);

  const fetchMySpots = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No auth token found');
      const response = await axios.get(`${baseUrl}/api/vacationSpot/my-Vacation`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      setSpots(response.data.data || []);
    } catch (e) {
      toast.error('Failed to load vacation spots: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMenuOpen = (event, spot) => {
    setAnchorEl(event.currentTarget);
    setSelectedSpot(spot);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSpot(null);
  };

  const handleMenuSelect = async (action) => {
    if (!selectedSpot) return;
    if (action === 'edit') {
      navigate('/add-vacation-spot', { state: { spot: selectedSpot } });
    } else if (action === 'delete') {
      if (window.confirm(`Are you sure you want to delete "${selectedSpot.name}"?`)) {
        try {
          const token = localStorage.getItem('auth_token');
          if (!token) throw new Error('No auth token found');
          const response = await axios.delete(`${baseUrl}/api/vacationSpot/${selectedSpot._id}`, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          });
          if (response.status === 200) {
            toast.success('Vacation spot deleted successfully!');
            fetchMySpots();
          } else {
            throw new Error('Failed to delete spot');
          }
        } catch (e) {
          toast.error(`Error deleting spot: ${e.message}`);
        }
      }
    }
    handleMenuClose();
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: 2, pb: 10 }}>
        <Header
         {...props}
        />
        <Box sx={{ maxWidth: 800, mx: 'auto', px: { xs: 2, sm: 4 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                My Services
              </Typography>
              <Chip
                label={hostType}
                icon={<Person />}
                sx={{
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  fontWeight: 'medium',
                  borderRadius: 4,
                }}
              />
            </Box>
           
          </Box>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress color="primary" />
            </Box>
          ) : spots.length === 0 ? (
            <Typography sx={{ textAlign: 'center', color: 'grey.600', mt: 4 }}>
              No vacation spots found.
            </Typography>
          ) : (
            spots.map((spot) => (
              <Card
                key={spot._id}
                sx={{ mb: 2, borderRadius: 16, position: 'relative', overflow: 'hidden' }}
                onClick={() => navigate(`/vacation-booking-detail/${spot._id}`)}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={spot.image || '/assets/placeholder.png'}
                    alt={spot.name}
                    sx={{ objectFit: 'cover', transition: 'transform 0.3s ease' }}
                    onError={(e) => { e.target.src = '/assets/placeholder.png'; }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)',
                    }}
                  />
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'rgba(255,255,255,0.8)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
                    }}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click
                      handleMenuOpen(e, spot);
                    }}
                  >
                    <MoreVert />
                  </IconButton>
                </Box>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {spot.name || 'No Name'}
                  </Typography>
                  <Typography sx={{ color: 'grey.700', mt: 1 }}>
                    📍 {spot.location || 'No Location'}
                  </Typography>
                  <Typography sx={{ color: 'green.700', fontWeight: 'bold', mt: 1 }}>
                    💰 ₹{(spot.price || 0).toFixed(2)}
                  </Typography>
                  {spot.categories?.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                      {spot.categories.map((category) => (
                        <Chip
                          key={category}
                          label={category}
                          sx={{
                            bgcolor: 'green.50',
                            color: 'green.800',
                            border: '1px solid',
                            borderColor: 'green.200',
                            borderRadius: 4,
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))
          )}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{ sx: { borderRadius: 10 } }}
          >
            <MenuItem onClick={() => handleMenuSelect('edit')}>Edit</MenuItem>
            <MenuItem onClick={() => handleMenuSelect('delete')}>Delete</MenuItem>
          </Menu>
        </Box>
        {/* <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            bgcolor: 'primary.main',
            '&:hover': { bgcolor: 'primary.dark' },
          }}
          onClick={() => navigate('/add-vacation-spot')}
        >
          <Add />
        </Fab> */}
        <ToastContainer position="top-right" autoClose={3000} />
      </Box>
    </ThemeProvider>
  );
}

export default MyServicesScreen;