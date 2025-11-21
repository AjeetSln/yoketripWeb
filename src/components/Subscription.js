// src/components/Subscription.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import addDays from 'date-fns/addDays';
import Header from './Header';

const Subscription = (props) => {
  const { 
    isLoggedIn, 
    setIsLoggedIn, 
    handleNavClick, 
    toggleDrawer, 
    handleLogout, 
    isChatRoute 
  } = props;
  
  const [currentPlan, setCurrentPlan] = useState('Loading...');
  const [expiresAt, setExpiresAt] = useState(null);
  const [daysRemaining, setDaysRemaining] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userFullName, setUserFullName] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Double click prevention के लिए refs
  const isPaymentInProgress = useRef(false);
  const razorpayInstance = useRef(null);
  
  const baseUrl = 'https://yoketrip.in';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Load Razorpay script
    const loadRazorpayScript = () => {
      if (window.Razorpay) {
        setIsRazorpayLoaded(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => setIsRazorpayLoaded(true);
      script.onerror = () => {
        toast.error('Failed to load Razorpay script. Please try again.');
        setIsRazorpayLoaded(false);
      };
      document.body.appendChild(script);
    };

    loadRazorpayScript();
    fetchCurrentPlan();
    fetchTransactions();
    fetchCurrentUserId();

    return () => {
      // Cleanup - close any open Razorpay instance
      if (razorpayInstance.current) {
        razorpayInstance.current.close();
      }
    };
  }, []);

  const fetchCurrentPlan = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No authentication token found');
      const response = await axios.get(`${baseUrl}/api/users/subscription`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setCurrentPlan(response.data.data.plan || 'Free');
        setExpiresAt(response.data.data.expiresAt ? new Date(response.data.data.expiresAt) : null);
        setDaysRemaining(response.data.data.daysRemaining);
        setIsLoading(false);
      }
    } catch (e) {
      setCurrentPlan('Free');
      setExpiresAt(null);
      setDaysRemaining(null);
      setIsLoading(false);
      toast.error('An error occurred. Please check your connection.');
    }
  };

  const fetchCurrentUserId = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No authentication token found');
      const response = await axios.get(`${baseUrl}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (response.status === 200) {
        setUserId(response.data._id || response.data.id);
        setUserEmail(response.data.email);
        setUserPhone(response.data.phone);
        setUserFullName(response.data.full_name);
      }
    } catch (e) {
      console.error('Error fetching user ID:', e);
      toast.error('Failed to fetch user profile');
    }
  };

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No authentication token found');
      const response = await axios.get(`${baseUrl}/api/users/subscription/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setTransactions(response.data.data || []);
      }
    } catch (e) {
      toast.error('An error occurred. Please check your connection.');
    }
  };

  const upgradePlan = async (plan) => {
    // Double click prevention
    if (isPaymentInProgress.current) {
      toast.info('Payment is already in progress. Please wait...');
      return;
    }

    if (isProcessing || !isRazorpayLoaded) {
      toast.error(isProcessing ? 'Processing, please wait...' : 'Razorpay is not loaded yet.');
      return;
    }

    if (!userPhone || !userEmail) {
      toast.error('Please update your phone and email in profile');
      return;
    }

    // Set payment in progress flag
    isPaymentInProgress.current = true;
    setIsProcessing(true);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No authentication token found');

      const planToSend =
        plan === 'Super' && currentPlan === 'Basic' && expiresAt && expiresAt > new Date()
          ? 'SuperUpgrade'
          : plan;

      const response = await axios.post(
        `${baseUrl}/api/users/subscription/payment-intent`,
        { plan: planToSend },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      if (response.status === 200 && response.data.success) {
        const razorpayData = response.data.data.razorpaySubscription;
        if (!razorpayData?.orderId || !razorpayData?.amount) {
          throw new Error('Invalid Razorpay response: missing orderId or amount');
        }

        setSelectedPlan(plan);
        setCurrentOrderId(razorpayData.orderId);

        const options = {
          key: razorpayData.key,
          order_id: razorpayData.orderId,
          amount: (razorpayData.amount * 100).toString(),
          currency: 'INR',
          name: `Yoketrip ${plan} Plan Payment`,
          description:
            plan === 'SuperUpgrade'
              ? 'One-time payment for Super Plan upgrade'
              : `One-time payment for ${plan} Plan`,
          prefill: {
            contact: userPhone,
            email: userEmail,
            name: userFullName || 'User Name',
          },
          theme: { color: '#1E88E5', backdrop_color: '#F5F7FA' },
          notes: {
            plan,
            user_id: userId || 'user_123',
            isUpgrade: plan === 'SuperUpgrade',
          },
          retry: { enabled: true, max_count: 3 },
          timeout: 300,
          modal: {
            animation: true,
            backdropclose: true,
            handle_back_button: true,
            ondismiss: handlePaymentModalClose,
          },
          handler: async (response) => {
            await handlePaymentSuccess(response);
          },
        };

        // Close any existing Razorpay instance
        if (razorpayInstance.current) {
          razorpayInstance.current.close();
        }

        // Create new Razorpay instance
        razorpayInstance.current = new window.Razorpay(options);
        razorpayInstance.current.on('payment.failed', handlePaymentError);
        razorpayInstance.current.open();
      } else {
        throw new Error(response.data.message || 'Failed to create payment intent');
      }
    } catch (e) {
      console.error('Error in upgradePlan:', e);
      toast.error(`Error: ${e.message}`);
      resetPaymentState();
    }
  };

  const handlePaymentModalClose = () => {
    // User closed the payment modal manually
    resetPaymentState();
    toast.info('Payment cancelled by user');
  };

  const resetPaymentState = () => {
    isPaymentInProgress.current = false;
    setIsProcessing(false);
    setSelectedPlan('');
    setCurrentOrderId(null);
    if (razorpayInstance.current) {
      razorpayInstance.current = null;
    }
  };

  const handlePaymentSuccess = async (response) => {
    if (!isPaymentInProgress.current) return;

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No authentication token found');
      if (!currentOrderId || !selectedPlan) throw new Error('Missing order or plan data');

      const confirmPayload = {
        paymentId: response.razorpay_payment_id,
        plan: selectedPlan === 'Super' && currentPlan === 'Basic' ? 'SuperUpgrade' : selectedPlan,
        orderId: currentOrderId,
      };

      const confirmResponse = await axios.post(
        `${baseUrl}/api/users/subscription/confirm`,
        confirmPayload,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      if (confirmResponse.status === 200 && confirmResponse.data.success) {
        toast.success(
          selectedPlan === 'Super' && currentPlan === 'Basic'
            ? 'Super plan upgrade completed!'
            : `${selectedPlan} plan payment confirmed successfully!`
        );
        await fetchCurrentPlan();
        await fetchTransactions();
      } else {
        throw new Error(confirmResponse.data.message || 'Failed to confirm payment');
      }
    } catch (e) {
      console.error('Error in handlePaymentSuccess:', e);
      toast.error('An error occurred. Please check your connection.');
      await fetchTransactions();
    } finally {
      resetPaymentState();
    }
  };

  const handlePaymentError = (response) => {
    toast.error(`Payment failed: ${response.error.description}`);
    resetPaymentState();
    fetchTransactions();
  };

  const processPlanUpgrade = async (plan) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No authentication token found');
      await axios.post(
        `${baseUrl}/api/users/subscription/free`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`${plan} plan selected. No payment needed.`);
      await fetchCurrentPlan();
    } catch (e) {
      toast.error(`Error: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelTransaction = async (transactionId) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No authentication token found');
      const response = await axios.post(
        `${baseUrl}/api/users/subscription/cancel`,
        { transactionId },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      if (response.status === 200 && response.data.success) {
        toast.success('Transaction cancelled successfully');
        await fetchTransactions();
      } else {
        throw new Error('Failed to cancel transaction');
      }
    } catch (e) {
      toast.error('An error occurred. Please check your connection.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await Promise.all([fetchCurrentPlan(), fetchTransactions(), fetchCurrentUserId()]);
    setIsLoading(false);
  };

  const isExpired = expiresAt && expiresAt < new Date();
  const showFreePlan = currentPlan === 'Free' || isExpired;
  const showBasicPlan = currentPlan === 'Free' || (currentPlan === 'Basic' && isExpired);

  return (
    <>
      <Header {...props} />
      <div className="min-h-screen bg-gray-100 px-4 py-6 sm:px-6 md:px-8 lg:px-12 pt-16">
        <div className="max-w-5xl mx-auto">
          {/* AppBar */}
          <div className="bg-blue-700 text-white text-center py-4 rounded-xl shadow-lg mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-bold">YokeTrip Subscription</h1>
            <button
              onClick={handleRefresh}
              disabled={isProcessing}
              className="mt-2 text-sm text-blue-200 hover:text-white transition-colors disabled:opacity-50"
            >
              Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-8">
              {/* Current Plan Header */}
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg bg-gradient-to-r from-blue-100 to-blue-50">
                <h2 className="text-lg sm:text-xl font-semibold text-blue-900">Your Current Plan</h2>
                <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mt-4">
                  <h3 className="text-xl sm:text-2xl font-bold text-blue-800">{currentPlan}</h3>
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-bold mt-2 sm:mt-0 ${
                      isExpired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {isExpired ? 'EXPIRED' : 'ACTIVE'}
                  </span>
                </div>
                {expiresAt && (
                  <p className={`mt-2 text-sm sm:text-base ${isExpired ? 'text-red-700' : 'text-gray-700'}`}>
                    {isExpired
                      ? `Expired on ${format(expiresAt, 'dd MMMM yyyy')}`
                      : daysRemaining
                      ? `Expires in ${daysRemaining} days`
                      : `Expires on ${format(expiresAt, 'dd MMMM yyyy')}`}
                  </p>
                )}
              </div>

              {/* Plan Selection Header */}
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Choose Your Plan</h2>

              {/* Plan Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {showFreePlan && (
                  <PlanCard
                    title="Free Plan"
                    price="₹0"
                    duration="Forever"
                    features={[
                      'Basic trip creation',
                      'Up to 3 trips per month',
                      'Standard support',
                    ]}
                    isCurrent={currentPlan === 'Free'}
                    buttonText="Select"
                    onClick={() => (currentPlan !== 'Free' ? processPlanUpgrade('Free') : null)}
                    isButtonEnabled={currentPlan !== 'Super' || isExpired}
                    isProcessing={isProcessing}
                    currentPlan={currentPlan}
                    expiresAt={expiresAt}
                    daysRemaining={daysRemaining}
                  />
                )}
                {showBasicPlan && (
                  <PlanCard
                    title="Basic Plan"
                    price="₹599"
                    duration="Per Year"
                    features={[
                      'Unlimited trip creation',
                      'Priority support',
                      'Basic analytics',
                      'Up to 10 participants per trip',
                    ]}
                    isCurrent={currentPlan === 'Basic'}
                    buttonText={currentPlan === 'Free' ? 'Subscribe' : 'Renew'}
                    onClick={() => upgradePlan('Basic')}
                    isButtonEnabled={currentPlan !== 'Super' || isExpired}
                    isProcessing={isProcessing}
                    currentPlan={currentPlan}
                    expiresAt={expiresAt}
                    daysRemaining={daysRemaining}
                  />
                )}
                <PlanCard
                  title="Super Plan"
                  price={currentPlan === 'Basic' && !isExpired ? '₹400' : '₹999'}
                  duration="Per Year"
                  features={[
                    'Unlimited trip creation',
                    '24/7 premium support',
                    'Advanced analytics',
                    'Unlimited participants',
                    'Early access to new features',
                    'Custom trip themes',
                  ]}
                  isCurrent={currentPlan === 'Super'}
                  buttonText={currentPlan === 'Free' || currentPlan === 'Basic' ? 'Subscribe' : 'Renew'}
                  onClick={() => upgradePlan('Super')}
                  isPopular={true}
                  isButtonEnabled={true}
                  isProcessing={isProcessing}
                  currentPlan={currentPlan}
                  expiresAt={expiresAt}
                  daysRemaining={daysRemaining}
                />
              </div>

              {currentPlan === 'Super' && !isExpired && (
                <p className="text-sm text-red-700 italic text-center sm:text-left">
                  Note: Downgrading from Super Plan to Basic or Free is not allowed until expiration.
                </p>
              )}

              {/* Transaction History */}
              {transactions.length > 0 && (
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Transaction History</h2>
                  <div className="space-y-4">
                    {transactions.map((txn) => {
                      const isPending = txn.status === 'pending';
                      const isFailed = txn.status === 'failed';
                      const utcDate = new Date(txn.createdAt);
                      const istDate = addDays(utcDate, 5 / 24);
                      return (
                        <div
                          key={txn._id || txn.id}
                          className="flex flex-col sm:flex-row items-start sm:items-center p-4 bg-gray-50 rounded-lg border"
                        >
                          <i
                            className={`material-icons text-lg sm:text-xl ${
                              isPending ? 'text-orange-500' : isFailed ? 'text-red-700' : 'text-green-700'
                            }`}
                          >
                            {isPending ? 'hourglass_empty' : isFailed ? 'error_outline' : 'check_circle'}
                          </i>
                          <div className="flex-1 ml-0 sm:ml-4 mt-2 sm:mt-0">
                            <p className="font-semibold text-sm sm:text-base">{`${txn.metadata.plan} Plan - ₹${txn.amount}`}</p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {`${txn.status.toUpperCase()} • ${format(istDate, 'dd MMM yyyy, hh:mm a')} IST`}
                            </p>
                          </div>
                          {isPending && (
                            <button
                              className="text-blue-500 hover:underline text-sm sm:text-base mt-2 sm:mt-0 disabled:opacity-50"
                              onClick={() => cancelTransaction(txn._id || txn.id)}
                              disabled={isProcessing}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const PlanCard = ({
  title,
  price,
  duration,
  features,
  isCurrent,
  buttonText,
  onClick,
  isPopular = false,
  isButtonEnabled = true,
  isProcessing,
  currentPlan,
  expiresAt,
  daysRemaining,
}) => {
  const isExpired = expiresAt && expiresAt < new Date();
  const showRenewButton = isCurrent && isExpired;
  const showSubscribeButton = !isCurrent || isExpired;

  return (
    <div
      className={`bg-white p-4 sm:p-6 rounded-xl shadow-lg transition-transform duration-300 hover:scale-105 ${
        isPopular ? 'border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-white' : ''
      }`}
    >
      {isPopular && (
        <div className="bg-gradient-to-r from-orange-300 to-orange-500 text-white px-3 py-1 rounded-lg inline-block mb-4 text-xs font-bold">
          MOST POPULAR
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h3>
        {isCurrent && (
          <span
            className={`px-3 py-1 rounded-lg text-xs font-bold mt-2 sm:mt-0 ${
              isExpired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}
          >
            {isExpired ? 'EXPIRED' : 'ACTIVE'}
          </span>
        )}
      </div>
      <div className="mt-2">
        <span className="text-xl sm:text-2xl font-bold text-gray-900">{price}</span>
        <span className="text-sm text-gray-600"> / {duration}</span>
      </div>
      {title === 'Super Plan' && currentPlan === 'Basic' && !isExpired && (
        <p className="text-xs sm:text-sm text-blue-600 italic mt-2">
          One-time payment of ₹400 to upgrade (No auto-renewal)
        </p>
      )}
      {isCurrent && expiresAt && (
        <p className={`mt-2 text-xs sm:text-sm ${isExpired ? 'text-red-700' : 'text-gray-600'}`}>
          {isExpired
            ? `Expired on ${format(expiresAt, 'dd MMMM yyyy')}`
            : daysRemaining
            ? `Expires in ${daysRemaining} days`
            : `Expires on ${format(expiresAt, 'dd MMMM yyyy')}`}
        </p>
      )}
      <hr className="my-4 border-gray-300" />
      <div className="space-y-3">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center">
            <i className="material-icons text-green-600 mr-2 text-lg">check_circle</i>
            <span className="text-sm sm:text-base text-gray-800">{feature}</span>
          </div>
        ))}
      </div>
      <div className="mt-6">
        {(showRenewButton || showSubscribeButton) && isButtonEnabled ? (
          <button
            className={`w-full py-3 rounded-lg text-white font-semibold text-sm sm:text-base ${
              isPopular ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'
            } transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            onClick={onClick}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-t-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : showRenewButton ? (
              'Renew Subscription'
            ) : (
              buttonText
            )}
          </button>
        ) : isCurrent && isButtonEnabled ? (
          <button
            className="w-full py-3 rounded-lg bg-gray-200 text-gray-600 font-semibold text-sm sm:text-base cursor-not-allowed"
            disabled
          >
            Current Plan
          </button>
        ) : (
          <button
            className="w-full py-3 rounded-lg bg-gray-200 text-gray-600 font-semibold text-sm sm:text-base cursor-not-allowed"
            disabled
          >
            Not Available
          </button>
        )}
      </div>
    </div>
  );
};

export default Subscription;