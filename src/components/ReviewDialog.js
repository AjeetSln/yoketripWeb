// src/components/ReviewDialog.js
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ReviewDialog = ({ id, userId, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.post(
        'https://yoketrip.in/api/reviews',
        { trip: id, reviewee: userId, rating, comment },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      if (response.status === 201) {
        toast.success('Review submitted successfully!');
        onSubmit(id);
        onClose();
      } else {
        toast.error('Failed to submit review');
      }
    } catch (error) {
      toast.error('An error occurred. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Leave a Review</h2>
        <p className="mb-4">How would you rate this trip?</p>
        <div className="flex mb-6">
          {[...Array(5)].map((_, i) => (
            <button
              key={i}
              onClick={() => setRating(i + 1)}
              className={`material-icons ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            >
              star
            </button>
          ))}
        </div>
        <textarea
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Comments (optional)"
          rows="4"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        ></textarea>
        <div className="flex justify-end mt-4 space-x-2">
          <button
            className="px-4 py-2 text-gray-600"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
            ) : (
              'Submit Review'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewDialog;