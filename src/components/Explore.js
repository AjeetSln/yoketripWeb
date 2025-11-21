import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import TripCard from './TripCard';
import { TripModel } from '../models/TripModel';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';
import Header from './Header';
import Footer from './footer';

// Bind modal to app element for accessibility
Modal.setAppElement('#root');

const ExploreScreen = (props) => {
  const { 
    isLoggedIn, 
    setIsLoggedIn, 
    handleNavClick, 
    toggleDrawer, 
    handleLogout, 
    isChatRoute 
  } = props;
  
  const baseUrl = 'https://yoketrip.in';
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [whereTo, setWhereTo] = useState('');
  const [selectedTravellerType, setSelectedTravellerType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [peopleRange, setPeopleRange] = useState([1, 20]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  const tripCategories = [
    'Adventure Tour',
    'Devotional Tours',
    'Cultural Tourism',
    'Bike Ride',
    'Agriculture Tourism',
    'Car Camping',
    'Coastal Beach Tourism',
    'EcoTourism',
    'Food Tourism',
    'Jungle Safari',
    'Historical Tourism',
  ].map((c) => ({ value: c, label: c }));

  const travellerTypes = ['Solo', 'Couple', 'Group'].map((t) => ({ value: t, label: t }));

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${baseUrl}/api/trips/gettrips`);
      if (response.status === 200) {
        const data = response.data;
        const now = new Date();
        const activeTrips = data.filter((trip) => {
          try {
            const endDate = new Date(trip.start?.dateTime || trip.startDate);
            return endDate > now;
          } catch (e) {
            return true;
          }
        });
        const mappedTrips = activeTrips.map((trip) => TripModel.fromJson(trip));
        setTrips(mappedTrips);
        setFilteredTrips(mappedTrips);
      } else {
        toast.error('Failed to load trips. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast.error('An error occurred. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchTrips();
    setIsRefreshing(false);
  };

  const applyFilters = () => {
    const filtered = trips.filter((trip) => {
      const categoryMatch = !selectedCategory || trip.category === selectedCategory;
      const travellerTypeMatch = !selectedTravellerType || trip.travellerType === selectedTravellerType;
      const priceMatch = trip.budget >= priceRange[0] && trip.budget <= priceRange[1];
      const peopleMatch = trip.totalPeople >= peopleRange[0] && trip.totalPeople <= peopleRange[1];
      const locationMatch = !whereTo || 
        (trip.endLocation && trip.endLocation.toLowerCase().includes(whereTo.toLowerCase().trim()));
      return categoryMatch && travellerTypeMatch && priceMatch && peopleMatch && locationMatch;
    });
    setFilteredTrips(filtered);
  };

  const handleFilterChange = (field, value) => {
    if (field === 'category') setSelectedCategory(value);
    if (field === 'travellerType') setSelectedTravellerType(value);
    if (field === 'priceRange') setPriceRange(value);
    if (field === 'peopleRange') setPeopleRange(value);
    applyFilters();
  };

  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedTravellerType('');
    setPriceRange([0, 100000]);
    setPeopleRange([1, 20]);
    setWhereTo('');
    setFilteredTrips(trips);
    setShowFilterModal(false);
  };

  const fetchCurrentUserId = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('No auth token found');
        return null;
      }
      const response = await axios.get(`${baseUrl}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (response.status === 200) {
        const userData = response.data;
        return userData._id || userData.id;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user ID:', error);
      return null;
    }
  };

  return (
    <>
      <Header {...props} />
      <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8 font-poppins pt-16 pb-20">
        <div className="container mx-auto max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-blue-600 mb-4">
              Find Your Travel Partner
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect with verified travel companions for your next adventure. Find like-minded travelers and create unforgettable memories together.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={whereTo}
                  onChange={(e) => {
                    setWhereTo(e.target.value);
                    applyFilters();
                  }}
                  placeholder="Where To?"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
              </div>
              <div className="flex-1">
                <select
                  value={selectedTravellerType}
                  onChange={(e) => {
                    handleFilterChange('travellerType', e.target.value);
                  }}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                >
                  <option value="">Select Traveller Type</option>
                  {travellerTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    handleFilterChange('category', e.target.value);
                  }}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                >
                  <option value="">Select Category</option>
                  {tripCategories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={applyFilters}
                className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors text-sm sm:text-base"
              >
                Find Now
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-semibold text-orange-500">Available Travel Partners</h2>
            <button
              onClick={() => setShowFilterModal(true)}
              className="flex items-center bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors text-sm sm:text-base"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v3.586a1 1 0 01-.293.707l-2 2a1 1 0 01-1.414 0l-2-2a1 1 0 01-.293-.707v-3.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filters
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
              <p className="ml-3 text-gray-600">Loading travel partners...</p>
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="text-center py-8">
              <svg
                className="w-16 h-16 mx-auto text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
              <p className="mt-2 text-gray-600">No travel partners available</p>
              <button
                onClick={refreshData}
                className="mt-2 text-blue-600 hover:underline text-sm sm:text-base"
              >
                Refresh
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrips.map((trip) => (
                <div key={trip._id || trip.id} className="relative">
                  <TripCard trip={trip} />
                </div>
              ))}
            </div>
          )}

          {isRefreshing && (
            <div className="flex justify-center items-center mt-6">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
            </div>
          )}

          <Modal
            isOpen={showFilterModal}
            onRequestClose={() => setShowFilterModal(false)}
            className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full mx-auto my-8"
            overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          >
            <h2 className="text-xl font-semibold text-blue-700 mb-4">Filter Travel Partners</h2>
            <div className="space-y-4">
              <select
                value={selectedCategory}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              >
                <option value="">Select Category</option>
                {tripCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price Range (₹)</label>
                <input
                  type="range"
                  min="0"
                  max="100000"
                  step="1000"
                  value={priceRange[1]}
                  onChange={(e) => handleFilterChange('priceRange', [priceRange[0], Number(e.target.value)])}
                  className="w-full"
                />
                <div className="flex justify-between text-sm">
                  <span>₹{priceRange[0]}</span>
                  <span>₹{priceRange[1]}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Number of People</label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={peopleRange[1]}
                  onChange={(e) => handleFilterChange('peopleRange', [peopleRange[0], Number(e.target.value)])}
                  className="w-full"
                />
                <div className="flex justify-between text-sm">
                  <span>{peopleRange[0]}</span>
                  <span>{peopleRange[1]}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 text-sm sm:text-base"
              >
                Reset
              </button>
              <button
                onClick={() => {
                  applyFilters();
                  setShowFilterModal(false);
                }}
                className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 text-sm sm:text-base"
              >
                Apply
              </button>
            </div>
          </Modal>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ExploreScreen;