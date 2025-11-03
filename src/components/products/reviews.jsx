"use client"
import Image from "next/image";
import { FaStar } from "react-icons/fa6";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import axiosInstance from "@/lib/axiosInstance";

const Reviews = ({ reviewStats: initialReviewStats }) => {
    const { productID } = useParams();
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [reviewStats, setReviewStats] = useState(initialReviewStats || {
        totalReviews: 0,
        averageRating: 0,
        ratingBreakdown: []
    });
    const [loading, setLoading] = useState(true);
    const [showWriteReview, setShowWriteReview] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { user, isAuthenticated } = useAuth();

    // Update review stats if prop changes
    useEffect(() => {
        if (initialReviewStats) {
            setReviewStats(initialReviewStats);
        }
    }, [initialReviewStats]);

    useEffect(() => {
        if (productID) {
            fetchReviews();
        }
    }, [productID]);

    const fetchReviews = async () => {
        try {
            const response = await axiosInstance.get(`/reviews/product/${productID}?limit=6`);
            if (response.data.success) {
                setReviews(response.data.data.reviews || []);
                console.log('Reviews:', response.data.data.reviews);

            }
        } catch (error) {
            console.error('Error fetching reviews:', error.response?.data || error.message);
            setReviews([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };


    const toggleReadMore = (index) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    // Get user profile image or default avatar
    const getUserImage = (profilePhoto) => {
        if (profilePhoto && Array.isArray(profilePhoto) && profilePhoto.length > 0) {
            return profilePhoto[0].imgUrl;
        }
        return '/default-avatar.png';
    };

    const handleSubmitReview = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to submit a review');
            return;
        }

        if (!rating) {
            toast.error('Please select a rating');
            return;
        }

        try {
            setSubmitting(true);
            const response = await axiosInstance.post(
                '/reviews/add',
                {
                    productID,
                    rating,
                    comment: comment || null
                }
            );

            if (response.data.success) {
                // toast.success('Review submitted successfully and is pending approval!');
                setShowWriteReview(false);
                setComment('');
                setRating(5);
                fetchReviews();
                // Trigger parent to refetch stats by dispatching an event or callback
                window.location.reload();
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-10">
                <div className="text-gray-500">Loading reviews...</div>
            </div>
        );
    }

    const totalRatings = reviewStats.totalReviews || 0;

    return (
        <div>
            {/* Write Review Button */}
            <div className="flex justify-between items-center mb-4 px-2">
                <h2 className="text-xl font-bold">Customer Reviews</h2>
                {isAuthenticated && (
                    <button
                        onClick={() => setShowWriteReview(true)}
                        className="px-4 py-2 bg-primary-yellow text-white rounded-lg hover:bg-yellow-500 font-medium text-sm"
                    >
                        Write a Review
                    </button>
                )}
            </div>

            {/* Write Review Modal */}
            {showWriteReview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Write Your Review</h3>
                            <button
                                onClick={() => {
                                    setShowWriteReview(false);
                                    setComment('');
                                    setRating(5);
                                }}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        {/* Rating Selection */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Your Rating</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className={`text-3xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                                {rating === 5 ? 'Excellent' :
                                    rating === 4 ? 'Good' :
                                        rating === 3 ? 'Average' :
                                            rating === 2 ? 'Poor' :
                                                'Very Poor'}
                            </p>
                        </div>

                        {/* Comment */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Your Review</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your experience with this product..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                                rows={4}
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowWriteReview(false);
                                    setComment('');
                                    setRating(5);
                                }}
                                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitReview}
                                disabled={submitting || !rating}
                                className="flex-1 py-2 px-4 bg-primary-yellow text-white rounded-lg font-medium hover:bg-yellow-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:grid md:grid-cols-2 gap-2 p-2">
                <div className="w-full grid grid-cols-3 col-span-1 mb-5 md:mb-0">
                    <div className="col-span-1 flex flex-col justify-center items-center">
                        <span className='text-4xl'>{reviewStats.averageRating.toFixed(1)}</span>
                        <p className='text-xs text-secondary-text-deep font-medium'>{totalRatings} rating{totalRatings !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="col-span-2 flex flex-col gap-2 justify-center">
                        {reviewStats.ratingBreakdown.map(({ rating, count }) => {
                            const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
                            return (
                                <div key={rating} className="flex items-center gap-2">
                                    <span className="w-4 text-sm">{rating}</span>
                                    <div className="flex-1 h-2 bg-gray-200 rounded overflow-hidden">
                                        <div
                                            className="h-full bg-yellow-400"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="w-10 text-xs text-gray-500">({count})</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                {reviews.length === 0 ? (
                    <div className="col-span-2 text-center py-10">
                        <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                    </div>
                ) : (
                    reviews.map((review, index) => (
                        <div
                            className="col-span-1 border-b border-gray-200 md:border md:border-gray-200 md:rounded-lg px-3 py-5"
                            key={index}
                        >
                            <div className="profileblock flex items-center font-medium gap-2">
                                <div className="relative aspect-[1/1] w-[45px] h-[45px]">
                                    <Image
                                        // src={getUserImage(review.profilePhoto)}
                                        src={review.profilePhoto}
                                        alt={review.username}
                                        fill
                                        className="rounded-full object-cover"
                                    />

                                </div>
                                <div className="nameandstars flex flex-col">
                                    <p>{review.username}</p>
                                    <div className="flex">
                                        {Array.from({ length: review.rating }, (_, idx) => (
                                            <FaStar key={idx} className="text-yellow-400" size={14} />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Comment with Read more */}
                            {review.comment && (
                                <p
                                    className={`mt-2 text-sm ${expandedIndex === index ? "" : "line-clamp-5"
                                        }`}
                                >
                                    {review.comment}
                                </p>
                            )}

                            {review.comment && review.comment.length > 100 && (
                                <button
                                    onClick={() => toggleReadMore(index)}
                                    className="text-blue-500 text-xs mt-1 font-medium"
                                >
                                    {expandedIndex === index ? "Read less" : "Read more"}
                                </button>
                            )}

                            {/* Review metadata
                            {review.verified_purchase && (
                                <p className="text-xs text-green-600 mt-2">✓ Verified Purchase</p>
                            )} */}
                        </div>
                    ))
                )}
            </div>
            <div className="flex justify-center">
                {reviews.length > 0 && (
                    <button className="underline bg-transparent border-none text-xs mt-5">More Reviews</button>
                )}
            </div>
        </div>
    )
}

export default Reviews

