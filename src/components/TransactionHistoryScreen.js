import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import Header from './Header'; // Adjust path if needed

const TransactionHistoryScreen = (props) => {
  const { 
    isLoggedIn, 
    setIsLoggedIn, 
    handleNavClick, 
    toggleDrawer, 
    handleLogout, 
    isChatRoute 
  } = props;
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const baseUrl = 'https://yoketrip.in';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    fetchTransactions();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No authentication token found');
      const response = await axios.get(`${baseUrl}/api/wallet/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setTransactions(
          response.data.data.map(txn => ({
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
      toast.error(`Error fetching transactions: ${e.message}`);
      setIsLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(txn => {
    switch (selectedFilter) {
      case 'deposit':
        return txn.amount > 0;
      case 'withdrawal':
        return txn.amount < 0;
      case 'pending':
        return txn.status === 'pending';
      default:
        return true;
    }
  });

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
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Transaction History</h1>
            <button
              onClick={() => {
                // Show filter dialog as a modal
                toast.info(
                  <div>
                    <h3 className="font-semibold">Filter Transactions</h3>
                    <div className="space-y-2">
                      {[
                        { value: 'all', label: 'All Transactions' },
                        { value: 'deposit', label: 'Deposits Only' },
                        { value: 'withdrawal', label: 'Withdrawals Only' },
                        { value: 'pending', label: 'Pending Only' },
                      ].map(option => (
                        <label key={option.value} className="flex items-center">
                          <input
                            type="radio"
                            value={option.value}
                            checked={selectedFilter === option.value}
                            onChange={() => setSelectedFilter(option.value)}
                            className="mr-2"
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  </div>,
                  { autoClose: false }
                );
              }}
              className="text-blue-500 hover:underline"
            >
              <i className="material-icons">filter_list</i>
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { label: 'All', value: 'all' },
              { label: 'Deposits', value: 'deposit' },
              { label: 'Withdrawals', value: 'withdrawal' },
              { label: 'Pending', value: 'pending' },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setSelectedFilter(option.value)}
                className={`px-4 py-2 rounded-lg ${
                  selectedFilter === option.value ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <i className="material-icons text-6xl text-gray-400">receipt</i>
              <p className="mt-2 text-gray-600">No transactions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map(txn => (
                <div
                  key={txn.id}
                  className="flex items-center p-4 bg-white rounded-lg shadow-md cursor-pointer hover:bg-gray-50"
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
                    <div
                      className={`inline-block px-2 py-1 rounded-full text-xs text-white ${
                        txn.status === 'completed'
                          ? 'bg-green-500'
                          : txn.status === 'pending'
                          ? 'bg-orange-500'
                          : 'bg-red-500'
                      }`}
                    >
                      {txn.status?.toUpperCase() || 'UNKNOWN'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TransactionHistoryScreen;