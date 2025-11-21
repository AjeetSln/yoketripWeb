'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Card,
  CardContent,
  Box,
  Grid,
  Chip,
  TextField,
  IconButton,
  CircularProgress,
  Avatar,
  Button,
  Typography,
  createTheme,
  ThemeProvider,
} from '@mui/material';
import { Search, LocationOn, CurrencyRupee, Refresh, Person } from '@mui/icons-material';
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
  },
});

function EcoTourismScreen(props) {
  const { 
    isLoggedIn, 
    setIsLoggedIn, 
    handleNavClick, 
    toggleDrawer, 
    handleLogout, 
    isChatRoute 
  } = props;
  const navigate = useNavigate();
  const [vacationSpots, setVacationSpots] = useState([]);
  const [filteredSpots, setFilteredSpots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [subscriptionCache, setSubscriptionCache] = useState({});

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem('auth_token'));
    };
    window.addEventListener('storage', checkAuth);
    checkAuth();
    fetchVacationSpots();
    return () => window.removeEventListener('storage', checkAuth);
  }, [setIsLoggedIn]);

  const getToken = () => localStorage.getItem('auth_token');

  const fetchCurrentUserId = async () => {
    try {
      const token = getToken();
      if (!token) {
        console.log('No auth token found');
        return null;
      }
      const response = await axios.get(`${baseUrl}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (response.status === 200) {
        return response.data._id || response.data.id;
      }
      console.log('Failed to fetch user profile:', response.status);
      return null;
    } catch (e) {
      console.error('Error fetching user ID:', e);
      return null;
    }
  };

  const fetchUserSubscriptionPlan = async (userId) => {
    if (subscriptionCache[userId]) {
      return subscriptionCache[userId];
    }
    try {
      const token = getToken();
      if (!token) {
        console.log('No auth token found');
        return null;
      }
      const response = await axios.get(`${baseUrl}/api/user/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (response.status === 200) {
        const plan = response.data.subscription?.plan || 'Free';
        setSubscriptionCache((prev) => ({ ...prev, [userId]: plan }));
        return plan;
      }
      console.log('Failed to fetch user subscription:', response.status);
      return null;
    } catch (e) {
      console.error('Error fetching user subscription:', e);
      return null;
    }
  };

  const fetchVacationSpots = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      const response = await axios.get(`${baseUrl}/api/vacationSpot/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setVacationSpots(response.data.data || []);
        setFilteredSpots(response.data.data || []);
      } else if (response.status === 404) {
        throw new Error('No Vacation Spots Found');
      } else {
        throw new Error(`Failed to fetch Vacation Spots: ${response.status}`);
      }
    } catch (e) {
      console.error('Error fetching vacation spots:', e);
      toast.error(`Error fetching Vacation Spots: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredSpots(vacationSpots);
    } else {
      const filtered = vacationSpots.filter(
        (spot) =>
          spot.name?.toLowerCase().includes(query.toLowerCase()) ||
          spot.location?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSpots(filtered);
    }
  };

  const handleCardClick = (spot) => {
    navigate('/vacation-spot-detail', { state: { spot } });
  };

  const handleProfileClick = async (userId) => {
    const currentUserId = await fetchCurrentUserId();
    if (currentUserId && userId === currentUserId) {
      navigate(`/profile/${currentUserId}`);
    } else {
      navigate(`/user-profile/${userId}`);
    }
  };

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
        {/* Hero Section */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)',
            color: 'white',
            py: { xs: 3, sm: 4 },
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            borderBottomLeftRadius: { sm: 20 },
            borderBottomRightRadius: { sm: 20 },
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url(/assets/eco-bg.jpg) center/cover no-repeat',
              opacity: 0.2,
              zIndex: 0,
            }}
          />
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 'bold',
                mb: 1.5,
                fontSize: { xs: '1.25rem', sm: '2rem' },
              }}
            >
              Discover Eco-Tourism Adventures
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mb: 2,
                fontSize: { xs: '0.85rem', sm: '1rem' },
                maxWidth: '500px',
                mx: 'auto',
              }}
            >
              Explore sustainable vacation spots and connect with nature
            </Typography>
            <Box
              sx={{
                maxWidth: '450px',
                mx: 'auto',
                px: { xs: 2, sm: 0 },
              }}
            >
              <TextField
                fullWidth
                placeholder="Search by name or location..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: 'grey.500', mr: 1 }} />,
                  sx: {
                    borderRadius: '50px',
                    bgcolor: 'white',
                    fontSize: '0.875rem',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                  },
                }}
                sx={{ mb: 1.5 }}
              />
            </Box>
          </Box>
        </Box>

        {/* Main Content */}
        <Box sx={{ px: { xs: 2, sm: 4 }, py: 3 }}>
          {isLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredSpots.length === 0 ? (
            <Card
              sx={{
                m: { xs: 2, sm: 4 },
                p: 3,
                textAlign: 'center',
                borderRadius: 16,
                width: 300, // Fixed width
                height: 280, // Fixed height
                mx: 'auto', // Center on mobile
              }}
            >
              <IconButton sx={{ fontSize: 60, color: 'grey.400' }}>
                <Search />
              </IconButton>
              <Typography variant="h6">No Eco Spots Found</Typography>
              <Typography variant="body2" color="text.secondary">
                Try refreshing or adjusting your search
              </Typography>
              <Button
                onClick={fetchVacationSpots}
                sx={{
                  mt: 2,
                  borderRadius: '20px',
                  textTransform: 'none',
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
                startIcon={<Refresh />}
              >
                Refresh
              </Button>
            </Card>
          ) : (
            <Grid
              container
              spacing={3}
              sx={{
                justifyContent: { xs: 'center', sm: 'flex-start' },
              }}
            >
              {filteredSpots.map((spot) => (
                <Grid item xs={12} sm={6} md={4} key={spot._id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      width: 300, // Fixed width
                      height: 300, // Fixed height
                      mx: 'auto', // Center on mobile
                    }}
                    onClick={() => handleCardClick(spot)}
                  >
                    <Box
                      component="img"
                      src={spot.image || '/assets/placeholder.png'}
                      alt={spot.name}
                      sx={{
                        height: 120, // Fixed image height
                        width: '100%',
                        objectFit: 'cover',
                        borderTopLeftRadius: 12,
                        borderTopRightRadius: 12,
                      }}
                      onError={(e) => {
                        e.target.src = '/assets/placeholder.png';
                      }}
                    />
                    <CardContent
                      sx={{
                        p: 2,
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Avatar
                          src={spot.user?.profilePic || '/assets/profilePic.png'}
                          sx={{
                            width: 40,
                            height: 40,
                            mr: 1.5,
                            border: '2px solid',
                            borderColor: 'primary.main',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProfileClick(spot.user?._id || '');
                          }}
                        >
                          {!spot.user?.profilePic && (
                            <IconButton sx={{ color: 'grey.500' }}>
                              <Person />
                            </IconButton>
                          )}
                        </Avatar>
                        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 600,
                              fontSize: '1rem',
                              lineHeight: 1.3,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {spot.name || 'No Name'}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <LocationOn sx={{ fontSize: 18, color: 'grey.600', mr: 0.5 }} />
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'grey.600',
                                fontSize: '0.85rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {spot.location || ''}
                            </Typography>
                          </Box>
                          {spot.categories && spot.categories.length > 0 && (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                              {spot.categories.slice(0, 2).map((category) => (
                                <Chip
                                  key={category}
                                  label={category}
                                  size="small"
                                  sx={{
                                    bgcolor: 'green.50',
                                    color: 'green.800',
                                    border: '1px solid',
                                    borderColor: 'green.200',
                                    fontSize: '0.75rem',
                                  }}
                                />
                              ))}
                            </Box>
                          )}
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 'bold',
                              color: 'primary.main',
                              mt: 1,
                              fontSize: '0.9rem',
                            }}
                          >
                            ₹{(spot.price || 0).toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>
      <ToastContainer position="top-right" autoClose={3000} />
    </ThemeProvider>
  );
}

export default EcoTourismScreen;