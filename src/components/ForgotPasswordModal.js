import React, { useState } from 'react';
import axios from 'axios';
import './ForgotPasswordModal.css';

const ForgotPasswordModal = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [storedEmail, setStoredEmail] = useState(null);
  const baseUrl = 'https://yoketrip.in';

  const validateEmail = (value) => {
    if (!value) return 'Email is required';
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) return 'Enter a valid email';
    return null;
  };

  const validateOtp = (value) => {
    if (!value) return 'OTP is required';
    if (value.length !== 6) return 'OTP must be 6 digits';
    return null;
  };

  const validatePassword = (value) => {
    if (!value) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  const validateConfirmPassword = (value) => {
    if (!value) return 'Please confirm password';
    if (value !== newPassword) return 'Passwords do not match';
    return null;
  };

  const sendOtp = async () => {
    const emailError = validateEmail(email);
    if (emailError) {
      setErrorMessage(emailError);
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const response = await axios.post(
        `${baseUrl}/api/auth/forgot-password`,
        { email: email.trim() },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setIsLoading(false);
      if (response.status === 200 && response.data.success) {
        setSuccessMessage('OTP sent to your email');
        setStoredEmail(email.trim());
        setCurrentStep(1);
      } else {
        setErrorMessage(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      setIsLoading(false);
      setErrorMessage('Failed to connect to server');
      console.error('Error:', error);
    }
  };

  const verifyOtp = async () => {
    const otpError = validateOtp(otp);
    if (otpError) {
      setErrorMessage(otpError);
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const response = await axios.post(
        `${baseUrl}/api/auth/verify-reset-otp`,
        { email: storedEmail || email.trim(), otp: otp.trim() },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setIsLoading(false);
      if (response.status === 200 && response.data.success) {
        setSuccessMessage('OTP verified successfully');
        setCurrentStep(2);
      } else {
        setErrorMessage(response.data.message || 'Invalid or expired OTP. Please try again.');
      }
    } catch (error) {
      setIsLoading(false);
      setErrorMessage('Failed to verify OTP. Please try again.');
      console.error('Error:', error);
    }
  };

  const resetPassword = async () => {
    const passwordError = validatePassword(newPassword);
    const confirmPasswordError = validateConfirmPassword(confirmPassword);
    if (passwordError) {
      setErrorMessage(passwordError);
      return;
    }
    if (confirmPasswordError) {
      setErrorMessage(confirmPasswordError);
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const response = await axios.post(
        `${baseUrl}/api/auth/reset-password`,
        {
          email: storedEmail || email.trim(),
          otp: otp.trim(),
          newPassword: newPassword.trim(),
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setIsLoading(false);
      if (response.status === 200 && response.data.success) {
        setSuccessMessage('Password reset successfully!');
        setTimeout(() => onClose(), 2000);
      } else {
        setErrorMessage(response.data.message || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      setIsLoading(false);
      setErrorMessage('Failed to reset password. Please try again.');
      console.error('Error:', error);
    }
  };

  const handleStepContinue = () => {
    switch (currentStep) {
      case 0:
        sendOtp();
        break;
      case 1:
        verifyOtp();
        break;
      case 2:
        resetPassword();
        break;
      default:
        break;
    }
  };

  const steps = [
    {
      title: 'Enter Email',
      content: (
        <div className="modal-input-container">
          <label className="modal-label">Email</label>
          <div className="modal-relative">
            <span className="modal-input-icon">
              <span className="material-icons">email</span>
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="modal-input"
              placeholder="Enter your email"
            />
          </div>
        </div>
      ),
    },
    {
      title: 'Verify OTP',
      content: (
        <div className="modal-input-container">
          <label className="modal-label">OTP</label>
          <div className="modal-relative">
            <span className="modal-input-icon">
              <span className="material-icons">lock</span>
            </span>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength="6"
              className="modal-input"
              placeholder="Enter OTP"
            />
          </div>
          <button
            type="button"
            onClick={sendOtp}
            className="modal-resend-button"
          >
            Resend OTP
          </button>
        </div>
      ),
    },
    {
      title: 'New Password',
      content: (
        <div className="modal-input-container">
          <label className="modal-label">New Password</label>
          <div className="modal-relative">
            <span className="modal-input-icon">
              <span className="material-icons">lock</span>
            </span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="modal-input"
              placeholder="Enter new password"
            />
          </div>
          <label className="modal-label">Confirm Password</label>
          <div className="modal-relative">
            <span className="modal-input-icon">
              <span className="material-icons">lock</span>
            </span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="modal-input"
              placeholder="Confirm new password"
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Reset Password</h2>
          <button onClick={onClose} className="modal-close-button">
            <span className="material-icons">close</span>
          </button>
        </div>
        <div className="modal-body">
          <h3 className="modal-step-title">{steps[currentStep].title}</h3>
          <div className="modal-step-content">{steps[currentStep].content}</div>
          {errorMessage && <p className="modal-error-message">{errorMessage}</p>}
          {successMessage && <p className="modal-success-message">{successMessage}</p>}
        </div>
        <button
          onClick={handleStepContinue}
          disabled={isLoading}
          className={`modal-continue-button ${isLoading ? 'disabled' : ''}`}
        >
          {isLoading ? (
            <svg className="modal-spinner" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          ) : (
            currentStep === 2 ? 'Reset Password' : 'Continue'
          )}
        </button>
        <div className="modal-stepper">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`modal-step-indicator ${index <= currentStep ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;