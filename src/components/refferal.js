// src/components/Referral.js
import React, { useState, useEffect } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import SwiperCore from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import axios from 'axios';
import Header from './Header'; // Adjust path if needed

SwiperCore.use([Navigation, Pagination]);

const Referral = (props) => {
  const { 
    isLoggedIn, 
    setIsLoggedIn, 
    handleNavClick, 
    toggleDrawer, 
    handleLogout, 
    isChatRoute 
  } = props;
  const [referralData, setReferralData] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const baseUrl = 'https://yoketrip.in';

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
    const fetchReferralData = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          setIsLoading(true);
          const response = await axios.get(`${baseUrl}/api/referral/link`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.status === 200) {
            setReferralData(response.data.data);
          }
        }
      } catch (e) {
        console.error('Error fetching referral data:', e);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchReferralList = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          setIsLoadingList(true);
          const response = await axios.get(`${baseUrl}/api/referral/list`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.status === 200) {
            setReferrals(response.data.data);
          }
        }
      } catch (e) {
        console.error('Error fetching referral list:', e);
      } finally {
        setIsLoadingList(false);
      }
    };

    fetchReferralData();
    fetchReferralList();
  }, []);

  const handleShare = () => {
    if (referralData) {
      const shareUrl = referralData.fallbackLink || referralData.referralLink;
      const shareText = referralData.shareMessage.replace(referralData.referralLink, shareUrl);
      navigator.share({
        title: 'YokeTrip Referral',
        text: shareText,
        url: shareUrl,
      });
    }
  };

  return (
    <>
      <Header
         {...props}
      />
      <div className="min-h-screen bg-gray-100 pt-16">
        {/* Main Content */}
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
          <Swiper
            spaceBetween={20}
            slidesPerView={1}
            pagination={{ clickable: true }}
            navigation={true}
            className="mb-6"
          >
            {/* Referral Code Section */}
            <SwiperSlide>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Your Referral Code</h2>
                {isLoading ? (
                  <div className="flex justify-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-blue-600">{referralData?.referralId || 'N/A'}</span>
                      <CopyToClipboard text={referralData?.referralId || ''} onCopy={() => setCopied(true)}>
                        <button className="text-blue-500 hover:text-blue-700">
                          <i className="material-icons">content_copy</i>
                        </button>
                      </CopyToClipboard>
                    </div>
                    {copied && <p className="text-green-500 mb-4">Copied to clipboard!</p>}
                    <p className="text-gray-600 mb-4">
                      Earn ₹100 when your friends sign up using your referral code and subscribe to any paid plan!
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h3 className="text-lg font-semibold mb-2">Share Your Link</h3>
                      <p className="text-gray-500 text-sm truncate">{referralData?.fallbackLink || referralData?.referralLink || 'N/A'}</p>
                      <button
                        onClick={handleShare}
                        className="mt-4 w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <i className="material-icons align-middle mr-2">share</i> Share Referral Link
                      </button>
                    </div>
                  </>
                )}
              </div>
            </SwiperSlide>

            {/* Referral List Section */}
            <SwiperSlide>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Your Referrals</h2>
                {isLoadingList ? (
                  <div className="flex justify-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : referrals.length === 0 ? (
                  <p className="text-gray-500 text-center">No referrals yet. Share your link to earn rewards!</p>
                ) : (
                  <div className="flex overflow-x-auto space-x-4 pb-4">
                    {referrals.map((referral, index) => (
                      <div
                        key={index}
                        className="flex-shrink-0 w-40 bg-white rounded-lg shadow-md p-4"
                      >
                        <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-2">
                          <img
                            src={referral.refereeAvatar || '/assets/default_avatar.png'}
                            alt="Referee"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-center font-semibold truncate">{referral.refereeName || 'Unknown'}</p>
                        <p className="text-center text-sm text-gray-500 truncate">{referral.refereeEmail || ''}</p>
                        <div
                          className={`mt-2 text-center text-sm py-1 rounded-full ${
                            referral.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                          }`}
                        >
                          {referral.status === 'completed' ? '₹100 Earned' : 'Pending'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </SwiperSlide>
          </Swiper>

          {/* How It Works Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">How it works:</h2>
            <ul className="space-y-2">
              {[
                'Share your referral link with friends',
                'They sign up using your link',
                'You get ₹100 in locked balance',
                'When they subscribe, ₹100 moves to available balance',
              ].map((step, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Referral;