import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './LoginScreen.css';
import ForgotPasswordModal from './ForgotPasswordModal';
import Footer from './footer';
import Header from './Header';

class WebAnalyticsService {
  static trackInstall() {
    const urlParams = new URLSearchParams(window.location.search);
    const installData = {
      type: 'web_install',
      installSource: this.getInstallSource(),
      utmSource: urlParams.get('utm_source'),
      utmMedium: urlParams.get('utm_medium'),
      utmCampaign: urlParams.get('utm_campaign'),
      utmContent: urlParams.get('utm_content'),
      utmTerm: urlParams.get('utm_term'),
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      platform: 'web',
      browser: this.getBrowserInfo(),
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
      timestamp: new Date().toISOString(),
    };

    // Save to localStorage to avoid duplicate tracking
    const tracked = localStorage.getItem('web_install_tracked');
    if (!tracked) {
      this.sendToBackend(installData);
      localStorage.setItem('web_install_tracked', 'true');
      localStorage.setItem('install_source', JSON.stringify(installData));
    }

    return installData;
  }

  static getInstallSource() {
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    const referrer = document.referrer;

    if (utmSource) {
      return utmSource;
    } else if (referrer) {
      // Parse referrer to determine source
      if (referrer.includes('facebook.com') || referrer.includes('fb.com')) {
        return 'facebook';
      } else if (referrer.includes('google.com')) {
        return 'google';
      } else if (referrer.includes('instagram.com')) {
        return 'instagram';
      } else if (referrer.includes('twitter.com')) {
        return 'twitter';
      } else if (referrer.includes('linkedin.com')) {
        return 'linkedin';
      } else {
        return 'referral';
      }
    } else {
      return 'direct';
    }
  }

  static getBrowserInfo() {
    const userAgent = navigator.userAgent;
    let browser = 'unknown';
    
    if (userAgent.includes('Chrome')) browser = 'chrome';
    else if (userAgent.includes('Firefox')) browser = 'firefox';
    else if (userAgent.includes('Safari')) browser = 'safari';
    else if (userAgent.includes('Edge')) browser = 'edge';
    
    return browser;
  }

  static async sendToBackend(data) {
    try {
      await axios.post('https://yoketrip.in/api/analytics/track-web-install', data);
    } catch (error) {
      console.error('Error sending web analytics:', error);
    }
  }

  static trackLogin(userId, method = 'email') {
    const installData = JSON.parse(localStorage.getItem('install_source') || '{}');
    
    const loginData = {
      type: 'web_login',
      userId,
      loginMethod: method,
      ...installData,
      timestamp: new Date().toISOString(),
    };

    this.sendToBackend(loginData);
  }

  static trackPageView(pageName) {
    const data = {
      type: 'web_page_view',
      page: pageName,
      url: window.location.href,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
    };

    this.sendToBackend(data);
  }
}   

const LoginScreen = (props) => {
  const { 
    isLoggedIn, 
    setIsLoggedIn, 
    handleNavClick, 
    toggleDrawer, 
    handleLogout, 
    isChatRoute 
  } = props;
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const baseUrl = 'https://yoketrip.in';

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
    WebAnalyticsService.trackInstall();
    WebAnalyticsService.trackPageView('login');
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem('auth_token'));
    };
    window.addEventListener('storage', checkAuth);
    checkAuth();
    return () => window.removeEventListener('storage', checkAuth);
  }, [setIsLoggedIn]);

  useEffect(() => {
    const loadSavedCredentials = async () => {
      const savedEmail = localStorage.getItem('remembered_email');
      const savedPassword = localStorage.getItem('remembered_password');
      if (savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      }

      const savedEmails = JSON.parse(localStorage.getItem('email_suggestions') || '[]');
      setEmailSuggestions(savedEmails);
    };
    loadSavedCredentials();
  }, []);

  const saveCredentials = async () => {
    if (rememberMe) {
      localStorage.setItem('remembered_email', email.trim());
      localStorage.setItem('remembered_password', password.trim());
      await saveEmailToSuggestions(email.trim());
    } else {
      localStorage.removeItem('remembered_email');
      localStorage.removeItem('remembered_password');
    }
  };

  const saveEmailToSuggestions = async (email) => {
    if (!email) return;
    const emails = JSON.parse(localStorage.getItem('email_suggestions') || '[]');
    if (!emails.includes(email)) {
      emails.push(email);
      if (emails.length > 5) emails.shift();
      localStorage.setItem('email_suggestions', JSON.stringify(emails));
      setEmailSuggestions(emails);
    }
  };

  const login = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Email and password are required');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await axios.post(
        `${baseUrl}/api/auth/login`,
        { 
          luseremail: email.trim(), 
          lpassword: password.trim() 
        },
        { 
          headers: { 
            'Content-Type': 'application/json' 
          } 
        }
      );

      if (response.data.success) {
        const userId = response.data.userId || 'mock_user_id';
        const token = response.data.token || 'mock_token';
        
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_id', userId);
        await saveCredentials();
        
        // Track login analytics
        WebAnalyticsService.trackLogin(userId, 'email');
        
        toast.success('Logged in successfully!');
        
        // Get redirect URL from query params or use default
        const queryParams = new URLSearchParams(location.search);
        const redirectUrl = queryParams.get('redirect') || '/#home';
        
        console.log('Redirecting to:', redirectUrl);

        // Use window.location.href instead of navigate
        window.location.href = redirectUrl;
        
      } else {
        setErrorMessage(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Full error details:', {
        message: error.message,
        response: error.response?.data,
        config: error.config
      });
      
      setErrorMessage(
        error.response?.data?.message || 
        'Invalid request. Please check your email and password format.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = () => {
    window.location.href = '/register';
  };

  const handleQuickDemo = () => {
    setEmail('demo@yoketrip.com');
    setPassword('demo123');
    toast.info('Demo credentials filled! Click Sign in to continue.');
  };

  return (
    <>
      <Header {...props} />
      
      {/* Main Login Container */}
      <div className="login-screen">
        <div className="login-background">
          {/* Background Animation Elements */}
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
            <div className="shape shape-4"></div>
          </div>
          
          {/* Login Content */}
          <div className="login-content">
            <div className="login-card">
              {/* Header Section */}
              <div className="login-header">
                <div className="logo-container">
                  <span className="logo-icon">✈️</span>
                  <h1 className="logo-text">YokeTrip</h1>
                </div>
                <h2 className="welcome-title">Welcome Back!</h2>
                <p className="welcome-subtitle">Sign in to continue your journey with us</p>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {errorMessage}
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={login} className="login-form">
                {/* Email Input */}
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    <span className="label-icon">📧</span>
                    Email Address
                  </label>
                  <div className="input-wrapper">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setShowSuggestions(e.target.value.length > 0);
                      }}
                      onFocus={() => setShowSuggestions(email.length > 0)}
                      className="form-input"
                      placeholder="Enter your email address"
                      required
                    />

                  </div>
                  
                  {/* Email Suggestions */}
                  {showSuggestions && emailSuggestions.length > 0 && (
                    <div className="suggestions-dropdown">
                      {emailSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="suggestion-item"
                          onClick={() => {
                            setEmail(suggestion);
                            setShowSuggestions(false);
                          }}
                        >
                          <span className="suggestion-icon">👤</span>
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Password Input */}
                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    <span className="label-icon">🔒</span>
                    Password
                  </label>
                  <div className="input-wrapper">
                    <input
                      id="password"
                      type={isPasswordVisible ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-input"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                      className="password-toggle"
                      aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                    >
                      <span className="toggle-icon">
                        {isPasswordVisible ? '👁️' : '👁️‍🗨️'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Form Options */}
                <div className="form-options">
                  
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="forgot-password-link"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="action-buttons">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`login-button ${isLoading ? 'loading' : ''}`}
                  >
                    {isLoading ? (
                      <>
                        <div className="button-spinner"></div>
                        Signing In...
                      </>
                    ) : (
                      <>
                        <span className="button-icon">🚀</span>
                        Sign In
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCreateAccount}
                    className="register-button"
                  >
                    <span className="button-icon">👤</span>
                    Create New Account
                  </button>

                </div>
              </form>

              {/* Additional Features */}
              <div className="login-features">
                <div className="feature-item">
                  <span className="feature-icon">🔐</span>
                  <span className="feature-text">Secure Login</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">⚡</span>
                  <span className="feature-text">Fast & Reliable</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🌍</span>
                  <span className="feature-text">Global Access</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />
        )}

        {/* Toast Notifications */}
        <ToastContainer 
          position="top-center"
          autoClose={3000}
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

export default LoginScreen;