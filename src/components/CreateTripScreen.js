// src/components/CreateTripScreen.js
import React, { useState, useRef,useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { format } from 'date-fns';
import './CreateTripScreen.css';
import Header from './Header'; // Adjust path if needed

const CreateTripScreen =  (props) => {
  const { 
    isLoggedIn, 
    setIsLoggedIn, 
    handleNavClick, 
    toggleDrawer, 
    handleLogout, 
    isChatRoute 
  } = props;
  const [formData, setFormData] = useState({
    name: '',
    budget: '',
    category: '',
    travelType: '',
    description: '',
    activities: '',
    people: '',
    inclusions: [],
    exclusions: [],
    startLocation: '',
    startDateTime: null,
    startTransport: '',
    startDesc: '',
    endLocation: '',
    endDateTime: null,
    endTransport: '',
    endDesc: '',
  });
  const [tripImages, setTripImages] = useState([]);
  const [stops, setStops] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stopForm, setStopForm] = useState({
    location: '',
    transport: '',
    description: '',
    dateTime: null,
  });
  const [showStopModal, setShowStopModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const fileInputRef = useRef(null);
  const baseUrl = 'https://yoketrip.in';
  const navigate = useNavigate();

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

  const categories = [
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

  const travelTypes = ['Solo', 'Group', 'Couple'].map((t) => ({ value: t, label: t }));

  const allOptions = [
    'Lunch',
    'Dinner',
    'Breakfast',
    'Travel TICKET',
    'Activities Ticket',
    'Room',
    'Guide',
  ].map((o) => ({ value: o, label: o }));

  const loadLocationSuggestions = async (inputValue) => {
    if (!inputValue) return [];
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${inputValue}&format=json&addressdetails=1&limit=5`,
        { headers: { 'User-Agent': 'ReactApp' } }
      );
      return response.data.map((item) => ({
        value: item.display_name,
        label: item.display_name,
      }));
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      return [];
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) {
      toast.error('No images selected');
      return;
    }

    const validImages = files.filter((file) => file.type.startsWith('image/'));
    if (validImages.length !== files.length) {
      toast.error('Only image files are allowed');
      return;
    }

    setTripImages([...tripImages, ...validImages]);
    toast.success('Images added successfully!');
  };

  const removeImage = (index) => {
    setTripImages(tripImages.filter((_, i) => i !== index));
  };

  const handleStopInputChange = (e) => {
    const { name, value } = e.target;
    setStopForm({ ...stopForm, [name]: value });
  };

  const addStop = () => {
    if (!stopForm.location || !stopForm.transport || !stopForm.dateTime) {
      toast.error('Please fill all required stop fields');
      return;
    }

    if (formData.startDateTime && stopForm.dateTime < formData.startDateTime) {
      toast.error('Stop must be after start time');
      return;
    }

    if (formData.endDateTime && stopForm.dateTime > formData.endDateTime) {
      toast.error('Stop must be before end time');
      return;
    }

    setStops([...stops, { ...stopForm }]);
    setStopForm({ location: '', transport: '', description: '', dateTime: null });
    setShowStopModal(false);
    toast.success('Stop added successfully!');
  };

  const removeStop = (index) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  const submitTrip = async () => {
    if (
      !formData.name ||
      !formData.budget ||
      !formData.category ||
      !formData.travelType ||
      !formData.description ||
      !formData.activities ||
      !formData.people ||
      formData.inclusions.length === 0 ||
      formData.exclusions.length === 0 ||
      !formData.startLocation ||
      !formData.startDateTime ||
      !formData.startTransport ||
      !formData.startDesc ||
      !formData.endLocation ||
      !formData.endDateTime ||
      !formData.endTransport ||
      !formData.endDesc ||
      tripImages.length === 0
    ) {
      toast.error('Please fill all required fields and add at least one photo');
      return;
    }

    if (formData.endDateTime < formData.startDateTime) {
      toast.error('End date must be after start date');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('budget', formData.budget);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('travelType', formData.travelType);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('activities', formData.activities);
      formDataToSend.append('people', formData.people);
      formDataToSend.append('inclusions', formData.inclusions.map((i) => i.value).join(','));
      formDataToSend.append('exclusions', formData.exclusions.map((e) => e.value).join(','));
      formDataToSend.append('startLocation', formData.startLocation);
      formDataToSend.append('startDateTime', formData.startDateTime.toISOString());
      formDataToSend.append('startTransport', formData.startTransport);
      formDataToSend.append('startDesc', formData.startDesc);
      formDataToSend.append('endLocation', formData.endLocation);
      formDataToSend.append('endDateTime', formData.endDateTime.toISOString());
      formDataToSend.append('endTransport', formData.endTransport);
      formDataToSend.append('endDesc', formData.endDesc);
      formDataToSend.append('stops', JSON.stringify(stops.map((stop) => ({
        location: stop.location,
        transport: stop.transport,
        description: stop.description || '',
        date: stop.dateTime.toISOString(),
      }))));

      tripImages.forEach((image, index) => {
        formDataToSend.append('photos', image);
      });

      const response = await axios.post(`${baseUrl}/api/trips/create`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        toast.success('Trip created successfully!');
        navigate('/explore');
      } else {
        toast.error('Failed to create trip');
      }
    } catch (error) {
      console.error('Error creating trip:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      borderRadius: '12px',
      border: 'none',
      backgroundColor: '#f3f4f6',
      padding: '8px',
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '12px',
    }),
  };

  return (
    <>
      <Header
        {...props}
      />
      <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
            Create Your Trip
          </h1>
          <form className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-medium text-blue-700 mb-4">Trip Photos</h2>
              <div className="flex flex-wrap gap-4">
                {tripImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Trip ${index}`}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      onClick={() => removeImage(index)}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
                <div
                  className="w-24 h-24 bg-gray-100 border border-blue-200 rounded-lg flex flex-col items-center justify-center cursor-pointer"
                  onClick={() => fileInputRef.current.click()}
                >
                  <svg
                    className="w-6 h-6 text-blue-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span className="text-sm text-blue-700">Add Photo</span>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
              {tripImages.length === 0 && (
                <p className="text-red-500 mt-2">Add at least one photo</p>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-medium text-blue-700 mb-4">Basic Information</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Trip Name*"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  placeholder="Budget*"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <Select
                  options={categories}
                  value={categories.find((c) => c.value === formData.category)}
                  onChange={(option) => setFormData({ ...formData, category: option.value })}
                  placeholder="Category*"
                  styles={customStyles}
                  required
                />
                <Select
                  options={travelTypes}
                  value={travelTypes.find((t) => t.value === formData.travelType)}
                  onChange={(option) => setFormData({ ...formData, travelType: option.value })}
                  placeholder="Travel Type*"
                  styles={customStyles}
                  required
                />
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Description*"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  required
                />
                <textarea
                  name="activities"
                  value={formData.activities}
                  onChange={handleInputChange}
                  placeholder="Activities*"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  required
                />
                <input
                  type="number"
                  name="people"
                  value={formData.people}
                  onChange={handleInputChange}
                  placeholder="Number of People*"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-medium text-blue-700 mb-4">Inclusions/Exclusions</h2>
              <Select
                isMulti
                options={allOptions}
                value={formData.inclusions}
                onChange={(options) => setFormData({ ...formData, inclusions: options })}
                placeholder="Select Inclusions*"
                styles={customStyles}
              />
              <Select
                isMulti
                options={allOptions}
                value={formData.exclusions}
                onChange={(options) => setFormData({ ...formData, exclusions: options })}
                placeholder="Select Exclusions*"
                className="mt-4"
                styles={customStyles}
              />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-medium text-blue-700 mb-4">Trip Itinerary</h2>
              <div className="mb-4">
                <h3 className="text-lg font-medium text-blue-700">Start From</h3>
                <DatePicker
                  selected={formData.startDateTime}
                  onChange={(date) => setFormData({ ...formData, startDateTime: date })}
                  showTimeSelect
                  dateFormat="MMM dd, yyyy h:mm aa"
                  placeholderText="Select Date & Time*"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  required
                />
                <AsyncSelect
                  cacheOptions
                  defaultOptions
                  loadOptions={loadLocationSuggestions}
                  value={{ value: formData.startLocation, label: formData.startLocation }}
                  onChange={(option) => setFormData({ ...formData, startLocation: option.value })}
                  placeholder="Location*"
                  styles={customStyles}
                  required
                />
                <input
                  type="text"
                  name="startTransport"
                  value={formData.startTransport}
                  onChange={handleInputChange}
                  placeholder="Transport Mode*"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                  required
                />
                <input
                  type="text"
                  name="startDesc"
                  value={formData.startDesc}
                  onChange={handleInputChange}
                  placeholder="Description*"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                  required
                />
              </div>

              <button
                type="button"
                className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors mb-4"
                onClick={() => setShowStopModal(true)}
              >
                Add Stop
              </button>
              {stops.length > 0 ? (
                <div>
                  <h3 className="text-lg font-medium text-blue-700">Stops</h3>
                  {stops.map((stop, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg mb-2 flex justify-between">
                      <div>
                        <p className="font-semibold">{stop.location}</p>
                        <p>Transport: {stop.transport}</p>
                        {stop.description && <p>Description: {stop.description}</p>}
                        <p>Date: {format(stop.dateTime, 'MMM dd, yyyy h:mm aa')}</p>
                      </div>
                      <button
                        type="button"
                        className="text-red-500"
                        onClick={() => removeStop(index)}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No stops added yet</p>
              )}

              <div className="mt-4">
                <h3 className="text-lg font-medium text-blue-700">End To</h3>
                <DatePicker
                  selected={formData.endDateTime}
                  onChange={(date) => setFormData({ ...formData, endDateTime: date })}
                  showTimeSelect
                  dateFormat="MMM dd, yyyy h:mm aa"
                  placeholderText="Select Date & Time*"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  minDate={formData.startDateTime}
                  required
                />
                <AsyncSelect
                  cacheOptions
                  defaultOptions
                  loadOptions={loadLocationSuggestions}
                  value={{ value: formData.endLocation, label: formData.endLocation }}
                  onChange={(option) => setFormData({ ...formData, endLocation: option.value })}
                  placeholder="Location*"
                  styles={customStyles}
                  required
                />
                <input
                  type="text"
                  name="endTransport"
                  value={formData.endTransport}
                  onChange={handleInputChange}
                  placeholder="Transport Mode*"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                  required
                />
                <input
                  type="text"
                  name="endDesc"
                  value={formData.endDesc}
                  onChange={handleInputChange}
                  placeholder="Description*"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                  required
                />
              </div>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={submitTrip}
                disabled={isLoading}
                className={`px-8 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <svg
                    className="animate-spin h-5 w-5 mx-auto text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  'Create Trip'
                )}
              </button>
            </div>
          </form>

          {showStopModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-xl font-medium text-blue-700 mb-4">Add Stop</h2>
                <AsyncSelect
                  cacheOptions
                  defaultOptions
                  loadOptions={loadLocationSuggestions}
                  value={{ value: stopForm.location, label: stopForm.location }}
                  onChange={(option) => setStopForm({ ...stopForm, location: option.value })}
                  placeholder="Location*"
                  styles={customStyles}
                  className="mb-4"
                  required
                />
                <input
                  type="text"
                  name="transport"
                  value={stopForm.transport}
                  onChange={handleStopInputChange}
                  placeholder="Transport*"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                  required
                />
                <input
                  type="text"
                  name="description"
                  value={stopForm.description}
                  onChange={handleStopInputChange}
                  placeholder="Description"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                />
                <DatePicker
                  selected={stopForm.dateTime}
                  onChange={(date) => setStopForm({ ...stopForm, dateTime: date })}
                  showTimeSelect
                  dateFormat="MMM dd, yyyy h:mm aa"
                  placeholderText="Select Date & Time*"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                  minDate={formData.startDateTime}
                  maxDate={formData.endDateTime}
                  required
                />
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowStopModal(false)}
                    className="px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={addStop}
                    className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CreateTripScreen;