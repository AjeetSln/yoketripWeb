'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  TextField,
  Typography,
  createTheme,
  ThemeProvider,
  List,
  ListItem,
  ListItemText,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { LocationOn, Upload } from '@mui/icons-material';
import Header from './Header';

const baseUrl = 'https://yoketrip.in';
const geoapifyApiKey = '47ecf4083a70466ca9027da71d128084';

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
  },
});

function AddVacationSpotScreen(props) {
  const { 
    isLoggedIn, 
    setIsLoggedIn, 
    handleNavClick, 
    toggleDrawer, 
    handleLogout, 
    isChatRoute 
  } = props;
  const location = useLocation();
  const navigate = useNavigate();
  const spot = location.state?.spot || {};
  const [formData, setFormData] = useState({
    name: spot.name || '',
    price: spot.price?.toString() || '',
    description: spot.description || '',
    location: spot.location || '',
    latitude: spot.latitude?.toString() || '',
    longitude: spot.longitude?.toString() || '',
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [existingImageUrl, setExistingImageUrl] = useState(spot.image || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [placeSuggestions, setPlaceSuggestions] = useState([]);
  const [isSuggestingLocation, setIsSuggestingLocation] = useState(false);
  const [serviceCategories, setServiceCategories] = useState({
    'Eco Stay (Accommodation)': (spot.categories || []).includes('Eco Stay (Accommodation)'),
    'Water Sports Activities': (spot.categories || []).includes('Water Sports Activities'),
    'Sea Sports Activities': (spot.categories || []).includes('Sea Sports Activities'),
    'Sky Activities': (spot.categories || []).includes('Sky Activities'),
    'Jungle Safari Activities': (spot.categories || []).includes('Jungle Safari Activities'),
    'Cultural Program': (spot.categories || []).includes('Cultural Program'),
    'Other Services': (spot.categories || []).includes('Other Services'),
  });

  const onDrop = useCallback((acceptedFiles) => {
    setSelectedImage(acceptedFiles[0]);
    setExistingImageUrl(null);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { 'image/*': [] }, maxFiles: 1 });

  const getCurrentLocation = async () => {
    setIsFetchingLocation(true);
    setFormData({ ...formData, location: 'Fetching location...' });

    try {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await axios.get(
              `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${geoapifyApiKey}`
            );
            const placemark = response.data.features[0].properties;
            const addressParts = [
              placemark.subLocality || placemark.subAdministrativeArea || '',
              placemark.locality || placemark.subAdministrativeArea || '',
              placemark.administrativeArea || '',
              placemark.postalCode || '',
            ].filter((e) => e);
            const formattedAddress = addressParts.join(', ');

            setFormData({
              ...formData,
              latitude: latitude.toString(),
              longitude: longitude.toString(),
              location: formattedAddress || 'Location acquired',
            });
            setIsFetchingLocation(false);
          } catch (e) {
            toast.error('Error fetching address');
            setFormData({ ...formData, location: 'Tap to try again' });
            setIsFetchingLocation(false);
          }
        },
        (error) => {
          toast.error(error.message);
          setFormData({ ...formData, location: 'Tap to try again' });
          setIsFetchingLocation(false);
        },
        { enableHighAccuracy: true }
      );
    } catch (e) {
      toast.error('Location services unavailable');
      setFormData({ ...formData, location: 'Tap to try again' });
      setIsFetchingLocation(false);
    }
  };

  const fetchLocationSuggestions = async (input) => {
    if (!input) {
      setPlaceSuggestions([]);
      return;
    }
    setIsSuggestingLocation(true);
    try {
      const response = await axios.get(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${input}&apiKey=${geoapifyApiKey}&limit=5`
      );
      setPlaceSuggestions(response.data.features || []);
    } catch (e) {
      toast.error('Error fetching suggestions');
    } finally {
      setIsSuggestingLocation(false);
    }
  };

  const selectSuggestion = async (suggestion) => {
    setFormData({ ...formData, location: suggestion.properties.formatted });
    setPlaceSuggestions([]);
    try {
      const response = await axios.get(
        `https://api.geoapify.com/v1/geocode/search?text=${suggestion.properties.formatted}&apiKey=${geoapifyApiKey}`
      );
      if (response.data.features.length > 0) {
        const { coordinates } = response.data.features[0].geometry;
        setFormData({ ...formData, latitude: coordinates[1].toString(), longitude: coordinates[0].toString(), location: suggestion.properties.formatted });
      }
    } catch (e) {
      toast.error('Error fetching coordinates');
    }
  };

  const handleCategoryChange = (category) => {
    setServiceCategories({ ...serviceCategories, [category]: !serviceCategories[category] });
  };

  const submitForm = async () => {
    if (!formData.name || !formData.price || !formData.description || !formData.location) {
      toast.error('Please fill all required fields');
      return;
    }
    if (!selectedImage && !existingImageUrl) {
      toast.error('Please select an image');
      return;
    }
    if (!formData.latitude || !formData.longitude) {
      toast.error('Please fetch or select a valid location');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const isUpdating = !!spot._id;
      const url = isUpdating ? `${baseUrl}/api/vacationSpot/${spot._id}` : `${baseUrl}/api/vacationSpot/spot-create`;
      const method = isUpdating ? 'put' : 'post';

      const form = new FormData();
      form.append('name', formData.name);
      form.append('price', formData.price);
      form.append('description', formData.description);
      form.append('location', formData.location);
      form.append('latitude', formData.latitude);
      form.append('longitude', formData.longitude);
      form.append('categories', JSON.stringify(Object.keys(serviceCategories).filter((key) => serviceCategories[key])));
      if (selectedImage) {
        form.append('vacation-spots', selectedImage);
      }
      if (isUpdating && !selectedImage) {
        form.append('keepExistingImage', 'true');
      }

      const response = await axios({
        method,
        url,
        data: form,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });

      if (response.status === 200 || response.status === 201) {
        toast.success(isUpdating ? 'Vacation spot updated successfully!' : 'Vacation spot added successfully!');
        navigate('/my-services', { replace: true });
      } else {
        throw new Error(`Failed to ${isUpdating ? 'update' : 'add'} vacation spot: ${response.status}`);
      }
    } catch (e) {
      toast.error(`Error: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Header
        {...props}
      />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: 2, pb: 4 }}>
        <Box sx={{ maxWidth: 800, mx: 'auto', px: { xs: 2, sm: 4 } }}>
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
            {spot._id ? 'Edit Vacation Spot' : 'Add Vacation Spot'}
          </Typography>
          <Card sx={{ p: 2, borderRadius: 16 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                Service Photo
              </Typography>
              <Box
                {...getRootProps()}
                sx={{
                  height: 150,
                  border: '1.5px dashed',
                  borderColor: 'grey.400',
                  borderRadius: 12,
                  bgcolor: 'grey.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  mb: 3,
                }}
              >
                <input {...getInputProps()} />
                {selectedImage ? (
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Selected"
                    style={{ height: '100%', width: '100%', objectFit: 'cover', borderRadius: 12 }}
                  />
                ) : existingImageUrl ? (
                  <img
                    src={existingImageUrl}
                    alt="Existing"
                    style={{ height: '100%', width: '100%', objectFit: 'cover', borderRadius: 12 }}
                    onError={(e) => { e.target.src = '/assets/placeholder.png'; }}
                  />
                ) : (
                  <Box sx={{ textAlign: 'center' }}>
                    <Upload sx={{ fontSize: 40, color: 'grey.600' }} />
                    <Typography sx={{ color: 'grey.600' }}>
                      Tap to add service photo
                    </Typography>
                  </Box>
                )}
              </Box>
              <TextField
                fullWidth
                label="Business/Service Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                sx={{ mb: 3 }}
                required
                error={!formData.name}
                helperText={!formData.name ? 'Please enter a service name' : ''}
              />
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                Service Category
              </Typography>
              <Card sx={{ p: 2, mb: 3, borderRadius: 8, border: '1px solid', borderColor: 'grey.300' }}>
                {Object.keys(serviceCategories).map((category) => (
                  <FormControlLabel
                    key={category}
                    control={
                      <Checkbox
                        checked={serviceCategories[category]}
                        onChange={() => handleCategoryChange(category)}
                        color="primary"
                      />
                    }
                    label={category}
                    sx={{ display: 'block' }}
                  />
                ))}
              </Card>
              <TextField
                fullWidth
                label="Price (INR)"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                type="number"
                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                sx={{ mb: 3 }}
                required
                error={!formData.price}
                helperText={!formData.price ? 'Enter a price' : ''}
              />
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                Location
              </Typography>
              <TextField
                fullWidth
                label="Enter or select location"
                value={formData.location}
                onChange={(e) => {
                  setFormData({ ...formData, location: e.target.value });
                  fetchLocationSuggestions(e.target.value);
                }}
                disabled={isFetchingLocation}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {isFetchingLocation ? (
                        <CircularProgress size={20} />
                      ) : (
                        <IconButton onClick={getCurrentLocation}>
                          <LocationOn />
                        </IconButton>
                      )}
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: placeSuggestions.length > 0 ? 0 : 3 }}
              />
              {placeSuggestions.length > 0 && (
                <Card sx={{ maxHeight: 150, overflow: 'auto', mt: 1, mb: 3, borderRadius: 8 }}>
                  <List>
                    {placeSuggestions.map((suggestion, index) => (
                      <ListItem
                        key={index}
                        onClick={() => selectSuggestion(suggestion)}
                        sx={{ cursor: 'pointer', bgcolor: 'white' }}
                      >
                        <ListItemText primary={suggestion.properties.formatted} />
                      </ListItem>
                    ))}
                  </List>
                </Card>
              )}
              {formData.latitude && formData.longitude && (
                <Typography sx={{ fontSize: 12, color: 'grey.600', mb: 3 }}>
                  Coordinates: {parseFloat(formData.latitude).toFixed(4)}, {parseFloat(formData.longitude).toFixed(4)}
                </Typography>
              )}
              <TextField
                fullWidth
                label="Full Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={4}
                sx={{ mb: 3 }}
                required
                error={!formData.description}
                helperText={!formData.description ? 'Enter a description' : ''}
              />
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={submitForm}
                disabled={isLoading}
                sx={{ py: 1.5, borderRadius: 12, textTransform: 'none', fontSize: '1rem' }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : spot._id ? 'UPDATE' : 'SUBMIT'}
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>
      <ToastContainer position="top-right" autoClose={3000} />
    </ThemeProvider>
  );
}

export default AddVacationSpotScreen;