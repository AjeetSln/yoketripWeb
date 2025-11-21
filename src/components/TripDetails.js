import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { toast } from 'react-toastify';
import { format, isValid, differenceInDays } from 'date-fns';
import profilePic from '../asstes/profilePic.png';
import Footer from './footer';
import Header from './Header';

const TripDetails = (props) => {
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
    const trip = location.state?.trip;
    const [isLiked, setIsLiked] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [locations, setLocations] = useState([]);
    const [subscriptionPlan, setSubscriptionPlan] = useState(null);
    const [showBookingDialog, setShowBookingDialog] = useState(false);
    const [selectedPeople, setSelectedPeople] = useState(null);
    const baseUrl = 'https://yoketrip.in';

    useEffect(() => {
        if (!trip) {
            toast.error('Invalid access to trip details. Please select a trip from the list.');
            navigate('/');
        }
    }, [trip, navigate]);

    const safeFormatDate = (dateString, formatString) => {
        const date = new Date(dateString);
        return isValid(date) ? format(date, formatString) : 'Invalid Date';
    };

    useEffect(() => {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });
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
                  const handleScroll = () => {
                      setScrolled(window.scrollY > 50);
                  };
                  window.addEventListener('scroll', handleScroll);
                  return () => window.removeEventListener('scroll', handleScroll);
              }, []);

    useEffect(() => {
        const incrementViews = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token || !trip) return;
            try {
                const response = await axios.put(
                    `${baseUrl}/api/trips/${trip.id || trip._id}/view`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (response.data.views !== undefined) {
                    console.log(`Views updated to ${response.data.views}`);
                }
            } catch (error) {
                console.error('Error incrementing views:', error);
            }
        };
        incrementViews();
    }, [trip]);

    useEffect(() => {
        const checkIfLiked = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token || !trip) return;
            try {
                const response = await axios.get(`${baseUrl}/api/trips/${trip.id || trip._id}/isLiked`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.data.success) {
                    setIsLiked(response.data.liked);
                    console.log(`Likes: ${response.data.likes || trip.likes}`);
                }
            } catch (error) {
                console.error('Error checking like status:', error);
            }
        };
        checkIfLiked();
    }, [trip]);

    useEffect(() => {
        const fetchUserSubscriptionPlan = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token || !trip?.userid) return;
            try {
                const response = await axios.get(`${baseUrl}/api/user/profile/${trip.userid}`, {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                });
                setSubscriptionPlan(response.data.subscription?.plan || 'Free');
            } catch (error) {
                console.error('Error fetching subscription:', error);
            }
        };
        fetchUserSubscriptionPlan();
    }, [trip]);

    useEffect(() => {
        if (trip?.images?.length > 1) {
            const timer = setInterval(() => {
                setCurrentImageIndex((prev) => (prev + 1) % trip.images.length);
            }, 4000);
            return () => clearInterval(timer);
        }
    }, [trip]);

    useEffect(() => {
        const fetchCoordinates = async () => {
            if (!trip || !trip.stops) return;
            const locationsToFetch = [
                trip.startlocation,
                ...trip.stops.map((stop) => stop.location || ''),
                trip.endlocation,
            ].filter(Boolean);
            const coords = [];
            for (const location of locationsToFetch) {
                const cached = await getCachedLocation(location);
                if (cached) {
                    coords.push(cached);
                } else {
                    const coord = await tryAllFreeAPIs(location);
                    await cacheLocation(location, coord);
                    coords.push(coord);
                }
            }
            setLocations(coords.filter((loc) => loc.lat !== 0 && loc.lng !== 0));
        };
        fetchCoordinates();
    }, [trip]);

    const tryAllFreeAPIs = async (location) => {
        const staticMap = {
            'Delhi': { lat: 28.6139, lng: 77.2090 },
            'Mumbai': { lat: 19.0760, lng: 72.8777 },
            'Jaipur': { lat: 26.915458, lng: 75.818982 },
            'Ahmedabad': { lat: 23.021537, lng: 72.580057 },
        };
        const simpleLocation = location.split(',')[0].trim();
        if (staticMap[simpleLocation]) return staticMap[simpleLocation];

        const apis = [
            async () => {
                const query = location.endsWith(', India') ? location : `${location}, India`;
                const response = await axios.get(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=in`
                );
                if (response.data.length > 0) {
                    return { lat: parseFloat(response.data[0].lat), lng: parseFloat(response.data[0].lon) };
                }
                return null;
            },
            async () => {
                const response = await axios.get(
                    `https://us1.locationiq.com/v1/search?q=${encodeURIComponent(location)}&format=json&limit=1&countrycodes=in`
                );
                if (response.data.length > 0) {
                    return { lat: parseFloat(response.data[0].lat), lng: parseFloat(response.data[0].lon) };
                }
                return null;
            },
            async () => {
                const response = await axios.get(
                    `https://photon.komoot.io/api/?q=${encodeURIComponent(location)}&limit=1`
                );
                if (response.data.features?.length > 0) {
                    return {
                        lat: response.data.features[0].geometry.coordinates[1],
                        lng: response.data.features[0].geometry.coordinates[0],
                    };
                }
                return null;
            },
        ];

        for (const api of apis) {
            try {
                const result = await Promise.race([api(), new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))]);
                if (result) return result;
            } catch (e) {
                console.error(`API failed for ${location}:`, e);
            }
        }
        return { lat: 20.5937, lng: 78.9629 };
    };

    const getCachedLocation = async (location) => {
        const cached = localStorage.getItem(`loc_${location}`);
        if (cached) {
            const [lat, lng] = cached.split(',').map(parseFloat);
            return { lat, lng };
        }
        return null;
    };

    const cacheLocation = async (location, coords) => {
        localStorage.setItem(`loc_${location}`, `${coords.lat},${coords.lng}`);
    };

    const toggleLikeTrip = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            toast.error('Please log in to like this trip');
            navigate('/login');
            return;
        }
        try {
            const response = await axios.put(
                `${baseUrl}/api/trips/${trip.id || trip._id}/like`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                setIsLiked(response.data.liked);
                toast.success(response.data.liked ? 'Liked this trip!' : 'Removed like');
            } else {
                toast.error('Failed to update like');
            }
        } catch (error) {
            toast.error(`Network error: ${error.message}`);
        }
    };

    const shareTrip = async () => {
        const tripUrl = `${baseUrl}/trips/${trip.id || trip._id}`;
        const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.yoketrip_india.app';
        const startDate = new Date(trip.startTime);
        const endDate = new Date(trip.endTime);
        const text = `
Check out this trip on YokeTrip!
📍 ${trip.tripName || 'Unnamed Trip'}
🗓 From ${isValid(startDate) ? format(startDate, 'dd MMM yyyy') : 'Invalid Date'} to ${isValid(endDate) ? format(endDate, 'dd MMM yyyy') : 'Invalid Date'}
💰 Budget: ₹${trip.budget || 'N/A'}
📲 Download the App: ${playStoreUrl}
    `;
        if (navigator.share) {
            try {
                await navigator.share({ title: trip.tripName || 'Unnamed Trip', text, url: tripUrl });
            } catch (error) {
                toast.error('Unable to share. Please try again later.');
            }
        } else {
            navigator.clipboard.writeText(text);
            toast.success('Trip details copied to clipboard!');
        }
    };

    const checkKYCStatus = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) return { status: 'not_submitted' };
        try {
            const response = await axios.get(`${baseUrl}/api/kyc/status`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            console.error('Error checking KYC:', error);
            return { status: 'not_submitted' };
        }
    };

    const getUserSubscriptionPlan = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) return 'Free';
        try {
            const response = await axios.get(`${baseUrl}/api/users/subscription`, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            return response.data.data?.plan || 'Free';
        } catch (error) {
            console.error('Error fetching subscription:', error);
            return 'Free';
        }
    };

    const handleBookTrip = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            toast.error('Please log in to book this trip');
            navigate('/login');
            return;
        }
        const kycResponse = await checkKYCStatus();
        const userPlan = await getUserSubscriptionPlan();

        if (kycResponse.status !== 'verified') {
            toast.error(
                kycResponse.status === 'not_submitted'
                    ? 'Please submit your KYC documents to book a trip.'
                    : kycResponse.status === 'pending'
                        ? 'Your KYC is under verification. Please wait for approval.'
                        : 'Your KYC was rejected. Please submit again with correct documents.'
            );
            if (kycResponse.status !== 'pending') {
                navigate('/kyc-verification');
            }
            return;
        }

        if (userPlan === 'Free') {
            toast.error('Please upgrade your subscription to book a trip.');
            navigate('/subscription');
            return;
        }

        const now = new Date();
        const startDate = new Date(trip.startTime);
        if (!isValid(startDate)) {
            toast.error('Invalid trip start date. Please contact support.');
            return;
        }
        if (now > startDate) {
            toast.error('This trip has already started. You cannot book a trip that has begun.');
            return;
        }

        setShowBookingDialog(true);
    };

    const handleSubmitBooking = async () => {
    if (!selectedPeople) {
      toast.error('Please select number of people');
      return;
    }
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Please log in to book this trip');
        navigate('/login');
        return;
      }
      const response = await axios.post(
        `${baseUrl}/api/trips/bookings`,
        {
          tripId: trip.id || trip._id,
          numPeople: selectedPeople,
          bookingDate: new Date().toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 201) {
        toast.success(response.data.message || 'Booking successful!');
        window.location.href = '/your-trips';
      } else {
        toast.error(response.data.message || 'Booking failed');
      }
    } catch (error) {
      toast.error(`Network error: ${error.message}`);
    }
    setShowBookingDialog(false);
    setSelectedPeople(null); // Reset selection after submission
  };

    const buildItineraryTimeline = () => {
        const endDate = new Date(trip.endTime);
        const startDate = new Date(trip.startTime);
        if (!isValid(startDate) || !isValid(endDate)) {
            return <div className="text-red-600">Invalid trip dates. Please contact support.</div>;
        }
        const totalDays = differenceInDays(endDate, startDate) + 1;
        const stopsByDay = {};

        const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        if (trip.stops && Array.isArray(trip.stops)) {
            trip.stops.forEach((stop) => {
                const stopDate = new Date(stop.date);
                if (!isValid(stopDate)) return;
                const stopDay = new Date(stopDate.getFullYear(), stopDate.getMonth(), stopDate.getDate());
                const dayNumber = differenceInDays(stopDay, startDay) + 1;
                stopsByDay[dayNumber] = stopsByDay[dayNumber] || [];
                stopsByDay[dayNumber].push(stop);
            });
        }

        return (
            <div className="border border-gray-200 rounded-lg p-4">
                {Array.from({ length: totalDays }, (_, i) => i + 1).map((dayNumber) => {
                    const date = new Date(startDate);
                    date.setDate(date.getDate() + (dayNumber - 1));
                    const isDeparture = dayNumber === 1;
                    const isArrival = dayNumber === totalDays;
                    const isTravelDay = !stopsByDay[dayNumber];
                    const location = isDeparture ? trip.startlocation : isArrival ? trip.endlocation : null;
                    const time = isDeparture || isArrival ? safeFormatDate(isDeparture ? trip.startTime : trip.endTime, 'HH:mm') : null;

                    return (
                        <div key={dayNumber} className="mb-4">
                            <div className="flex items-center">
                                <span className="font-bold">DAY {dayNumber}</span>
                                <span className="ml-2 text-gray-600">{safeFormatDate(date, 'dd MMM yyyy')}</span>
                            </div>
                            {(isDeparture || isArrival || isTravelDay) && (
                                <div className="mt-2">
                                    {time && location && (
                                        <div className="flex items-center">
                                            <span className="font-bold">{time}</span>
                                            <span className="ml-2">{location}</span>
                                        </div>
                                    )}
                                    <div className="flex items-start">
                                        <input type="checkbox" disabled className="mt-1" />
                                        <span className="ml-2">{isDeparture ? `Depart from ${location}` : isArrival ? `Arrive at ${location}` : 'Travel day'}</span>
                                    </div>
                                </div>
                            )}
                            {stopsByDay[dayNumber]?.map((stop, index) => (
                                <div key={index} className="mt-2">
                                    <div className="flex items-center">
                                        <span className="font-bold">{safeFormatDate(stop.date, 'dd/MM/yyyy')}</span>
                                        <span className="ml-2">{stop.location || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-start">
                                        <input type="checkbox" disabled className="mt-1" />
                                        <span className="ml-2">{stop.activity || `Visit ${stop.location || 'N/A'}`}</span>
                                    </div>
                                </div>
                            ))}
                            <hr className="my-2" />
                        </div>
                    );
                })}
            </div>
        );
    };

    if (!trip) {
        return null;
    }

    return (
        <>
        <Header
                         {...props}
                    />
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto p-4 sm:p-6 md:p-8">
                <div className="relative w-full max-w-screen-md h-70 sm:h-70 md:h-70 lg:h-70 xl:h-70 mx-auto rounded-lg shadow-lg overflow-hidden flex flex-col sm:flex-row gap-2">
                    {trip.images?.length > 0 ? (
                        <>
                         {/* Single image on mobile */}
                            <div className="relative w-full h-full sm:hidden">
                                <img
                                    src={trip.images[currentImageIndex] || trip.firstImage}
                                    alt={trip.tripName || 'Trip Image'}
                                    className="w-full h-full object-cover rounded-lg"
                                    loading="lazy"
                                    onError={(e) => (e.target.src = '/assets/placeholder.png')}
                                />
                                {trip.images.length > 1 && (
                                    <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                                        <button
                                            onClick={() => setCurrentImageIndex((prev) => (prev - 1 + trip.images.length) % trip.images.length)}
                                            className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-900 transition-colors"
                                        >
                                            &larr;
                                        </button>
                                        <button
                                            onClick={() => setCurrentImageIndex((prev) => (prev + 1) % trip.images.length)}
                                            className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-900 transition-colors"
                                        >
                                            &rarr;
                                        </button>
                                    </div>
                                )}
                                <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-lg">
                                    {trip.tripName || 'Unnamed Trip'}
                                </div>
                            </div>
                            {/* Two images on sm and larger screens */}
                            <div className="hidden sm:flex w-full h-full gap-2">
                                <div className="relative w-1/2 h-full">
                                    <img
                                        src={trip.images[currentImageIndex] || trip.firstImage}
                                        alt={trip.tripName || 'Trip Image'}
                                        className="w-full h-full object-cover rounded-lg"
                                        loading="lazy"
                                        onError={(e) => (e.target.src = '/assets/placeholder.png')}
                                    />
                                    <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-lg">
                                        {trip.tripName || 'Unnamed Trip'}
                                    </div>
                                </div>
                                {trip.images.length > 1 && (
                                    <div className="relative w-1/2 h-full">
                                        <img
                                            src={trip.images[(currentImageIndex + 1) % trip.images.length] || trip.firstImage}
                                            alt={trip.tripName || 'Trip Image'}
                                            className="w-full h-full object-cover rounded-lg"
                                            loading="lazy"
                                            onError={(e) => (e.target.src = '/assets/placeholder.png')}
                                        />
                                        <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-lg">
                                            {trip.tripName || 'Unnamed Trip'}
                                        </div>
                                    </div>
                                )}
                                {trip.images.length > 1 && (
                                    <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                                        <button
                                            onClick={() => setCurrentImageIndex((prev) => (prev - 1 + trip.images.length) % trip.images.length)}
                                            className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-900 transition-colors"
                                        >
                                            &larr;
                                        </button>
                                        <button
                                            onClick={() => setCurrentImageIndex((prev) => (prev + 1) % trip.images.length)}
                                            className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-900 transition-colors"
                                        >
                                            &rarr;
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-lg">
                            <span className="material-icons text-gray-500 text-4xl">image</span>
                        </div>
                    )}
                </div>
                <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center">
                        <span className="material-icons text-blue-600">visibility</span>
                        <span className="ml-1 text-blue-600">{trip.views || 0} views</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center cursor-pointer" onClick={toggleLikeTrip}>
                            <span className="material-icons text-red-600">{isLiked ? 'favorite' : 'favorite_border'}</span>
                            <span className="ml-1">{trip.likes || 0}</span>
                        </div>
                        <div className="flex items-center cursor-pointer" onClick={shareTrip}>
                            <span className="material-icons text-blue-600">share</span>
                            <span className="ml-1 text-blue-600">Share</span>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center gap-4 mt-4">
                    <button
                        onClick={handleBookTrip}
                        className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700"
                    >
                        Book Now
                    </button>
                    <button
                        onClick={async () => {
                            const token = localStorage.getItem('auth_token');
                            if (!token) {
                                toast.error('Please log in to message');
                                navigate('/login');
                                return;
                            }
                            const userPlan = await getUserSubscriptionPlan();
                            if (userPlan === 'Free') {
                                toast.error('Please upgrade your subscription to message.');
                                navigate('/subscription');
                                return;
                            }
                            navigate(`/userchat/${trip.userid}`, { state: { receiverId: trip.userid, receiverName: trip.full_name, receiverImage: trip.profilePic } });
                        }}
                        className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700"
                    >
                        Message
                    </button>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mt-4">{trip.tripName || 'Unnamed Trip'}</h1>
                <div className="flex items-center mt-2">
                    <span className="text-sm">Published: </span>
                    <div className="relative ml-2">
                        <img
                            src={trip.profilePic || profilePic}
                            alt="Profile"
                            className="w-12 h-12 rounded-full border-2 border-white cursor-pointer"
                            onClick={() => trip.userid && navigate(`/user-profile/${trip.userid}`)}
                        />
                        {subscriptionPlan && subscriptionPlan !== 'Free' && (
                            <div className="absolute bottom-0 right-0 bg-blue-600 rounded-full w-4 h-4 flex items-center justify-center">
                                <span className="material-icons text-white text-[10px]">verified</span>
                            </div>
                        )}
                    </div>
                    <div className="ml-2">
                        <p className="font-bold">{trip.full_name || 'Unknown User'}</p>
                        <p className="text-sm text-gray-600">{safeFormatDate(trip.createdAt, 'dd/MM/yyyy')}</p>
                    </div>
                </div>
                <div className="mt-2">
                    <p className="text-sm">From: {trip.startlocation || 'N/A'}</p>
                    <p className="text-sm">To: {trip.endlocation || 'N/A'}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 border border-gray-200 rounded-lg p-4">
                    <div>
                        <p className="text-sm text-gray-600">Start Trip</p>
                        <p className="font-bold">{safeFormatDate(trip.startTime, 'dd/MM/yyyy')}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">End Trip</p>
                        <p className="font-bold">{safeFormatDate(trip.endTime, 'dd/MM/yyyy')}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Budget</p>
                        <p className="font-bold">₹{trip.budget || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Traveller Type</p>
                        <p className="font-bold">{trip.travellerType || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Max Participants</p>
                        <p className="font-bold">{trip.totalPeople || 0} people</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="font-bold">{trip.duration || 'N/A'}</p>
                    </div>
                </div>
                <div className="mt-4 border border-gray-200 rounded-lg p-4">
                    <p className="font-bold">Description:</p>
                    <p className="text-sm">{trip.description || 'No description available'}</p>
                </div>
                <div className="mt-4 border border-gray-200 rounded-lg p-4">
                    <p className="font-bold">Activities:</p>
                    <p className="text-sm">{trip.activities || 'No activities listed'}</p>
                </div>
                <div className="mt-4 border border-gray-200 rounded-lg p-4">
                    <p className="font-bold">Includings:</p>
                    <p className="text-sm">{trip.inclusions?.join(', ') || 'No inclusions listed'}</p>
                </div>
                <div className="mt-4 border border-gray-200 rounded-lg p-4">
                    <p className="font-bold">Excludings:</p>
                    <p className="text-sm">{trip.exclusions?.join(', ') || 'No exclusions listed'}</p>
                </div>
                <div className="mt-4">
                    <h2 className="font-bold text-lg">Itinerary Timeline</h2>
                    {buildItineraryTimeline()}
                </div>
                <div className="mt-4">
                    <h2 className="font-bold text-lg">Trip Route Map</h2>
                    <div className="h-64 sm:h-80 md:h-96 border border-gray-200 rounded-lg overflow-hidden">
                        {locations.length > 0 ? (
                            <MapContainer
                                center={locations[0]}
                                zoom={locations.length > 1 ? 5 : 12}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                {locations.length > 1 && (
                                    <Polyline positions={locations} color="blue" weight={3.5} />
                                )}
                                {locations.map((loc, index) => (
                                    <Marker
                                        key={index}
                                        position={loc}
                                        icon={L.icon({
                                            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                                            iconSize: [25, 41],
                                            iconAnchor: [12, 41],
                                            popupAnchor: [1, -34],
                                            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                                            shadowSize: [41, 41],
                                        })}
                                    >
                                        <Popup>
                                            <span className="font-bold">{index + 1}</span>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p>No valid locations found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {showBookingDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold">Book This Trip</h2>
                            <button onClick={() => setShowBookingDialog(false)} className="text-red-600">
                                <span className="material-icons">close</span>
                            </button>
                        </div>
                        <p className="text-sm mt-2">
                            Trip starts on: {safeFormatDate(trip.startTime, 'dd MMM yyyy')}
                        </p>
                        <p className="text-sm">Available spots: {trip.totalPeople || 0}</p>
                        <select
                            value={selectedPeople || ''}
                            onChange={(e) => setSelectedPeople(parseInt(e.target.value))}
                            className="mt-4 w-full p-2 border rounded-lg"
                        >
                            <option value="" disabled>Select number of people</option>
                            {Array.from({ length: trip.totalPeople || 0 }, (_, i) => i + 1).map((num) => (
                                <option key={num} value={num}>{num}</option>
                            ))}
                        </select>
                        <div className="flex justify-end gap-4 mt-4">
                            <button
                                onClick={() => setShowBookingDialog(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitBooking}
                                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        <Footer/>
        </>
    );
};

export default TripDetails;