import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import TermsAndConditions from './TermsAndConditions';
import PrivacyPolicy from './PrivacyPolicy';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import OtpVerificationScreen from './components/OtpVerificationScreen';
import TripDetails from './components/TripDetails';
import TripCard from './components/TripCard';
import ProtectedRoute from './components/ProtectedRoute';
import UserProfileScreen from './components/UserProfile';
import CustomDrawer from './components/CustomDrawer';
import EditProfileScreen from './components/editProfileScreen';
import ProfileScreen from './components/ProfileScreen';
import CreateTripScreen from './components/CreateTripScreen';
import ExploreScreen from './components/Explore';
import FindTravelPartnerScreen from './components/FindTravelPartnerScreen';
import FindGuideScreen from './components/FindGuideScreen';
import TravelBlogScreen from './components/TravelBlogScreen';
import AboutUsScreen from './components/AboutUsScreen';
import KycVerificationScreen from './components/KycVerificationScreen';
import Wallet from './components/Wallet';
import TransactionHistoryScreen from './components/TransactionHistoryScreen';
import Subscription from './components/Subscription';
import YourTrips from './components/YourTrips';
import TripBookings from './components/TripBookings';
import ChatApp from './components/ChatApp';
import Settings from './components/Settings';
import Referral from './components/refferal';
import EditTrip from './components/edittrip';
import MainContent from './components/MainContent';
import GuideListingScreen from './components/GuideListingScreen';
import GuideDashboard from './components/GuideDashboardPage';
import GuideBookingRequest from './components/GuideBookingRequest';
import EcoTourismScreen from './components/EcoTourismScreen';
import VacationSpotDetailScreen from './components/VacationSpotDetailScreen';
import AddVacationSpotScreen from './components/AddVacation';
import MyServicesScreen from './components/myservices';
import VacationBookingDetail from './components/vacationBookingDetail';
import BlogScreen from './components/BlogScreen';
import BlogDetailScreen from './components/BlogDetailScreen';
import AllBlogsScreen from './components/AllBlogsScreen';
import ScrollToTop from './components/scrollTop';

// Popup components
const SubscriptionPopup = ({ onClose, onUpgrade }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-6 sm:p-8 relative max-w-md w-full shadow-2xl">
      <button onClick={onClose} className="absolute top-3 right-3 text-red-600 hover:text-red-800">
        <i className="material-icons">close</i>
      </button>
      <div className="text-center">
        <p className="text-4xl sm:text-5xl">🚀</p>
        <h3 className="font-bold text-lg sm:text-xl mt-3 text-gray-800">Unlock Your Full Travel Experience!</h3>
        <div className="text-left mt-4 text-sm sm:text-base text-gray-600">
          <p className="mb-2">• Unlimited travel partner bookings</p>
          <p className="mb-2">• Exclusive Volunteer Yatra & verified guides</p>
          <p className="mb-2">• Chat without limits – Go Premium now!</p>
        </div>
        <button
          onClick={onUpgrade}
          className="mt-5 bg-gradient-to-r from-orange-400 to-orange-600 text-white px-8 py-3 rounded-lg hover:from-orange-500 hover:to-orange-700 transition-all duration-300 shadow-md"
        >
          ✨ Upgrade Now
        </button>
      </div>
    </div>
  </div>
);

const PopupWrapper = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="flag-bg bg-white rounded-2xl p-6 sm:p-8 relative max-w-md w-full shadow-2xl overflow-hidden">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-red-600 hover:text-red-800 z-10"
      >
        <i className="material-icons">close</i>
      </button>
      <div className="text-center relative">
        <div className="fireworks"></div>
        {children}
      </div>
    </div>
  </div>
);

export const IndependenceDayPopup = ({ onClose }) => (
  <PopupWrapper onClose={onClose}>
    <p className="text-6xl mb-4 animate-flag-bounce">🇮🇳</p>
    <h3 className="font-bold text-2xl mt-3 text-orange-600 animate-text-fade">Happy Independence Day!</h3>
    <p className="mt-4 text-gray-600 text-lg">
      Celebrate freedom with YokeTrip. Let's make every journey memorable!
    </p>
    <div className="mt-4 text-sm text-gray-500">15th August - Swatantrata Diwas</div>
  </PopupWrapper>
);

export const GandhiJayantiPopup = ({ onClose }) => (
  <PopupWrapper onClose={onClose}>
    <p className="text-6xl mb-4 animate-flag-bounce">🇮🇳</p>
    <h3 className="font-bold text-2xl mt-3 text-orange-600 animate-text-fade">Happy Gandhi Jayanti!</h3>
    <p className="mt-4 text-gray-600 text-lg">
      Celebrate the father of the nation with YokeTrip. Let's make every journey peaceful and memorable!
    </p>
    <div className="mt-4 text-sm text-gray-500">2nd October - Gandhi Jayanti</div>
  </PopupWrapper>
);

export const RepublicDayPopup = ({ onClose }) => (
  <PopupWrapper onClose={onClose}>
    <p className="text-6xl mb-4 animate-flag-bounce">🇮🇳</p>
    <h3 className="font-bold text-2xl mt-3 text-orange-600 animate-text-fade">Happy Republic Day!</h3>
    <p className="mt-4 text-gray-600 text-lg">
      Celebrate India's sovereignty with YokeTrip. Let's embark on journeys of unity!
    </p>
    <div className="mt-4 text-sm text-gray-500">26th January - Republic Day</div>
  </PopupWrapper>
);

const KYCProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const baseUrl = 'https://yoketrip.in';

  useEffect(() => {
    const checkKYC = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Please log in to continue.');
        navigate('/login');
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${baseUrl}/api/kyc/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { status } = response.data || {};
        const validStatuses = ['pending', 'verified', 'rejected'];
        const finalStatus = validStatuses.includes(status) ? status : 'not_submitted';
        if (finalStatus === 'verified') {
          setLoading(false);
        } else {
          if (finalStatus === 'pending') {
            toast.error('Your KYC is under verification. Please wait for approval.');
            navigate('/');
          } else if (finalStatus === 'rejected') {
            toast.error('Your KYC was rejected. Please submit again with correct documents.');
            navigate('/kyc-verification');
          } else {
            navigate('/kyc-verification');
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error checking KYC:', error);
        toast.error('Failed to check KYC status. Please try again.');
        navigate('/');
        setLoading(false);
      }
    };
    checkKYC();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return children;
};

const SubscriptionProtectedRoute = ({ children, setShowSubscriptionPopup }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const baseUrl = 'https://yoketrip.in';

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          toast.error('Please log in to continue.');
          navigate('/login');
          setLoading(false);
          return;
        }
        const response = await fetch(`${baseUrl}/api/users/subscription`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        const plan = response.ok ? data.data?.plan || 'Free' : 'Free';
        if (plan === 'Free') {
          setShowSubscriptionPopup(true);
          navigate('/');
          setLoading(false);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
        toast.error('Failed to check subscription status. Please try again.');
        navigate('/');
        setLoading(false);
      }
    };
    checkSubscription();
  }, [navigate, setShowSubscriptionPopup]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return children;
};

async function getLocationName(latitude, longitude) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
      { headers: { 'User-Agent': 'ReactApp' } }
    );
    const data = await response.json();
    const subLocality = data.address.village || data.address.suburb || data.address.neighbourhood || data.address.locality || 'Unknown';
    const city = data.address.city || data.address.town || data.address.village || data.address.state_district || 'Unknown';
    return { subLocality, city };
  } catch (e) {
    console.error('Error fetching location name:', e);
    return { subLocality: 'Unknown', city: 'Unknown' };
  }
}

async function updateLocationToBackend(latitude, longitude, baseUrl) {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    console.warn('No auth token found');
    return false;
  }
  try {
    const response = await axios.put(`${baseUrl}/api/user/currentlocation`, {
      latitude,
      longitude,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.status === 200;
  } catch (e) {
    console.error('Error updating location to backend:', e);
    return false;
  }
}

function AppContent() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('auth_token'));
  const [postLogout, setPostLogout] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);
  const [showIndependencePopup, setShowIndependencePopup] = useState(false);
  const [showGandhiPopup, setShowGandhiPopup] = useState(false);
  const [showRepublicPopup, setShowRepublicPopup] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const baseUrl = 'https://yoketrip.in';

  const isChatRoute = location.pathname.startsWith('/userchat');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('auth_token', token);
      setIsLoggedIn(true);
      navigate(location.pathname, { replace: true });
      toast.success('Logged in successfully as user!');
      window.location.reload();
    }
  }, [location.search, location.pathname, navigate]);

  const checkKYCStatus = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return { status: 'not_submitted' };
    try {
      const response = await axios.get(`${baseUrl}/api/kyc/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { status } = response.data || {};
      const validStatuses = ['pending', 'verified', 'rejected'];
      return { status: validStatuses.includes(status) ? status : 'not_submitted' };
    } catch (error) {
      console.error('Error checking KYC:', error);
      return { status: 'not_submitted' };
    }
  };

  const getUserSubscriptionPlan = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.warn('No auth token found');
        return 'Free';
      }
      const response = await fetch(`${baseUrl}/api/users/subscription`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      return response.ok ? data.data?.plan || 'Free' : 'Free';
    } catch (e) {
      console.error('Error fetching user subscription:', e);
      return 'Free';
    }
  };

  const handleNavClick = async (path) => {
    if (postLogout) {
      setPostLogout(false);
      navigate(path);
    } else if (path === '/userchat' && isLoggedIn) {
      const userPlan = await getUserSubscriptionPlan();
      if (userPlan === 'Free') {
        setShowSubscriptionPopup(true);
      } else {
        setMenuOpen(false);
        navigate(path);
      }
    } else if (path === '/create-trip' && isLoggedIn) {
      const kycResponse = await checkKYCStatus();
      const { status } = kycResponse;
      if (status !== 'verified') {
        toast.error(
          status === 'pending'
            ? 'Your KYC is under verification. Please wait for approval.'
            : 'Your KYC was rejected. Please submit again with correct documents.'
        );
        if (status === 'rejected') {
          navigate('/kyc-verification');
        } else {
          navigate('/kyc-verification');
        }
      } else {
        setMenuOpen(false);
        navigate(path);
      }
    } else {
      setMenuOpen(false);
      navigate(path);
    }
  };

  const handleLogout = () => {
    setDrawerOpen(false);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    setIsLoggedIn(false);
    setPostLogout(true);
    toast.success('Logged out successfully!');
    navigate('/');
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [drawerOpen]);

  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = !!localStorage.getItem('auth_token');
      setIsLoggedIn(loggedIn);
      if (!loggedIn) {
        setPostLogout(true);
      }
    };
    window.addEventListener('storage', checkAuth);
    checkAuth();
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  useEffect(() => {
    const today = new Date();
    const month = today.getMonth();
    const date = today.getDate();
    if (month === 7 && date === 15) {
      setShowIndependencePopup(true);
    } else if (month === 9 && date === 2) {
      setShowGandhiPopup(true);
    } else if (month === 0 && date === 26) {
      setShowRepublicPopup(true);
    }
  }, []);

  useEffect(() => {
    let watchId;
    if (isLoggedIn && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const success = await updateLocationToBackend(latitude, longitude, baseUrl);
          if (success) {
            await getLocationName(latitude, longitude);
          } else {
            toast.error('Failed to update initial location');
          }
        },
        (error) => {
          console.error('Error getting initial location:', error);
          if (error.code === error.PERMISSION_DENIED) {
            toast.error('Location permission denied. Please enable in browser settings.');
          } else {
            toast.error('Failed to get location');
          }
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );

      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const success = await updateLocationToBackend(latitude, longitude, baseUrl);
          if (!success) {
            console.warn('Failed to update real-time location');
          }
        },
        (error) => {
          console.error('Error watching location:', error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
      );
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isLoggedIn]);

  const handleClick = async () => {
    const kycResponse = await checkKYCStatus();
    const { status } = kycResponse;

    if (status !== 'verified') {
      toast.error(
        status === 'not_submitted'
          ? 'Please submit your KYC documents to create a trip.'
          : status === 'pending'
            ? 'Your KYC is under verification. Please wait for approval.'
            : 'Your KYC was rejected. Please submit again with correct documents.'
      );

      if (status === 'not_submitted' || status === 'rejected') {
        navigate('/kyc-verification');
      } else {
        navigate('/');
      }
    } else {
      setShowOptions(true);
    }
  };

  // Common props for all components
  const commonProps = {
    isLoggedIn,
    setIsLoggedIn,
    handleNavClick,
    toggleDrawer,
    handleLogout,
    isChatRoute
  };

  return (
    <div className={`App ${drawerOpen ? 'drawer-open' : ''}`}>
      <ScrollToTop />
      {showSubscriptionPopup && (
        <SubscriptionPopup
          onClose={() => setShowSubscriptionPopup(false)}
          onUpgrade={() => {
            setShowSubscriptionPopup(false);
            navigate('/subscription');
          }}
        />
      )}
      {showIndependencePopup && (
        <IndependenceDayPopup onClose={() => setShowIndependencePopup(false)} />
      )}
      {showGandhiPopup && <GandhiJayantiPopup onClose={() => setShowGandhiPopup(false)} />}
      {showRepublicPopup && <RepublicDayPopup onClose={() => setShowRepublicPopup(false)} />}
      
      <CustomDrawer
        isOpen={drawerOpen}
        onClose={toggleDrawer}
        userId={localStorage.getItem('user_id')}
      />
      
      {isLoggedIn && !isChatRoute && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={handleClick}
            className="bg-orange-500 text-white p-4 rounded-full shadow-lg hover:bg-orange-600 transition-all duration-300 transform hover:scale-110"
            title="Create Your Trip"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>

          {showOptions && (
            <div className="absolute bottom-16 right-0 bg-white shadow-lg rounded-lg p-3 w-48">
              <p
                onClick={() => {
                  navigate('/create-trip');
                  setShowOptions(false);
                }}
                className="cursor-pointer p-2 rounded hover:bg-gray-100"
              >
                Create Trip
              </p>
              <p
                onClick={() => {
                  navigate('/add-vacation-spot');
                  setShowOptions(false);
                }}
                className="cursor-pointer p-2 rounded hover:bg-gray-100"
              >
                Eco Trip
              </p>
              <p
                onClick={() => {
                  navigate('/volunteer-yatra');
                  setShowOptions(false);
                }}
                className="cursor-pointer p-2 rounded hover:bg-gray-100"
              >
                Volunteer Yatra
              </p>
            </div>
          )}
        </div>
      )}
      
      <div className={`main-content ${drawerOpen ? 'hidden md:block' : 'block'}`}>
        <Routes>
          {/* PUBLIC ROUTES - Index करने के लिए */}
          <Route path="/" element={<MainContent {...commonProps} />} />
          <Route path="/login" element={<LoginScreen {...commonProps} />} />
          <Route path="/register" element={<RegisterScreen {...commonProps} />} />
          <Route path="/find-travel-partner" element={<FindTravelPartnerScreen {...commonProps} />} />
          <Route path="/find-guide" element={<FindGuideScreen {...commonProps} />} />
          <Route path="/travel-blog" element={<TravelBlogScreen {...commonProps} />} />
          <Route path="/about" element={<AboutUsScreen {...commonProps} />} />
          
          {/* EXISTING PUBLIC ROUTES */}
          <Route path="/all-blogs" element={<AllBlogsScreen {...commonProps} />} />
          <Route path="/otp-verification" element={<OtpVerificationScreen {...commonProps} />} />
          <Route path="/explore" element={<ExploreScreen {...commonProps} />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions {...commonProps} />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy {...commonProps} />} />
          <Route path="/eco-tourism" element={ <ProtectedRoute><EcoTourismScreen {...commonProps} /></ProtectedRoute>} />
          <Route path="/guides" element={<GuideListingScreen {...commonProps} />} />
          <Route path="/settings" element={<Settings {...commonProps} />} />
          
          {/* BLOG ROUTES */}
          <Route path="/blog/:id/:title?" element={<BlogDetailScreen {...commonProps} />} />
          
          {/* PROTECTED ROUTES */}
          <Route
            path="/trip/:id"
            element={
              <ProtectedRoute>
                <TripDetails {...commonProps} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/blog"
            element={
              <ProtectedRoute>
                <BlogScreen {...commonProps} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:userId"
            element={
              <ProtectedRoute>
                <ProfileScreen {...commonProps} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-profile/:userId"
            element={
              <ProtectedRoute>
                <UserProfileScreen {...commonProps} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vacation-spot-detail"
            element={
              <ProtectedRoute>
                <VacationSpotDetailScreen {...commonProps} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-vacation-spot"
            element={
              <ProtectedRoute>
                <AddVacationSpotScreen {...commonProps} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-services"
            element={
              <ProtectedRoute>
                <MyServicesScreen {...commonProps} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vacation-booking-detail/:spotId"
            element={
              <ProtectedRoute>
                <VacationBookingDetail {...commonProps} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-profile/:userId"
            element={
              <ProtectedRoute>
                <EditProfileScreen {...commonProps} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-trip"
            element={
              <ProtectedRoute>
                <KYCProtectedRoute>
                  <CreateTripScreen {...commonProps} />
                </KYCProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/your-trips"
            element={
              <ProtectedRoute>
                <YourTrips {...commonProps} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-trip/:tripId"
            element={
              <ProtectedRoute>
                <KYCProtectedRoute>
                  <EditTrip {...commonProps} />
                </KYCProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/trip-bookings/:tripId/:tripName"
            element={
              <ProtectedRoute>
                <KYCProtectedRoute>
                  <SubscriptionProtectedRoute setShowSubscriptionPopup={setShowSubscriptionPopup}>
                    <TripBookings {...commonProps} />
                  </SubscriptionProtectedRoute>
                </KYCProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/userchat"
            element={
              <ProtectedRoute>
                <SubscriptionProtectedRoute setShowSubscriptionPopup={setShowSubscriptionPopup}>
                  <ChatApp {...commonProps} />
                </SubscriptionProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/userchat/:receiverId"
            element={
              <ProtectedRoute>
                <SubscriptionProtectedRoute setShowSubscriptionPopup={setShowSubscriptionPopup}>
                  <ChatApp {...commonProps} />
                </SubscriptionProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/referral"
            element={
              <ProtectedRoute>
                <Referral {...commonProps} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/kyc-verification"
            element={
              <ProtectedRoute>
                <KycVerificationScreen 
                  onCloseDrawer={() => setDrawerOpen(false)}
                  {...commonProps} 
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wallet"
            element={
              <ProtectedRoute>
                <Wallet 
                  onCloseDrawer={() => setDrawerOpen(false)}
                  {...commonProps} 
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transaction-history"
            element={
              <ProtectedRoute>
                <TransactionHistoryScreen 
                  onCloseDrawer={() => setDrawerOpen(false)}
                  {...commonProps} 
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscription"
            element={
              <ProtectedRoute>
                <Subscription 
                  onCloseDrawer={() => setDrawerOpen(false)}
                  {...commonProps} 
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/guide-dashboard"
            element={
              <ProtectedRoute>
                <GuideDashboard
                  guide={location.state?.guide || null}
                  {...commonProps}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/guide-booking-requests"
            element={
              <ProtectedRoute>
                <GuideBookingRequest
                  guide={location.state?.guide || null}
                  {...commonProps}
                />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;