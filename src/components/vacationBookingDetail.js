'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  Typography,
  Button,
  CircularProgress,
  Avatar,
  IconButton,
} from '@mui/material';
import { Person } from '@mui/icons-material';
import { format } from 'date-fns';
import Header from './Header';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const baseUrl = 'https://yoketrip.in';

const theme = createTheme({
  palette: {
    primary: { main: '#388e3c', contrastText: '#fff' },
    secondary: { main: '#f50057' },
    background: { default: '#f5f5f5' },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: { fontWeight: 500 },
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

function VacationBookingDetail(props) {
  const { 
    isLoggedIn, 
    setIsLoggedIn, 
    handleNavClick, 
    toggleDrawer, 
    handleLogout, 
    isChatRoute 
  } = props;
  const { spotId } = useParams();
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);

  useEffect(() => {
    fetchBookings();
    fetchBookingRequests();
  }, []);

  const fetchBookings = async () => {
    setIsLoadingBookings(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No auth token found');
      const response = await axios.get(`${baseUrl}/api/vacationSpot/my-bookings/${spotId}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      setBookings(response.data.data.filter((booking) => booking.status === 'accepted') || []);
    } catch (e) {
      toast.error('Failed to load bookings: ' + e.message);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const fetchBookingRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No auth token found');
      const response = await axios.get(`${baseUrl}/api/vacationSpot/requests/${spotId}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      setRequests(response.data.data.filter((booking) => booking.status === 'pending') || []);
    } catch (e) {
      toast.error('Failed to load booking requests: ' + e.message);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No auth token found');
      const response = await axios.put(
        `${baseUrl}/api/vacationSpot/${bookingId}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      if (response.status === 200) {
        toast.success(`Booking ${action}ed successfully!`);
        fetchBookings();
        fetchBookingRequests();
      } else {
        throw new Error(`Failed to ${action} booking`);
      }
    } catch (e) {
      toast.error(`Error: ${e.message}`);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: 2 }}>
        <Header
          {...props}
        />
        <Box sx={{ maxWidth: 800, mx: 'auto', px: { xs: 2, sm: 4 } }}>
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
            Vacation Bookings
          </Typography>
          <Tabs
            value={tabIndex}
            onChange={(e, newValue) => setTabIndex(newValue)}
            indicatorColor="primary"
            textColor="primary"
            centered
            sx={{ mb: 2, bgcolor: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
          >
            <Tab label="Your Bookings" />
            <Tab label="Booking Requests" />
          </Tabs>
          <TabPanel value={tabIndex} index={0}>
            {isLoadingBookings ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : bookings.length === 0 ? (
              <Typography sx={{ textAlign: 'center', color: 'grey.600', mt: 4 }}>
                No bookings found.
              </Typography>
            ) : (
              bookings.map((booking) => (
                <Card key={booking._id} sx={{ mb: 2, borderRadius: 16 }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      src={booking.user?.profilePic || ''}
                      sx={{ width: 60, height: 60, mr: 2, cursor: 'pointer' }}
                      onClick={() => navigate(`/user-profile/${booking.user?._id || ''}`)}
                    >
                      {!booking.user?.profilePic && (
                        <IconButton>
                          <Person />
                        </IconButton>
                      )}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {booking.user?.full_name || 'Unknown User'}
                      </Typography>
                      <Typography sx={{ color: 'grey.700' }}>
                        Booked on: {format(new Date(booking.createdAt), 'dd MMM yyyy')}
                      </Typography>
                      <Typography sx={{ color: 'green.700', fontWeight: 'bold' }}>
                        Status: Accepted
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))
            )}
          </TabPanel>
          <TabPanel value={tabIndex} index={1}>
            {isLoadingRequests ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : requests.length === 0 ? (
              <Typography sx={{ textAlign: 'center', color: 'grey.600', mt: 4 }}>
                No booking requests found.
              </Typography>
            ) : (
              requests.map((request) => (
                <Card key={request._id} sx={{ mb: 2, borderRadius: 16 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        src={request.user?.profilePic || ''}
                        sx={{ width: 60, height: 60, mr: 2, cursor: 'pointer' }}
                        onClick={() => navigate(`/user-profile/${request.user?._id || ''}`)}
                      >
                        {!request.user?.profilePic && (
                          <IconButton>
                            <Person />
                          </IconButton>
                        )}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {request.user?.full_name || 'Unknown User'}
                        </Typography>
                        <Typography sx={{ color: 'grey.700' }}>
                          Requested on: {format(new Date(request.createdAt), 'dd MMM yyyy')}
                        </Typography>
                        <Typography sx={{ color: 'orange.700', fontWeight: 'bold' }}>
                          Status: Pending
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                      <Button
                        variant="text"
                        color="success"
                        onClick={() => handleBookingAction(request._id, 'accept')}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="text"
                        color="error"
                        onClick={() => handleBookingAction(request._id, 'reject')}
                      >
                        Reject
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))
            )}
          </TabPanel>
        </Box>
        <ToastContainer position="top-right" autoClose={3000} />
      </Box>
    </ThemeProvider>
  );
}

export default VacationBookingDetail;