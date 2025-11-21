'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Card,
  CardContent,
  Box,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container,
  Avatar,
  Divider,
  createTheme,
  ThemeProvider,
} from '@mui/material';
import { Refresh, LocationOn, AttachMoney, ListAlt } from '@mui/icons-material';
import Header from './Header';

const baseUrl = 'https://yoketrip.in';

// Custom theme (same as GuideDashboard)
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
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
        },
      },
    },
  },
});

function GuideBookingRequestsScreen(props) {
  const { 
    isLoggedIn, 
    setIsLoggedIn, 
    handleNavClick, 
    toggleDrawer, 
    handleLogout, 
    isChatRoute 
  } = props;
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [guideId, setGuideId] = useState(null);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem('auth_token'));
    };
    window.addEventListener('storage', checkAuth);
    checkAuth();
    fetchGuideIdAndRequests();
    return () => window.removeEventListener('storage', checkAuth);
  }, [setIsLoggedIn]);

  const getToken = () => localStorage.getItem('auth_token');

  const fetchGuideIdAndRequests = async () => {
    setIsLoading(true);
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      toast.error('Authentication token not found');
      navigate('/login');
      return;
    }

    try {
      const guideResponse = await axios.get(`${baseUrl}/api/guide/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (guideResponse.status === 200) {
        const guide = guideResponse.data.data;
        setGuideId(guide._id);
        await fetchRequests(token);
      } else {
        throw new Error('Failed to fetch guide data');
      }
    } catch (e) {
      console.error('Error fetching guide data:', e);
      toast.error(`Error: ${e.message}`);
      setIsLoading(false);
    }
  };

  const fetchRequests = async (token) => {
    try {
      const response = await axios.get(`${baseUrl}/api/traveller/guide/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setRequests(response.data.data || []);
      } else if (response.status === 404) {
        setRequests([]);
      } else {
        throw new Error('Failed to fetch requests');
      }
    } catch (e) {
      console.error('Error fetching requests:', e);
      toast.error(`Error: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateRequestStatus = async (requestId, status) => {
    const token = getToken();
    if (!token) {
      toast.error('Authentication token not found');
      return;
    }

    try {
      const endpoint = `${baseUrl}/api/traveller/${requestId}/${status}`;
      const response = await axios.put(endpoint, { guideId }, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (response.status === 200) {
        toast.success(`Request ${status}ed successfully`);
        await fetchRequests(token);
      } else {
        throw new Error(`Failed to ${status} request`);
      }
    } catch (e) {
      console.error('Error updating request status:', e);
      toast.error(`Failed to ${status} request: ${e.message}`);
    }
  };

  const handleReject = (requestId) => {
    setSelectedRequestId(requestId);
    setOpenRejectDialog(true);
  };

  const confirmReject = () => {
    setOpenRejectDialog(false);
    updateRequestStatus(selectedRequestId, 'reject');
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      case 'completed':
        return 'secondary';
      case 'cancelled':
        return 'warning';
      default:
        return 'primary';
    }
  };

  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <ThemeProvider theme={theme}>
      <Header
        {...props}
      />
      <AppBar position="fixed" color="primary" elevation={2}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Booking Requests
          </Typography>
          <IconButton color="inherit" onClick={() => fetchGuideIdAndRequests()}>
            <Refresh />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box sx={{ pt: '64px', bgcolor: 'background.default', minHeight: '100vh' }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {isLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : requests.length === 0 ? (
            <Card sx={{ m: 2, p: 3, textAlign: 'center' }}>
              <IconButton sx={{ fontSize: 60, color: 'grey.400' }}>
                <ListAlt />
              </IconButton>
              <Typography variant="h6">No Booking Requests</Typography>
              <Typography variant="body2" color="text.secondary">
                You don't have any booking requests yet
              </Typography>
            </Card>
          ) : (
            <Grid container spacing={2}>
              {requests.map((request) => (
                <Grid item xs={12} md={6} key={request._id}>
                  <Card>
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item>
                          <Avatar
                            src={request.traveller.profilePic || '/assets/profilePic.png'}
                            sx={{ width: 48, height: 48 }}
                            onClick={() => handleViewProfile(request.traveller._id)}
                            style={{ cursor: 'pointer' }}
                          />
                        </Grid>
                        <Grid item xs>
                          <Typography variant="subtitle1">{request.traveller.full_name || 'Unknown Traveler'}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Wants to book your guide services
                          </Typography>
                        </Grid>
                        <Grid item>
                          <Chip
                            label={request.status.toUpperCase()}
                            color={getStatusColor(request.status)}
                          />
                        </Grid>
                      </Grid>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="h6">Trip Details</Typography>
                      <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocationOn sx={{ mr: 1 }} />
                          <Typography>Location: {request.guide.workLocation || 'Not specified'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <AttachMoney sx={{ mr: 1 }} />
                          <Typography>Price: {request.guide.price} {request.guide.priceType}</Typography>
                        </Box>
                      </Box>
                      {request.message && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle1">Traveler's Message:</Typography>
                          <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1, mt: 1 }}>
                            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                              {request.message}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                      {request.status.toLowerCase() === 'pending' && (
                        <Grid container spacing={2} sx={{ mt: 2 }}>
                          <Grid item xs={6}>
                            <Button
                              variant="outlined"
                              color="error"
                              fullWidth
                              onClick={() => handleReject(request._id)}
                            >
                              Reject
                            </Button>
                          </Grid>
                          <Grid item xs={6}>
                            <Button
                              variant="contained"
                              color="success"
                              fullWidth
                              onClick={() => updateRequestStatus(request._id, 'accept')}
                            >
                              Accept
                            </Button>
                          </Grid>
                        </Grid>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>
      <Dialog
        open={openRejectDialog}
        onClose={() => setOpenRejectDialog(false)}
      >
        <DialogTitle>Confirm Rejection</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to reject this booking request?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRejectDialog(false)}>Cancel</Button>
          <Button onClick={confirmReject} color="error">
            Reject
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer position="top-right" autoClose={3000} />
    </ThemeProvider>
  );
}

export default GuideBookingRequestsScreen;