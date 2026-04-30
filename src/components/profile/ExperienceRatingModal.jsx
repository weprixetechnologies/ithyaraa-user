"use client";

import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '@/lib/axiosInstance';

const ExperienceRatingModal = ({ orderID, isOpen, onClose, onFinish }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const tags = ['Fast Delivery', 'Great Packaging', 'On Time', 'Polite Courier', 'Easy Tracking'];

    const toggleTag = (tag) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.warning('Please select a rating');
            return;
        }

        setSubmitting(true);
        try {
            const response = await axiosInstance.post('/delivery-experience/submit', {
                orderID,
                rating,
                comment,
                tags: selectedTags
            });

            if (response.data.success) {
                toast.success('Thank you for your feedback!');
                onFinish();
                onClose();
            } else {
                toast.error(response.data.message || 'Failed to submit feedback');
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            toast.error(error.response?.data?.message || 'Error submitting feedback');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-opacity duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-300 scale-100">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Rate Your Experience</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <p className="text-gray-600 mb-6">How was your ordering and delivery experience for Order #{orderID}?</p>

                    {/* Star Rating */}
                    <div className="flex justify-center space-x-2 mb-8">
                        {[...Array(5)].map((_, index) => {
                            const starValue = index + 1;
                            return (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => setRating(starValue)}
                                    onMouseEnter={() => setHover(starValue)}
                                    onMouseLeave={() => setHover(0)}
                                    className="focus:outline-none transition-transform active:scale-90"
                                >
                                    <FaStar
                                        size={42}
                                        className={`transition-colors duration-200 ${starValue <= (hover || rating) ? 'text-yellow-400' : 'text-gray-200'}`}
                                    />
                                </button>
                            );
                        })}
                    </div>

                    {/* Tags */}
                    <div className="mb-6">
                        <p className="text-sm font-semibold text-gray-700 mb-3">What did you like?</p>
                        <div className="flex flex-wrap gap-2">
                            {tags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => toggleTag(tag)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedTags.includes(tag)
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Comment */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Anything else we should know?</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell us about your experience..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || rating === 0}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
                    >
                        {submitting ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExperienceRatingModal;
