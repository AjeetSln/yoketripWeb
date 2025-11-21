import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import profilePic from '../asstes/profilePic.png'; // Updated path

const TripCard = ({ trip }) => {
    const navigate = useNavigate();
    const [subscriptionPlan, setSubscriptionPlan] = useState(null);
    const baseUrl = 'https://yoketrip.in';

    const fetchCurrentUserId = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                console.warn('No auth token found');
                return null;
            }

            const response = await axios.get(`${baseUrl}/api/user/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            return response.data._id || response.data.id;
        } catch (error) {
            console.error('Error fetching user ID:', error);
            return null;
        }
    };

    const fetchUserSubscriptionPlan = async (userId) => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                console.warn('No auth token found');
                return null;
            }

            const response = await axios.get(`${baseUrl}/api/user/profile/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            return response.data.subscription?.plan || 'Free';
        } catch (error) {
            console.error('Error fetching user subscription:', error);
            return null;
        }
    };

    useEffect(() => {
        fetchUserSubscriptionPlan(trip.userid).then((plan) => {
            setSubscriptionPlan(plan);
        });
    }, [trip.userid]);

    const handleTripClick = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            navigate(`/login?redirect=/trip/${trip.id || trip._id}`, { state: { trip } });
            return;
        }
        navigate(`/trip/${trip.id || trip._id}`, { state: { trip } });
    };

    const handleProfileClick = async (e) => {
        e.stopPropagation();
        const token = localStorage.getItem('auth_token');
        if (!token) {
            navigate(`/login?redirect=/profile/${trip.userid}`);
            return;
        }

        const currentUserId = await fetchCurrentUserId();
        if (currentUserId && trip.userid === currentUserId) {
            navigate(`/profile/${currentUserId}`);
        } else {
            navigate(`/user-profile/${trip.userid}`);
        }
    };

    return (
        <div
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-105"
            onClick={handleTripClick}
        >
            <div className="relative">
                {trip.images && trip.images.length > 0 ? (
                    <img
                        src={trip.images[0]}
                        alt={trip.tripName}
                        className="w-full h-48 object-cover"
                        onError={(e) => (e.target.src = '/assets/placeholder.png')}
                    />
                ) : (
                    <div className="w-full h-48 bg-gray-300 flex items-center justify-center">
                        <span className="material-icons text-gray-500 text-4xl">image</span>
                    </div>
                )}
                <div
                    className="absolute bottom-2 right-2"
                    onClick={handleProfileClick}
                >
                    <div className="relative">
                        <img
                            src={trip.profilePic || profilePic}
                            alt="Profile"
                            className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                        />
                        {subscriptionPlan && subscriptionPlan !== 'Free' && (
                            <div className="absolute bottom-0 right-0 bg-blue-600 rounded-full w-4 h-4 flex items-center justify-center">
                                <span className="material-icons text-white text-[10px]">verified</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 truncate">{trip.tripName}</h3>
                <p className="text-md text-green-600 font-semibold">₹{trip.budget}</p>
                <p className="text-sm text-gray-600">{trip.totalPeople} People</p>
                <p className="text-sm text-gray-600">{trip.duration}</p>
            </div>
        </div>
    );
};

export default TripCard;