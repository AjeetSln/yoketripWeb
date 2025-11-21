import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Header from './Header'; // Adjust path if needed

const baseUrl = 'https://yoketrip.in';

const EditTrip = ( props) => {
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
  const tripId = trip?.id;

  const [tripName, setTripName] = useState(trip?.tripName || '');
  const [budget, setBudget] = useState(trip?.budget ? trip.budget.toString() : '');
  const [description, setDescription] = useState(trip?.description || '');
  const [totalPeople, setTotalPeople] = useState(trip?.totalPeople ? trip.totalPeople.toString() : '');
  const [category, setCategory] = useState(trip?.category || '');
  const [travellerType, setTravellerType] = useState(trip?.travellerType || '');
  const [startDate, setStartDate] = useState(
    trip?.start?.dateTime ? new Date(trip.start.dateTime) : new Date()
  );
  const [endDate, setEndDate] = useState(
    trip?.end?.dateTime ? new Date(trip.end.dateTime) : new Date(Date.now() + 86400000)
  );
  const [startLocation, setStartLocation] = useState(trip?.start?.location || '');
  const [endLocation, setEndLocation] = useState(trip?.end?.location || '');
  const [existingImages, setExistingImages] = useState(trip?.images || []);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const categoryOptions = [
    'Adventure Tour', 'Devotional Tours', 'Cultural Tourism', 'Bike Ride',
    'Agriculture Tourism', 'Car Camping', 'Coastal Beach Tourism', 'EcoTourism',
    'Food Tourism', 'Jungle Safari', 'Historical Tourism'
  ];

  const travellerTypeOptions = ['Solo', 'Couple', 'Group'];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  useEffect(() => {
                const checkAuth = () => {
                    setIsLoggedIn(!!localStorage.getItem('auth_token'));
                };
                window.addEventListener('storage', checkAuth);
                checkAuth();
                return () => window.removeEventListener('storage', checkAuth);
            }, [setIsLoggedIn]);

  if (!trip || !tripId) {
    return (
      <>
        <Header
           {...props}
        />
        <div className="text-center py-8 pt-16">
          <p className="text-gray-600">Trip data not found</p>
          <button
            onClick={() => navigate('/your-trips')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Your Trips
          </button>
        </div>
      </>
    );
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setNewImages(prev => [...prev, ...files]);
    setNewImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeExistingImage = (index) => {
    const removed = existingImages[index];
    setRemovedImages(prev => [...prev, removed]);
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!tripName.trim()) return 'Trip name is required';
    if (!budget || isNaN(parseFloat(budget)) || parseFloat(budget) <= 0) return 'Valid budget is required';
    if (!description.trim()) return 'Description is required';
    if (!totalPeople || isNaN(parseInt(totalPeople)) || parseInt(totalPeople) <= 0) return 'Valid total people is required';
    if (!category) return 'Category is required';
    if (!travellerType) return 'Traveller type is required';
    if (!startLocation.trim()) return 'Start location is required';
    if (!endLocation.trim()) return 'End location is required';
    if (!startDate || !endDate || endDate <= startDate) return 'Valid dates are required';
    if (existingImages.length + newImages.length === 0) return 'At least one photo is required';
    return null;
  };

  const updateTrip = async () => {
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Authentication token missing');
        navigate('/login');
        return;
      }
      const formData = new FormData();
      formData.append('tripName', tripName.trim());
      formData.append('budget', parseFloat(budget));
      formData.append('description', description.trim());
      formData.append('totalPeople', parseInt(totalPeople));
      formData.append('category', category);
      formData.append('travellerType', travellerType);
      formData.append('start[location]', startLocation.trim());
      formData.append('start[dateTime]', startDate.toISOString());
      formData.append('end[location]', endLocation.trim());
      formData.append('end[dateTime]', endDate.toISOString());
      formData.append('existingImages', JSON.stringify(existingImages));
      formData.append('removedImages', JSON.stringify(removedImages));

      newImages.forEach((image) => {
        formData.append('images', image);
      });

      const response = await axios.put(`${baseUrl}/api/trips/${tripId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success('Trip updated successfully');
        navigate('/your-trips');
      } else {
        throw new Error(response.data.message || 'Failed to update trip');
      }
    } catch (error) {
      console.error('Error updating trip:', error);
      toast.error(`Error: ${error.message || 'Failed to update trip'}`);
    } finally {
      setIsLoading(false);
    }
  };

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
      <div className="container mx-auto py-8 px-4 max-w-4xl pt-16">
        <h1 className="text-3xl font-bold mb-8 text-center">Edit Trip</h1>
        <form className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Trip Photos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {existingImages.map((url, index) => (
                <div key={`existing-${index}`} className="relative">
                  <img src={url} alt="Existing" className="w-full h-32 object-cover rounded-lg" />
                  <button
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"
                    type="button"
                  >
                    <i className="material-icons text-sm">close</i>
                  </button>
                </div>
              ))}
              {newImagePreviews.map((url, index) => (
                <div key={`new-${index}`} className="relative">
                  <img src={url} alt="New" className="w-full h-32 object-cover rounded-lg" />
                  <button
                    onClick={() => removeNewImage(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"
                    type="button"
                  >
                    <i className="material-icons text-sm">close</i>
                  </button>
                </div>
              ))}
              <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-blue-200 rounded-lg cursor-pointer hover:bg-blue-50">
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                <div className="text-center">
                  <i className="material-icons text-3xl text-blue-600">add_a_photo</i>
                  <p className="text-sm text-blue-600">Add Photo</p>
                </div>
              </label>
            </div>
            {(existingImages.length + newImages.length === 0) && (
              <p className="text-red-600 mt-2 text-sm">Add at least one photo</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Trip Name</label>
            <input
              type="text"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              placeholder="Enter trip name"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-1">Budget</label>
            <span className="absolute left-3 top-10 text-gray-500">₹</span>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Enter budget"
              className="w-full p-3 pl-8 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              rows={4}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Total People</label>
            <input
              type="number"
              value={totalPeople}
              onChange={(e) => setTotalPeople(e.target.value)}
              placeholder="Enter total people"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Category</option>
              {categoryOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Traveller Type</label>
            <select
              value={travellerType}
              onChange={(e) => setTravellerType(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Traveller Type</option>
              {travellerTypeOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Start Location</label>
            <input
              type="text"
              value={startLocation}
              onChange={(e) => setStartLocation(e.target.value)}
              placeholder="Enter start location"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">End Location</label>
            <input
              type="text"
              value={endLocation}
              onChange={(e) => setEndLocation(e.target.value)}
              placeholder="Enter end location"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <DatePicker
                selected={startDate}
                onChange={date => {
                  setStartDate(date);
                  if (endDate && endDate <= date) {
                    setEndDate(new Date(date.getTime() + 86400000));
                  }
                }}
                dateFormat="dd-MM-yyyy"
                minDate={new Date()}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholderText="Select start date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <DatePicker
                selected={endDate}
                onChange={date => setEndDate(date)}
                dateFormat="dd-MM-yyyy"
                minDate={startDate ? new Date(startDate.getTime() + 86400000) : new Date()}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!startDate}
                placeholderText="Select end date"
              />
            </div>
          </div>

          <button
            onClick={updateTrip}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </>
  );
};

export default EditTrip;