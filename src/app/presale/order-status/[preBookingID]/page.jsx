"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import axiosInstance from '@/lib/axiosInstance';
import Link from 'next/link';
import { FaCheckCircle, FaTruck, FaCreditCard, FaMapMarkerAlt, FaPhone, FaEnvelope, FaDownload } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';

const PresaleOrderSuccessPage = () => {
    const params = useParams();
    const preBookingID = params.preBookingID;

    const [orderDetails, setOrderDetails] = useState(null);
    const [showCongrats, setShowCongrats] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCheckingPayment, setIsCheckingPayment] = useState(false);
    const [downloadingInvoice, setDownloadingInvoice] = useState(false);

    const fetchOrderDetails = useCallback(async () => {
        try {
            setLoading(true);
            // Fetch presale booking details
            const response = await axiosInstance.get(`/presale/booking-details/${preBookingID}`);

            if (response.data?.success) {
                const apiItems = Array.isArray(response.data.items) ? response.data.items : [];
                if (apiItems.length === 0) {
                    setError('Order not found');
                    return;
                }

                const detail = response.data.orderDetail || {};
                const first = apiItems[0];

                const items = apiItems.map((it) => ({
                    name: it.name,
                    featuredImage: it.featuredImage,
                    variationName: it.storedVariationName,
                    salePrice: it.salePrice,
                    regularPrice: it.regularPrice,
                    quantity: it.quantity,
                    lineTotalAfter: it.lineTotalAfter,
                    comboItems: it.comboItems || [],
                }));

                // Prefer backend-provided totals and meta from orderDetail; fallback to compute when absent
                const fallbackSubtotal = items.reduce((sum, it) => {
                    const unit = (it?.salePrice ? parseFloat(it.salePrice) : (it?.regularPrice ? parseFloat(it.regularPrice) : 0)) || 0;
                    const line = it?.lineTotalAfter ? parseFloat(it.lineTotalAfter) : unit * (it.quantity || 0);
                    return sum + (line || 0);
                }, 0);

                // Extract address details from orderDetail or first item
                const deliveryAddr = detail.deliveryAddress || {};
                const normalized = {
                    orderID: detail.orderID || first.orderID,
                    preBookingID: preBookingID,
                    items,
                    subtotal: detail.subtotal != null ? parseFloat(detail.subtotal) : fallbackSubtotal,
                    discount: detail.totalDiscount != null ? parseFloat(detail.totalDiscount) : 0,
                    couponDiscount: detail.couponDiscount != null ? parseFloat(detail.couponDiscount) : 0,
                    shipping: detail.shipping != null ? parseFloat(detail.shipping) : 0,
                    total: detail.total != null ? parseFloat(detail.total) : (first.total ? parseFloat(first.total) : fallbackSubtotal),
                    paymentMode: detail.paymentMode || first.paymentMode,
                    paymentStatus: detail.paymentStatus || first.paymentStatus,
                    createdAt: detail.createdAt || first.orderCreatedAt,
                    deliveryAddress: {
                        emailID: first.email || '',
                        phoneNumber: deliveryAddr.phoneNumber || first.contactNumber || '',
                        line1: deliveryAddr.line1 || first.addressLine1 || (first.shippingAddress ? first.shippingAddress.split(',')[0] : '') || '',
                        line2: deliveryAddr.line2 || first.addressLine2 || '',
                        city: deliveryAddr.city || first.city || '',
                        state: deliveryAddr.state || first.state || '',
                        pincode: deliveryAddr.pincode || first.pincode || '',
                        landmark: deliveryAddr.landmark || first.landmark || '',
                    },
                    couponCode: detail.couponCode || '',
                    orderStatus: detail.orderStatus || first.orderStatus || 'pending',
                    coinsEarned: detail.coinsEarned != null ? parseInt(detail.coinsEarned) : Math.floor(((detail.total != null ? parseFloat(detail.total) : (first.total ? parseFloat(first.total) : fallbackSubtotal)) || 0) / 100),
                    isWalletUsed: detail.isWalletUsed ? Boolean(Number(detail.isWalletUsed)) : false,
                    paidWallet: detail.paidWallet != null ? parseFloat(detail.paidWallet) : 0
                };

                setOrderDetails(normalized);
                // Only show coins modal if payment is successful (not pending for PREPAID, not failed)
                const isPaymentPending = normalized.paymentMode === 'PREPAID' && normalized.paymentStatus === 'pending';
                const isPaymentFailed = normalized.paymentStatus === 'failed';
                if ((normalized.coinsEarned || 0) > 0 && !isPaymentPending && !isPaymentFailed) {
                    setShowCongrats(true);
                }
                return normalized;
            } else {
                setError('Order not found');
                return null;
            }
        } catch (err) {
            console.error('Error fetching order details:', err);
            setError('Failed to load order details');
            return null;
        } finally {
            setLoading(false);
        }
    }, [preBookingID]);

    useEffect(() => {
        if (preBookingID) {
            fetchOrderDetails();
        }
    }, [preBookingID, fetchOrderDetails]);

    // Poll for payment status updates if payment is pending (for PREPAID orders)
    useEffect(() => {
        if (!orderDetails || orderDetails.paymentMode !== 'PREPAID' || orderDetails.paymentStatus !== 'pending') {
            return;
        }

        // Poll every 10 seconds for up to 200 seconds (20 attempts)
        let attempts = 0;
        const maxAttempts = 20;
        const pollInterval = 10000; // 10 seconds
        let isPolling = true;

        const checkPaymentStatus = async () => {
            try {
                setIsCheckingPayment(true);

                // Use presale-specific PhonePe status check API
                const statusResponse = await axiosInstance.get(`/phonepe/presale/${preBookingID}/status`);

                if (statusResponse.data?.success) {
                    const latestStatus = statusResponse.data.latestStatus;

                    // If payment is successful, refresh order details
                    if (latestStatus?.isSuccess || statusResponse.data.currentStatus === 'paid') {
                        // Fetch updated order details
                        const updatedOrder = await fetchOrderDetails();

                        // Stop polling if payment is successful
                        if (updatedOrder && updatedOrder.paymentStatus === 'successful') {
                            isPolling = false;
                            setIsCheckingPayment(false);
                            return true; // Payment confirmed
                        }
                    }
                }

                setIsCheckingPayment(false);
                return false; // Still pending
            } catch (err) {
                console.error('Error checking payment status:', err);
                setIsCheckingPayment(false);
                return false; // Continue polling on error
            }
        };

        // Initial check after 5 seconds
        const initialTimeout = setTimeout(async () => {
            if (isPolling) {
                await checkPaymentStatus();
            }
        }, 5000);

        // Poll at intervals
        const pollPaymentStatus = setInterval(async () => {
            if (!isPolling) {
                clearInterval(pollPaymentStatus);
                return;
            }

            attempts++;
            const paymentConfirmed = await checkPaymentStatus();

            // Stop polling if payment is successful or max attempts reached
            if (paymentConfirmed) {
                isPolling = false;
                clearInterval(pollPaymentStatus);
                clearTimeout(initialTimeout);
            } else if (attempts >= maxAttempts) {
                isPolling = false;
                clearInterval(pollPaymentStatus);
                clearTimeout(initialTimeout);
                setIsCheckingPayment(false);
                console.log('Payment status check stopped after max attempts');
            }
        }, pollInterval);

        return () => {
            isPolling = false;
            clearInterval(pollPaymentStatus);
            clearTimeout(initialTimeout);
            setIsCheckingPayment(false);
        };
    }, [orderDetails?.paymentStatus, orderDetails?.paymentMode, preBookingID, fetchOrderDetails]);

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

    const getOrderStatusUI = (status) => {
        const s = String(status || '').toLowerCase();
        switch (s) {
            case 'pending':
                return { label: 'Pending', dot: 'bg-yellow-500', badge: 'bg-yellow-100 text-yellow-800' };
            case 'accepted':
                return { label: 'Accepted', dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-800' };
            case 'packed':
                return { label: 'Packed', dot: 'bg-purple-500', badge: 'bg-purple-100 text-purple-800' };
            case 'shipped':
                return { label: 'Shipped', dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-800' };
            case 'delivered':
                return { label: 'Delivered', dot: 'bg-green-500', badge: 'bg-green-100 text-green-800' };
            case 'cancelled':
                return { label: 'Cancelled', dot: 'bg-red-500', badge: 'bg-red-100 text-red-800' };
            case 'returned':
                return { label: 'Returned', dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-800' };
            default:
                return { label: 'Pending', dot: 'bg-yellow-500', badge: 'bg-yellow-100 text-yellow-800' };
        }
    };

    const handleDownloadInvoice = async () => {
        try {
            setDownloadingInvoice(true);
            // Try presale invoice endpoint, fallback to regular if not available
            try {
                const response = await axiosInstance.get(`/presale/generate-invoice/${preBookingID}?action=download`, {
                responseType: 'blob'
            });
            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
                link.setAttribute('download', `presale_invoice_${orderDetails.orderID}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            } catch (presaleErr) {
                // If presale invoice endpoint doesn't exist, show message
                alert('Invoice generation for presale bookings is not available yet.');
            }
        } catch (err) {
            console.error('Error downloading invoice:', err);
            alert('Failed to download invoice. Please try again.');
        } finally {
            setDownloadingInvoice(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
            <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
                {/* Success Header */}
                <div className="text-center mb-6 sm:mb-8">
                    {orderDetails.paymentMode === 'PREPAID' && orderDetails.paymentStatus === 'pending' ? (
                        <>
                            <div className="text-yellow-500 text-4xl sm:text-6xl mx-auto mb-3 sm:mb-4 animate-pulse">⏳</div>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Payment In Progress</h1>
                            <p className="text-sm sm:text-base text-gray-600 px-2">Your order has been confirmed. We're verifying your payment - this page will update automatically.</p>
                            <div className="mt-3 sm:mt-4 inline-flex items-center px-3 sm:px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-xs sm:text-sm font-medium">
                                Pre-Booking ID: {orderDetails.orderID}
                            </div>
                        </>
                    ) : orderDetails.paymentMode === 'PREPAID' && orderDetails.paymentStatus === 'failed' ? (
                        <>
                            <div className="text-red-500 text-4xl sm:text-6xl mx-auto mb-3 sm:mb-4">❌</div>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
                            <p className="text-sm sm:text-base text-gray-600 px-2">Your payment could not be processed. Please try again or contact support.</p>
                            <div className="mt-3 sm:mt-4 inline-flex items-center px-3 sm:px-4 py-2 bg-red-100 text-red-800 rounded-full text-xs sm:text-sm font-medium">
                                Pre-Booking ID: {orderDetails.orderID}
                            </div>
                        </>
                    ) : (
                        <>
                            <FaCheckCircle className="text-green-500 text-4xl sm:text-6xl mx-auto mb-3 sm:mb-4" />
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Pre-Booking Confirmed!</h1>
                            <p className="text-sm sm:text-base text-gray-600 px-2">Your pre-booking has been confirmed and will be processed soon.</p>
                            <div className="mt-3 sm:mt-4 inline-flex items-center px-3 sm:px-4 py-2 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm font-medium">
                                Pre-Booking ID: {orderDetails.orderID}
                            </div>
                        </>
                    )}
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
                                                    {item.brandName && (
                                                        <p className="text-xs text-blue-600 font-medium mt-0.5">{item.brandName}</p>
                                                    )}
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
                                                                {comboItem.brandName && (
                                                                    <p className="text-xs text-blue-600 font-medium">{comboItem.brandName}</p>
                                                                )}
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
                                                                    {item.brandName && (
                                                                        <p className="text-xs text-blue-600 font-medium">{item.brandName}</p>
                                                                    )}
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
                                                                        {comboItem.brandName && (
                                                                            <p className="text-xs text-blue-600 font-medium">{comboItem.brandName}</p>
                                                                        )}
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
                                        {/* Payment breakdown */}
                                        {orderDetails.paidWallet > 0 && (
                                            <div className="mt-2 space-y-1 border-t pt-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Paid via Wallet:</span>
                                                    <span className="font-medium">{formatPrice(orderDetails.paidWallet)}</span>
                                                </div>
                                                {Math.max(0, (orderDetails.total || 0) - (orderDetails.paidWallet || 0)) > 0 ? (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">To pay by {orderDetails.paymentMode === 'PREPAID' ? 'Online' : 'COD'}:</span>
                                                        <span className="font-medium">{formatPrice(Math.max(0, (orderDetails.total || 0) - (orderDetails.paidWallet || 0)))}</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Status:</span>
                                                        <span className="font-medium text-green-600">Fully paid via Wallet</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Information Cards (25%) */}
                    <div className="lg:col-span-4 flex flex-col space-y-4 sm:space-y-6 order-1 lg:order-2">
                        {/* Coins Earned / Pending Cashback / Cancelled */}
                        {(() => {
                            const isPaymentFailed = orderDetails.paymentStatus === 'failed';
                            const hasCoins = typeof orderDetails.coinsEarned === 'number' && orderDetails.coinsEarned > 0;
                            const isPaymentPending = orderDetails.paymentMode === 'PREPAID' && orderDetails.paymentStatus === 'pending';
                            
                            // Show coins section if there are coins (even if 0) OR if payment failed (to show cancelled message)
                            if (hasCoins || isPaymentFailed) {
                                return (
                                    <div className="bg-white rounded-lg border border-gray-200 p-0 overflow-hidden">
                                        <div className={`p-4 sm:p-6 ${
                                            isPaymentFailed 
                                                ? 'bg-red-50' 
                                                : isPaymentPending 
                                                    ? 'bg-yellow-50' 
                                                    : 'coins-animated-bg'
                                        }`}>
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                                                    {isPaymentFailed
                                                        ? 'Ithyaraa Coins Earning Cancelled'
                                                        : isPaymentPending
                                                            ? 'Pending Cashback'
                                                            : 'Ithyaraa Coins Earned'}
                                                </h3>
                                                {!isPaymentFailed && (
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs sm:text-sm font-medium ${
                                                        isPaymentPending
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-amber-100 text-amber-800'
                                                    }`}>
                                                        +{orderDetails.coinsEarned} coins
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs sm:text-sm text-gray-700 mt-2">
                                                {isPaymentFailed
                                                    ? 'Payment failed. Coins were not earned for this order.'
                                                    : isPaymentPending
                                                        ? `You will earn ${orderDetails.coinsEarned} coins once payment is confirmed. Coins expire after 365 days.`
                                                        : `You earned ${orderDetails.coinsEarned} coins for this order. Coins expire after 365 days.`}
                                            </p>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })()}
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
                                    {orderDetails.paymentMode === 'COD' ? (
                                        <span className={`ml-0 sm:ml-2 mt-1 sm:mt-0 inline-block px-2 py-1 rounded text-xs bg-gray-100 text-gray-800`}>
                                            Pay on delivery
                                        </span>
                                    ) : (
                                        <span className={`ml-0 sm:ml-2 mt-1 sm:mt-0 inline-block px-2 py-1 rounded text-xs ${
                                            orderDetails.paymentStatus === 'pending'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : orderDetails.paymentStatus === 'failed'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-green-100 text-green-800'
                                            }`}>
                                            {orderDetails.paymentStatus === 'pending' 
                                                ? 'Verifying payment...' 
                                                : orderDetails.paymentStatus === 'successful' 
                                                ? 'Payment successful' 
                                                : orderDetails.paymentStatus === 'failed'
                                                ? 'Payment failed'
                                                : 'Payment ' + orderDetails.paymentStatus}
                                        </span>
                                    )}
                                </div>
                                {orderDetails.paymentMode === 'PREPAID' && orderDetails.paymentStatus === 'pending' && (
                                    <div className="text-xs sm:text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-3 py-2 mt-2">
                                        <div className="flex items-start space-x-2">
                                            {isCheckingPayment && (
                                                <ClipLoader size={12} color="#D97706" className="mt-0.5" />
                                            )}
                                            <div className="flex-1">
                                                <p className="font-medium mb-1">
                                                    {isCheckingPayment ? '🔄 Checking payment status...' : '⏳ Payment verification in progress'}
                                                </p>
                                                <p className="text-yellow-600">Your payment is being verified. This page will update automatically once confirmed.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {orderDetails.paidWallet > 0 && (
                                    <div className="flex flex-col sm:flex-row sm:items-center">
                                        <span className="font-medium">Wallet:</span>
                                        <span className="ml-0 sm:ml-2 mt-1 sm:mt-0 inline-block px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                                            Used {formatPrice(orderDetails.paidWallet)}
                                        </span>
                                    </div>
                                )}
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
                                {(() => {
                                    const ui = getOrderStatusUI(orderDetails.orderStatus);
                                    return (
                                        <>
                                            <div className="flex items-center space-x-2">
                                                <div className={`w-3 h-3 rounded-full ${ui.dot}`}></div>
                                                <span className="text-gray-700 text-sm sm:text-base">{ui.label}</span>
                                            </div>
                                            {orderDetails.paymentMode === 'COD' ? (
                                                <span className={`text-xs sm:text-sm inline-block px-2 py-1 rounded bg-gray-100 text-gray-800`}>
                                                    Pay on delivery
                                                </span>
                                            ) : (
                                                <span className={`text-xs sm:text-sm inline-block px-2 py-1 rounded ${
                                                    orderDetails.paymentStatus === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : orderDetails.paymentStatus === 'failed'
                                                        ? 'bg-red-100 text-red-800'
                                                        : ui.badge
                                                }`}>
                                                    {orderDetails.paymentStatus === 'pending' 
                                                        ? 'Verifying payment...' 
                                                        : orderDetails.paymentStatus === 'failed'
                                                        ? 'Payment failed'
                                                        : 'Payment completed'}
                                                </span>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2 sm:px-0">
                    <button
                        onClick={handleDownloadInvoice}
                        disabled={downloadingInvoice}
                        className="inline-flex items-center justify-center px-4 sm:px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {downloadingInvoice ? (
                            <>
                                <ClipLoader size={16} color="#ffffff" className="mr-2" />
                                Downloading...
                            </>
                        ) : (
                            <>
                                <FaDownload className="mr-2" />
                                Download Invoice
                            </>
                        )}
                    </button>
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
                {/* Congrats modal with confetti - Don't show if payment is pending or failed */}
                {showCongrats && !(orderDetails.paymentMode === 'PREPAID' && orderDetails.paymentStatus === 'pending') && orderDetails.paymentStatus !== 'failed' && (
                    <div 
                        className="confetti-overlay" 
                        role="dialog" 
                        aria-modal="true"
                        onClick={() => setShowCongrats(false)}
                    >
                        <div 
                            className="confetti-card"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Congratulations! 🎉</h3>
                            <p className="text-sm text-gray-600 mt-2">
                                You earned <span className="font-semibold text-amber-600">{orderDetails?.coinsEarned}</span> Ithyaraa coin{(orderDetails?.coinsEarned || 0) > 1 ? 's' : ''}.
                            </p>
                            <p className="text-xs text-gray-500 mt-1">You can use them on your next order.</p>
                            <button onClick={() => setShowCongrats(false)}
                                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                                Awesome
                            </button>
                            {/* Simple confetti pieces */}
                            {Array.from({ length: 24 }).map((_, i) => {
                                const left = Math.random() * 100; // vw percent
                                const delay = Math.random() * 0.6; // s
                                const duration = 1.8 + Math.random() * 1.2; // s
                                const colors = ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6'];
                                const color = colors[i % colors.length];
                                return (
                                    <span key={i}
                                        className="confetti"
                                        style={{ left: `${left}%`, background: color, animationDuration: `${duration}s`, animationDelay: `${delay}s` }} />
                                );
                            })}
                        </div>
                        <style jsx global>{`
                            .confetti-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; z-index: 50; }
                            .confetti-card { background: #fff; border-radius: 12px; padding: 20px; max-width: 420px; width: 90%; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.2); position: relative; overflow: hidden; }
                            .confetti { position: absolute; top: -10px; width: 8px; height: 14px; opacity: 0.9; animation: fall linear forwards; }
                            @keyframes fall { from { transform: translateY(-20px) rotate(0deg); } to { transform: translateY(520px) rotate(720deg); } }
                            /* Animated gradient for coins card */
                            .coins-animated-bg { 
                                background: linear-gradient(120deg, rgba(255,251,235,1), rgba(254,243,199,1), rgba(254,240,138,1));
                                background-size: 200% 200%;
                                animation: coinsGlow 4s ease infinite;
                            }
                            @keyframes coinsGlow {
                                0% { background-position: 0% 50%; }
                                50% { background-position: 100% 50%; }
                                100% { background-position: 0% 50%; }
                            }
                        `}</style>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PresaleOrderSuccessPage;
