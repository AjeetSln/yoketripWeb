'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    Tabs,
    Tab,
    Box,
    Card,
    CardContent,
    Avatar,
    Button,
    IconButton,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    FormControlLabel,
    CircularProgress,
    Grid,
    Chip,
    Menu,
    Rating,
    Fade,
} from '@mui/material';
import { LocationOn, CurrencyRupee, Visibility, VisibilityOff, Delete, Edit, MoreVert, Refresh } from '@mui/icons-material';
import AsyncSelect from 'react-select/async';
import { getDistance } from 'geolib';
import Header from './Header'; // Assuming Header is in the same directory or adjust the import path

const baseUrl = 'https://yoketrip.in';

const Guide = {
    fromMap: (map) => ({
        id: map._id?.toString() || '',
        userId: map.userId?._id?.toString() || map.userId || '',
        fullName: map.userId?.full_name || map.fullName || 'Unknown',
        profilePic: map.userId?.profilePic || map.profilePic || null,
        workLocation: map.workLocation || '',
        price: map.price || 0,
        priceType: map.priceType || 'per day',
        languages: map.languages || [],
        availability: map.availability || Array(7).fill(false),
        about: map.about || '',
        isCertified: map.isCertified || false,
        certificateUrl: map.certificateUrl || null,
        rating: map.rating || 0,
        reviewCount: map.reviewCount || 0,
        createdAt: new Date(map.createdAt) || new Date(),
        approval: map.approval || 'pending',
        hide: map.hide || false,
    }),
    toMap: (guide) => ({
        _id: guide.id,
        userId: guide.userId,
        fullName: guide.fullName,
        profilePic: guide.profilePic,
        workLocation: guide.workLocation,
        price: guide.price,
        priceType: guide.priceType,
        languages: guide.languages,
        availability: guide.availability,
        about: guide.about,
        isCertified: guide.isCertified,
        certificateUrl: guide.certificateUrl,
        rating: guide.rating,
        reviewCount: guide.reviewCount,
        createdAt: guide.createdAt.toISOString(),
        approval: guide.approval,
        hide: guide.hide,
    }),
};

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} {...other}>
            {value === index && (
                <Fade in={value === index} timeout={300}>
                    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>{children}</Box>
                </Fade>
            )}
        </div>
    );
}

function GuideDashboard({ props, guide: initialGuide }) {
    const { 
    isLoggedIn, 
    setIsLoggedIn, 
    handleNavClick, 
    toggleDrawer, 
    handleLogout, 
    isChatRoute 
  } = props;
    const navigate = useNavigate();
    const location = useLocation();
    const [guide, setGuide] = useState(initialGuide || null);
    const [tabIndex, setTabIndex] = useState(() => {
        const initialTab = location.state?.tabIndex || 0;
        return initialTab;
    });
    const [isLoading, setIsLoading] = useState(true);
    const [bookings, setBookings] = useState({ upcoming: [], completed: [] });
    const [menuOpen, setMenuOpen] = useState(false); // Added for Header component
    const [formData, setFormData] = useState({
        workLocation: initialGuide?.workLocation || '',
        price: initialGuide?.price?.toString() || '',
        priceType: initialGuide?.priceType || 'per day',
        languages: initialGuide?.languages || [],
        availability: initialGuide?.availability || Array(7).fill(false),
        about: initialGuide?.about || '',
        isCertified: initialGuide?.isCertified || false,
        certificateFile: null,
    });
    const [locationInput, setLocationInput] = useState(initialGuide?.workLocation || '');
    const [anchorEl, setAnchorEl] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const formRef = useRef(null);

    const languageOptions = [
        'Hindi', 'English', 'Bengali', 'Marathi', 'Telugu', 'Tamil', 'Gujarati', 'Urdu',
        'Kannada', 'Odia', 'Punjabi', 'Malayalam', 'Assamese', 'Maithili', 'Sanskrit',
        'Konkani', 'Manipuri', 'Dogri', 'Sindhi', 'Bodo', 'Santhali', 'Kashmiri', 'Nepali',
        'Tulu', 'Rajasthani',
    ];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const showCreateProfileTab = !guide || (guide.approval !== 'approved' && guide.approval !== 'pending');
    const showEditProfileTab = guide?.approval === 'approved';

    useEffect(() => {
        const checkAuth = () => setIsLoggedIn(!!localStorage.getItem('auth_token'));
        window.addEventListener('storage', checkAuth);
        fetchGuideData();
        fetchBookings();
        return () => window.removeEventListener('storage', checkAuth);
    }, [setIsLoggedIn]);

    useEffect(() => {
        if (tabIndex === 3 && !showCreateProfileTab) {
            setTabIndex(0);
        } else if (tabIndex === 2 && !showEditProfileTab) {
            setTabIndex(0);
        }
    }, [guide, tabIndex]);

    const getToken = () => localStorage.getItem('auth_token');

    const getLocationSuggestions = async (input) => {
        if (!input) return [];
        try {
            const response = await axios.get(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(input)}&format=json&addressdetails=1&limit=5`,
                { headers: { 'User-Agent': 'YokTripApp/1.0' } }
            );
            return response.data.map((item) => ({
                value: item.display_name,
                label: item.display_name,
                coords: { latitude: parseFloat(item.lat), longitude: parseFloat(item.lon) },
            }));
        } catch (e) {
            console.error('Error getting location suggestions:', e);
            return [];
        }
    };

    const geocodeLocation = async (location) => {
        try {
            const response = await axios.get(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`,
                { headers: { 'User-Agent': 'YokTripApp/1.0' } }
            );
            if (response.data.length > 0) {
                return {
                    latitude: parseFloat(response.data[0].lat),
                    longitude: parseFloat(response.data[0].lon),
                };
            }
            return null;
        } catch (e) {
            console.error('Error geocoding location:', e);
            return null;
        }
    };

    const fetchGuideData = async () => {
        if (!guide?.userId) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const token = getToken();
            if (!token) {
                toast.error('Authentication token not found');
                navigate('/login');
                return;
            }
            const response = await axios.get(`${baseUrl}/api/guide/${guide.userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.status === 200) {
                const guideData = Guide.fromMap(response.data.guide || response.data);
                setGuide(guideData);
                setFormData({
                    workLocation: guideData.workLocation,
                    price: guideData.price.toString(),
                    priceType: guideData.priceType,
                    languages: guideData.languages,
                    availability: guideData.availability,
                    about: guideData.about,
                    isCertified: guideData.isCertified,
                    certificateFile: null,
                });
                setLocationInput(guideData.workLocation);
            } else {
                toast.error('Failed to fetch guide data');
            }
        } catch (e) {
            console.error('Error fetching guide data:', e);
            toast.error(`Error: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchBookings = async () => {
        try {
            const token = getToken();
            if (!token) return;
            const response = await axios.get(`${baseUrl}/api/traveller/guide/my-bookings`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.status === 200) {
                setBookings({
                    upcoming: response.data.upcoming || [],
                    completed: response.data.completed || [],
                });
            }
        } catch (e) {
            console.error('Error fetching bookings:', e);
            toast.error(`Error: ${e.message}`);
        }
    };

    const handleDelete = async () => {
        try {
            const token = getToken();
            if (!token) return;
            const response = await axios.delete(`${baseUrl}/api/guide/${guide.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.status === 200) {
                toast.success('Profile deleted successfully');
                navigate('/dashboard');
            } else {
                throw new Error('Failed to delete profile');
            }
        } catch (e) {
            console.error('Error deleting profile:', e);
            toast.error(`Error: ${e.message}`);
        }
        setAnchorEl(null);
    };

    const handleHide = async () => {
        try {
            const token = getToken();
            if (!token) return;
            const response = await axios.patch(
                `${baseUrl}/api/guide/${guide.id}/hide`,
                { hide: !guide.hide },
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );
            if (response.status === 200) {
                setGuide({ ...guide, hide: !guide.hide });
                toast.success(guide.hide ? 'Profile unhidden' : 'Profile hidden');
            }
        } catch (e) {
            console.error('Error toggling profile visibility:', e);
            toast.error(`Error: ${e.message}`);
        }
        setAnchorEl(null);
    };

    const handleSubmit = async (mode) => {
        if (!formRef.current.checkValidity()) {
            toast.error('Please fill all required fields');
            return;
        }
        if (formData.isCertified && !formData.certificateFile && !guide?.certificateUrl) {
            toast.error('Please upload a certificate');
            return;
        }
        setIsSubmitting(true);
        try {
            const token = getToken();
            if (!token) {
                toast.error('Authentication token not found');
                navigate('/login');
                return;
            }
            const form = new FormData();
            form.append('workLocation', formData.workLocation);
            form.append('price', formData.price);
            form.append('priceType', formData.priceType);
            form.append('about', formData.about);
            form.append('isCertified', formData.isCertified.toString());
            formData.languages.forEach((lang, index) => {
                form.append(`languages[${index}]`, lang);
            });
            formData.availability.forEach((avail, index) => {
                form.append(`availability[${index}]`, avail.toString());
            });
            if (formData.certificateFile) {
                form.append('certificate', formData.certificateFile);
            }

            let response;
            if (mode === 'create') {
                response = await axios.post(`${baseUrl}/api/guide/create`, form, {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
                });
            } else {
                response = await axios.put(`${baseUrl}/api/guide/${guide.id}`, form, {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
                });
            }

            if (response.status === 201 || response.status === 200) {
                const newGuide = Guide.fromMap(response.data.guide || response.data);
                setGuide(newGuide);
                setTabIndex(0);
                toast.success(mode === 'create' ? 'Profile created successfully' : 'Profile updated successfully');
            } else {
                throw new Error(response.data || (mode === 'create' ? 'Failed to create profile' : 'Failed to update profile'));
            }
        } catch (e) {
            console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} profile:`, e);
            toast.error(`Failed to update profile: ${e.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        try {
            const token = getToken();
            if (!token) return;
            const response = await axios.post(
                `${baseUrl}/api/traveller/cancel-booking/${bookingId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.status === 200) {
                toast.success('Booking cancelled successfully');
                fetchBookings();
            }
        } catch (e) {
            console.error('Error cancelling booking:', e);
            toast.error(`Error: ${e.message}`);
        }
    };

    const buildDashboardTab = () => {
        if (!guide || guide.approval !== 'approved') {
            return (
                <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 text-center">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">
                        Your profile is {guide?.approval || 'not created'}
                    </h2>
                    <p className="text-gray-600 mt-2 text-sm sm:text-base">
                        {guide ? 'Waiting for approval' : 'Create a guide profile to get started'}
                    </p>
                    <button
                        onClick={fetchGuideData}
                        className="mt-4 bg-orange-500 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-lg hover:bg-orange-600 transition-all duration-300 flex items-center justify-center mx-auto text-sm sm:text-base"
                    >
                        <Refresh className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> Refresh Status
                    </button>
                </div>
            );
        }

        return (
            <div className="space-y-4 max-h-[calc(100vh-180px)] sm:max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-center sm:space-x-4">
                        <div className="relative">
                            <Avatar
                                src={guide.profilePic || '/assets/profilePic.png'}
                                className="w-28 h-28 sm:w-32 sm:h-32 md:w-34 md:h-34"
                            />

                            <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1">
                                {guide.hide ? (
                                    <VisibilityOff className="text-white text-xs sm:text-sm" />
                                ) : (
                                    <Visibility className="text-white text-xs sm:text-sm" />
                                )}
                            </div>
                        </div>
                        <div className="mt-2 sm:mt-0 text-center sm:text-left">
                            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">{guide.fullName}</h2>
                            <p className="text-gray-600 text-sm sm:text-base">Professional Guide</p>
                            <div className="flex items-center justify-center sm:justify-start mt-1">
                                <Rating value={guide.rating} readOnly size="small" />
                                <span className="text-gray-600 ml-2 text-sm sm:text-base">({guide.reviewCount} reviews)</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                    <h2 className="text-base sm:text-lg md:text-lg font-semibold text-gray-800">Basic Information</h2>
                    <div className="mt-4 space-y-2">
                        <div className="flex items-center">
                            <LocationOn className="text-orange-500 mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                            <p className="text-gray-600 text-sm sm:text-base">{guide.workLocation}</p>
                        </div>
                        <div className="flex items-center">
                            <CurrencyRupee className="text-orange-500 mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                            <p className="text-gray-600 text-sm sm:text-base">{guide.price} {guide.priceType}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {guide.languages.map((lang) => (
                                <Chip
                                    key={lang}
                                    label={lang}
                                    size="small"
                                    className="bg-orange-100 text-orange-800 text-xs sm:text-sm"
                                />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                    <h2 className="text-base sm:text-lg md:text-lg font-semibold text-gray-800">Availability</h2>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mt-4">
                        {days.map((day, index) => (
                            <div
                                key={day}
                                className={`p-2 text-center rounded-lg border ${guide.availability[index] ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'
                                    }`}
                            >
                                <p className="text-xs sm:text-sm font-medium text-gray-800">{day}</p>
                                <p className="text-xs sm:text-sm">{guide.availability[index] ? '✓' : '✗'}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                    <h2 className="text-base sm:text-lg md:text-lg font-semibold text-gray-800">About Me</h2>
                    <p className="mt-2 text-gray-600 text-sm sm:text-base">{guide.about}</p>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                    <h2 className="text-base sm:text-lg md:text-lg font-semibold text-gray-800">Certification</h2>
                    {guide.isCertified ? (
                        <div>
                            <p className="text-gray-600 text-sm sm:text-base">Certified Guide</p>
                            {guide.certificateUrl && (
                                <img
                                    src={guide.certificateUrl}
                                    alt="Certificate"
                                    className="mt-2 rounded-lg max-w-full h-auto sm:max-w-md"
                                />
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-600 text-sm sm:text-base">Not Certified</p>
                    )}
                </div>
            </div>
        );
    };

    const buildBookingsTab = () => {
        if (isLoading) {
            return (
                <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 text-center">
                    <CircularProgress size={24} />
                </div>
            );
        }
        if (bookings.upcoming.length === 0 && bookings.completed.length === 0) {
            return (
                <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 text-center">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">No Bookings Yet</h2>
                    <p className="text-gray-600 mt-2 text-sm sm:text-base">Book a trip to see your reservations here</p>
                </div>
            );
        }
        return (
            <div className="space-y-4 max-h-[calc(100vh-180px)] sm:max-h-[calc(100vh-200px)] overflow-y-auto">
                {bookings.upcoming.length > 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                        <h2 className="text-base sm:text-lg md:text-lg font-semibold text-gray-800">Upcoming Bookings</h2>
                        {bookings.upcoming.map((booking) => (
                            <BookingCard key={booking._id} booking={booking} onCancel={handleCancelBooking} />
                        ))}
                    </div>
                )}
                {bookings.completed.length > 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                        <h2 className="text-base sm:text-lg md:text-lg font-semibold text-gray-800">Completed Bookings</h2>
                        {bookings.completed.map((booking) => (
                            <BookingCard key={booking._id} booking={booking} onCancel={handleCancelBooking} />
                        ))}
                    </div>
                )}
                <button
                    onClick={() => navigate('/guide-booking-requests')}
                    className="w-full bg-orange-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-orange-600 transition-all duration-300 text-sm sm:text-base"
                >
                    See All Requests
                </button>
            </div>
        );
    };

    const buildProfileFormTab = (mode) => (
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 max-w-full sm:max-w-2xl mx-auto">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-4">
                {mode === 'create' ? 'Become a Travel Guide' : 'Edit Your Profile'}
            </h2>
            <form className="space-y-4" ref={formRef}>
                <AsyncSelect
                    cacheOptions
                    defaultOptions
                    loadOptions={getLocationSuggestions}
                    value={locationInput ? { value: locationInput, label: locationInput } : null}
                    onChange={async (option) => {
                        const location = option ? option.value : '';
                        setLocationInput(location);
                        setFormData({ ...formData, workLocation: location });
                        if (option && option.coords) {
                            const coords = await geocodeLocation(location);
                            if (coords) {
                                if (coords.latitude >= 6.7 && coords.latitude <= 37.6 && coords.longitude >= 68.7 && coords.longitude <= 97.25) {
                                    setFormData({ ...formData, workLocation: location });
                                } else {
                                    toast.error('Please select a location within India');
                                }
                            }
                        }
                    }}
                    placeholder="Work Location"
                    styles={{
                        control: (base) => ({
                            ...base,
                            fontFamily: 'Roboto',
                            borderRadius: '8px',
                            padding: '2px',
                            fontSize: '0.875rem',
                            '@media (min-width: 640px)': { padding: '4px', fontSize: '1rem' },
                        }),
                    }}
                    required
                />
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                    <TextField
                        fullWidth
                        label="Price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                        error={!formData.price}
                        helperText={!formData.price ? 'Price is required' : ''}
                        size="small"
                        InputProps={{ style: { fontSize: '0.875rem', padding: '4px' } }}
                        InputLabelProps={{ style: { fontSize: '0.875rem' } }}
                        sx={{ '@media (min-width: 640px)': { fontSize: '1rem' } }}
                    />
                    <FormControl fullWidth size="small">
                        <InputLabel sx={{ fontSize: '0.875rem', '@media (min-width: 640px)': { fontSize: '1rem' } }}>
                            Price Type
                        </InputLabel>
                        <Select
                            value={formData.priceType}
                            onChange={(e) => setFormData({ ...formData, priceType: e.target.value })}
                            required
                            sx={{ fontSize: '0.875rem', '@media (min-width: 640px)': { fontSize: '1rem' } }}
                        >
                            <MenuItem value="per day" sx={{ fontSize: '0.875rem', '@media (min-width: 640px)': { fontSize: '1rem' } }}>
                                Per Day
                            </MenuItem>
                            <MenuItem value="per hour" sx={{ fontSize: '0.875rem', '@media (min-width: 640px)': { fontSize: '1rem' } }}>
                                Per Hour
                            </MenuItem>
                        </Select>
                    </FormControl>
                </div>
                <div>
                    <h3 className="text-sm sm:text-base md:text-base font-semibold text-gray-800">Languages</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {languageOptions.map((lang) => (
                            <Chip
                                key={lang}
                                label={lang}
                                color={formData.languages.includes(lang) ? 'primary' : 'default'}
                                onClick={() =>
                                    setFormData({
                                        ...formData,
                                        languages: formData.languages.includes(lang)
                                            ? formData.languages.filter((l) => l !== lang)
                                            : [...formData.languages, lang],
                                    })
                                }
                                className="bg-orange-100 text-orange-800 text-xs sm:text-sm"
                            />
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="text-sm sm:text-base md:text-base font-semibold text-gray-800">Availability</h3>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                        {days.map((day, index) => (
                            <FormControlLabel
                                key={day}
                                control={
                                    <Checkbox
                                        checked={formData.availability[index]}
                                        onChange={() => {
                                            const newAvailability = [...formData.availability];
                                            newAvailability[index] = !newAvailability[index];
                                            setFormData({ ...formData, availability: newAvailability });
                                        }}
                                        size="small"
                                    />
                                }
                                label={<span className="text-xs sm:text-sm">{day}</span>}
                            />
                        ))}
                    </div>
                </div>
                <TextField
                    fullWidth
                    label="About You"
                    multiline
                    rows={4}
                    value={formData.about}
                    onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                    required
                    error={!formData.about}
                    helperText={!formData.about ? 'About is required' : ''}
                    size="small"
                    InputProps={{ style: { fontSize: '0.875rem', padding: '4px' } }}
                    InputLabelProps={{ style: { fontSize: '0.875rem' } }}
                    sx={{ '@media (min-width: 640px)': { fontSize: '1rem' } }}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={formData.isCertified}
                            onChange={(e) => setFormData({ ...formData, isCertified: e.target.checked })}
                            size="small"
                        />
                    }
                    label={<span className="text-xs sm:text-sm">I have a certification</span>}
                />
                {formData.isCertified && (
                    <div>
                        {guide?.certificateUrl && mode === 'edit' && (
                            <div className="mb-4">
                                <p className="text-xs sm:text-sm text-gray-600">Current Certificate:</p>
                                <img
                                    src={guide.certificateUrl}
                                    alt="Current Certificate"
                                    className="mt-2 rounded-lg max-w-full h-auto sm:max-w-xs"
                                />
                            </div>
                        )}
                        <Button
                            variant="outlined"
                            component="label"
                            className="border-orange-500 text-orange-500 hover:bg-orange-100 text-xs sm:text-sm"
                            size="small"
                        >
                            {formData.certificateFile ? 'Certificate Selected' : 'Upload New Certificate'}
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={(e) => setFormData({ ...formData, certificateFile: e.target.files[0] })}
                            />
                        </Button>
                    </div>
                )}
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                    <button
                        onClick={() => handleSubmit(mode)}
                        disabled={isSubmitting}
                        className="flex-1 bg-orange-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-orange-600 transition-all duration-300 disabled:opacity-50 text-sm sm:text-base"
                    >
                        {isSubmitting ? (
                            <CircularProgress size={20} className="text-white" />
                        ) : mode === 'create' ? (
                            'Submit Profile'
                        ) : (
                            'Update Profile'
                        )}
                    </button>
                    {mode === 'edit' && (
                        <button
                            onClick={() => setTabIndex(0)}
                            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-gray-300 transition-all duration-300 text-sm sm:text-base"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );

    const BookingCard = ({ booking, onCancel }) => {
        const bookingDate = new Date(booking.travellerDate);
        const formattedDate = bookingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const formattedTime = bookingDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

        return (
            <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="col-span-1 sm:col-span-2">
                        <p className="text-xs sm:text-sm font-semibold text-gray-800">Booking ID: #{booking._id.slice(0, 8)}</p>
                        <div className="flex items-center mt-2">
                            <Avatar
                                src={booking.traveller?.profilePic || '/assets/profilePic.png'}
                                className="w-8 h-8 sm:w-10 sm:h-10"
                            />
                            <p className="ml-2 text-gray-600 text-xs sm:text-sm">
                                {booking.traveller?.full_name || 'Unknown Traveller'}
                            </p>
                        </div>
                        <p className="mt-2 text-gray-600 text-xs sm:text-sm">Date: {formattedDate}</p>
                        <p className="text-gray-600 text-xs sm:text-sm">Time: {formattedTime}</p>
                        <p className="text-gray-600 text-xs sm:text-sm">Price: {booking.price} {booking.priceType}</p>
                    </div>
                    <div className="text-right">
                        <Chip
                            label={booking.status.toUpperCase()}
                            className={`text-xs sm:text-sm ${booking.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : booking.status === 'accepted'
                                        ? 'bg-green-100 text-green-800'
                                        : booking.status === 'completed'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                }`}
                        />
                        {booking.status === 'pending' && (
                            <button
                                onClick={() => onCancel(booking._id)}
                                className="mt-2 bg-red-500 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-lg hover:bg-red-600 transition-all duration-300 text-xs sm:text-sm"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Header
                 {...props}
            />
            <div className="pt-16 sm:pt-20 max-w-full sm:max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-lg p-2 sm:p-4 mb-4">
                    <Tabs
                        value={tabIndex}
                        onChange={(e, newValue) => setTabIndex(newValue)}
                        centered
                        variant="scrollable"
                        scrollButtons="auto"
                        allowScrollButtonsMobile
                        className="bg-orange-100"
                        TabIndicatorProps={{ style: { backgroundColor: '#f97316' } }}
                    >
                        <Tab label="Dashboard" className="text-orange-600 font-semibold text-xs sm:text-sm md:text-base" />
                        <Tab label="Bookings" className="text-orange-600 font-semibold text-xs sm:text-sm md:text-base" />
                        {showEditProfileTab && (
                            <Tab label="Edit Profile" className="text-orange-600 font-semibold text-xs sm:text-sm md:text-base" />
                        )}
                        {showCreateProfileTab && (
                            <Tab label="Create Profile" className="text-orange-600 font-semibold text-xs sm:text-sm md:text-base" />
                        )}
                    </Tabs>
                    {guide?.approval === 'approved' && (
                        <div className="absolute top-16 sm:top-20 right-2 sm:right-4">
                            <IconButton
                                onClick={(e) => setAnchorEl(e.currentTarget)}
                                className="text-orange-600"
                                size="small"
                            >
                                <MoreVert className="w-5 h-5 sm:w-6 sm:h-6" />
                            </IconButton>
                        </div>
                    )}
                </div>
                <div className="py-2 sm:py-4">
                    <TabPanel value={tabIndex} index={0}>
                        {isLoading ? (
                            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 text-center">
                                <CircularProgress size={24} />
                            </div>
                        ) : (
                            buildDashboardTab()
                        )}
                    </TabPanel>
                    <TabPanel value={tabIndex} index={1}>
                        {buildBookingsTab()}
                    </TabPanel>
                    {showEditProfileTab && (
                        <TabPanel value={tabIndex} index={2}>
                            {buildProfileFormTab('edit')}
                        </TabPanel>
                    )}
                    {showCreateProfileTab && (
                        <TabPanel value={tabIndex} index={3}>
                            {buildProfileFormTab('create')}
                        </TabPanel>
                    )}
                </div>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                    PaperProps={{
                        className: 'shadow-lg rounded-lg',
                    }}
                >
                    <MenuItem
                        onClick={() => {
                            if (showEditProfileTab) {
                                setTabIndex(2);
                            }
                            setAnchorEl(null);
                        }}
                        className="flex items-center text-gray-800 hover:bg-orange-100 text-xs sm:text-sm"
                    >
                        <Edit className="mr-2 text-orange-500 w-4 h-4 sm:w-5 sm:h-5" /> Edit Profile
                    </MenuItem>
                    <MenuItem
                        onClick={handleHide}
                        className="flex items-center text-gray-800 hover:bg-orange-100 text-xs sm:text-sm"
                    >
                        {guide?.hide ? (
                            <Visibility className="mr-2 text-orange-500 w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                            <VisibilityOff className="mr-2 text-orange-500 w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                        {guide?.hide ? 'Unhide Profile' : 'Hide Profile'}
                    </MenuItem>
                    <MenuItem
                        onClick={handleDelete}
                        className="flex items-center text-red-600 hover:bg-orange-100 text-xs sm:text-sm"
                    >
                        <Delete className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> Delete Profile
                    </MenuItem>
                </Menu>
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    className="mt-16 sm:mt-20"
                    toastClassName="text-xs sm:text-sm"
                />
            </div>
        </div>
    );
}

export default GuideDashboard;