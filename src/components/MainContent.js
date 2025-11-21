import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Search, Clear, SearchOff, ArrowForward, Google } from '@mui/icons-material';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import Header from './Header';
import TripCard from './TripCard';
import { TripModel } from '../models/TripModel';
import Footer from './footer';
import '../App.css';
import gif from '../asstes/traveller.gif';

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
};

const MainContent = (props) => {
  const { 
    isLoggedIn, 
    setIsLoggedIn, 
    handleNavClick, 
    toggleDrawer, 
    handleLogout, 
    isChatRoute 
  } = props;
  
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [formStatus, setFormStatus] = useState(null);
  const [trendingTrips, setTrendingTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [tourGuideDialogOpen, setTourGuideDialogOpen] = useState(false);

  const homeRef = useRef(null);
  const downloadRef = useRef(null);
  const contactRef = useRef(null);
  const tripsRef = useRef(null);

  const location = useLocation();

  useEffect(() => {
    const hash = location.hash;
    let ref;
    if (hash === '#home') ref = homeRef;
    else if (hash === '#download') ref = downloadRef;
    else if (hash === '#contact') ref = contactRef;
    else if (hash === '#trips') ref = tripsRef;

    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem('auth_token'));
    };
    window.addEventListener('storage', checkAuth);
    checkAuth();
    return () => window.removeEventListener('storage', checkAuth);
  }, [setIsLoggedIn]);

  useEffect(() => {
    const fetchTrendingTrips = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/trips/trending`);
        let trips;
        if (TripModel) {
          trips = response.data.map((json) => TripModel.fromJson(json));
        } else {
          console.warn('TripModel is undefined, using raw data');
          trips = response.data;
        }
        const validTrips = trips.filter(
          (trip) => trip.userid && typeof trip.userid === 'string' && trip.userid !== 'undefined'
        );
        if (validTrips.length < trips.length) {
          console.warn(`Filtered out ${trips.length - validTrips.length} trips with invalid userId`);
        }
        setTrendingTrips(validTrips);
        setFilteredTrips(validTrips);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching trending trips:', error);
        toast.error('Failed to load trips');
        setIsLoading(false);
      }
    };
    fetchTrendingTrips();
  }, []);

  useEffect(() => {
    setFilteredTrips(
      searchQuery
        ? trendingTrips.filter((trip) =>
            trip.tripName?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : trendingTrips
    );
  }, [searchQuery, trendingTrips]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${baseUrl}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setFormStatus('Message sent successfully!');
        setFormData({ name: '', email: '', message: '' });
        toast.success('Message sent successfully!');
      } else {
        setFormStatus('Failed to send message. Please try again.');
        toast.error('Failed to send message.');
      }
    } catch (error) {
      setFormStatus('Error: Could not connect to server.');
      toast.error('Error: Could not connect to server.');
    }
  };

  const handleTourGuideClick = (e) => {
    e.preventDefault();
    setTourGuideDialogOpen(true);
  };

  const getToken = () => localStorage.getItem('auth_token');

  const fetchCurrentUserId = async () => {
    try {
      const token = getToken();
      if (!token) {
        console.log('No auth token found');
        return null;
      }
      const response = await axios.get(`${baseUrl}/api/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200) {
        const userData = response.data;
        return userData._id || userData.id;
      } else {
        console.log(`Failed to fetch user profile: ${response.status}`);
        return null;
      }
    } catch (e) {
      console.error('Error fetching user ID:', e);
      return null;
    }
  };

  const getGuideProfile = async (userId, token) => {
    try {
      const response = await axios.get(`${baseUrl}/api/guide/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      if (response.status === 200) {
        return Guide.fromMap(response.data);
      } else if (response.status === 404) {
        return null;
      } else {
        throw new Error(`Failed to fetch guide profile: ${response.status}`);
      }
    } catch (e) {
      console.error('Error fetching guide profile:', e);
      throw e;
    }
  };

  const handleYouAreGuide = async () => {
    if (!isLoggedIn) {
      toast.error('Please log in to access the guide dashboard');
      navigate('/login');
      setTourGuideDialogOpen(false);
      return;
    }

    try {
      const token = getToken();
      const userId = await fetchCurrentUserId();
      if (!token || !userId) {
        toast.error('Please log in first');
        navigate('/login');
        setTourGuideDialogOpen(false);
        return;
      }
      const existingProfile = await getGuideProfile(userId, token);
      if (existingProfile) {
        // Guide profile exists, pass it to GuideDashboard
        navigate('/guide-dashboard', { state: { tabIndex: 0, guide: existingProfile } });
      } else {
        // No guide profile, navigate to Create Profile tab
        navigate('/guide-dashboard', { state: { tabIndex: 2 } });
      }
    } catch (e) {
      console.error('Error checking guide profile:', e);
      toast.error('Error checking guide profile');
      setTourGuideDialogOpen(false);
    }
  };

  // Update categories links for SEO
  const categories = [
    { 
      title: 'Find Travel Partner', 
      desc: 'Connect with like-minded travelers', 
      icon: '🌍',
      link: '/find-travel-partner'
    },
    { 
      title: 'Tour Guides', 
      desc: 'Access professional guides', 
      icon: '🧭', 
      isTourGuide: true 
    },
    { 
      title: 'Ecotourism', 
      desc: 'Explore sustainable options', 
      icon: '🌿',
      link: '/eco-tourism'
    },
    { 
      title: 'Volunteering Travel', 
      desc: 'Meaningful volunteer work', 
      icon: '🤝',
      link: 'https://play.google.com/store/apps/details?id=com.yoketrip_india.app'
    },
    { 
      title: 'Expenses Management', 
      desc: 'Track your expenses', 
      icon: '💸',
      link: 'https://play.google.com/store/apps/details?id=com.yoketrip_india.app'
    },
    { 
      title: 'Travel Shop', 
      desc: 'Shop travel essentials', 
      icon: '🛍️',
      link: 'https://play.google.com/store/apps/details?id=com.yoketrip_india.app'
    },
    { 
      title: 'Travel Blogs', 
      desc: 'Inspiring travel stories', 
      icon: '✍️',
      link: '/travel-blog'
    },
  ];

  return (
    <>
      <Header {...props} />
      <section className="hero" id="home" ref={homeRef}>
        <div className="hero-content text-center">
          <h1 className="hero-title">Find Your Perfect Travel Partner</h1>
          <p className="hero-subtitle">
            Travel solo, but never alone. Find the perfect companion for your journey.
          </p>
          <div className="mt-6 flex justify-center">
            <a
              href="https://play.google.com/store/apps/details?id=com.yoketrip_india.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors text-base sm:text-lg"
            >
              <Google className="text-xl mr-2" />
              Get it on Play Store
            </a>
          </div>
        </div>
      </section>
      <section className="trips-section" id="trips" ref={tripsRef}>
        <div className="container mx-auto py-12 px-4">
          <div className="flex items-center justify-center mb-6">
            <img src={gif} alt="Traveller" className="w-12 h-12 mr-2" />
            <h2 className="text-3xl font-semibold text-orange-500">Trending Trips</h2>
          </div>
          <div className="mb-6 max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search trips..."
                className="w-full p-2 pl-10 pr-10 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <Search />
              </span>
              {searchQuery && (
                <span
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={() => setSearchQuery('')}
                >
                  <Clear />
                </span>
              )}
            </div>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
            </div>
          ) : filteredTrips.length === 0 && searchQuery ? (
            <div className="text-center py-8">
              <SearchOff className="text-6xl text-gray-400" />
              <p className="mt-2 text-gray-600">No trips found for "{searchQuery}"</p>
              <button onClick={() => setSearchQuery('')} className="mt-2 text-blue-600 hover:underline">
                Clear search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrips.map((trip) => (
                <TripCard key={trip._id || trip.id} trip={trip} />
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Link
              to="/find-travel-partner"
              className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
            >
              View All Trips
              <ArrowForward className="ml-2" />
            </Link>
          </div>
        </div>
      </section>
      <section className="categories bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold text-center mb-8 text-gray-800">YokeTrip Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => {
              const cardContent = (
                <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow h-full flex flex-col justify-center cursor-pointer">
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className="text-xl font-medium mb-2">{category.title}</h3>
                  <p className="text-gray-600">{category.desc}</p>
                </div>
              );

              if (category.isTourGuide) {
                return (
                  <div key={index} onClick={handleTourGuideClick}>
                    {cardContent}
                  </div>
                );
              } else if (category.link.startsWith('http')) {
                return (
                  <a
                    href={category.link}
                    key={index}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {cardContent}
                  </a>
                );
              } else {
                return (
                  <Link to={category.link} key={index}>
                    {cardContent}
                  </Link>
                );
              }
            })}
          </div>
        </div>
      </section>
      <section className="why-choose py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold text-center mb-8 text-gray-800">Why Choose YokeTrip</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Perfect Travel Buddy', desc: 'Advanced matching', icon: '👥' },
              { title: '24/7 Support', desc: 'Always there for you', icon: '📞' },
              { title: 'Diverse Categories', desc: 'Explore more', icon: '🌈' },
              { title: 'Verified Partners', desc: 'Safe and trusted', icon: '✅' },
            ].map((feature, index) => (
              <a
                href="https://play.google.com/store/apps/details?id=com.yoketrip_india.app"
                key={index}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow h-full flex flex-col justify-center">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
      <section className="vision bg-gray-100 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-semibold mb-6 text-gray-800">Our Vision</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            At YokeTrip, we envision a world where travel feels safe with verified users, has an impact with eco-friendly options, and builds connections that last beyond the trip. <strong>"Transforming each trip into a Memorable Tale."</strong>
          </p>
        </div>
      </section>
      <section className="about py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-semibold mb-6 text-gray-800">About Us</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            YokeTrip is India's first travel ecosystem focused on building real connections. Founded in 2025, we make travel safer, affordable, and meaningful with KYC-verified users and encrypted transactions. Whether you seek companionship or purpose, YokeTrip is your partner.
          </p>
          <div className="mt-6">
            <Link 
              to="/about" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Learn More About Us
              <ArrowForward className="ml-2" />
            </Link>
          </div>
        </div>
      </section>
      <section className="contact bg-white py-12" id="contact" ref={contactRef}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-semibold mb-6 text-black">Contact Us</h2>
          <form className="max-w-lg mx-auto space-y-4" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              className="w-full p-3 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <input
              type="email"
              name="email"
              className="w-full p-3 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <textarea
              name="message"
              className="w-full p-3 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your Message"
              rows="4"
              value={formData.message}
              onChange={handleInputChange}
              required
            ></textarea>
            <button type="submit" className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
              Send Message
            </button>
            {formStatus && <p className="text-gray-600">{formStatus}</p>}
          </form>
        </div>
      </section>
      <Dialog
        open={tourGuideDialogOpen}
        onClose={() => setTourGuideDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle className="text-center">Tour Guides</DialogTitle>
        <DialogContent className="text-center">
          <p className="mb-4">Choose an option to proceed:</p>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            className="mb-2 rounded-full"
            onClick={() => {
              navigate('/find-guide');
              setTourGuideDialogOpen(false);
            }}
          >
            Search a Guide
          </Button>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            className="rounded-full"
            onClick={handleYouAreGuide}
          >
            You are a Guide
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTourGuideDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
      <ToastContainer position="top-right" autoClose={3000} />
      <Footer />
    </>
  );
};

export default MainContent;