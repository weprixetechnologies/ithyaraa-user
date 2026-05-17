"use client";

import React, { useState } from 'react';
import { FaExclamationTriangle, FaArrowRight, FaTrashAlt } from 'react-icons/fa';
import axiosInstance from '@/lib/axiosInstance';
import { toast } from 'react-toastify';

const StockValidationModal = ({ isOpen, items, onClose, onUnselectComplete }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isUpdating, setIsUpdating] = useState(false);

    if (!isOpen || !items || items.length === 0) return null;

    const currentItem = items[currentIndex];
    const isLastItem = currentIndex === items.length - 1;

    const handleNext = () => {
        if (!isLastItem) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handleUnselect = async () => {
        try {
            setIsUpdating(true);
            const response = await axiosInstance.post('/cart/auto-update-selection');
            if (response.data.success) {
                toast.success('Cart updated successfully');
                onUnselectComplete();
            } else {
                toast.error('Failed to update cart');
            }
        } catch (error) {
            console.error('Error auto-updating selection:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsUpdating(false);
            onClose();
            setCurrentIndex(0); // Reset for next time
        }
    };

    // Helper to parse featuredImage
    const getImageUrl = (imageField) => {
        try {
            if (!imageField) return '/placeholder.png';
            const images = typeof imageField === 'string' ? JSON.parse(imageField) : imageField;
            return images?.[0]?.imgUrl || images?.[0]?.url || '/placeholder.png';
        } catch (e) {
            return '/placeholder.png';
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[100] px-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />
            
            {/* Modal Container */}
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 transform transition-all duration-300 scale-100 opacity-100"
            >
                {/* Header */}
                <div className="bg-amber-50 p-6 flex items-center gap-4 border-b border-amber-100">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                        <FaExclamationTriangle size={24} className="animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">
                            {currentItem.stockStatus === 'out_of_stock' ? 'Out of Stock' : 'Low Stock'}
                        </h3>
                        <p className="text-amber-700 text-sm font-medium">
                            {items.length > 1 ? `Item ${currentIndex + 1} of ${items.length}` : 'Requires your attention'}
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="flex gap-4 mb-6">
                        <div className="w-24 h-32 rounded-lg overflow-hidden bg-gray-100 border border-gray-100 shrink-0">
                            <img 
                                src={getImageUrl(currentItem.featuredImage)} 
                                alt={currentItem.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex flex-col justify-center gap-1">
                            <h4 className="font-bold text-gray-800 leading-tight">
                                {currentItem.name}
                            </h4>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {currentItem.variationValues && Array.isArray(currentItem.variationValues) && currentItem.variationValues.map((v, i) => {
                                    const entries = Object.entries(v);
                                    if (entries.length === 0) return null;
                                    const [key, value] = entries[0];
                                    return (
                                        <span key={i} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">
                                            {key}: {value}
                                        </span>
                                    );
                                })}
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                Requested: <span className="font-semibold text-gray-800">{currentItem.quantity}</span>
                                {currentItem.stockStatus === 'low_stock' && (
                                    <span className="block text-red-500 text-xs mt-0.5 font-medium">
                                        Only {currentItem.variationStock} units available
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                        <p className="text-sm text-red-800 leading-relaxed">
                            {currentItem.stockStatus === 'out_of_stock' 
                                ? 'This item is currently unavailable and must be unselected before you can proceed to checkout.' 
                                : 'We don\'t have enough units in stock to fulfill this request. Please unselect it to continue.'}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 pt-0 flex gap-3">
                    {!isLastItem ? (
                        <button
                            onClick={handleNext}
                            className="flex-1 bg-gray-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all group"
                        >
                            Next Low Stock Item
                            <FaArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    ) : (
                        <button
                            onClick={handleUnselect}
                            disabled={isUpdating}
                            className="flex-1 bg-red-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-all disabled:opacity-50"
                        >
                            {isUpdating ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <FaTrashAlt size={16} />
                            )}
                            UNSELECT IT
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StockValidationModal;
