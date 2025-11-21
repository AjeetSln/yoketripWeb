import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function CustomDrawer({ isOpen, onClose, userId }) {
    const [userName, setUserName] = useState('');
    const [UserId, setuserId] = useState('')
    const [profilePic, setProfilePic] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isBusinessExpanded, setIsBusinessExpanded] = useState(false);
    const baseUrl = 'https://yoketrip.in';

    useEffect(() => {
        const fetchUserDetails = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) return;

            try {
                setIsLoading(true);
                const response = await axios.get(`${baseUrl}/api/user/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.status === 200) {
                    setUserName(response.data.full_name || 'Guest');
                    setProfilePic(response.data.profilePic || '');
                    setuserId(response.data._id || userId);
                }
            } catch (e) {
                console.error('Error fetching user details:', e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserDetails();
    }, []);

    // Custom Arrow Component
    const ArrowIcon = () => (
        <svg className="ml-auto text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
    );

    // Expand Icon Component
    const ExpandIcon = ({ isExpanded }) => (
        <svg
            className={`ml-auto text-gray-400 w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
    );

    return (
        <>
            {/* Overlay for dimming background when drawer is open */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-40 z-40 md:bg-opacity-20"
                    onClick={onClose}
                ></div>
            )}

            <div
                className={`fixed left-0 z-50 bg-white transform transition-transform duration-300 ease-in-out shadow-lg
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          w-full md:w-80 lg:w-96 ${isOpen && !'md:top-20'} ${isOpen ? 'top-0 md:top-20' : 'top-20 md:top-20'} h-full md:h-[calc(100%-5rem)]`}
            >
                {/* Profile Header */}
                <div className="p-6 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-br-3xl md:rounded-tr-3xl">
                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-4 border-white">
                            {profilePic ? (
                                <img
                                    src={profilePic}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <img
                                    src="/assets/profilePic.png"
                                    alt="Default Profile"
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>
                        <h3 className="mt-4 text-xl font-semibold">{userName}</h3>
                        <button
                            className="mt-3 px-4 py-2 bg-white text-orange-600 rounded-full font-medium hover:bg-gray-100 transition-colors"
                            onClick={() => {
                                onClose();
                                window.location.href = `/profile/${UserId}`;
                            }}
                        >
                            View Profile
                        </button>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="p-4 space-y-2 overflow-y-auto h-[calc(100%-200px)]">
                    <Link
                        to="/wallet"
                        className="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium transition-colors"
                        onClick={onClose}
                    >
                        <i className="material-icons text-blue-500">account_balance_wallet</i>
                        <span className="ml-3">Wallet</span>
                        <ArrowIcon />
                    </Link>
                    <Link
                        to="/kyc-verification"
                        className="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium transition-colors"
                        onClick={onClose}
                    >
                        <i className="material-icons text-green-500">verified_user</i>
                        <span className="ml-3">KYC</span>
                        <ArrowIcon />
                    </Link>
                    <Link
                        to="/subscription"
                        className="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium transition-colors"
                        onClick={onClose}
                    >
                        {<i className="material-icons text-purple-500">subscriptions</i>}
                        <span className="ml-3">Subscription</span>
                        <ArrowIcon />
                    </Link>
                    <Link
                        to="/settings"
                        className="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium transition-colors"

                    >
                        {<i className="material-icons text-gray-500">settings</i>}
                        <span className="ml-3">Settings</span>
                        <ArrowIcon />
                    </Link>
                    <a
                        href="/blog"
                        className="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium transition-colors"
                    >
                        {<i className="material-icons text-red-500">article</i>}
                        <span className="ml-3">My Blog</span>
                        <ArrowIcon />
                    </a>
                    {/* Business Expansion Tile */}
                    <div className="relative">
                        <button
                            className="flex items-center w-full p-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium transition-colors"
                            onClick={() => setIsBusinessExpanded(!isBusinessExpanded)}
                        >
                            <i className="material-icons text-indigo-500">business</i>
                            <span className="ml-3">Business</span>
                            <ExpandIcon isExpanded={isBusinessExpanded} />
                        </button>
                        <div
                            className={`overflow-hidden transition-all duration-300 ${isBusinessExpanded ? 'max-h-48' : 'max-h-0'
                                }`}
                        >
                            <a
                                href="https://play.google.com/store/apps/details?id=com.yoketrip_india.app"
                                className="flex items-center p-3 ml-6 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium transition-colors"
                                target="_blank"
                            >
                                <i className="material-icons text-teal-500">group</i>
                                <span className="ml-3">Volunteer Yatra</span>
                                <ArrowIcon />
                            </a>
                            <a
                                href="https://play.google.com/store/apps/details?id=com.yoketrip_india.app"
                                className="flex items-center p-3 ml-6 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium transition-colors"
                                target="_blank"
                            >
                                <i className="material-icons text-yellow-500">person_pin</i>
                                <span className="ml-3">Guide</span>
                                <ArrowIcon />
                            </a>
                            <a
                                href="https://play.google.com/store/apps/details?id=com.yoketrip_india.app"
                                className="flex items-center p-3 ml-6 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium transition-colors"
                                target="_blank"
                            >
                                <i className="material-icons text-green-500">store</i>
                                <span className="ml-3">My Store</span>
                                <ArrowIcon />
                            </a>
                            <a
                                href="/my-services"
                                className="flex items-center p-3 ml-6 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium transition-colors"
                            >
                                <i className="material-icons text-blue-500">location_on</i>
                                <span className="ml-3">EcoTourism</span>
                                <ArrowIcon />
                            </a>
                        </div>
                    </div>
                    {/* Refer and Earn Button */}
                    <button
                        className="w-full mt-4 px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                        onClick={() => window.location.href = '/referral'}
                    >
                        Refer and Earn
                    </button>
                </div>

                {/* Loading Overlay */}
                {isOpen && isLoading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-white mt-4">Loading profile...</p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default CustomDrawer;