import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './RegisterScreen.css';
import Header from './Header';
import Footer from './footer';

const RegisterScreen = (props) => {
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dob: '',
    gender: 'Male',
    country: 'IN',
    referral: '',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Check device type
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    if (ref) {
      setFormData(prev => ({ ...prev, referral: ref }));
    }
  }, [location]);

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

  // Password strength calculator
  useEffect(() => {
    if (formData.password) {
      let strength = 0;
      if (formData.password.length >= 8) strength += 20;
      if (/[A-Z]/.test(formData.password)) strength += 20;
      if (/[a-z]/.test(formData.password)) strength += 20;
      if (/\d/.test(formData.password)) strength += 20;
      if (/[@$!%*?&]/.test(formData.password)) strength += 20;
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [formData.password]);

  const countries = [
    { code: 'IN', name: 'India', flag: '🇮🇳' },
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    { code: 'CN', name: 'China', flag: '🇨🇳' },
    { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
    { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
    { code: 'RU', name: 'Russia', flag: '🇷🇺' },
    { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
    { code: 'IT', name: 'Italy', flag: '🇮🇹' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸' },
    { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
    { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
    { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
    { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
    { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  ];

  const genders = [
    { value: 'Male', label: '👨 Male' },
    { value: 'Female', label: '👩 Female' },
    { value: 'Transgender', label: '⚧ Transgender' },
    { value: 'Other', label: '❓ Other' },
    { value: 'Not to say', label: '🙊 Prefer not to say' }
  ];

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 40) return '#ef4444';
    if (passwordStrength <= 60) return '#f59e0b';
    if (passwordStrength <= 80) return '#10b981';
    return '#059669';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 40) return 'Weak';
    if (passwordStrength <= 60) return 'Fair';
    if (passwordStrength <= 80) return 'Good';
    return 'Strong';
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Please enter your full name';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters long';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Please enter your email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = 'Please enter your phone number';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Please enter your password';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) {
      newErrors.password = 'Password does not meet requirements';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Date of birth validation
    if (!formData.dob) {
      newErrors.dob = 'Please select your date of birth';
    } else {
      const today = new Date();
      const dob = new Date(formData.dob);
      const age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      
      if (age < 18 || (age === 18 && monthDiff < 0) || 
          (age === 18 && monthDiff === 0 && today.getDate() < dob.getDate())) {
        newErrors.dob = 'You must be at least 18 years old';
      }
    }

    // Terms validation
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms & conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await axios.post(
        'https://yoketrip.in/api/auth/register',
        {
          full_name: formData.fullName.trim(),
          email: formData.email.toLowerCase(),
          phone: formData.phone,
          password: formData.password,
          gender: formData.gender,
          dob: formData.dob,
          country: formData.country,
          referral: formData.referral || '',
          accept_terms: formData.acceptTerms.toString(),
          registration_source: 'web',
          platform: 'web',
        },
        { 
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success('Registration successful! Redirecting to verification...');
        setTimeout(() => {
          navigate('/otp-verification', { 
            state: { 
              email: formData.email,
              phone: formData.phone 
            } 
          });
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMsg = error.response?.data?.message ||
        error.message ||
        'Network error. Please check your connection and try again.';
      
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleQuickFill = () => {
    setFormData({
      fullName: 'Demo User',
      email: 'demo@yoketrip.com',
      phone: '9876543210',
      password: 'Demo@123',
      confirmPassword: 'Demo@123',
      dob: '1990-01-01',
      gender: 'Male',
      country: 'IN',
      referral: '',
      acceptTerms: true,
    });
    toast.info('Demo data filled! You can now test the registration.');
  };

  const PasswordRequirement = ({ text, isValid }) => (
    <div className="password-req-item">
      <span className={`req-indicator ${isValid ? 'valid' : 'invalid'}`}>
        {isValid ? '✓' : '✗'}
      </span>
      <span className={`req-text ${isValid ? 'valid' : 'invalid'}`}>
        {text}
      </span>
    </div>
  );

  return (
    <>
      <Header {...props} />
      
      {/* Main Register Container */}
      <div className="register-screen">
        <div className="register-background">
          {/* Background Animation Elements */}
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
            <div className="shape shape-4"></div>
          </div>
          
          {/* Register Content */}
          <div className="register-content">
            <div className="register-card">
              {/* Header Section */}
              <div className="register-header">
                <div className="logo-container">
                  <span className="logo-icon">✈️</span>
                  <h1 className="logo-text">YokeTrip</h1>
                </div>
                <h2 className="welcome-title">Start Your Journey!</h2>
                <p className="welcome-subtitle">Create your account and explore the world with us</p>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {errorMessage}
                </div>
              )}

              {/* Register Form */}
              <form onSubmit={handleRegister} className="register-form">
                <div className="form-grid">
                  {/* Full Name */}
                  <div className="form-group">
                    <label htmlFor="fullName" className="form-label">
                      <span className="label-icon">👤</span>
                      Full Name *
                    </label>
                    <div className="input-wrapper">
                      <input
                        id="fullName"
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className={`form-input ${errors.fullName ? 'error' : ''}`}
                        placeholder="Enter your full name"
                      />
                    </div>
                    {errors.fullName && (
                      <span className="error-text">{errors.fullName}</span>
                    )}
                  </div>

                  {/* Email */}
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      <span className="label-icon">📧</span>
                      Email Address *
                    </label>
                    <div className="input-wrapper">
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`form-input ${errors.email ? 'error' : ''}`}
                        placeholder="Enter your email address"
                      />
                    </div>
                    {errors.email && (
                      <span className="error-text">{errors.email}</span>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">
                      <span className="label-icon">📱</span>
                      Phone Number *
                    </label>
                    <div className="input-wrapper">
                      <input
                        id="phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`form-input ${errors.phone ? 'error' : ''}`}
                        placeholder="Enter 10-digit phone number"
                        maxLength="10"
                      />
                    </div>
                    {errors.phone && (
                      <span className="error-text">{errors.phone}</span>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div className="form-group">
                    <label htmlFor="dob" className="form-label">
                      <span className="label-icon">🎂</span>
                      Date of Birth *
                    </label>
                    <div className="input-wrapper">
                      <input
                        id="dob"
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        className={`form-input ${errors.dob ? 'error' : ''}`}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    {errors.dob && (
                      <span className="error-text">{errors.dob}</span>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="form-group">
                    <label htmlFor="gender" className="form-label">
                      <span className="label-icon">⚧</span>
                      Gender *
                    </label>
                    <div className="input-wrapper">
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="form-select"
                      >
                        {genders.map((gender) => (
                          <option key={gender.value} value={gender.value}>
                            {gender.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Country */}
                  <div className="form-group">
                    <label htmlFor="country" className="form-label">
                      <span className="label-icon">🌍</span>
                      Country *
                    </label>
                    <div className="input-wrapper">
                      <select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="form-select"
                      >
                        {countries.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.flag} {country.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Password Section */}
                <div className="password-section">
                  {/* Password */}
                  <div className="form-group">
                    <label htmlFor="password" className="form-label">
                      <span className="label-icon">🔒</span>
                      Password *
                    </label>
                    <div className="input-wrapper">
                      <input
                        id="password"
                        type={isPasswordVisible ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`form-input ${errors.password ? 'error' : ''}`}
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        className="password-toggle"
                      >
                        <span className="toggle-icon">
                          {isPasswordVisible ? '👁️' : '👁️‍🗨️'}
                        </span>
                      </button>
                    </div>
                    
                    {/* Password Strength Meter */}
                    {formData.password && (
                      <div className="password-strength">
                        <div className="strength-bar">
                          <div 
                            className="strength-fill"
                            style={{
                              width: `${passwordStrength}%`,
                              backgroundColor: getPasswordStrengthColor()
                            }}
                          ></div>
                        </div>
                        <span className="strength-text">
                          Strength: <strong>{getPasswordStrengthText()}</strong>
                        </span>
                      </div>
                    )}

                    {/* Password Requirements */}
                    <div className="password-requirements">
                      <PasswordRequirement
                        text="At least 8 characters"
                        isValid={formData.password.length >= 8}
                      />
                      <PasswordRequirement
                        text="One uppercase letter"
                        isValid={/[A-Z]/.test(formData.password)}
                      />
                      <PasswordRequirement
                        text="One lowercase letter"
                        isValid={/[a-z]/.test(formData.password)}
                      />
                      <PasswordRequirement
                        text="One number"
                        isValid={/\d/.test(formData.password)}
                      />
                      <PasswordRequirement
                        text="One special character (@$!%*?&)"
                        isValid={/[@$!%*?&]/.test(formData.password)}
                      />
                    </div>
                    
                    {errors.password && (
                      <span className="error-text">{errors.password}</span>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="form-group">
                    <label htmlFor="confirmPassword" className="form-label">
                      <span className="label-icon">🔒</span>
                      Confirm Password *
                    </label>
                    <div className="input-wrapper">
                      <input
                        id="confirmPassword"
                        type={isConfirmPasswordVisible ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                        className="password-toggle"
                      >
                        <span className="toggle-icon">
                          {isConfirmPasswordVisible ? '👁️' : '👁️‍🗨️'}
                        </span>
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <span className="error-text">{errors.confirmPassword}</span>
                    )}
                  </div>
                </div>

                {/* Referral Code */}
                <div className="form-group">
                  <label htmlFor="referral" className="form-label">
                    <span className="label-icon">🎁</span>
                    Referral Code (Optional)
                  </label>
                  <div className="input-wrapper">
                    <input
                      id="referral"
                      type="text"
                      name="referral"
                      value={formData.referral}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter referral code if any"
                      disabled={!!location.search.includes('ref')}
                    />
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="terms-section">
                  <label className="terms-checkbox">
                    <input
                      type="checkbox"
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={handleChange}
                      className="checkbox-input"
                    />
                    <span className="checkmark"></span>
                    <span className="terms-text">
                      I confirm that I am 18 years old or older and accept the{' '}
                      <a href="/terms" target="_blank" rel="noopener noreferrer" className="terms-link">
                        terms & conditions
                      </a>
                    </span>
                  </label>
                  {errors.acceptTerms && (
                    <span className="error-text">{errors.acceptTerms}</span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="action-buttons">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`register-button ${isLoading ? 'loading' : ''}`}
                  >
                    {isLoading ? (
                      <>
                        <div className="button-spinner"></div>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <span className="button-icon">🚀</span>
                        Create Account
                      </>
                    )}
                  </button>

          

                  <div className="login-redirect">
                    <span>Already have an account? </span>
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="login-link"
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              </form>

              {/* Security Features */}
              <div className="security-features">
                <div className="feature-item">
                  <span className="feature-icon">🔐</span>
                  <span className="feature-text">Bank-level Security</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">⚡</span>
                  <span className="feature-text">Instant Verification</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🌍</span>
                  <span className="feature-text">Global Access</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Toast Notifications */}
        <ToastContainer 
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </div>
      
      <Footer />
    </>
  );
};

export default RegisterScreen;