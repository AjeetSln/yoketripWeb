import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormHelperText,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import Header from './Header'; // Adjust path if needed
import Footer from './footer'; // Adjust path if needed

const baseUrl = 'https://yoketrip.in';

function EditProfileScreen( props) {
  const { 
    isLoggedIn, 
    setIsLoggedIn, 
    handleNavClick, 
    toggleDrawer, 
    handleLogout, 
    isChatRoute 
  } = props;
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    dob: '',
    about: '',
    gender: '',
    country: '',
    socialLinks: { facebook: '', instagram: '', youtube: '', twitter: '' },
    interests: [],
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const interestOptions = ['Travel', 'Photography', 'Food', 'Sports', 'Music', 'Art', 'Technology', 'Fashion'];
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const cropperRef = useRef(null);

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem('auth_token'));
    };
    window.addEventListener('storage', checkAuth);
    checkAuth();
    return () => window.removeEventListener('storage', checkAuth);
  }, [setIsLoggedIn]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          toast.error('Please log in to continue', { theme: 'colored' });
          navigate('/login');
          return;
        }
        if (!userId) throw new Error('User ID is undefined');
        const response = await axios.get(`${baseUrl}/api/user/ourveiw/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 200) {
          setUserData(response.data);
          setFormData({
            full_name: response.data.full_name || '',
            phone: response.data.phone || '',
            dob: response.data.dob || '',
            about: response.data.about || '',
            gender: response.data.gender || '',
            country: response.data.country || '',
            socialLinks: response.data.socialLinks || {
              facebook: '',
              instagram: '',
              youtube: '',
              twitter: '',
            },
            interests: response.data.interests || [],
          });
        } else {
          throw new Error('Failed to load profile');
        }
      } catch (error) {
        console.error('Fetch Profile Error:', error.response || error.message);
        if (error.response?.status === 404) {
          toast.error('User profile not found', { theme: 'colored' });
          navigate('/not-found');
        } else if (error.response?.status === 401) {
          toast.error('Session expired. Please log in again.', { theme: 'colored' });
          navigate('/login');
        } else {
          toast.error(`Error: ${error.response?.data?.message || error.message}`, { theme: 'colored' });
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserProfile();
  }, [userId, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('socialLinks')) {
      const key = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [key]: value },
      }));
      setErrors((prev) => ({ ...prev, [`socialLinks.${key}`]: '' }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleInterestToggle = (interest) => {
    setFormData((prev) => {
      const interests = prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests };
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image must be less than 10MB', { theme: 'colored' });
        return;
      }
      setProfileImage(URL.createObjectURL(file));
      setCroppedImage(file); // Set initial file to allow cropping
    } else {
      toast.error('No image selected', { theme: 'colored' });
    }
  };

  const handleCrop = () => {
    if (cropperRef.current) {
      const cropper = cropperRef.current.cropper;
      cropper.getCroppedCanvas({ width: 200, height: 200 }).toBlob(
        (blob) => {
          setCroppedImage(blob);
        },
        'image/jpeg',
        0.8
      );
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (formData.phone && !/^\+?[1-9]\d{1,14}$/.test(formData.phone)) {
      newErrors.phone = 'Enter a valid phone number';
    }
    if (formData.dob) {
      const parts = formData.dob.split('-');
      if (parts.length !== 3 || !/^\d{4}-\d{2}-\d{2}$/.test(formData.dob)) {
        newErrors.dob = 'Invalid date format (YYYY-MM-DD)';
      } else {
        const [year, month, day] = parts.map(Number);
        const currentYear = new Date().getFullYear();
        if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > currentYear) {
          newErrors.dob = 'Enter a valid date';
        }
      }
    }
    if (formData.about && formData.about.length > 500) {
      newErrors.about = 'About me cannot exceed 500 characters';
    }
    ['facebook', 'instagram', 'youtube', 'twitter'].forEach((key) => {
      const url = formData.socialLinks[key];
      if (url && !/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/.test(url)) {
        newErrors[`socialLinks.${key}`] = 'Enter a valid URL';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatDateToDDMMYYYY = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleUpdateProfile = async () => {
    if (!validateForm()) return;
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Please log in to continue', { theme: 'colored' });
        navigate('/login');
        return;
      }
      const form = new FormData();
      form.append('full_name', formData.full_name);
      form.append('phone', formData.phone);
      form.append('dob', formatDateToDDMMYYYY(formData.dob));
      form.append('about', formData.about);
      if (formData.gender) form.append('gender', formData.gender);
      if (formData.country) form.append('country', formData.country);
      form.append('interests', formData.interests.join(','));
      Object.keys(formData.socialLinks).forEach((key) => {
        form.append(`socialLinks[${key}]`, formData.socialLinks[key]);
      });
      if (croppedImage) {
        form.append('profilePic', croppedImage, 'profile.jpg');
      } else if (userData.profilePic) {
        form.append('profilePic', userData.profilePic);
      }
      console.log('FormData Entries:');
      for (let [key, value] of form.entries()) {
        console.log(`${key}: ${value instanceof File ? value.name : value}`);
      }
      const response = await axios.put(`${baseUrl}/api/user/update`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      console.log('Update Response:', response);
      if (response.status === 200) {
        toast.success('Profile updated successfully!', { theme: 'colored' });
        navigate(-1);
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update Profile Error:', error.response || error.message);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.', { theme: 'colored' });
        navigate('/login');
      } else {
        toast.error(`Error: ${error.response?.data?.message || error.message}`, { theme: 'colored' });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header
          {...props}
        />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress />
        </Box>
      </>
    );
  }

  return (
    <>
      <Header
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        scrolled={scrolled}
        isLoggedIn={isLoggedIn}
        handleNavClick={handleNavClick}
        toggleDrawer={toggleDrawer}
        handleLogout={handleLogout}
        isChatRoute={isChatRoute}
      />
      <Box sx={{ pt: 16, pb: 16, bgcolor: 'background.default', minHeight: '100vh' }}>
        <Container maxWidth="sm">
          <Box mt={4} mb={4}>
            <Typography variant="h4" align="center" gutterBottom>
              Edit Profile
            </Typography>
            <Box display="flex" justifyContent="center" mb={2}>
              <Box position="relative">
                <Avatar
                  src={
                    profileImage ||
                    (userData.profilePic && userData.profilePic.startsWith('http')
                      ? userData.profilePic
                      : '/assets/profilePic.png')
                  }
                  sx={{ width: 100, height: 100 }}
                />
                <IconButton
                  sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: 'orange', color: 'white' }}
                  component="label"
                >
                  <PhotoCamera />
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageChange}
                    ref={fileInputRef}
                  />
                </IconButton>
              </Box>
            </Box>
            {profileImage && (
              <Box mb={2}>
                <Cropper
                  src={profileImage}
                  style={{ height: 300, width: '100%' }}
                  initialAspectRatio={1}
                  aspectRatio={1}
                  guides={true}
                  viewMode={1}
                  autoCropArea={1}
                  cropBoxResizable={true}
                  dragMode="move"
                  crop={handleCrop}
                  ref={cropperRef}
                />
                <Button
                  variant="contained"
                  sx={{ mt: 1, bgcolor: 'orange', '&:hover': { bgcolor: 'orange.dark' } }}
                  onClick={handleCrop}
                >
                  Crop Image
                </Button>
              </Box>
            )}
            <TextField
              fullWidth
              label="Full Name"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              error={!!errors.full_name}
              helperText={errors.full_name}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              error={!!errors.phone}
              helperText={errors.phone}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Gender</InputLabel>
              <Select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Date of Birth"
              name="dob"
              value={formData.dob}
              onChange={handleInputChange}
              error={!!errors.dob}
              helperText={errors.dob || 'Format: YYYY-MM-DD'}
              margin="normal"
              type="date"
            />
            <TextField
              fullWidth
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="About Me"
              name="about"
              value={formData.about}
              onChange={handleInputChange}
              error={!!errors.about}
              helperText={errors.about}
              multiline
              rows={3}
              margin="normal"
            />
            <Box my={2}>
              <Typography variant="h6">Interests</Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {interestOptions.map((interest) => (
                  <Chip
                    key={interest}
                    label={interest}
                    color={formData.interests.includes(interest) ? 'primary' : 'default'}
                    onClick={() => handleInterestToggle(interest)}
                    sx={{
                      bgcolor: formData.interests.includes(interest) ? 'orange' : undefined,
                      color: formData.interests.includes(interest) ? 'white' : undefined,
                    }}
                  />
                ))}
              </Box>
            </Box>
            <Typography variant="h6">Social Links</Typography>
            <TextField
              fullWidth
              label="Facebook"
              name="socialLinks.facebook"
              value={formData.socialLinks.facebook}
              onChange={handleInputChange}
              error={!!errors['socialLinks.facebook']}
              helperText={errors['socialLinks.facebook']}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Instagram"
              name="socialLinks.instagram"
              value={formData.socialLinks.instagram}
              onChange={handleInputChange}
              error={!!errors['socialLinks.instagram']}
              helperText={errors['socialLinks.instagram']}
              margin="normal"
            />
            <TextField
              fullWidth
              label="YouTube"
              name="socialLinks.youtube"
              value={formData.socialLinks.youtube}
              onChange={handleInputChange}
              error={!!errors['socialLinks.youtube']}
              helperText={errors['socialLinks.youtube']}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Twitter"
              name="socialLinks.twitter"
              value={formData.socialLinks.twitter}
              onChange={handleInputChange}
              error={!!errors['socialLinks.twitter']}
              helperText={errors['socialLinks.twitter']}
              margin="normal"
            />
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 2, bgcolor: 'orange', '&:hover': { bgcolor: 'orange.dark' } }}
              onClick={handleUpdateProfile}
              disabled={isUpdating}
            >
              {isUpdating ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          </Box>
        </Container>
      </Box>
      <Footer />
    </>
  );
}

export default EditProfileScreen;