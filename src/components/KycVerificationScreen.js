// src/components/KycVerificationScreen.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Header from './Header'; // Adjust path if needed
import Footer from './footer'; // Adjust path if needed

const KycVerificationScreen = ( props) => {
  const { 
    isLoggedIn, 
    setIsLoggedIn, 
    handleNavClick, 
    toggleDrawer, 
    handleLogout, 
    isChatRoute ,
  } = props;
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    panNumber: '',
    aadhaarNumber: '',
    countryCode: '+91',
  });
  const [files, setFiles] = useState({
    aadhaarFront: null,
    aadhaarBack: null,
    panCard: null,
    selfieWithAadhaar: null,
  });
  const [kycStatus, setKycStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingStatus, setIsFetchingStatus] = useState(false);
  const [errors, setErrors] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const baseUrl = 'https://yoketrip.in';
  const countryCodes = ['+91', '+1', '+44', '+971'];
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchKycStatus();
  }, []);
  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem('auth_token'));
    };
    window.addEventListener('storage', checkAuth);
    checkAuth();
    return () => window.removeEventListener('storage', checkAuth);
  }, [setIsLoggedIn]);

  const fetchKycStatus = async () => {
    setIsFetchingStatus(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await axios.get(`${baseUrl}/api/kyc/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (response.status === 200) {
        setKycStatus(response.data.status);
      }
    } catch (e) {
      console.error('KYC status error:', e);
      toast.error('Failed to fetch KYC status');
    } finally {
      setIsFetchingStatus(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setFiles({ ...files, [field]: file });
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Required';
    if (formData.mobile.length !== 10) newErrors.mobile = '10 digits required';
    if (formData.panNumber.length !== 10) newErrors.panNumber = '10 characters required';
    if (formData.aadhaarNumber.replace(/\s/g, '').length !== 12) newErrors.aadhaarNumber = '12 digits required';
    if (!files.aadhaarFront) newErrors.aadhaarFront = 'Required';
    if (!files.aadhaarBack) newErrors.aadhaarBack = 'Required';
    if (!files.panCard) newErrors.panCard = 'Required';
    if (!files.selfieWithAadhaar) newErrors.selfieWithAadhaar = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitKyc = async () => {
    if (!validateForm()) {
      toast.error('Please fill all required fields and upload documents');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Session expired. Please login again.');
        return;
      }

      const form = new FormData();
      form.append('fullName', formData.fullName.trim());
      form.append('mobile', `${formData.countryCode}${formData.mobile.trim()}`);
      form.append('panNumber', formData.panNumber.trim());
      form.append('aadhaarNumber', formData.aadhaarNumber.replace(/\s/g, ''));
      form.append('aadhaarFront', files.aadhaarFront);
      form.append('aadhaarBack', files.aadhaarBack);
      form.append('panCard', files.panCard);
      form.append('selfieWithAadhaar', files.selfieWithAadhaar);

      const response = await axios.post(`${baseUrl}/api/kyc/submit`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        toast.success('KYC submitted successfully!');
        await fetchKycStatus();
        navigate('/');
      } else {
        toast.error(response.data.message || 'KYC submission failed');
      }
    } catch (e) {
      console.error('Error:', e);
      toast.error(`Error: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderImagePicker = (label, field, cameraOnly = false) => (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <div className="flex items-center p-3 border border-gray-300 rounded-lg bg-gray-100">
        <i className="material-icons text-blue-500 mr-2">upload_file</i>
        <span className="flex-1 truncate text-gray-600">
          {files[field]?.name || 'No file chosen'}
        </span>
        <input
          type="file"
          accept="image/*"
          capture={cameraOnly ? 'environment' : undefined}
          className="hidden"
          id={field}
          onChange={(e) => handleFileChange(e, field)}
        />
        <label htmlFor={field} className="text-blue-500 cursor-pointer">
          Choose
        </label>
      </div>
      {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
    </div>
  );

  const renderStatusCard = () => {
    const statusInfo = {
      pending: {
        message: 'Your KYC is under review.',
        icon: 'hourglass_top',
        color: 'text-orange-500',
      },
      verified: {
        message: 'Your KYC is verified!',
        icon: 'verified_user',
        color: 'text-green-500',
      },
      rejected: {
        message: 'Your KYC was rejected. Please resubmit.',
        icon: 'error',
        color: 'text-red-500',
      },
    }[kycStatus] || {
      message: 'No KYC information found.',
      icon: 'info',
      color: 'text-gray-500',
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <i className={`material-icons text-5xl ${statusInfo.color}`}>{statusInfo.icon}</i>
        <p className={`mt-4 text-lg ${statusInfo.color}`}>{statusInfo.message}</p>
        {kycStatus === 'rejected' && (
          <button
            className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
            onClick={() => setKycStatus(null)}
          >
            Resubmit KYC
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      <Header
        {...props}
      />
      <div className="min-h-screen bg-gray-100">
        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {isFetchingStatus ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-orange-500"></div>
            </div>
          ) : kycStatus ? (
            <div className="flex justify-center items-center min-h-[80vh]">
              {renderStatusCard()}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleInputChange}
                    className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {countryCodes.map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>
                  <div className="flex-1">
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Mobile Number *"
                      maxLength="10"
                    />
                    {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                  </div>
                </div>
                <div>
                  <input
                    type="text"
                    name="panNumber"
                    value={formData.panNumber}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 uppercase"
                    placeholder="PAN Number *"
                    maxLength="10"
                  />
                  {errors.panNumber && <p className="text-red-500 text-xs mt-1">{errors.panNumber}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    name="aadhaarNumber"
                    value={formData.aadhaarNumber}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Aadhaar Number *"
                    maxLength="14"
                  />
                  {errors.aadhaarNumber && <p className="text-red-500 text-xs mt-1">{errors.aadhaarNumber}</p>}
                </div>
                {renderImagePicker('Aadhaar Card Front', 'aadhaarFront')}
                {renderImagePicker('Aadhaar Card Back', 'aadhaarBack')}
                {renderImagePicker('PAN Card Image', 'panCard')}
                {renderImagePicker('Selfie with Aadhaar', 'selfieWithAadhaar', true)}
                <button
                  onClick={submitKyc}
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:bg-orange-300 flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                  ) : (
                    'Submit KYC'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default KycVerificationScreen;