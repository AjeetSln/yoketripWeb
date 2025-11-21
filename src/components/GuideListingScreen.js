'use client'; // Mark as Client Component

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Box,
  Container,
  Card,
  CardContent,
  CardActionArea,
  Avatar,
  Chip,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Badge,
  Grid,
  Rating,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  LocationOn,
  CurrencyRupee,
  FilterList,
  MyLocation,
  Clear,
  Search,
  Refresh,
  CheckCircle,
  BookmarkBorder,
  SearchOff,
  Menu as MenuIcon,
  Chat,
  Person,
  ExitToApp,
  Home,
  TravelExplore,
} from '@mui/icons-material';
import AsyncSelect from 'react-select/async';
import { getDistance } from 'geolib';
import Header from './Header'; // Adjust path as needed
import KYCService from '../services/kycservice'; // Adjust path as needed

const baseUrl = 'https://yoketrip.in';

const Review = {
  fromMap: (map) => ({
    id: map._id?.toString() || '',
    guideId: map.guideId?.toString() || '',
    userId: map.userId?._id?.toString() || '',
    rating: map.rating || 0,
    comment: map.comment?.toString() || '',
    createdAt: new Date(map.createdAt) || new Date(),
  }),
};

const BookingRequest = {
  fromMap: (map) => {
    let guideMap = map.guide;
    if (typeof guideMap === 'string') {
      console.warn(`Warning: guide is a string ID (${guideMap}), expected an object. Using default values.`);
      guideMap = { _id: map.guide, userId: { _id: map.guide, full_name: 'Unknown', profilePic: null } };
    }
    return {
      id: map._id?.toString() || '',
      guide: Guide.fromMap(guideMap),
      message: map.message?.toString() || '',
      status: map.status?.toString() || 'pending',
      initiatedBy: map.initiatedBy?.toString() || '',
      createdAt: new Date(map.createdAt) || new Date(),
    };
  },
};

const Guide = {
  fromMap: (map) => ({
    id: map._id?.toString() || '',
    userId: map.userId?._id?.toString() || '',
    fullName: map.userId?.full_name || 'Unknown',
    profilePic: map.userId?.profilePic || null,
    workLocation: map.workLocation || null,
    price: map.price || 0,
    priceType: map.priceType || '',
    languages: map.languages || [],
    coordinates: map.coordinates || null, // Added coordinates field
  }),
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: { xs: 1, sm: 3 } }}>{children}</Box>}
    </div>
  );
}

function GuideCard({ guide, onBookingRequest, hasExistingBookingRequest }) {
  const [subscriptionPlan, setSubscriptionPlan] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        const response = await axios.get(`${baseUrl}/api/user/profile/${guide.userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 200) {
          setSubscriptionPlan(response.data.subscription?.plan || 'Free');
        }
      } catch (e) {
        console.error('Error fetching subscription plan:', e);
      }
    };
    fetchPlan();
  }, [guide.userId]);

  return (
    <Card sx={{ m: { xs: 0.5, sm: 1, md: 2 }, borderRadius: 3, boxShadow: 2, mb: 2 }}>
      <CardActionArea onClick={() => navigate(`/guide/${guide.id}`)}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={3} sm={2}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={guide.profilePic || '/assets/profilePic.png'}
                  sx={{ width: { xs: 50, sm: 60, md: 80 }, height: { xs: 50, sm: 60, md: 80 } }}
                  imgProps={{ onError: () => console.error('Error loading guide profile pic') }}
                />
                <Box sx={{ position: 'absolute', bottom: 0, right: 0 }}>
                  {subscriptionPlan && subscriptionPlan !== 'Free' && (
                    <Box sx={{ bgcolor: 'blue', borderRadius: '50%', p: 0.5 }}>
                      <CheckCircle sx={{ color: 'white', fontSize: 16 }} />
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6} sm={7} md={7}>
              <Typography variant="h6" fontFamily="Roboto" sx={{ fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' } }}>
                {guide.fullName || 'Unknown'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <LocationOn fontSize="small" color="disabled" />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5, fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                  {guide.workLocation || 'Location not specified'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <CurrencyRupee fontSize="small" color="disabled" />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5, fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                  {guide.price} {guide.priceType}
                </Typography>
              </Box>
              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {guide.languages.slice(0, 3).map((lang) => (
                  <Chip
                    key={lang}
                    label={lang}
                    size="small"
                    sx={{ 
                      bgcolor: 'blue.50', 
                      fontFamily: 'Roboto',
                      fontSize: { xs: '0.6rem', sm: '0.7rem' },
                      height: { xs: 20, sm: 24 }
                    }}
                  />
                ))}
                {guide.languages.length > 3 && (
                  <Chip
                    label={`+${guide.languages.length - 3}`}
                    size="small"
                    sx={{ 
                      bgcolor: 'grey.100', 
                      fontFamily: 'Roboto',
                      fontSize: { xs: '0.6rem', sm: '0.7rem' },
                      height: { xs: 20, sm: 24 }
                    }}
                  />
                )}
              </Box>
            </Grid>
            <Grid item xs={3} sm={3} md={3} sx={{ textAlign: 'right' }}>
              <Button
                variant="contained"
                color={hasExistingBookingRequest ? 'grey' : 'primary'}
                size="small"
                disabled={hasExistingBookingRequest}
                onClick={async (e) => {
                  e.stopPropagation();
                  onBookingRequest(guide.id);
                }}
                sx={{ 
                  borderRadius: 20, 
                  fontFamily: 'Roboto',
                  fontSize: { xs: '0.7rem', sm: '0.8rem' },
                  px: { xs: 1, sm: 2 }
                }}
              >
                {hasExistingBookingRequest ? 'Applied' : 'Book'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function BookingCard({ request, onReviewClick }) {
  const [subscriptionPlan, setSubscriptionPlan] = useState(null);
  const [review, setReview] = useState(null);

  useEffect(() => {
    const fetchPlanAndReview = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        // Fetch subscription plan
        const planResponse = await axios.get(`${baseUrl}/api/user/profile/${request.guide.userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (planResponse.status === 200) {
          setSubscriptionPlan(planResponse.data.subscription?.plan || 'Free');
        }

        // Fetch review
        const reviewResponse = await axios.get(`${baseUrl}/api/guide/${request.guide.id}/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (reviewResponse.status === 200 && reviewResponse.data.success && reviewResponse.data.review) {
          setReview(Review.fromMap(reviewResponse.data.review));
        } else {
          setReview(null);
        }
      } catch (e) {
        console.error('Error fetching plan or review:', e);
      }
    };
    fetchPlanAndReview();
  }, [request.guide.userId, request.guide.id]);

  return (
    <Card sx={{ m: { xs: 0.5, sm: 1, md: 2 }, borderRadius: 3, boxShadow: 2, mb: 2 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={2} sm={1}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={request.guide.profilePic || '/assets/profilePic.png'}
                sx={{ width: { xs: 40, sm: 50 }, height: { xs: 40, sm: 50 } }}
                imgProps={{ onError: () => console.error('Error loading guide profile pic') }}
              />
              <Box sx={{ position: 'absolute', bottom: 0, right: 0 }}>
                {subscriptionPlan && subscriptionPlan !== 'Free' && (
                  <Box sx={{ bgcolor: 'blue', borderRadius: '50%', p: 0.3 }}>
                    <CheckCircle sx={{ color: 'white', fontSize: 12 }} />
                  </Box>
                )}
              </Box>
            </Box>
          </Grid>
          <Grid item xs={7} sm={8}>
            <Typography variant="h6" fontFamily="Roboto" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              {request.guide.fullName || 'Unknown Guide'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
              Initiated by: {request.initiatedBy}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
              Created: {new Date(request.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Typography>
            {request.message && (
              <Typography variant="body2" sx={{ mt: 1, fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                Message: {request.message}
              </Typography>
            )}
          </Grid>
          <Grid item xs={3} sm={3}>
            <Chip
              label={request.status.toUpperCase()}
              color={
                request.status === 'accepted'
                  ? 'success'
                  : request.status === 'rejected'
                  ? 'error'
                  : 'warning'
              }
              sx={{ 
                fontFamily: 'Roboto',
                fontSize: { xs: '0.6rem', sm: '0.7rem' },
                width: '100%'
              }}
            />
          </Grid>
        </Grid>
        {request.status === 'accepted' && (
          <Box sx={{ mt: 2 }}>
            {review ? (
              <Box>
                <Typography variant="subtitle2" color="primary" fontFamily="Roboto" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                  Your Review:
                </Typography>
                <Rating value={review.rating} readOnly size="small" />
                <Typography variant="body2" sx={{ mt: 0.5, fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                  {review.comment}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>
                  Submitted: {new Date(review.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'right', mt: 1 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => onReviewClick(request.guide.id)}
                  sx={{ 
                    borderRadius: 20, 
                    fontFamily: 'Roboto',
                    fontSize: { xs: '0.7rem', sm: '0.8rem' }
                  }}
                >
                  Submit Review
                </Button>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function GuideListingScreen( props) {
  const { 
    isLoggedIn, 
    setIsLoggedIn, 
    handleNavClick, 
    toggleDrawer, 
    handleLogout, 
    isChatRoute 
  } = props;
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [tabIndex, setTabIndex] = useState(0);
  const [guides, setGuides] = useState([]);
  const [filteredGuides, setFilteredGuides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [searchLocation, setSearchLocation] = useState(null);
  const [searchLocationCoords, setSearchLocationCoords] = useState(null);
  const [locationInput, setLocationInput] = useState('');
  const [priceMin, setPriceMin] = useState(null);
  const [priceMax, setPriceMax] = useState(null);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const languageOptions = ['English', 'Hindi', 'Spanish', 'French', 'German', 'Marathi', 'Tamil', 'Telugu', 'Bengali', 'Gujarati'];
  const [bookingRequests, setBookingRequests] = useState([]);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [bookingRequestStatus, setBookingRequestStatus] = useState({});
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [currentGuideId, setCurrentGuideId] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [locationCache, setLocationCache] = useState({});

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem('auth_token'));
    };
    window.addEventListener('storage', checkAuth);
    checkAuth();
    return () => window.removeEventListener('storage', checkAuth);
  }, [setIsLoggedIn]);

  useEffect(() => {
    getCurrentLocation();
    fetchBookingRequests();
  }, []);

  const getToken = async () => {
    return localStorage.getItem('auth_token');
  };

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      if (!navigator.geolocation) {
        toast.error('Geolocation is not supported by this browser');
        setLocationLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentPosition({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setSearchLocation(null);
          setSearchLocationCoords(null);
          setLocationInput('');
          fetchGuides();
        },
        (error) => {
          let message = 'Error getting location';
          if (error.code === error.PERMISSION_DENIED) {
            message = 'Location permissions are denied';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            message = 'Location information is unavailable';
          } else if (error.code === error.TIMEOUT) {
            message = 'The request to get location timed out';
          }
          toast.error(message);
          setLocationLoading(false);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } catch (e) {
      console.error('Error getting location:', e);
      toast.error(`Error getting location: ${e.message}`);
      setLocationLoading(false);
    }
  };

  const geocodeLocation = async (location) => {
    // Check cache first
    if (locationCache[location]) {
      return locationCache[location];
    }
    
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`,
        { headers: { 'User-Agent': 'YokTripApp/1.0' } }
      );
      if (response.data.length > 0) {
        const coords = {
          latitude: parseFloat(response.data[0].lat),
          longitude: parseFloat(response.data[0].lon),
        };
        
        // Cache the result
        setLocationCache(prev => ({...prev, [location]: coords}));
        return coords;
      }
      return null;
    } catch (e) {
      console.error('Error geocoding location:', e);
      return null;
    }
  };

  const fetchGuides = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication token not found');
        navigate('/login');
        return;
      }

      const queryParams = {};
      if (priceMin) queryParams.priceMin = priceMin;
      if (priceMax) queryParams.priceMax = priceMax;
      if (selectedLanguages.length > 0) queryParams.languages = selectedLanguages.join(',');

      const response = await axios.get(`${baseUrl}/api/guide/allGuides`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        params: queryParams,
      });

      if (response.status === 200) {
        const allGuides = response.data.guides.map(Guide.fromMap);
        
        // Pre-cache coordinates for guides with work locations
        const guidesWithCoordinates = await Promise.all(
          allGuides.map(async (guide) => {
            if (guide.workLocation) {
              try {
                const coords = await geocodeLocation(guide.workLocation);
                return { ...guide, coordinates: coords };
              } catch (e) {
                console.error(`Error geocoding ${guide.workLocation}:`, e);
                return guide;
              }
            }
            return guide;
          })
        );

        let filtered = guidesWithCoordinates;

        if (currentPosition || searchLocationCoords) {
          const userCoords = currentPosition || searchLocationCoords;
          filtered = guidesWithCoordinates.filter((guide) => {
            if (!guide.coordinates) return false;
            
            const distance = getDistance(
              { latitude: userCoords.latitude, longitude: userCoords.longitude },
              { latitude: guide.coordinates.latitude, longitude: guide.coordinates.longitude }
            ) / 1000; // Convert to km
            
            return distance <= 50;
          });
        }

        // Fetch booking request status for each guide
        const statusPromises = allGuides.map(async (guide) => {
          const exists = await hasExistingBookingRequest(guide.id);
          return { guideId: guide.id, hasRequest: exists };
        });
        const statuses = await Promise.all(statusPromises);
        const statusMap = statuses.reduce((acc, { guideId, hasRequest }) => {
          acc[guideId] = hasRequest;
          return acc;
        }, {});
        setBookingRequestStatus(statusMap);

        setGuides(guidesWithCoordinates);
        setFilteredGuides(filtered);
      } else {
        throw new Error(`Failed to load guides: ${response.status}`);
      }
    } catch (e) {
      console.error('Error fetching guides:', e);
      toast.error(`Error: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getLocationSuggestions = async (input) => {
    if (!input || input.length < 3) return [];
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(input)}&format=json&addressdetails=1&limit=8`,
        { headers: { 'User-Agent': 'YokTripApp/1.0' } }
      );
      return response.data.map((item) => ({
        value: item.display_name,
        label: item.display_name,
      }));
    } catch (e) {
      console.error('Error getting location suggestions:', e);
      return [];
    }
  };

  const fetchBookingRequests = async () => {
    setIsBookingLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication token not found');
        navigate('/login');
        return;
      }

      const response = await axios.get(`${baseUrl}/api/traveller/booking-requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200 && response.data.success) {
        const requests = await Promise.all(
          response.data.data.map(async (request) => {
            if (typeof request.guide === 'string') {
              const guideData = await fetchGuideDetails(request.guide);
              request.guide = guideData || {
                _id: request.guide,
                userId: { _id: request.guide, full_name: 'Unknown', profilePic: null },
              };
            }
            return BookingRequest.fromMap(request);
          })
        );
        setBookingRequests(requests);
      } else {
        throw new Error(response.data.message || 'Failed to load booking requests');
      }
    } catch (e) {
      console.error('Error fetching booking requests:', e);
      toast.error(`Error: ${e.message}`);
    } finally {
      setIsBookingLoading(false);
    }
  };

  const fetchGuideDetails = async (guideId) => {
    try {
      const token = await getToken();
      if (!token) return null;

      const response = await axios.get(`${baseUrl}/api/guide/${guideId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.status === 200 ? response.data.guide : null;
    } catch (e) {
      console.error('Error fetching guide details:', e);
      return null;
    }
  };

  const sendGuideBookingRequest = async (guideId) => {
    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication token not found');
        navigate('/login');
        return;
      }

      const response = await axios.post(
        `${baseUrl}/api/traveller/guide/${guideId}/request`,
        { message: 'I would like to book your guide services' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 201 && response.data.success) {
        toast.success('Booking request sent successfully!');
        setBookingRequestStatus((prev) => ({ ...prev, [guideId]: true }));
        fetchBookingRequests();
      } else if (response.status === 400 && response.data.message === 'Request already sent to this guide') {
        toast.info('Booking request already sent to this guide');
      } else {
        throw new Error(response.data.message || 'Failed to send request');
      }
    } catch (e) {
      console.error('Error sending guide booking request:', e);
      toast.error(`Error: ${e.message}`);
    }
  };

  const hasExistingBookingRequest = async (guideId) => {
    try {
      const token = await getToken();
      if (!token) return false;

      const response = await axios.get(
        `${baseUrl}/api/traveller/booking/check?guideId=${guideId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.status === 200 && response.data.exists === true;
    } catch (e) {
      console.error('Error checking existing booking request:', e);
      return false;
    }
  };

  const submitReview = async (guideId, rating, comment) => {
    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication token not found');
        navigate('/login');
        return;
      }

      const response = await axios.post(
        `${baseUrl}/api/guide/review`,
        { guideId, rating, comment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 201) {
        toast.success('Review submitted successfully!');
        fetchBookingRequests();
        setReviewDialogOpen(false);
      } else {
        throw new Error(response.data.message || 'Failed to submit review');
      }
    } catch (e) {
      console.error('Error submitting review:', e);
      toast.error(`Error: ${e.message}`);
    }
  };

  const showSubscriptionPopup = () => {
    return (
      <Dialog open={true} onClose={() => navigate('/subscription')}>
        <Box sx={{ p: 3, position: 'relative' }}>
          <IconButton
            sx={{ position: 'absolute', top: 8, right: 8 }}
            onClick={() => navigate('/subscription')}
          >
            <Clear />
          </IconButton>
          <Typography variant="h6" align="center">🚀</Typography>
          <Typography variant="h5" align="center" gutterBottom>
            Unlock Your Full Travel Experience!
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography>• Unlimited travel partners Bookings.</Typography>
            <Typography>• Exclusive Volunteer Yatra. Verified guides.</Typography>
            <Typography>• Chat without limits – Go Premium now!</Typography>
          </Box>
          <Button
            variant="contained"
            color="warning"
            fullWidth
            onClick={() => navigate('/subscription')}
          >
            ✨ Upgrade Super Plan
          </Button>
        </Box>
      </Dialog>
    );
  };

  const handleBookingRequest = async (guideId) => {
    const plan = await KYCService.getUserSubscriptionPlan();
    if (plan === 'Super') {
      sendGuideBookingRequest(guideId);
    } else {
      showSubscriptionPopup();
    }
  };

  const buildBookingStatusTab = () => {
    if (isBookingLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      );
    }

    if (bookingRequests.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <BookmarkBorder sx={{ fontSize: 60, color: 'grey.400' }} />
          <Typography variant="h6" fontFamily="Roboto" sx={{ mt: 2 }}>
            No booking requests found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Your booking requests will appear here
          </Typography>
          <Button onClick={fetchBookingRequests} sx={{ mt: 2, fontFamily: 'Roboto' }}>
            Refresh
          </Button>
        </Box>
      );
    }

    return (
      <Box sx={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
        {bookingRequests.map((request) => (
          <BookingCard
            key={request.id}
            request={request}
            onReviewClick={(guideId) => {
              setCurrentGuideId(guideId);
              setReviewDialogOpen(true);
            }}
          />
        ))}
      </Box>
    );
  };

  const showReviewDialog = () => (
    <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontFamily: 'Roboto' }}>Rate Your Guide</DialogTitle>
      <DialogContent>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Rating
            value={rating}
            onChange={(e, newValue) => setRating(newValue)}
            size="large"
          />
        </Box>
        <TextField
          fullWidth
          label="Your Review"
          multiline
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          error={!comment}
          helperText={!comment ? 'Please enter a review' : ''}
          sx={{ mb: 2, '& .MuiInputBase-root': { fontFamily: 'Roboto' } }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setReviewDialogOpen(false)} sx={{ fontFamily: 'Roboto' }}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            if (rating > 0 && comment) {
              submitReview(currentGuideId, rating, comment);
              setRating(0);
              setComment('');
            } else {
              toast.error('Please provide a rating and review');
            }
          }}
          variant="contained"
          color="primary"
          sx={{ fontFamily: 'Roboto' }}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );

  const buildLocationSearch = () => (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AsyncSelect
          cacheOptions
          defaultOptions
          loadOptions={getLocationSuggestions}
          value={searchLocation ? { value: searchLocation, label: searchLocation } : null}
          onChange={async (option) => {
            setLocationInput(option ? option.value : '');
            setSearchLocation(option ? option.value : null);
            setCurrentPosition(null);
            const coords = await geocodeLocation(option ? option.value : '');
            setSearchLocationCoords(coords);
            fetchGuides();
          }}
          placeholder="Search by location..."
          styles={{
            control: (base) => ({
              ...base,
              fontFamily: 'Roboto, sans-serif',
              backgroundColor: '#f5f5f5',
              borderRadius: '30px',
              padding: '2px 8px',
              minWidth: isMobile ? '150px' : '300px',
            }),
            input: (base) => ({ ...base, padding: '8px' }),
            menu: (base) => ({ ...base, zIndex: 9999 }),
          }}
          components={{
            DropdownIndicator: () => <Search sx={{ mx: 1 }} />,
            IndicatorSeparator: () => null,
          }}
        />
        <IconButton onClick={getCurrentLocation} title="Use current location" disabled={locationLoading}>
          {locationLoading ? <CircularProgress size={24} /> : <MyLocation />}
        </IconButton>
        {locationInput && (
          <IconButton
            onClick={() => {
              setLocationInput('');
              setSearchLocation(null);
              setSearchLocationCoords(null);
              fetchGuides();
            }}
          >
            <Clear />
          </IconButton>
        )}
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'Roboto', display: 'block', mt: 1 }}>
        {currentPosition
          ? 'Showing guides within 50km of your location'
          : searchLocationCoords
          ? `Showing guides near ${searchLocation}`
          : 'Showing all available guides'}
      </Typography>
    </Box>
  );

  const showFiltersDialog = () => (
    <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontFamily: 'Roboto' }}>Filter Guides</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1" fontFamily="Roboto" sx={{ fontWeight: 'bold', mt: 1 }}>
          Price Range
        </Typography>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Min"
              type="number"
              value={priceMin || ''}
              onChange={(e) => setPriceMin(e.target.value ? parseFloat(e.target.value) : null)}
              sx={{ '& .MuiInputBase-root': { fontFamily: 'Roboto' } }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Max"
              type="number"
              value={priceMax || ''}
              onChange={(e) => setPriceMax(e.target.value ? parseFloat(e.target.value) : null)}
              sx={{ '& .MuiInputBase-root': { fontFamily: 'Roboto' } }}
            />
          </Grid>
        </Grid>
        <Typography variant="subtitle1" fontFamily="Roboto" sx={{ mt: 2, fontWeight: 'bold' }}>
          Languages
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          {languageOptions.map((language) => (
            <Chip
              key={language}
              label={language}
              color={selectedLanguages.includes(language) ? 'primary' : 'default'}
              onClick={() =>
                setSelectedLanguages((prev) =>
                  prev.includes(language)
                    ? prev.filter((l) => l !== language)
                    : [...prev, language]
                )
              }
              sx={{ fontFamily: 'Roboto', mb: 1 }}
            />
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setPriceMin(null);
            setPriceMax(null);
            setSelectedLanguages([]);
            fetchGuides();
            setFilterDialogOpen(false);
          }}
          sx={{ fontFamily: 'Roboto' }}
        >
          Reset
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            fetchGuides();
            setFilterDialogOpen(false);
          }}
          sx={{ fontFamily: 'Roboto' }}
        >
          Apply Filters
        </Button>
      </DialogActions>
    </Dialog>
  );

  const displayGuides = currentPosition || searchLocationCoords ? filteredGuides : guides;

  return (
    <>
      <Header
        {...props}
      />
      <Box sx={{ 
        pt: { xs: 12, sm: 14, md: 16 }, 
        bgcolor: 'background.default', 
        minHeight: '100vh' 
      }}>
        <AppBar 
          position="fixed" 
          color="primary" 
          elevation={2}
          sx={{ 
            top: { xs: 56, sm: 64 },
            zIndex: theme.zIndex.appBar - 1
          }}
        >
          <Toolbar sx={{ minHeight: { xs: 48, sm: 64 } }}>
            <Typography variant="h6" sx={{ flexGrow: 1, fontFamily: 'Roboto', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Local Guides
            </Typography>
            <IconButton
              color="inherit"
              onClick={() => (tabIndex === 0 ? fetchGuides() : fetchBookingRequests())}
              size={isMobile ? "small" : "medium"}
            >
              <Refresh />
            </IconButton>
            {tabIndex === 0 && (
              <IconButton color="inherit" onClick={() => setFilterDialogOpen(true)} size={isMobile ? "small" : "medium"}>
                <Badge
                  color="primary"
                  variant={priceMin || priceMax || selectedLanguages.length > 0 ? 'dot' : 'standard'}
                >
                  <FilterList />
                </Badge>
              </IconButton>
            )}
          </Toolbar>
          <Tabs
            value={tabIndex}
            onChange={(e, newValue) => {
              setTabIndex(newValue);
              if (newValue === 1) fetchBookingRequests();
            }}
            indicatorColor="secondary"
            textColor="inherit"
            centered
            sx={{ bgcolor: 'primary.main' }}
            variant={isMobile ? "fullWidth" : "standard"}
          >
            <Tab 
              label="Guides" 
              sx={{ 
                fontFamily: 'Roboto', 
                fontWeight: 'bold',
                fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' },
                minWidth: { xs: 80, sm: 120 }
              }} 
            />
            <Tab 
              label="Booking Status" 
              sx={{ 
                fontFamily: 'Roboto', 
                fontWeight: 'bold',
                fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' },
                minWidth: { xs: 80, sm: 120 }
              }} 
            />
          </Tabs>
        </AppBar>
        <Container maxWidth="lg" sx={{ mt: 2 }}>
          <TabPanel value={tabIndex} index={0}>
            {buildLocationSearch()}
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : displayGuides.length === 0 ? (
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <SearchOff sx={{ fontSize: 60, color: 'grey.400' }} />
                <Typography variant="h6" fontFamily="Roboto" sx={{ mt: 2 }}>
                  No guides found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Try adjusting your filters or search location
                </Typography>
                <Button 
                  onClick={() => {
                    setSearchLocation(null);
                    setSearchLocationCoords(null);
                    setCurrentPosition(null);
                    setLocationInput('');
                    fetchGuides();
                  }}
                  variant="outlined"
                  sx={{ mt: 2 }}
                >
                  Clear Location Filter
                </Button>
              </Box>
            ) : (
              <Box sx={{ 
                maxHeight: 'calc(100vh - 200px)', 
                overflowY: 'auto',
                pb: 2
              }}>
                {displayGuides.map((guide) => (
                  <GuideCard
                    key={guide.id}
                    guide={guide}
                    onBookingRequest={handleBookingRequest}
                    hasExistingBookingRequest={bookingRequestStatus[guide.id] || false}
                  />
                ))}
              </Box>
            )}
          </TabPanel>
          <TabPanel value={tabIndex} index={1}>
            {buildBookingStatusTab()}
          </TabPanel>
        </Container>
        {showReviewDialog()}
        {showFiltersDialog()}
        <ToastContainer position="top-right" autoClose={3000} />
      </Box>
    </>
  );
}

export default GuideListingScreen;