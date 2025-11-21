'use client';

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Card,
  CardContent,
  Box,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Chip,
  IconButton,
  Typography,
  createTheme,
  ThemeProvider,
} from '@mui/material';
import { LocationOn, CurrencyRupee, CheckCircle, Cancel, HourglassEmpty, Info } from '@mui/icons-material';
import Header from './Header';

const baseUrl = 'https://yoketrip.in';

const theme = createTheme({
  palette: {
    primary: {
      main: '#388e3c', // Green for eco-friendly theme
      contrastText: '#fff',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid',
          borderColor: 'grey.300',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '1rem',
          '&.Mui-selected': {
            color: '#388e3c',
          },
        },
      },
    },
  },
});

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} {...other}>
      {value === index && (
        <Box sx={{ p: { xs: 2, sm: 3 } }}>{children}</Box>
      )}
    </div>
  );
}

function VacationSpotDetailScreen( props) {
  const { 
    isLoggedIn, 
    setIsLoggedIn, 
    handleNavClick, 
    toggleDrawer, 
    handleLogout, 
    isChatRoute 
  } = props;
  const location = useLocation();
  const spot = location.state?.spot || {};
  const [tabIndex, setTabIndex] = useState(0);
  const [isLoadingBooking, setIsLoadingBooking] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [bookingStatus, setBookingStatus] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem('auth_token'));
    };
    window.addEventListener('storage', checkAuth);
    checkAuth();
    checkBookingStatus();
    return () => window.removeEventListener('storage', checkAuth);
  }, [setIsLoggedIn]);

  const getToken = () => localStorage.getItem('auth_token');

  const checkBookingStatus = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const response = await axios.get(`${baseUrl}/api/vacationSpot/status/${spot._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setHasApplied(response.data.hasApplied || false);
        setBookingStatus(response.data.status || null);
      } else {
        throw new Error(`Failed to check booking status: ${response.status}`);
      }
    } catch (e) {
      console.error('Error checking booking status:', e);
      toast.error(`Error checking booking status: ${e.message}`);
    }
  };

  const sendBookingRequest = async () => {
    if (hasApplied) return;
    setIsLoadingBooking(true);
    try {
      const token = getToken();
      if (!token) {
        toast.error('Please log in to book');
        return;
      }
      const response = await axios.post(
        `${baseUrl}/api/vacationSpot/createBooking`,
        { vacationSpotId: spot._id },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      if (response.status === 201) {
        setHasApplied(true);
        setBookingStatus('pending');
        toast.success('Booking request sent successfully');
      } else {
        throw new Error(`Failed to send booking request: ${response.status}`);
      }
    } catch (e) {
      console.error('Error sending booking request:', e);
      toast.error(`Error sending booking request: ${e.message}`);
    } finally {
      setIsLoadingBooking(false);
    }
  };

  const name = spot.name || 'No Name';
  const spotLocation = spot.location || '';
  const description = spot.description || 'No description';
  const price = (spot.price || 0).toFixed(2);
  const categories = spot.categories || [];
  const imageUrl = spot.image;

  return (
    <ThemeProvider theme={theme}>
      <Header
        {...props}
      />
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          pt: 2,
        }}
      >
        {/* Hero Image Section */}
        <Box
          sx={{
            position: 'relative',
            maxWidth: 800, // Constrain width
            width: '100%',
            mx: 'auto', // Center the image
            height: { xs: 200, sm: 300 },
            overflow: 'hidden',
            borderRadius: { xs: 12, sm: 20 },
            mt: 2,
          }}
        >
          <Box
            component="img"
            src={imageUrl || '/assets/placeholder.png'}
            alt={name}
            sx={{
              height: '100%',
              width: '100%',
              objectFit: 'contain', // Ensure full image is visible
              borderRadius: { xs: 12, sm: 20 },
            }}
            onError={(e) => {
              e.target.src = '/assets/placeholder.png';
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              p: 3,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                color: 'white',
                fontWeight: 'bold',
                fontSize: { xs: '1.25rem', sm: '2rem' },
              }}
            >
              {name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <LocationOn sx={{ fontSize: 18, color: 'white', mr: 0.5 }} />
              <Typography
                variant="body1"
                sx={{
                  color: 'white',
                  fontSize: { xs: '0.85rem', sm: '0.9rem' },
                }}
              >
                {spotLocation}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Main Content */}
        <Box sx={{ px: { xs: 2, sm: 4 }, py: 3, maxWidth: 800, mx: 'auto' }}>
          <Tabs
            value={tabIndex}
            onChange={(e, newValue) => setTabIndex(newValue)}
            indicatorColor="primary"
            textColor="primary"
            centered
            sx={{
              mb: 2,
              bgcolor: 'white',
              borderRadius: 12,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Tab label="Details" />
            <Tab label="Booking Status" />
          </Tabs>

          <TabPanel value={tabIndex} index={0}>
            <Card sx={{ p: 2, borderRadius: 16 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}
                >
                  Details
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 'bold', color: 'primary.main' }}
                >
                  ₹{price}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 2 }}>
                  Description
                </Typography>
                <Typography variant="body2" sx={{ color: 'grey.800', mt: 1 }}>
                  {description}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 2 }}>
                  Categories
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {categories.map((category) => (
                    <Chip
                      key={category}
                      label={category}
                      sx={{
                        bgcolor: 'green.50',
                        color: 'green.800',
                        border: '1px solid',
                        borderColor: 'green.200',
                      }}
                    />
                  ))}
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={isLoadingBooking || hasApplied}
                  onClick={sendBookingRequest}
                  sx={{
                    mt: 3,
                    py: 1.5,
                    borderRadius: 12,
                    textTransform: 'none',
                    fontSize: '1rem',
                  }}
                >
                  {isLoadingBooking ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : hasApplied ? (
                    'Already Applied'
                  ) : (
                    'Send Booking'
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabPanel>
          <TabPanel value={tabIndex} index={1}>
            <Card sx={{ p: 2, borderRadius: 16, textAlign: 'center' }}>
              <CardContent>
                {hasApplied ? (
                  <>
                    <IconButton
                      sx={{
                        fontSize: 60,
                        color:
                          bookingStatus === 'accepted'
                            ? 'green.700'
                            : bookingStatus === 'rejected'
                            ? 'red.700'
                            : 'orange.700',
                      }}
                    >
                      {bookingStatus === 'accepted' ? (
                        <CheckCircle />
                      ) : bookingStatus === 'rejected' ? (
                        <Cancel />
                      ) : (
                        <HourglassEmpty />
                      )}
                    </IconButton>
                    <Typography
                      variant="h6"
                      sx={{
                        color:
                          bookingStatus === 'accepted'
                            ? 'green.700'
                            : bookingStatus === 'rejected'
                            ? 'red.700'
                            : 'orange.700',
                      }}
                    >
                      Booking Status: {bookingStatus ? bookingStatus.charAt(0).toUpperCase() + bookingStatus.slice(1) : 'Unknown'}
                    </Typography>
                    {bookingStatus === 'pending' && (
                      <Typography variant="body2" sx={{ color: 'grey.600', mt: 2 }}>
                        Your booking is awaiting review.
                      </Typography>
                    )}
                    {bookingStatus === 'accepted' && (
                      <Typography variant="body2" sx={{ color: 'green.700', mt: 2 }}>
                        Your booking has been confirmed!
                      </Typography>
                    )}
                    {bookingStatus === 'rejected' && (
                      <Typography variant="body2" sx={{ color: 'red.700', mt: 2 }}>
                        Sorry, your booking was not approved.
                      </Typography>
                    )}
                  </>
                ) : (
                  <>
                    <IconButton sx={{ fontSize: 60, color: 'grey.600' }}>
                      <Info />
                    </IconButton>
                    <Typography variant="h6" sx={{ color: 'grey.600' }}>
                      Not Applied
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </TabPanel>
        </Box>
      </Box>
      <ToastContainer position="top-right" autoClose={3000} />
    </ThemeProvider>
  );
}

export default VacationSpotDetailScreen;