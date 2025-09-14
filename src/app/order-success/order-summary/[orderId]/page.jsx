"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axiosInstance from '@/lib/axiosInstance';
import Link from 'next/link';
import { FaCheckCircle, FaTruck, FaCreditCard, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';

const OrderSuccessPage = () => {
    const params = useParams();
    const orderId = params.orderId;

    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get(`/order/order-details/${orderId}`);

                if (response.data?.success) {
                    setOrderDetails(response.data.data);
                } else {
                    setError('Order not found');
                }
            } catch (err) {
                console.error('Error fetching order details:', err);
                setError('Failed to load order details');
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="text-center">
                    <ClipLoader size={40} color="#3B82F6" />
                    <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (error || !orderDetails) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="text-red-500 text-4xl sm:text-6xl mb-4">⚠️</div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
                    <p className="text-gray-600 mb-6 text-sm sm:text-base">{error || 'Unable to load order details'}</p>
                    <Link
                        href="/profile?tab=orders"
                        className="inline-flex items-center px-4 sm:px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                    >
                        View My Orders
                    </Link>
                </div>
            </div>
        );
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatPrice = (price) => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(numPrice || 0);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
            <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
                {/* Success Header */}
                <div className="text-center mb-6 sm:mb-8">
                    <FaCheckCircle className="text-green-500 text-4xl sm:text-6xl mx-auto mb-3 sm:mb-4" />
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
                    <p className="text-sm sm:text-base text-gray-600 px-2">Your order has been confirmed and will be processed soon.</p>
                    <div className="mt-3 sm:mt-4 inline-flex items-center px-3 sm:px-4 py-2 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm font-medium">
                        Order ID: {orderDetails.orderID}
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-12 gap-4 sm:gap-6 mb-6">
                    {/* Left Side - Order Summary (75%) */}
                    <div className="lg:col-span-8 order-2 lg:order-1">
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-b border-gray-200">
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Order Summary</h2>
                            </div>

                            <div className="p-3 sm:p-6">
                                {/* Mobile Card Layout */}
                                <div className="block sm:hidden space-y-4">
                                    {orderDetails.items?.map((item, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                                            {/* Main Item */}
                                            <div className="flex items-start space-x-3">
                                                <img
                                                    src={item.featuredImage?.[0]?.imgUrl || '/placeholder-product.jpg'}
                                                    alt={item.name}
                                                    className="w-16 h-16 object-cover rounded flex-shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 text-sm leading-tight">{item.name}</p>
                                                    {item.variationName && (
                                                        <p className="text-xs text-gray-500 mt-1">{item.variationName}</p>
                                                    )}
                                                    <div className="flex justify-between items-center mt-2">
                                                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                                                            Qty: {item.quantity}
                                                        </span>
                                                        <div className="text-right">
                                                            <p className="text-xs text-gray-500">
                                                                {formatPrice(item.salePrice || item.regularPrice || 0)} each
                                                            </p>
                                                            <p className="font-medium text-sm">
                                                                {formatPrice(item.lineTotalAfter || (item.salePrice || item.regularPrice || 0) * item.quantity)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Combo Items */}
                                            {item.comboItems && item.comboItems.length > 0 && (
                                                <div className="mt-3 pl-4 border-l-2 border-gray-200">
                                                    <p className="text-xs font-medium text-gray-600 mb-2">Includes:</p>
                                                    {item.comboItems.map((comboItem, comboIndex) => (
                                                        <div key={comboIndex} className="flex items-center space-x-2 mb-2">
                                                            <img
                                                                src={comboItem.featuredImage?.[0]?.imgUrl || '/placeholder-product.jpg'}
                                                                alt={comboItem.name}
                                                                className="w-8 h-8 object-cover rounded"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-medium text-gray-700">{comboItem.name}</p>
                                                                {comboItem.variationName && (
                                                                    <p className="text-xs text-gray-500">{comboItem.variationName}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop Table Layout */}
                                <div className="hidden sm:block overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-3 px-4 font-medium text-gray-700">Product</th>
                                                <th className="text-center py-3 px-4 font-medium text-gray-700">Quantity</th>
                                                <th className="text-right py-3 px-4 font-medium text-gray-700">Price</th>
                                                <th className="text-right py-3 px-4 font-medium text-gray-700">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orderDetails.items?.map((item, index) => (
                                                <React.Fragment key={index}>
                                                    {/* Main Item Row */}
                                                    <tr className="border-b">
                                                        <td className="py-4 px-4">
                                                            <div className="flex items-center space-x-3">
                                                                <img
                                                                    src={item.featuredImage?.[0]?.imgUrl || '/placeholder-product.jpg'}
                                                                    alt={item.name}
                                                                    className="w-12 h-12 object-cover rounded"
                                                                />
                                                                <div>
                                                                    <p className="font-medium text-gray-900">{item.name}</p>
                                                                    {item.variationName && (
                                                                        <p className="text-sm text-gray-500">{item.variationName}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-4 text-center">
                                                            <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                                                                {item.quantity}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-4 text-right">
                                                            {formatPrice(item.salePrice || item.regularPrice || 0)}
                                                        </td>
                                                        <td className="py-4 px-4 text-right font-medium">
                                                            {formatPrice(item.lineTotalAfter || (item.salePrice || item.regularPrice || 0) * item.quantity)}
                                                        </td>
                                                    </tr>

                                                    {/* Combo Items Rows */}
                                                    {item.comboItems && item.comboItems.length > 0 && item.comboItems.map((comboItem, comboIndex) => (
                                                        <tr key={`${index}-combo-${comboIndex}`} className="border-b bg-gray-50">
                                                            <td className="py-3 px-4 pl-8">
                                                                <div className="flex items-center space-x-3">
                                                                    <img
                                                                        src={comboItem.featuredImage?.[0]?.imgUrl || '/placeholder-product.jpg'}
                                                                        alt={comboItem.name}
                                                                        className="w-10 h-10 object-cover rounded"
                                                                    />
                                                                    <div>
                                                                        <p className="text-sm font-medium text-gray-700">{comboItem.name}</p>
                                                                        {comboItem.variationName && (
                                                                            <p className="text-xs text-gray-500">{comboItem.variationName}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-4 text-center">
                                                                <span className="text-xs text-gray-500">Included</span>
                                                            </td>
                                                            <td className="py-3 px-4 text-right">
                                                                <span className="text-xs text-gray-500">-</span>
                                                            </td>
                                                            <td className="py-3 px-4 text-right">
                                                                <span className="text-xs text-gray-500">-</span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Order Totals */}
                                <div className="mt-4 sm:mt-6 border-t pt-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm sm:text-base">
                                            <span className="text-gray-600">Subtotal:</span>
                                            <span>{formatPrice(orderDetails.subtotal)}</span>
                                        </div>
                                        {parseFloat(orderDetails.discount) > 0 && (
                                            <div className="flex justify-between text-green-600 text-sm sm:text-base">
                                                <span>Discount:</span>
                                                <span>-{formatPrice(orderDetails.discount)}</span>
                                            </div>
                                        )}
                                        {parseFloat(orderDetails.couponDiscount) > 0 && (
                                            <div className="flex justify-between text-green-600 text-sm sm:text-base">
                                                <span className="truncate">Coupon Discount ({orderDetails.couponCode}):</span>
                                                <span className="ml-2 flex-shrink-0">-{formatPrice(orderDetails.couponDiscount)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm sm:text-base">
                                            <span className="text-gray-600">Shipping:</span>
                                            <span>{formatPrice(orderDetails.shipping)}</span>
                                        </div>
                                        <div className="flex justify-between text-base sm:text-lg font-semibold border-t pt-2">
                                            <span>Total:</span>
                                            <span>{formatPrice(orderDetails.total)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Information Cards (25%) */}
                    <div className="lg:col-span-4 flex flex-col space-y-4 sm:space-y-6 order-1 lg:order-2">
                        {/* Delivery Address */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                            <div className="flex items-center mb-3 sm:mb-4">
                                <FaMapMarkerAlt className="text-blue-500 mr-2 text-sm sm:text-base" />
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Delivery Address</h3>
                            </div>
                            {orderDetails.deliveryAddress ? (
                                <div className="text-gray-600 text-sm sm:text-base">
                                    <p className="font-medium text-xs sm:text-sm">{orderDetails.deliveryAddress.emailID}</p>
                                    <p className="mt-1">{orderDetails.deliveryAddress.line1}</p>
                                    {orderDetails.deliveryAddress.line2 && (
                                        <p>{orderDetails.deliveryAddress.line2}</p>
                                    )}
                                    <p className="mt-1">{orderDetails.deliveryAddress.city}, {orderDetails.deliveryAddress.state} {orderDetails.deliveryAddress.pincode}</p>
                                    {orderDetails.deliveryAddress.landmark && (
                                        <p className="text-xs sm:text-sm text-gray-500 mt-1">Near: {orderDetails.deliveryAddress.landmark}</p>
                                    )}
                                    <p className="mt-2 text-xs sm:text-sm">
                                        <FaPhone className="inline mr-1" />
                                        {orderDetails.deliveryAddress.phoneNumber}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm sm:text-base">Address not available</p>
                            )}
                        </div>

                        {/* Payment Information */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                            <div className="flex items-center mb-3 sm:mb-4">
                                <FaCreditCard className="text-green-500 mr-2 text-sm sm:text-base" />
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Payment Information</h3>
                            </div>
                            <div className="text-gray-600 text-sm sm:text-base space-y-2">
                                <div>
                                    <span className="font-medium">Payment Method:</span>
                                    <span className="ml-2">{orderDetails.paymentMode}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center">
                                    <span className="font-medium">Payment Status:</span>
                                    <span className={`ml-0 sm:ml-2 mt-1 sm:mt-0 inline-block px-2 py-1 rounded text-xs ${orderDetails.paymentStatus === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-green-100 text-green-800'
                                        }`}>
                                        {orderDetails.paymentStatus === 'pending' ? 'Pending' : 'Successful'}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium">Order Date:</span>
                                    <span className="ml-2 text-xs sm:text-sm">{formatDate(orderDetails.createdAt)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Order Status */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                            <div className="flex items-center mb-3 sm:mb-4">
                                <FaTruck className="text-purple-500 mr-2 text-sm sm:text-base" />
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Order Status</h3>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="text-gray-700 text-sm sm:text-base">Order Confirmed</span>
                                </div>
                                <span className="text-xs sm:text-sm text-gray-500">
                                    {orderDetails.paymentStatus === 'pending'
                                        ? 'Payment pending'
                                        : 'Payment completed'
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2 sm:px-0">
                    <Link
                        href="/profile?tab=orders"
                        className="inline-flex items-center justify-center px-4 sm:px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                    >
                        View All Orders
                    </Link>
                    <Link
                        href="/shop"
                        className="inline-flex items-center justify-center px-4 sm:px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccessPage;
