import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import { useParams, Link } from 'react-router-dom';
import ReviewDialog from './ReviewDialog';
import Header from './Header'; // Adjust path if needed

const baseUrl = 'https://yoketrip.in';

const TripBookings = ( props) => {
  const { 
    isLoggedIn, 
    setIsLoggedIn, 
    handleNavClick, 
    toggleDrawer, 
    handleLogout, 
    isChatRoute 
  } = props;
  const { tripId, tripName } = useParams();
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingBookings, setPendingBookings] = useState([]);
  const [confirmedUpcomingBookings, setConfirmedUpcomingBookings] = useState([]);
  const [confirmedOngoingBookings, setConfirmedOngoingBookings] = useState([]);
  const [confirmedPastBookings, setConfirmedPastBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [reviews, setReviews] = useState({});
  const [showReviewDialog, setShowReviewDialog] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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

    const token = localStorage.getItem('auth_token');
    if (!token) {
      window.location.href = '/login';
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

    return () => {
      socket.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [tripId]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${baseUrl}/api/trips/${tripId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const bookings = response.data.bookings || [];
      const now = new Date();

      setPendingBookings(
        bookings.filter((booking) => booking.status === 'pending' && new Date(booking.trip.end?.dateTime) >= now)
      );
      setConfirmedUpcomingBookings(
        bookings.filter((booking) => {
          const startDate = new Date(booking.trip.start?.dateTime);
          return booking.status === 'confirmed' && startDate > now;
        })
      );
      setConfirmedOngoingBookings(
        bookings.filter((booking) => {
          const startDate = new Date(booking.trip.start?.dateTime);
          const endDate = new Date(booking.trip.end?.dateTime);
          return booking.status === 'confirmed' && startDate <= now && endDate >= now;
        })
      );
      setConfirmedPastBookings(
        bookings.filter((booking) => {
          const endDate = new Date(booking.trip.end?.dateTime);
          return booking.status === 'confirmed' && endDate < now;
        })
      );

      setIsLoading(false);

      for (const booking of bookings.filter((b) => b.status !== 'cancelled')) {
        fetchReview(tripId, booking.user?._id);
      }
    } catch (error) {
      setErrorMessage('Failed to load bookings');
      setIsLoading(false);
      toast.error('Failed to load bookings');
    }
  };

  const fetchReview = async (tripId, userId) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${baseUrl}/api/reviews/${tripId}/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReviews((prev) => ({ ...prev, [`${tripId}|${userId}`]: response.data.review || {} }));
    } catch (error) {
      setReviews((prev) => ({ ...prev, [`${tripId}|${userId}`]: null }));
    }
  };

  const acceptBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('auth_token');
      await axios.post(`${baseUrl}/api/trips/bookings/accept/${bookingId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Booking confirmed successfully');
      fetchBookings();
    } catch (error) {
      toast.error('Failed to confirm booking');
    }
  };

  const rejectBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('auth_token');
      await axios.post(`${baseUrl}/api/trips/bookings/reject/${bookingId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Booking rejected successfully');
      fetchBookings();
    } catch (error) {
      toast.error('Failed to reject booking');
    }
  };

  const renderBookingCard = (booking, type) => {
    const isOngoing = type === 'ongoing';
    const isPast = type === 'past';
    const status = booking.status.toLowerCase();
    const review = reviews[`${tripId}|${booking.user?._id}`];
    const reviewExists = review && review.rating;

    return (
      <div className="bg-white shadow-md rounded-lg p-4 mb-4" key={booking._id}>
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
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isOngoing ? 'bg-blue-100 text-blue-800' :
              status === 'pending' ? 'bg-orange-100 text-orange-800' :
              status === 'cancelled' ? 'bg-red-100 text-red-800' :
              'bg-green-100 text-green-800'
            }`}>
              {isOngoing ? 'ONGOING' : status.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="mt-4">
          <p>User Name: {booking.user?.full_name || 'Unknown'}</p>
          <p>Email: {booking.user?.email || 'N/A'}</p>
          <p>Mobile: {booking.user?.phone || 'N/A'}</p>
          <p>Status: {isOngoing ? 'ONGOING' : status.toUpperCase()}</p>
        </div>
        {status === 'pending' && (
          <div className="mt-4 flex space-x-2">
            <button
              className="flex-1 bg-green-600 text-white py-2 rounded-lg"
              onClick={() => acceptBooking(booking._id)}
            >
              Accept
            </button>
            <button
              className="flex-1 bg-red-600 text-white py-2 rounded-lg"
              onClick={() => rejectBooking(booking._id)}
            >
              Reject
            </button>
          </div>
        )}
        {isPast && status !== 'cancelled' && (
          <div className="mt-4">
            {reviewExists ? (
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-semibold">User Review</h4>
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
                className="w-full bg-blue-600 text-white py-2 rounded-lg"
                onClick={() => setShowReviewDialog({ id: tripId, userId: booking.user?._id })}
              >
                Leave a Review
              </button>
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
          onClick={fetchBookings}
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
            onSubmit={() => fetchReview(tripId, showReviewDialog.userId)}
          />
        )}
        <h1 className="text-3xl font-semibold mb-6">{decodeURIComponent(tripName)}</h1>
        <div className="flex space-x-4 mb-6">
          <button
            className={`px-4 py-2 font-semibold ${activeTab === 'pending' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Requests
          </button>
          <button
            className={`px-4 py-2 font-semibold ${activeTab === 'confirmed' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('confirmed')}
          >
            Confirmed Bookings
          </button>
        </div>
        {activeTab === 'pending' ? (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Pending Requests</h2>
            {pendingBookings.length === 0 ? (
              <p className="text-gray-600">No pending requests</p>
            ) : (
              pendingBookings.map((booking) => renderBookingCard(booking, 'pending'))
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Upcoming Confirmed Bookings</h2>
            {confirmedUpcomingBookings.length === 0 ? (
              <p className="text-gray-600">No upcoming confirmed bookings</p>
            ) : (
              confirmedUpcomingBookings.map((booking) => renderBookingCard(booking, 'upcoming'))
            )}
            <h2 className="text-2xl font-semibold mt-8 mb-4">Ongoing Confirmed Bookings</h2>
            {confirmedOngoingBookings.length === 0 ? (
              <p className="text-gray-600">No ongoing confirmed bookings</p>
            ) : (
              confirmedOngoingBookings.map((booking) => renderBookingCard(booking, 'ongoing'))
            )}
            <h2 className="text-2xl font-semibold mt-8 mb-4">Past Confirmed Bookings</h2>
            {confirmedPastBookings.length === 0 ? (
              <p className="text-gray-600">No past confirmed bookings</p>
            ) : (
              confirmedPastBookings.map((booking) => renderBookingCard(booking, 'past'))
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default TripBookings;