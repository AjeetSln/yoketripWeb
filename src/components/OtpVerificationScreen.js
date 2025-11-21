import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './OtpVerificationScreen.css';

const OtpVerificationScreen = () => {
  const { state } = useLocation();
  const email = state?.email || '';
  const navigate = useNavigate();

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const baseUrl = 'https://yoketrip.in';

  useEffect(() => {
    let timer;
    if (!canResend) {
      timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [canResend]);

  const verifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await axios.post(
        `${baseUrl}/api/auth/verify-otp`,
        { email, otp: otp.trim() },
        { headers: { 'Content-Type': 'application/json' } }
      );

      setIsLoading(false);
      if (response.status === 201) {
        showSuccessDialog();
      } else {
        setErrorMessage(response.data.message || 'Verification failed');
      }
    } catch (error) {
      setIsLoading(false);
      setErrorMessage('⚠️ Verification failed. Please try again.');
      console.error('Error:', error);
    }
  };

  const resendOtp = async () => {
    setIsResending(true);
    setErrorMessage(null);

    try {
      const response = await axios.post(
        `${baseUrl}/api/auth/resend-otp`,
        { email },
        { headers: { 'Content-Type': 'application/json' } }
      );

      setIsResending(false);
      if (response.status === 200) {
        setCanResend(false);
        setResendTimer(30);
        alert('OTP resent successfully!');
      } else {
        setErrorMessage(response.data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      setIsResending(false);
      setErrorMessage('⚠️ Failed to resend OTP. Try again later.');
      console.error('Error:', error);
    }
  };

  const showSuccessDialog = () => {
    alert('Your account has been successfully verified.');
    navigate('/login');
  };

  return (
    <div className="otp-container">
      <h2 className="title">Verify Your Email</h2>
      <p className="subtitle">
        We sent a 6-digit code to <span className="font-bold text-primary">{email}</span>
      </p>

      {errorMessage && (
        <div className="error-message">{errorMessage}</div>
      )}

      <form onSubmit={verifyOtp} className="form">
        <div className="input-container">
          <label className="label">Enter OTP</label>
          <div className="relative">
            <span className="input-icon">
              <span className="material-icons">lock</span>
            </span>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength="6"
              className="input"
              placeholder="Enter 6-digit OTP"
              style={{ letterSpacing: '2px' }}
            />
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isLoading}
            className={`verify-button ${isLoading ? 'disabled' : ''}`}
          >
            {isLoading ? (
              <svg className="spinner" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              'Verify'
            )}
          </button>
        </div>

        <div className="text-center mt-4">
          <p className="text-gray">Didn't receive the code?</p>
          <button
            type="button"
            onClick={resendOtp}
            disabled={!canResend || isResending}
            className={`resend-button ${canResend && !isResending ? '' : 'disabled'}`}
          >
            {isResending ? (
              <svg className="spinner" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : canResend ? (
              'Resend OTP'
            ) : (
              `Resend in ${resendTimer} seconds`
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OtpVerificationScreen;