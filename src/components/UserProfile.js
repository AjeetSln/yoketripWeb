import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { capitalize } from 'lodash';
import { toast } from 'react-toastify';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaLinkedin } from 'react-icons/fa';
import Header from './Header'; // Adjust path if needed
import Footer from './footer'; // Adjust path if needed

const baseUrl = "https://yoketrip.in";

// Utility functions
const getToken = async () => {
    return localStorage.getItem('auth_token') || 'mock-token';
};

const calculateAge = (dob) => {
    try {
        if (!dob) {
            console.warn('calculateAge: dob is undefined or null');
            return 'Not available';
        }
        const birthDate = new Date(dob);
        const currentDate = new Date();
        let age = currentDate.getFullYear() - birthDate.getFullYear();
        if (
            currentDate.getMonth() < birthDate.getMonth() ||
            (currentDate.getMonth() === birthDate.getMonth() && currentDate.getDate() < birthDate.getDate())
        ) {
            age--;
        }
        return `${age} years`;
    } catch (e) {
        console.warn('calculateAge: Error parsing dob:', e);
        return 'Not available';
    }
};

const formatMemberSince = (dateString) => {
    try {
        if (!dateString) {
            console.warn('formatMemberSince: dateString is undefined or null');
            return 'Not available';
        }
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            console.warn('formatMemberSince: Invalid date string:', dateString);
            return 'Not available';
        }
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    } catch (e) {
        console.warn('formatMemberSince: Error parsing date:', e);
        return 'Not available';
    }
};

// InfoRow Component
const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start sm:items-center gap-x-3 py-2 sm:py-3">
    <span className="material-icons-outlined text-gray-700 text-xl sm:text-2xl mt-1 sm:mt-0">
      {icon}
    </span>
    <div className="flex flex-col">
      <p className="text-gray-600 text-sm sm:text-base">{label}</p>
      <p className="font-medium text-base sm:text-lg text-gray-900">{value}</p>
    </div>
  </div>
);

// StatisticBox Component
const StatisticBox = ({ count, label, icon }) => (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-5 text-center transform transition-all duration-300 ease-in-out hover:scale-105 hover:bg-gray-50">
        <div className="flex justify-center items-center mb-2">
            <span className="material-icons-outlined text-blue-600 text-3xl sm:text-4xl">
                {icon}
            </span>
        </div>
        <p className="font-bold text-xl sm:text-2xl text-gray-800">{count}</p>
        <p className="text-gray-600 text-sm sm:text-base mt-1">{label}</p>
    </div>
);

// SocialLinkItem Component
const SocialLinkItem = ({ Icon, label, url, platform }) => {
  const handleClick = () => {
    let raw = url?.trim();

    if (!raw || raw === 'https://yoketrip/' || raw === 'yoketrip') {
      toast.error('Invalid social link');
      return;
    }

    // If @username
    if (raw.startsWith('@')) {
      raw = raw.substring(1); // remove @
    }

    // If no http or dot in string → assume it's a username
    if (!raw.startsWith('http') && !raw.includes('.')) {
      if (!platform) {
        toast.error('Platform not specified');
        return;
      }

      const baseUrls = {
        facebook: 'https://facebook.com/',
        instagram: 'https://instagram.com/',
        twitter: 'https://twitter.com/',
        youtube: 'https://youtube.com/',
        linkedin: 'https://linkedin.com/in/',
      };

      const base = baseUrls[platform];
      if (!base) {
        toast.error('Unknown platform');
        return;
      }

      raw = base + raw;
    }

    // If still missing http
    if (!raw.startsWith('http')) {
      raw = 'https://' + raw;
    }

    try {
      const finalUrl = new URL(raw);
      window.open(finalUrl.href, '_blank');
    } catch (e) {
      console.error('Invalid URL:', raw);
      toast.error('Invalid social link');
    }
  };

  return (
    <div
      className="flex items-center py-2 px-3 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors duration-200"
      onClick={handleClick}
    >
      <Icon className="text-blue-600 text-xl sm:text-2xl" />
      <p className="flex-1 ml-3 text-base sm:text-lg text-gray-800">{label}</p>
      <i className="material-icons text-sm text-gray-500">open_in_new</i>
    </div>
  );
};

// SubscriptionPopup Component
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

// UserListModal Component
const UserListModal = ({ type, users, onClose, onUserClick, searchQuery, setSearchQuery }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-t-3xl p-4 sm:p-6 h-[85%] w-full max-w-2xl shadow-2xl">
            <div className="flex justify-between items-center">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{type === 'followers' ? 'Followers' : 'Following'}</h2>
                <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
                    <i className="material-icons">close</i>
                </button>
            </div>
            <input
                type="text"
                placeholder={`Search ${type}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full mt-3 bg-gray-100 rounded-lg p-3 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
            <div className="overflow-y-auto mt-3 max-h-[70vh]">
                {users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <i className={`material-icons text-gray-400 text-5xl sm:text-6xl`}>
                            {type === 'followers' ? 'people_outline' : 'person_outline'}
                        </i>
                        <p className="text-gray-600 mt-4 text-sm sm:text-base">
                            {type === 'followers' ? 'No followers yet' : 'Not following anyone'}
                        </p>
                    </div>
                ) : (
                    users
                        .filter((user) => user.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((user) => (
                            <div
                                key={user._id || user.id}
                                className="flex items-center p-3 bg-white rounded-lg shadow-sm my-1 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                                onClick={() => onUserClick(user)}
                            >
                                <img
                                    src={user.profilePic || '/assets/profilePic.png'}
                                    alt="Profile"
                                    className="w-12 sm:w-14 h-12 sm:h-14 rounded-full object-cover"
                                />
                                <div className="ml-3 flex-1">
                                    <p className="font-medium text-base sm:text-lg text-gray-800">{user.full_name}</p>
                                    {user.gender && (
                                        <p className="text-gray-600 text-sm truncate">{user.gender}</p>
                                    )}
                                </div>
                                <i className="material-icons text-gray-400 text-sm sm:text-base">arrow_forward_ios</i>
                            </div>
                        ))
                )}
            </div>
        </div>
    </div>
);

// Main UserProfileScreen Component
const UserProfileScreen = (props) => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [averageRating, setAverageRating] = useState(0.0);
    const [reviewCount, setReviewCount] = useState(0);
    const [subscriptionPlan, setSubscriptionPlan] = useState(null);
    const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);
    const [showUserList, setShowUserList] = useState(null);
    const [userList, setUserList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentUserId, setCurrentUserId] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { 
    isLoggedIn, 
    setIsLoggedIn, 
    handleNavClick, 
    toggleDrawer, 
    handleLogout, 
    isChatRoute 
  } = props;
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

        if (!userId || userId === 'undefined' || typeof userId !== 'string') {
            console.error('UserProfileScreen: Invalid or missing userId:', userId);
            toast.error('Invalid user profile');
            navigate('/');
            return;
        }

        const fetchUserProfile = async () => {
            try {
                const token = await getToken();
                if (!token) {
                    toast.error('Authentication required');
                    navigate('/login');
                    return;
                }

                setIsLoading(true);
                const response = await fetch(`${baseUrl}/api/user/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();

                if (response.ok && data.success && data.data) {
                    setUser(data.data);
                    setFollowersCount(data.data.followers?.length || 0);
                    setFollowingCount(data.data.following?.length || 0);
                    setIsFollowing(data.data.isFollowing || false);
                } else {
                    toast.error(data.message || 'User data not available');
                    navigate('/');
                }
            } catch (e) {
                toast.error(`Network error: ${e.message}`);
                navigate('/');
            } finally {
                setIsLoading(false);
            }
        };

        const fetchAverageRating = async () => {
            try {
                const response = await fetch(`${baseUrl}/api/reviewee/${userId}/average-rating`);
                const data = await response.json();
                if (response.ok) {
                    setAverageRating(data.averageRating || 0.0);
                    setReviewCount(data.reviewCount || 0);
                } else {
                    setAverageRating(0.0);
                    setReviewCount(0);
                }
            } catch (e) {
                console.error('Error fetching average rating:', e);
                setAverageRating(0.0);
                setReviewCount(0);
            }
        };

        const fetchUserSubscriptionPlan = async () => {
            try {
                const token = await getToken();
                if (!token) {
                    console.warn('No auth token found');
                    return;
                }
                const response = await fetch(`${baseUrl}/api/user/profile/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();
                if (response.ok) {
                    setSubscriptionPlan(data.subscription?.plan || 'Free');
                }
            } catch (e) {
                console.error('Error fetching subscription:', e);
            }
        };

        const fetchCurrentUserId = async () => {
            try {
                const token = await getToken();
                if (!token) return;
                const response = await fetch(`${baseUrl}/api/user/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                if (response.ok) {
                    setCurrentUserId(data._id || data.id);
                }
            } catch (e) {
                console.error('Error fetching current user ID:', e);
            }
        };

        fetchUserProfile();
        fetchAverageRating();
        fetchUserSubscriptionPlan();
        fetchCurrentUserId();

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [userId, navigate]);

    const toggleFollow = async () => {
        try {
            const token = await getToken();
            if (!token) {
                toast.error('Authentication required');
                return;
            }
            const response = await fetch(`${baseUrl}/api/user/${userId}/follow`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({}),
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setIsFollowing(data.data.isFollowing);
                setFollowersCount(data.data.followersCount);
                setFollowingCount(data.data.followingCount);
                setUser({
                    ...user,
                    followersCount: data.data.followersCount,
                    followingCount: data.data.followingCount,
                });
                toast.success(isFollowing ? 'Unfollowed user' : 'Followed user');
            } else {
                toast.error(data.message || 'Follow action failed');
            }
        } catch (e) {
            toast.error(`Network error: ${e.message}`);
        }
    };

    const fetchUserList = async (type) => {
        try {
            const token = await getToken();
            if (!token) {
                toast.error('Authentication required');
                return;
            }
            const response = await fetch(`${baseUrl}/api/user/${userId}/${type}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) {
                setUserList(data.data || []);
            } else {
                console.error(`${type} fetch error:`, data);
                setUserList([]);
                toast.error(`Failed to load ${type}`);
            }
        } catch (e) {
            console.error(`Error fetching ${type}:`, e);
            setUserList([]);
            toast.error(`Network error: ${e.message}`);
        }
    };

    const handleUserListClick = (type) => {
        setShowUserList(type);
        fetchUserList(type);
    };

    const handleUserClick = (selectedUser) => {
        setShowUserList(null);
        const targetUserId = selectedUser._id || selectedUser.id;
        if (!targetUserId || targetUserId === 'undefined') {
            console.error('handleUserClick: Invalid or missing user ID:', targetUserId);
            toast.error('Invalid user profile');
            return;
        }
        if (currentUserId && targetUserId === currentUserId) {
            navigate(`/profile/${currentUserId}`);
        } else {
            navigate(`/user-profile/${targetUserId}`);
        }
    };

    const getUserSubscriptionPlan = async () => {
        try {
            const token = await getToken();
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

    const handleMessageClick = async () => {
        const userPlan = await getUserSubscriptionPlan();
        if (userPlan === 'Free') {
            setShowSubscriptionPopup(true);
            return;
        }
        navigate(`/userchat/${user._id}`, {
            state: { receiverName: user.full_name, receiverImage: user.profilePic },
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <>
                <Header
                    {...props}
                />
                <div className="text-center text-lg text-gray-600 mt-10 pt-16">User not found</div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header
                 {...props}
            />
            <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 pt-16 pb-16">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Profile Header with Cover Image */}
                    <div className="relative bg-gradient-to-r from-blue-600 to-teal-600 h-48 sm:h-64 lg:h-80 rounded-t-xl overflow-hidden">
                        <img
                            src={user.coverImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1920&auto=format&fit=crop'}
                            alt="Cover"
                            className="w-full h-full object-cover opacity-50"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative">
                                <img
                                    src={user.profilePic || '/assets/profilePic.png'}
                                    alt="Profile"
                                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-lg object-cover transform transition-transform duration-300 hover:scale-105"
                                />
                                {subscriptionPlan && subscriptionPlan !== 'Free' && (
                                    <div className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1.5 shadow-md">
                                        <i className="material-icons text-white text-sm">verified</i>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="bg-white rounded-b-xl shadow-lg p-4 sm:p-6 lg:p-8 -mt-12 sm:-mt-16">
                        <div className="text-center">
                            <h2 className="font-bold text-xl sm:text-2xl lg:text-3xl text-gray-900">{user.full_name}</h2>
                            {user.kycStatus === 'verified' && (
                                <p className="text-blue-600 text-sm sm:text-base mt-2 flex items-center justify-center">
                                    <i className="material-icons text-sm mr-1">verified</i> Verified
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col sm:flex-row justify-around mt-4 sm:mt-6 gap-4">
                            <div
                                className="text-center cursor-pointer hover:text-blue-700 transition-colors duration-200"
                                onClick={() => handleUserListClick('followers')}
                            >
                                <p className="text-blue-600 font-bold text-lg sm:text-xl lg:text-2xl">{followersCount}</p>
                                <p className="text-gray-600 text-sm sm:text-base">Followers</p>
                            </div>
                            <div
                                className="text-center cursor-pointer hover:text-blue-700 transition-colors duration-200"
                                onClick={() => handleUserListClick('following')}
                            >
                                <p className="text-blue-600 font-bold text-lg sm:text-xl lg:text-2xl">{followingCount}</p>
                                <p className="text-gray-600 text-sm sm:text-base">Following</p>
                            </div>
                            <div className="text-center">
                                <div className="flex justify-center items-center">
                                    <i className="material-icons text-amber-500 text-base sm:text-lg">star</i>
                                    <p className="text-blue-600 font-bold text-lg sm:text-xl lg:text-2xl ml-1">{averageRating.toFixed(1)}</p>
                                </div>
                                <p className="text-gray-600 text-sm sm:text-base">Rating ({reviewCount})</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row mt-4 sm:mt-6 gap-3 sm:gap-4">
                            <button
                                onClick={toggleFollow}
                                className={`flex-1 py-3 sm:py-4 rounded-lg text-white font-medium shadow-md transition-all duration-300 ease-in-out ${isFollowing
                                    ? 'bg-gray-500 hover:bg-gray-600'
                                    : 'bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900'
                                    } text-base sm:text-lg`}
                            >
                                {isFollowing ? 'Following' : 'Follow'}
                            </button>
                            <button
                                onClick={handleMessageClick}
                                className="flex-1 py-3 sm:py-4 rounded-lg bg-gradient-to-r from-teal-600 to-teal-800 text-white font-medium shadow-md hover:from-teal-700 hover:to-teal-900 transition-all duration-300 ease-in-out text-base sm:text-lg"
                            >
                                Message
                            </button>
                        </div>
                    </div>

                    <hr className="border-gray-200 my-6" />

                    {/* User Info Section */}
                    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
                        <h3 className="font-bold text-lg sm:text-xl lg:text-2xl text-gray-900">Info</h3>
                        <div className="mt-4 space-y-2 sm:space-y-3">
                            <InfoRow icon="person_outline" label="Full Name" value={user.full_name} />
                            <InfoRow icon="cake" label="Age" value={calculateAge(user.dob)} />
                            <InfoRow icon="transgender" label="Gender" value={capitalize(user.gender) || 'Not available'} />
                            <InfoRow icon="calendar_today" label="Member since" value={formatMemberSince(user.createdAt)} />
                        </div>
                    </div>

                    <hr className="border-gray-200 my-6" />

                    {/* Social Links Section */}
                    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
                        <h3 className="font-bold text-lg sm:text-xl lg:text-2xl text-gray-900">Social Links</h3>
                        <div className="mt-4 space-y-2">
                            {Object.keys(user.socialLinks || {}).every((key) => !user.socialLinks[key]) ? (
                                <p className="text-gray-600 text-sm sm:text-base">No social links added</p>
                            ) : (
                                <>
                                    {user.socialLinks?.facebook && (
                                        <SocialLinkItem Icon={FaFacebook} platform="facebook" label="Facebook" url={user.socialLinks.facebook} />
                                    )}
                                    {user.socialLinks?.instagram && (
                                        <SocialLinkItem Icon={FaInstagram} platform="instagram" label="Instagram" url={user.socialLinks.instagram} />
                                    )}
                                    {user.socialLinks?.twitter && (
                                        <SocialLinkItem Icon={FaTwitter} platform="twitter" label="Twitter" url={user.socialLinks.twitter} />
                                    )}
                                    {user.socialLinks?.youtube && (
                                        <SocialLinkItem Icon={FaYoutube} platform="youtube" label="YouTube" url={user.socialLinks.youtube} />
                                    )}
                                    {user.socialLinks?.linkedin && (
                                        <SocialLinkItem Icon={FaLinkedin} platform="linkedin" label="LinkedIn" url={user.socialLinks.linkedin} />
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <hr className="border-gray-200 my-6" />

                    {/* Trip Statistics Section */}
                    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
                        <h3 className="font-bold text-lg sm:text-xl lg:text-2xl text-gray-900">Trip Statistics</h3>
                        <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            <StatisticBox
                                count={user.tripsHosted || 0}
                                label="Trips Hosted"
                                icon="airplanemode_active"
                            />
                            <StatisticBox
                                count={user.tripsCompleted || 0}
                                label="Trips Completed"
                                icon="check_circle_outline"
                            />
                            <StatisticBox
                                count={user.tripsUpcoming || 0}
                                label="Upcoming Trips"
                                icon="event"
                            />
                        </div>
                    </div>

                    {/* Modals */}
                    {showSubscriptionPopup && (
                        <SubscriptionPopup
                            onClose={() => setShowSubscriptionPopup(false)}
                            onUpgrade={() => navigate('/subscription')}
                        />
                    )}
                    {showUserList && (
                        <UserListModal
                            type={showUserList}
                            users={userList}
                            onClose={() => setShowUserList(null)}
                            onUserClick={handleUserClick}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                        />
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default UserProfileScreen;