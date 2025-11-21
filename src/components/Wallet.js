import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import TransactionHistoryScreen from './TransactionHistoryScreen';
import Header from './Header'; // Adjust path if needed

const Wallet = (props) => {
  const { 
    isLoggedIn, 
    setIsLoggedIn, 
    handleNavClick, 
    toggleDrawer, 
    handleLogout, 
    isChatRoute 
  } = props;
  const [availableBalance, setAvailableBalance] = useState(0);
  const [lockedBalance, setLockedBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [userProfile, setUserProfile] = useState({});
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const baseUrl = 'https://yoketrip.in';

  // Load Razorpay script dynamically and handle scroll
  useEffect(() => {
    const loadRazorpayScript = () => {
      if (window.Razorpay) {
        setIsRazorpayLoaded(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        setIsRazorpayLoaded(true);
      };
      script.onerror = () => {
        toast.error('Failed to load Razorpay script. Please try again.');
        setIsRazorpayLoaded(false);
      };
      document.body.appendChild(script);
    };
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    loadRazorpayScript();
    fetchWalletData();
    fetchUserProfile();
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  useEffect(() => {
        const checkAuth = () => {
          setIsLoggedIn(!!localStorage.getItem('auth_token'));
        };
        window.addEventListener('storage', checkAuth);
        checkAuth();
        return () => window.removeEventListener('storage', checkAuth);
      }, [setIsLoggedIn]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No authentication token found');
      const response = await axios.get(`${baseUrl}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setUserProfile(response.data);
      }
    } catch (e) {
      toast.error(`Error fetching profile: ${e.message}`);
    }
  };

  const fetchWalletData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No authentication token found');
      const response = await axios.get(`${baseUrl}/api/wallet`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setAvailableBalance(response.data.availableBalance || 0);
        setLockedBalance(response.data.lockedBalance || 0);
        setTransactions(
          response.data.transactions.map((txn) => ({
            id: txn._id || txn.id,
            description: txn.description || '',
            amount: parseFloat(txn.amount) || 0,
            date: txn.date || '',
            type: txn.type || 'unknown',
            status: txn.status,
            method: txn.method,
            details: txn.details,
          }))
        );
        setIsLoading(false);
      }
    } catch (e) {
      toast.error(`Error fetching wallet data: ${e.message}`);
      setIsLoading(false);
    }
  };

  const processDeposit = async () => {
    if (!isRazorpayLoaded) {
      toast.error('Razorpay is not loaded yet. Please try again.');
      return;
    }

    if (!depositAmount || parseFloat(depositAmount) <= 0 || parseFloat(depositAmount) < 10) {
      toast.error('Please enter a valid amount (minimum ₹10)');
      return;
    }
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No authentication token found');
      const response = await axios.post(
        `${baseUrl}/api/wallet/create-order`,
        {
          amount: parseFloat(depositAmount),
          currency: 'INR',
          receipt: `deposit_${Date.now()}`,
          notes: {
            userId: userProfile._id,
            purpose: 'wallet_deposit',
          },
        },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      if (response.status === 200) {
        const orderData = response.data;
        const options = {
          key: 'rzp_live_CO61Bu0ltjKZgN',
          amount: (parseFloat(depositAmount) * 100).toString(),
          currency: 'INR',
          name: 'Yoktrip Wallet',
          description: 'Wallet Deposit',
          order_id: orderData.id,
          handler: async (response) => {
            try {
              const verifyResponse = await axios.post(
                `${baseUrl}/api/wallet/verify-payment`,
                {
                  payment_id: response.razorpay_payment_id,
                  order_id: response.razorpay_order_id,
                  signature: response.razorpay_signature,
                },
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
              );
              if (verifyResponse.status === 200) {
                toast.success('Deposit Successful!');
                fetchWalletData();
                setShowDepositModal(false);
                setDepositAmount('');
              }
            } catch (e) {
              toast.error(`Verification Error: ${e.message}`);
            }
          },
          prefill: {
            contact: userProfile.phone || '9876543210',
            email: userProfile.email || 'user@example.com',
            name: userProfile.full_name || 'Yoktrip User',
          },
          theme: { color: '#007BFF' },
          timeout: 300,
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (e) {
      toast.error(`Payment Error: ${e.message}`);
    }
  };

  const processWithdrawal = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > availableBalance) {
      toast.error('Please enter a valid amount within available balance');
      return;
    }
    if (withdrawMethod === 'upi' && !upiId) {
      toast.error('Please enter UPI ID');
      return;
    }
    if (withdrawMethod === 'bank' && (!accountNumber || !ifscCode)) {
      toast.error('Please enter account number and IFSC code');
      return;
    }
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No authentication token found');
      const withdrawalDetails = {
        amount: parseFloat(withdrawAmount),
        method: withdrawMethod,
        ...(withdrawMethod === 'upi' ? { upiId } : { accountNumber, ifscCode }),
      };
      const response = await axios.post(
        `${baseUrl}/api/wallet/withdraw`,
        withdrawalDetails,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      if (response.status === 200) {
        toast.success('Withdrawal request submitted!');
        fetchWalletData();
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        setUpiId('');
        setAccountNumber('');
        setIfscCode('');
      }
    } catch (e) {
      toast.error(`Withdrawal Error: ${e.message}`);
    }
  };

  const handleTransactionClick = (txn) => {
    toast.info(
      <div>
        <h3 className="font-semibold">Transaction Details</h3>
        <p><strong>Type:</strong> {txn.type.toUpperCase()}</p>
        <p><strong>Date:</strong> {new Date(txn.date).toLocaleDateString('en-IN')}</p>
        <p><strong>Amount:</strong> ₹{Math.abs(txn.amount).toFixed(2)}</p>
        <p><strong>Description:</strong> {txn.description}</p>
        {txn.status && <p><strong>Status:</strong> {txn.status.toUpperCase()}</p>}
        {txn.method && <p><strong>Method:</strong> {txn.method === 'upi' ? 'UPI Transfer' : 'Bank Transfer'}</p>}
        {txn.details && (
          <>
            {txn.method === 'upi' && <p><strong>UPI ID:</strong> {txn.details.upiId}</p>}
            {txn.method === 'bank' && (
              <>
                <p><strong>Account Number:</strong> {txn.details.accountNumber}</p>
                <p><strong>IFSC Code:</strong> {txn.details.ifscCode}</p>
              </>
            )}
          </>
        )}
        <p><strong>Transaction ID:</strong> {txn.id}</p>
      </div>,
      { autoClose: false }
    );
  };

  return (
    <>
      <Header
        {...props}
      />
      <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8 pt-16">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* Balance Section */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6 text-center">
              <h2 className="text-lg text-gray-500">Available Balance</h2>
              <h1 className="text-3xl font-bold mt-2">₹{availableBalance.toFixed(2)}</h1>
              <div className="flex justify-around mt-4">
                <div>
                  <p className="text-sm text-gray-500">Total Balance</p>
                  <p className="font-semibold">₹{(availableBalance + lockedBalance).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Locked Balance</p>
                  <p className="font-semibold">₹{lockedBalance.toFixed(2)}</p>
                </div>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <button
                onClick={() => setShowDepositModal(true)}
                className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors"
                disabled={!isRazorpayLoaded}
              >
                <i className="material-icons align-middle mr-2">arrow_downward</i>Deposit
              </button>
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <i className="material-icons align-middle mr-2">arrow_upward</i>Withdraw
              </button>
            </div>
            <div className="flex flex-wrap gap-4 mb-6">
              <button
                onClick={() => window.location.href = '/referral'}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                <i className="material-icons align-middle mr-2">people</i>Refer & Earn
              </button>
              <Link
                to="/transaction-history"
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                <i className="material-icons align-middle mr-2">history</i>Transaction History
              </Link>
            </div>
            {/* Recent Transactions */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Recent Transactions</h2>
                {transactions.length > 0 && (
                  <Link to="/transaction-history" className="text-blue-500 hover:underline">
                    View All
                  </Link>
                )}
              </div>
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <i className="material-icons text-6xl text-gray-400">receipt</i>
                  <p className="mt-2 text-gray-600">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.slice(0, 5).map((txn) => (
                    <div
                      key={txn.id}
                      className="flex items-center p-4 bg-orange-50 rounded-lg border border-orange-200 cursor-pointer hover:bg-orange-100"
                      onClick={() => handleTransactionClick(txn)}
                    >
                      <div className={`p-2 rounded-full ${txn.amount > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                        <i className={`material-icons ${txn.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {txn.amount > 0 ? 'arrow_downward' : 'arrow_upward'}
                        </i>
                      </div>
                      <div className="flex-1 ml-4">
                        <p className="font-semibold">{txn.description}</p>
                        <p className="text-sm text-gray-500">{new Date(txn.date).toLocaleDateString('en-IN')}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${txn.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {txn.amount > 0 ? '+' : ''}₹{Math.abs(txn.amount).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">{txn.type.toUpperCase()}</p>
                      </div>
                    </div>
                  ))}
                  {transactions.length > 5 && (
                    <div className="text-center">
                      <Link to="/transaction-history" className="text-blue-500 hover:underline">
                        Show More
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Deposit Modal */}
            {showDepositModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg w-full max-w-md">
                  <h2 className="text-lg font-semibold mb-4">Deposit Funds</h2>
                  <div className="mb-4">
                    <label className="block text-sm text-gray-500 mb-2">Amount (₹)</label>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full p-2 border rounded-lg"
                      placeholder="Enter amount"
                      min="10"
                    />
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Payment will be processed for:</p>
                    {userProfile.full_name && <p className="font-semibold">{userProfile.full_name}</p>}
                    {userProfile.phone && <p className="text-sm">{userProfile.phone}</p>}
                    {userProfile.email && <p className="text-sm">{userProfile.email}</p>}
                  </div>
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => setShowDepositModal(false)}
                      className="px-4 py-2 bg-gray-200 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={processDeposit}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg"
                      disabled={!isRazorpayLoaded}
                    >
                      Proceed to Pay
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Withdraw Modal */}
            {showWithdrawModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg w-full max-w-md">
                  <h2 className="text-lg font-semibold mb-4">Withdraw Funds</h2>
                  <p className="text-sm font-semibold mb-4">
                    Available: ₹{availableBalance.toFixed(2)}
                  </p>
                  <div className="mb-4">
                    <label className="block text-sm text-gray-500 mb-2">Amount</label>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full p-2 border rounded-lg"
                      placeholder="Enter amount"
                      min="0"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm text-gray-500 mb-2">Withdraw to</label>
                    <select
                      value={withdrawMethod}
                      onChange={(e) => setWithdrawMethod(e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="upi">UPI ID</option>
                      <option value="bank">Bank Transfer</option>
                    </select>
                  </div>
                  {withdrawMethod === 'upi' ? (
                    <div className="mb-4">
                      <label className="block text-sm text-gray-500 mb-2">UPI ID</label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                        placeholder="yourname@upi"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <label className="block text-sm text-gray-500 mb-2">Account Number</label>
                        <input
                          type="text"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          className="w-full p-2 border rounded-lg"
                          placeholder="Enter account number"
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm text-gray-500 mb-2">IFSC Code</label>
                        <input
                          type="text"
                          value={ifscCode}
                          onChange={(e) => setIfscCode(e.target.value)}
                          className="w-full p-2 border rounded-lg"
                          placeholder="Enter IFSC code"
                        />
                      </div>
                    </>
                  )}
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => setShowWithdrawModal(false)}
                      className="px-4 py-2 bg-gray-200 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={processWithdrawal}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                    >
                      Withdraw
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Wallet;