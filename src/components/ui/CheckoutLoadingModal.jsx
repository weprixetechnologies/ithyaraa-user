"use client";

import React from 'react';
import { FaSpinner, FaShieldAlt, FaCreditCard } from 'react-icons/fa';

const CheckoutLoadingModal = ({ isOpen }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl">
                {/* Animated Icons */}
                <div className="flex justify-center items-center space-x-4 mb-6">
                    <FaShieldAlt className="text-green-500 text-2xl animate-pulse" />
                    <FaCreditCard className="text-blue-500 text-2xl animate-bounce" />
                    <FaShieldAlt className="text-green-500 text-2xl animate-pulse" />
                </div>

                {/* Main Loading Spinner */}
                <div className="mb-6">
                    <FaSpinner className="text-4xl text-gray-600 animate-spin mx-auto" />
                </div>

                {/* Animated Text */}
                <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Curating Secure Checkout
                    </h2>
                    <div className="flex justify-center items-center space-x-1">
                        <span className="text-gray-600">Please wait</span>
                        <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                </div>

                {/* Security Message */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600">
                        🔒 Your payment is being processed securely through PhonePe
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full animate-pulse"></div>
                </div>

                {/* Additional Info */}
                <p className="text-xs text-gray-500">
                    Do not close this window or refresh the page
                </p>
            </div>
        </div>
    );
};

export default CheckoutLoadingModal;
