import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import cover from '../asstes/profile_cover.jpg';
import {
    Container,
    Box,
    Typography,
    Tabs,
    Tab,
    Button,
    Avatar,
    CircularProgress,
    Divider,
    Chip,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Modal,
    TextField,
    IconButton,
} from '@mui/material';
import { Verified, Warning, Edit, ExitToApp, Facebook, Instagram, Twitter, YouTube, ChevronRight } from '@mui/icons-material';
import Header from './Header'; // Adjust path if needed
import Footer from './footer'; // Adjust path if needed

const baseUrl = 'https://yoketrip.in';

function ProfileScreen(props) {
    const { 
    isLoggedIn, 
    setIsLoggedIn, 
    handleNavClick, 
    toggleDrawer, 
    handleLogout, 
    isChatRoute 
  } = props;
    const { userId } = useParams();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isVerified, setIsVerified] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [modalData, setModalData] = useState([]);
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

        const fetchUserProfile = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) throw new Error('No authentication token found');
                const response = await axios.get(`${baseUrl}/api/user/ourveiw/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.status === 200) {
                    setUserData(response.data);
                    setIsVerified(response.data.kycStatus === 'verified');
                } else {
                    throw new Error('Failed to load profile');
                }
            } catch (error) {
                toast.error(`Error: ${error.message}`);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserProfile();

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [userId]);

    const calculateAge = (dobString) => {
        try {
            const dob = new Date(dobString);
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const monthDiff = today.getMonth() - dob.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                age--;
            }
            return age;
        } catch (e) {
            console.error('Invalid DOB Format:', dobString);
            return 0;
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleEditProfile = () => {
        navigate(`/edit-profile/${userId}`);
    };

    const handleKycVerification = () => {
        if (!isVerified) {
            navigate('/kyc-verification');
        }
    };

    const handleSocialLinkClick = async (url) => {
        try {
            window.open(url, '_blank');
        } catch (error) {
            toast.error(`Could not launch ${url}`);
        }
    };

    const handleUserListModal = async (type) => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get(`${baseUrl}/api/user/${userId}/${type}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Handle different response structures
            let users = [];
            if (Array.isArray(response.data)) {
                users = response.data;
            } else if (response.data && Array.isArray(response.data.data)) {
                users = response.data.data;
            } else if (response.data && Array.isArray(response.data.users)) {
                users = response.data.users;
            }

            setModalType(type);
            setModalData(users);
            setModalOpen(true);
        } catch (error) {
            toast.error(`Failed to load ${type}`);
            console.error(`Error fetching ${type}:`, error);
            setModalData([]);
        }
    };

    const filteredUsers = (users) => {
        if (!users || !Array.isArray(users)) return [];
        return users.filter((user) => {
            if (!user) return false;
            const name = user.full_name || user.name || user.username || '';
            return name.toLowerCase().includes(searchQuery.toLowerCase());
        });
    };

    if (isLoading) {
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
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                    <CircularProgress />
                </Box>
            </>
        );
    }

    return (
        <>
            <Header
                {...props}
            />
            <Box sx={{ pt: 16, pb: 16, bgcolor: 'background.default', minHeight: '100vh' }}>
                <Container maxWidth="lg">
                    <Box>
                        {/* Profile Header */}
                        <Box
                            sx={{
                                position: 'relative',
                                height: '200px',
                                backgroundImage: `url(${cover})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}
                        >
                            <Button
                                variant="contained"
                                startIcon={<Edit />}
                                sx={{ position: 'absolute', top: 20, right: 20 }}
                                onClick={handleEditProfile}
                            >
                                Edit Profile
                            </Button>
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: '150px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    textAlign: 'center',
                                }}
                            >
                                <Avatar
                                    src={userData?.profilePic || '/assets/default_avatar.png'}
                                    sx={{ width: 100, height: 100, border: '4px solid white' }}
                                />
                            </Box>
                        </Box>
                        <Box mt={7} textAlign="center">
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <Typography variant="h5" fontWeight="bold">
                                    {userData?.full_name || 'Unknown'}
                                </Typography>
                                <Box
                                    ml={1}
                                    p={0.5}
                                    bgcolor={isVerified ? 'blue.50' : 'grey.200'}
                                    borderRadius={2}
                                    display="flex"
                                    alignItems="center"
                                    sx={{ cursor: isVerified ? 'default' : 'pointer' }}
                                    onClick={handleKycVerification}
                                >
                                    <IconButton size="small">
                                        {isVerified ? <Verified color="primary" /> : <Warning color="warning" />}
                                    </IconButton>
                                    <Typography variant="caption" color={isVerified ? 'primary' : 'warning'}>
                                        {isVerified ? 'VERIFIED' : 'NOT VERIFIED'}
                                    </Typography>
                                </Box>
                            </Box>
                            <Typography variant="body2">
                                {userData?.gender || 'N/A'}, {calculateAge(userData?.dob || '')}
                            </Typography>
                            <Typography variant="body2">
                                {(userData?.city && userData?.country) ? `${userData.city}, ${userData.country}` : userData?.city || userData?.country || ''}
                            </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-evenly" my={2}>
                            <Box textAlign="center" onClick={() => handleUserListModal('followers')} sx={{ cursor: 'pointer' }}>
                                <Typography variant="h6" color="primary">
                                    {userData?.followers?.length || 0}
                                </Typography>
                                <Typography variant="body2">Followers</Typography>
                            </Box>
                            <Box textAlign="center" onClick={() => handleUserListModal('following')} sx={{ cursor: 'pointer' }}>
                                <Typography variant="h6" color="primary">
                                    {userData?.following?.length || 0}
                                </Typography>
                                <Typography variant="body2">Following</Typography>
                            </Box>
                            <Box textAlign="center">
                                <Typography variant="h6" color="orange">
                                    Traveller
                                </Typography>
                                <Typography variant="body2" color="orange">
                                    Traveller
                                </Typography>
                            </Box>
                        </Box>

                        {/* Tabs */}
                        <Tabs value={tabValue} onChange={handleTabChange} centered>
                            <Tab label="About" />
                            <Tab label="Social" />
                            <Tab label="Map" />
                            <Tab label="Login Status" />
                        </Tabs>
                        <Divider />

                        {/* Tab Content */}
                        {tabValue === 0 && (
                            <Box p={2}>
                                {userData?.about && (
                                    <>
                                        <Typography variant="h6" fontWeight="bold">About</Typography>
                                        <Typography>{userData.about}</Typography>
                                        <Divider sx={{ my: 1 }} />
                                    </>
                                )}
                                {userData?.interests?.length > 0 && (
                                    <>
                                        <Typography variant="h6" fontWeight="bold">Interests</Typography>
                                        <Box display="flex" flexWrap="wrap" gap={1}>
                                            {userData.interests.map((interest, index) => (
                                                <Chip key={index} label={interest} color="primary" variant="outlined" />
                                            ))}
                                        </Box>
                                        <Divider sx={{ my: 1 }} />
                                    </>
                                )}
                                <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                                <Typography>{userData?.email || 'N/A'}</Typography>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="subtitle2" color="textSecondary">Phone</Typography>
                                <Typography>{userData?.phone || 'N/A'}</Typography>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="subtitle2" color="textSecondary">DOB</Typography>
                                <Typography>{userData?.dob || 'N/A'}</Typography>
                            </Box>
                        )}
                        {tabValue === 1 && (
                            <Box p={2}>
                                {userData?.socialLinks && Object.keys(userData.socialLinks).length > 0 ? (
                                    <List>
                                        {userData.socialLinks.facebook && (
                                            <ListItem button onClick={() => handleSocialLinkClick(userData.socialLinks.facebook)}>
                                                <ListItemIcon><Facebook /></ListItemIcon>
                                                <ListItemText primary="Facebook" secondary={userData.socialLinks.facebook} />
                                                <ChevronRight />
                                            </ListItem>
                                        )}
                                        {userData.socialLinks.instagram && (
                                            <ListItem button onClick={() => handleSocialLinkClick(userData.socialLinks.instagram)}>
                                                <ListItemIcon><Instagram /></ListItemIcon>
                                                <ListItemText primary="Instagram" secondary={userData.socialLinks.instagram} />
                                                <ChevronRight />
                                            </ListItem>
                                        )}
                                        {userData.socialLinks.twitter && (
                                            <ListItem button onClick={() => handleSocialLinkClick(userData.socialLinks.twitter)}>
                                                <ListItemIcon><Twitter /></ListItemIcon>
                                                <ListItemText primary="Twitter" secondary={userData.socialLinks.twitter} />
                                                <ChevronRight />
                                            </ListItem>
                                        )}
                                        {userData.socialLinks.youtube && (
                                            <ListItem button onClick={() => handleSocialLinkClick(userData.socialLinks.youtube)}>
                                                <ListItemIcon><YouTube /></ListItemIcon>
                                                <ListItemText primary="YouTube" secondary={userData.socialLinks.youtube} />
                                                <ChevronRight />
                                            </ListItem>
                                        )}
                                    </List>
                                ) : (
                                    <Typography color="textSecondary">No social links added</Typography>
                                )}
                            </Box>
                        )}
                        {tabValue === 2 && (
                            <Box p={2}>
                                <Typography>Map Page Coming Soon</Typography>
                            </Box>
                        )}
                        {tabValue === 3 && (
                            <Box p={2}>
                                <Typography variant="h6" fontWeight="bold">Login Status</Typography>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="subtitle2" color="textSecondary">Last Login</Typography>
                                <Typography>
                                    {userData?.lastLogin ? new Date(userData.lastLogin).toLocaleString() : 'N/A'}
                                </Typography>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="subtitle2" color="textSecondary">Last Login IP</Typography>
                                <Typography>{userData?.lastLoginIP || 'N/A'}</Typography>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="subtitle2" color="textSecondary">Last Login Device</Typography>
                                <Typography>{userData?.lastLoginDevice || 'N/A'}</Typography>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="subtitle2" color="textSecondary">Last Login Location</Typography>
                                <Typography>{userData?.lastLoginLocation || 'N/A'}</Typography>
                            </Box>
                        )}

                        {/* Logout Button */}
                        <Box p={2}>
                            <Button
                                variant="contained"
                                color="error"
                                startIcon={<ExitToApp />}
                                fullWidth
                                onClick={handleLogout}
                            >
                                Logout
                            </Button>
                        </Box>

                        {/* Followers/Following Modal */}
                        <Modal
                            open={modalOpen}
                            onClose={() => setModalOpen(false)}
                            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Box
                                sx={{
                                    bgcolor: 'background.paper',
                                    borderRadius: 2,
                                    p: 2,
                                    width: '90%',
                                    maxWidth: 500,
                                    maxHeight: '80vh',
                                    overflowY: 'auto',
                                }}
                            >
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="h6">
                                        {modalType === 'followers' ? 'Followers' : 'Following'}
                                        ({modalData.length || 0})
                                    </Typography>
                                    <IconButton onClick={() => setModalOpen(false)}><ChevronRight /></IconButton>
                                </Box>
                                <TextField
                                    fullWidth
                                    placeholder={`Search ${modalType}...`}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    sx={{ my: 2 }}
                                />
                                <List>
                                    {filteredUsers(modalData).length > 0 ? (
                                        filteredUsers(modalData).map((user) => (
                                            <ListItem
                                                key={user._id || user.id}
                                                button
                                                onClick={() => {
                                                    setModalOpen(false);
                                                    navigate(`/user-profile/${user._id || user.id}`);
                                                }}
                                            >
                                                <Avatar src={user?.profilePic || '/assets/profilePic.png'} />
                                                <ListItemText
                                                    primary={user?.full_name || user?.name || user?.username || 'Unknown User'}
                                                    secondary={user?.gender || ''}
                                                    sx={{ ml: 2 }}
                                                />
                                                <ChevronRight />
                                            </ListItem>
                                        ))
                                    ) : (
                                        <Box textAlign="center" py={4}>
                                            <Typography color="textSecondary">
                                                {modalType === 'followers' ? 'No followers found' : 'No following found'}
                                            </Typography>
                                        </Box>
                                    )}
                                </List>
                            </Box>
                        </Modal>
                    </Box>
                </Container>
            </Box>
            <Footer />
        </>
    );
}

export default ProfileScreen;