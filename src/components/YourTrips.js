import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import ReviewDialog from './ReviewDialog';
import UserProfileScreen from './UserProfile'; // Corrected import path to match App.js
import moment from 'moment';
import Header from './Header'; // Adjust path if needed

const baseUrl = 'https://yoketrip.in';

const YourTrips = (props) => {
  const { 
    isLoggedIn, 
    setIsLoggedIn, 
    handleNavClick, 
    toggleDrawer, 
    handleLogout, 
    isChatRoute 
  } = props;
  const [activeTab, setActiveTab] = useState('bookings');
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [ongoingBookings, setOngoingBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [reviews, setReviews] = useState({});
  const [expandedTrips, setExpandedTrips] = useState({});
  const [tripBookings, setTripBookings] = useState({});
  const [showReviewDialog, setShowReviewDialog] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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


  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/login');
      return;
    }

    const socket = io(baseUrl, {
      transports: ['websocket'],
      query: { token },
      path: '/socket.io',
    });

    socket.on('connect', () => console.log('Socket connected'));
    socket.on('booking_accepted', () => fetchBookings());
    socket.on('booking_rejected', () => fetchBookings());
    socket.on('booking_cancelled', () => fetchBookings());
    socket.on('booking_cancelled_admin', () => fetchBookings());
    socket.on('connect_error', (error) => console.error('Socket connection error:', error));
    socket.on('error', (error) => console.error('Socket error:', error));

    fetchBookings();
    fetchTrips();

    return () => socket.disconnect();
  }, [navigate]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${baseUrl}/api/trips/bookings/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const bookings = response.data.bookings || [];
      const now = new Date();

      setUpcomingBookings(
        bookings.filter((booking) => {
          const startDate = new Date(booking.startDate);
          return startDate > now && booking.status !== 'cancelled';
        })
      );

      setOngoingBookings(
        bookings.filter((booking) => {
          const startDate = new Date(booking.startDate);
          const endDate = new Date(booking.endDate);
          return startDate <= now && endDate >= now && booking.status !== 'cancelled';
        })
      );

      setPastBookings(
        bookings.filter((booking) => {
          const endDate = new Date(booking.endDate);
          return endDate < now && booking.status !== 'cancelled';
        })
      );

      setIsLoading(false);

      for (const booking of bookings.filter((b) => b.status !== 'cancelled')) {
        fetchReview(booking._id);
      }
    } catch (error) {
      setErrorMessage('Failed to load bookings');
      setIsLoading(false);
      toast.error('Failed to load bookings');
    }
  };

  const fetchTrips = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${baseUrl}/api/trips/getowntrips/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTrips(response.data);
      setIsLoading(false);
    } catch (error) {
      setErrorMessage('Failed to load trips');
      setIsLoading(false);
      toast.error('Failed to load trips');
    }
  };

  const fetchReview = async (bookingId) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${baseUrl}/api/reviews/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReviews((prev) => ({ ...prev, [bookingId]: response.data.review }));
    } catch (error) {
      console.error(`Error fetching review for booking ${bookingId}:`, error);
    }
  };

  const fetchBookingsForTrip = async (tripId) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${baseUrl}/api/trips/${tripId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTripBookings((prev) => ({ ...prev, [tripId]: response.data.bookings || [] }));
    } catch (error) {
      toast.error('Failed to load trip bookings');
    }
  };

  const cancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this trip?')) {
      try {
        const token = localStorage.getItem('auth_token');
        await axios.delete(`${baseUrl}/api/trips/cancel/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Booking cancelled successfully');
        fetchBookings();
      } catch (error) {
        toast.error('Failed to cancel booking');
      }
    }
  };

  const acceptBooking = async (bookingId, tripId) => {
    try {
      const token = localStorage.getItem('auth_token');
      await axios.post(`${baseUrl}/api/trips/bookings/accept/${bookingId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Booking confirmed successfully');
      fetchBookingsForTrip(tripId);
    } catch (error) {
      toast.error('Failed to confirm booking');
    }
  };

  const rejectBooking = async (bookingId, tripId) => {
    try {
      const token = localStorage.getItem('auth_token');
      await axios.post(`${baseUrl}/api/trips/bookings/reject/${bookingId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Booking rejected successfully');
      fetchBookingsForTrip(tripId);
    } catch (error) {
      toast.error('Failed to reject booking');
    }
  };

  const deleteTrip = async (tripId) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        const token = localStorage.getItem('auth_token');
        await axios.delete(`${baseUrl}/api/trips/${tripId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTrips(trips.filter((trip) => trip.id !== tripId));
        toast.success('Trip deleted successfully');
      } catch (error) {
        toast.error('Failed to delete trip');
      }
    }
  };

  const toggleTripExpansion = async (tripId) => {
    if (!expandedTrips[tripId]) {
      await fetchBookingsForTrip(tripId);
    }
    setExpandedTrips((prev) => ({ ...prev, [tripId]: !prev[tripId] }));
  };

  const handleReviewSubmit = (tripId) => {
    fetchReview(tripId);
    setShowReviewDialog(null);
  };

  const formatDate = (isoDate) => {
    return isoDate ? moment(isoDate).format('DD/MM/YYYY') : 'N/A';
  };

  const renderBookingCard = (booking, type) => {
    const isPending = booking.status === 'pending';
    const isOngoing = type === 'ongoing';
    const isPast = type === 'past';
    const startDate = new Date(booking.startDate);
    const canCancel = !isPending && !isOngoing && !isPast && startDate > new Date() && (startDate - new Date()) / 3600000 > 12;
    const review = reviews[booking._id];
    const reviewExists = review && review.rating;

    return (
      <div className="bg-white shadow-md rounded-lg p-6 mb-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{booking.tripName || 'Trip'}</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${isPending ? 'bg-orange-100 text-orange-800' :
              isOngoing ? 'bg-blue-100 text-blue-800' :
                isPast ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-800'
            }`}>
            {isPending ? 'Pending' : isOngoing ? 'Ongoing' : isPast ? 'Completed' : 'Confirmed'}
          </span>
        </div>
        <div className="mt-4 space-y-2">
          <p><i className="material-icons mr-2">location_on</i>Start: {booking.startLocation || 'N/A'}</p>
          <p><i className="material-icons mr-2">location_off</i>End: {booking.endLocation || 'N/A'}</p>
          <p><i className="material-icons mr-2">calendar_today</i>Dates: {formatDate(booking.startDate)} - {formatDate(booking.endDate)}</p>
          <p><i className="material-icons mr-2">group</i>Participants: {booking.numPeople || 'N/A'}</p>
          <p><i className="material-icons mr-2">currency_rupee</i>Total: ₹{booking.totalAmount?.toFixed(2) || '0.00'}</p>
        </div>
        {canCancel && (
          <button
            className="mt-4 w-full border border-red-600 text-red-600 py-2 rounded-lg hover:bg-red-600 hover:text-white transition"
            onClick={() => cancelBooking(booking._id)}
          >
            Cancel Trip
          </button>
        )}
        {isPending && (
          <div className="mt-4 bg-orange-50 border border-orange-200 p-3 rounded-lg flex items-center">
            <i className="material-icons text-orange-800 mr-2">info</i>
            <span>Awaiting host approval</span>
          </div>
        )}
        {isPast && booking.status !== 'cancelled' && (
          <div className="mt-4">
            {reviewExists ? (
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-semibold">Your Review</h4>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className={`material-icons ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                      star
                    </i>
                  ))}
                </div>
                {review.comment && <p className="mt-2 text-gray-600">{review.comment}</p>}
              </div>
            ) : (
              <button
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                onClick={() => setShowReviewDialog({ id: booking._id, userId: booking.tripuserowner || '' })}
              >
                Leave a Review
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderTripCard = (trip) => {
    const tripId = trip.id;
    const isExpanded = expandedTrips[tripId];
    const bookings = tripBookings[tripId] || [];
    const startDate = new Date(trip.start?.dateTime);
    const endDate = new Date(trip.end?.dateTime);
    const isOngoing = startDate <= new Date() && endDate >= new Date();
    const isPast = endDate < new Date();

    return (
      <div className="bg-white shadow-md rounded-lg mb-4" key={tripId}>
        <div className="p-6">
          <div className="flex">
            <img
              src={trip.images?.[0] || '/assets/default_trip.jpg'}
              alt="Trip"
              className="w-24 h-24 rounded-lg object-cover"
            />
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold">{trip.tripName || 'Untitled Trip'}</h3>
              <p><i className="material-icons mr-2">location_on</i>{trip.end?.location || 'No location'}</p>
              <p><i className="material-icons mr-2">currency_rupee</i>₹{trip.budget || '0'}</p>
              <p><i className="material-icons mr-2">calendar_today</i>
                {formatDate(trip.start?.dateTime)} - {formatDate(trip.end?.dateTime)}
              </p>
              {isOngoing && (
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  Ongoing
                </span>
              )}
            </div>
          </div>
          <p className="mt-4 text-gray-600">{trip.description || 'No description'}</p>
          <div className="mt-4 flex justify-between">
            <Link
              to={`/trip-bookings/${tripId}/${encodeURIComponent(trip.tripName || 'Untitled Trip')}`}
              className="flex items-center bg-blue-50 text-blue-600 px-4 py-2 rounded-full"
            >
              <i className="material-icons mr-2">people_alt</i>Bookings
            </Link>
            <div className="relative group">
              <button className="text-gray-600">
                <i className="material-icons">more_vert</i>
              </button>
              <div className="absolute right-0 mt-2 w-32 bg-white shadow-lg rounded-lg hidden group-hover:block">
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => navigate(`/edit-trip/${trip.id}`, { state: { trip } })}
                >
                  Edit
                </button>
                <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">Hide</button>
                <button
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                  onClick={() => deleteTrip(tripId)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
        <button
          className="w-full bg-blue-50 text-blue-600 py-3 rounded-b-lg flex justify-center items-center"
          onClick={() => toggleTripExpansion(tripId)}
        >
          {isExpanded ? 'Hide Bookings' : 'Show Bookings'}
          <i className="material-icons ml-2">{isExpanded ? 'expand_less' : 'expand_more'}</i>
        </button>
        {isExpanded && (
          <div className="p-6 bg-gray-50 rounded-b-lg">
            <h4 className="text-lg font-semibold text-blue-600">Booking Details</h4>
            {bookings.length === 0 ? (
              <p className="text-gray-600">No bookings yet</p>
            ) : (
              bookings.map((booking) => (
                <div key={booking._id} className="bg-white shadow-md rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <Link to={`/user-profile/${booking.user?._id}`}>
                      <img
                        src={booking.user?.profilePic || '/assets/default_user.jpg'}
                        alt="User"
                        className="w-12 h-12 rounded-full"
                      />
                    </Link>
                    <div className="ml-4">
                      <p className="font-semibold">Booking ID: {booking._id}</p>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${booking.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-green-100 text-green-800'
                        }`}>
                        {booking.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p>User Name: {booking.user?.full_name || 'Unknown'}</p>
                    <p>Email: {booking.user?.email || 'N/A'}</p>
                    <p>Mobile: {booking.user?.phone || 'N/A'}</p>
                    <p>Status: {booking.status.toUpperCase()}</p>
                  </div>
                  {booking.status === 'pending' && (
                    <div className="mt-4 flex space-x-2">
                      <button
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg"
                        onClick={() => acceptBooking(booking._id, tripId)}
                      >
                        Accept
                      </button>
                      <button
                        className="flex-1 bg-red-600 text-white py-2 rounded-lg"
                        onClick={() => rejectBooking(booking._id, tripId)}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {isPast && booking.status !== 'cancelled' && (
                    <div className="mt-4">
                      {reviews[`${tripId}|${booking.user?._id}`] ? (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <h4 className="font-semibold">User Review</h4>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <i key={i} className={`material-icons ${i < reviews[`${tripId}|${booking.user?._id}`].rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                                star
                              </i>
                            ))}
                          </div>
                          {reviews[`${tripId}|${booking.user?._id}`].comment && (
                            <p className="mt-2 text-gray-600">{reviews[`${tripId}|${booking.user?._id}`].comment}</p>
                          )}
                        </div>
                      ) : (
                        <button
                          className="w-full bg-blue-600 text-white py-2 rounded-lg"
                          onClick={() => setShowReviewDialog({ id: tripId, userId: booking.user?._id })}
                        >
                          Leave a Review
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-600">{errorMessage}</p>
        <button
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
          onClick={() => { fetchBookings(); fetchTrips(); }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <Header
        {...props}
      />
      <div className="container mx-auto py-8 px-4 pt-16">
        {showReviewDialog && (
          <ReviewDialog
            id={showReviewDialog.id}
            userId={showReviewDialog.userId}
            onClose={() => setShowReviewDialog(null)}
            onSubmit={handleReviewSubmit}
          />
        )}
        <div className="flex space-x-4 mb-6">
          <button
            className={`px-4 py-2 font-semibold ${activeTab === 'bookings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('bookings')}
          >
            My Bookings
          </button>
          <button
            className={`px-4 py-2 font-semibold ${activeTab === 'trips' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('trips')}
          >
            My Trips
          </button>
        </div>
        {activeTab === 'bookings' ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Upcoming Bookings</h2>
              <Link to="/all-bookings" className="text-blue-600 hover:underline">View All →</Link>
            </div>
            {upcomingBookings.length === 0 ? (
              <p className="text-gray-600">No upcoming bookings</p>
            ) : (
              upcomingBookings.map((booking) => renderBookingCard(booking, 'upcoming'))
            )}
            <h2 className="text-2xl font-semibold mt-8">Ongoing Bookings</h2>
            {ongoingBookings.length === 0 ? (
              <p className="text-gray-600">No ongoing bookings</p>
            ) : (
              ongoingBookings.map((booking) => renderBookingCard(booking, 'ongoing'))
            )}
            <h2 className="text-2xl font-semibold mt-8">Past Bookings</h2>
            {pastBookings.length === 0 ? (
              <p className="text-gray-600">No past bookings</p>
            ) : (
              pastBookings.map((booking) => renderBookingCard(booking, 'past'))
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Upcoming Trips</h2>
            {trips.filter((trip) => new Date(trip.start?.dateTime) > new Date()).length === 0 ? (
              <p className="text-gray-600">No upcoming trips</p>
            ) : (
              trips
                .filter((trip) => new Date(trip.start?.dateTime) > new Date())
                .map((trip) => renderTripCard(trip))
            )}
            <h2 className="text-2xl font-semibold mt-8">Ongoing Trips</h2>
            {trips.filter((trip) => {
              const start = new Date(trip.start?.dateTime);
              const end = new Date(trip.end?.dateTime);
              return start <= new Date() && end >= new Date();
            }).length === 0 ? (
              <p className="text-gray-600">No ongoing trips</p>
            ) : (
              trips
                .filter((trip) => {
                  const start = new Date(trip.start?.dateTime);
                  const end = new Date(trip.end?.dateTime);
                  return start <= new Date() && end >= new Date();
                })
                .map((trip) => renderTripCard(trip))
            )}
            <h2 className="text-2xl font-semibold mt-8">Past Trips</h2>
            {trips.filter((trip) => new Date(trip.end?.dateTime) < new Date()).length === 0 ? (
              <p className="text-gray-600">No past trips</p>
            ) : (
              trips
                .filter((trip) => new Date(trip.end?.dateTime) < new Date())
                .map((trip) => renderTripCard(trip))
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default YourTrips;