'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axiosInstance from '@/lib/axiosInstance'
import {
    FaTruck,
    FaCheckCircle,
    FaClock,
    FaBox,
    FaTimesCircle,
    FaMapMarkerAlt,
    FaPhone,
    FaEnvelope,
    FaChevronRight,
    FaArrowLeft
} from 'react-icons/fa'
import Image from 'next/image'
import Link from 'next/link'
import { ClipLoader } from 'react-spinners'

const TrackOrder = () => {
    const router = useRouter()
    const [orderSummaries, setOrderSummaries] = useState([])
    const [selectedOrderDetails, setSelectedOrderDetails] = useState(null)
    const [loading, setLoading] = useState(true)
    const [loadingDetails, setLoadingDetails] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState(null)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [searchOrderID, setSearchOrderID] = useState('')
    const [totalOrders, setTotalOrders] = useState(0)

    useEffect(() => {
        fetchOrderSummaries(1, true)
    }, [])

    useEffect(() => {
        if (selectedOrder) {
            fetchOrderDetails(selectedOrder)
        }
    }, [selectedOrder])

    const fetchOrderSummaries = async (page = 1, reset = false) => {
        try {
            if (page === 1) {
                setLoading(true)
            } else {
                setLoadingMore(true)
            }

            const url = searchOrderID
                ? `/order/get-order-summaries?page=${page}&limit=10&orderID=${searchOrderID}`
                : `/order/get-order-summaries?page=${page}&limit=10`

            const response = await axiosInstance.get(url)

            if (response.data?.success) {
                if (reset || page === 1) {
                    setOrderSummaries(response.data.data)
                    // Auto-select the most recent order if available
                    if (response.data.data.length > 0) {
                        setSelectedOrder(response.data.data[0].orderID)
                    }
                } else {
                    setOrderSummaries(prev => [...prev, ...response.data.data])
                }

                setCurrentPage(page)
                setHasMore(response.data.hasMore)
                setTotalOrders(response.data.total)
            } else {
                setError('Failed to load orders')
            }
        } catch (err) {
            console.error('Error fetching order summaries:', err)
            setError('Failed to load orders')
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }

    const handleSearch = () => {
        setCurrentPage(1)
        fetchOrderSummaries(1, true)
    }

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target
        if (scrollHeight - scrollTop <= clientHeight + 100 && hasMore && !loadingMore) {
            fetchOrderSummaries(currentPage + 1, false)
        }
    }

    const fetchOrderDetails = async (orderID) => {
        try {
            setLoadingDetails(true)
            const response = await axiosInstance.get(`/order/order-details/${orderID}`)

            if (response.data?.success) {
                // Process items and group by order
                const items = response.data.items

                if (items.length > 0) {
                    const orderData = {
                        orderID: items[0].orderID,
                        createdAt: items[0].orderCreatedAt || items[0].createdAt,
                        paymentMode: items[0].paymentMode,
                        paymentStatus: items[0].paymentStatus,
                        orderStatus: items[0].orderStatus,
                        shippingAddress: items[0].shippingAddress,
                        contactNumber: items[0].contactNumber,
                        email: items[0].email,
                        total: items[0].total || items.reduce((sum, item) => sum + parseFloat(item.lineTotalAfter || 0), 0),
                        items: items.map(item => ({
                            ...item,
                            featuredImage: Array.isArray(item.featuredImage) ? item.featuredImage : []
                        }))
                    }
                    setSelectedOrderDetails(orderData)
                }
            }
        } catch (err) {
            console.error('Error fetching order details:', err)
            setSelectedOrderDetails(null)
        } finally {
            setLoadingDetails(false)
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatPrice = (price) => {
        const numPrice = parseFloat(price) || 0
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(numPrice)
    }

    const getOrderStatusSteps = (orderStatus) => {
        const status = orderStatus?.toLowerCase()

        // For cancelled orders
        if (status === 'cancelled') {
            return [
                { key: 'pending', label: 'Order Confirmed', icon: FaCheckCircle, isActive: true, isCurrent: false },
                { key: 'cancelled', label: 'Cancelled', icon: FaTimesCircle, isActive: true, isCurrent: true }
            ]
        }

        // For returned orders
        if (status === 'returned' || status === 'return') {
            return [
                { key: 'pending', label: 'Order Confirmed', icon: FaCheckCircle, isActive: true, isCurrent: false },
                { key: 'preparing', label: 'Preparing', icon: FaBox, isActive: true, isCurrent: false },
                { key: 'shipped', label: 'Shipped', icon: FaTruck, isActive: true, isCurrent: false },
                { key: 'delivered', label: 'Delivered', icon: FaCheckCircle, isActive: true, isCurrent: false },
                { key: 'returned', label: 'Returned', icon: FaTimesCircle, isActive: true, isCurrent: true }
            ]
        }

        // For other order statuses (pending, preparing, shipped, delivered)
        const statuses = [
            { key: 'pending', label: 'Order Confirmed', icon: FaCheckCircle },
            { key: 'preparing', label: 'Preparing', icon: FaBox },
            { key: 'shipped', label: 'Shipped', icon: FaTruck },
            { key: 'delivered', label: 'Delivered', icon: FaCheckCircle }
        ]

        const statusIndex = statuses.findIndex(s => s.key.toLowerCase() === status)

        return statuses.map((status, index) => {
            const isActive = index <= statusIndex
            const isCurrent = index === statusIndex

            return {
                ...status,
                isActive,
                isCurrent
            }
        })
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <ClipLoader color="#FCD34D" size={50} />
            </div>
        )
    }

    if (error || orderSummaries.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        <Link href="/profile" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
                            <FaArrowLeft className="mr-2" />
                            Back to Profile
                        </Link>
                        <div className="bg-white rounded-lg shadow p-8 text-center">
                            <FaTimesCircle className="text-gray-400 text-6xl mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Found</h2>
                            <p className="text-gray-600 mb-6">
                                {error || 'You haven\'t placed any orders yet.'}
                            </p>
                            <Link href="/shop" className="inline-flex items-center px-6 py-3 bg-primary-yellow text-white rounded-lg hover:bg-yellow-500">
                                Start Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    {/* <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Track Your Order</h1>
                            <p className="text-gray-600 mt-2">Monitor your order status and delivery updates</p>
                        </div>
                        <Link href="/profile" className="inline-flex items-center text-gray-600 hover:text-gray-900">
                            <FaArrowLeft className="mr-2" />
                            Back to Profile
                        </Link>
                    </div> */}

                    {/* Search Bar */}
                    <div className="bg-white rounded-lg shadow p-4 mb-6 md:mb-8">
                        <div className="flex flex-col sm:flex-row gap-3 ">
                            <input
                                type="text"
                                placeholder="Enter Order ID to track..."
                                value={searchOrderID}
                                onChange={(e) => setSearchOrderID(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="flex-1 px-4 py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-yellow transition-all"
                            />
                            <button
                                onClick={handleSearch}
                                className="w-full sm:w-auto px-6 py-3 bg-primary-yellow text-white rounded-lg hover:bg-yellow-500 transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
                            >
                                <FaTruck className="text-base sm:text-lg" />
                                Track Order
                            </button>
                        </div>
                        {totalOrders > 0 && !searchOrderID && (
                            <p className="text-xs sm:text-sm text-gray-500 mt-3 hidden sm:block">
                                Total: {totalOrders} order{totalOrders !== 1 ? 's' : ''} • Scroll down to load more
                            </p>
                        )}
                        {totalOrders > 0 && !searchOrderID && (
                            <p className="text-xs sm:text-sm text-gray-500 mt-3 block sm:hidden">
                                Total: {totalOrders} order{totalOrders !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                        {/* Order List */}
                        <div className="lg:col-span-1 ">
                            <div className="bg-white rounded-lg shadow p-4 md:p-6">
                                <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Your Orders</h2>

                                <div className="space-y-2 md:space-y-3 max-h-[400px] md:max-h-[600px] overflow-y-auto" onScroll={handleScroll}>
                                    {orderSummaries.map((order, index) => (
                                        <div
                                            key={index}
                                            onClick={() => setSelectedOrder(order.orderID)}
                                            className={`p-3 md:p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedOrder === order.orderID
                                                ? 'border-primary-yellow bg-yellow-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >

                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 text-sm md:text-base truncate">Order #{order.orderID}</p>
                                                    <p className="text-xs md:text-sm text-gray-500">{formatDate(order.orderCreatedAt)}</p>
                                                </div>
                                                <FaChevronRight className="text-gray-400 flex-shrink-0 ml-2" />
                                            </div>
                                            <div className="flex items-center justify-between mt-2 md:mt-3 gap-2">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${order.orderStatus?.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-800' :
                                                    order.orderStatus?.toLowerCase() === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                                        order.orderStatus?.toLowerCase() === 'preparing' ? 'bg-orange-100 text-orange-800' :
                                                            order.orderStatus?.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                                order.orderStatus?.toLowerCase() === 'returned' || order.orderStatus?.toLowerCase() === 'return' ? 'bg-purple-100 text-purple-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1)}
                                                </span>
                                                <p className="text-xs md:text-sm font-semibold text-gray-900">
                                                    {formatPrice(order.total)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}

                                    {loadingMore && (
                                        <div className="flex justify-center py-4">
                                            <ClipLoader color="#FCD34D" size={30} />
                                        </div>
                                    )}

                                    {!hasMore && orderSummaries.length > 0 && (
                                        <div className="text-center py-4 text-sm text-gray-500">
                                            No more orders to load
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Order Details */}
                        <div className="lg:col-span-2">
                            {loadingDetails ? (
                                <div className="bg-white rounded-lg shadow p-12 text-center">
                                    <ClipLoader color="#FCD34D" size={50} />
                                    <p className="text-gray-600 mt-4">Loading order details...</p>
                                </div>
                            ) : selectedOrderDetails ? (
                                <>
                                    <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-4 md:mb-6">
                                        {/* Order Status Timeline */}
                                        <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Order Status</h2>
                                        <div className="relative">
                                            <div className="absolute left-4 md:left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                                            {getOrderStatusSteps(selectedOrderDetails.orderStatus).map((step, index) => {
                                                const Icon = step.icon
                                                return (
                                                    <div key={index} className="relative flex items-center mb-6 md:mb-8">
                                                        <div className={`flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center z-10 ${step.isActive
                                                            ? step.isCurrent
                                                                ? (step.key === 'cancelled' || step.key === 'returned'
                                                                    ? 'bg-red-600 text-white'
                                                                    : 'bg-primary-yellow text-white')
                                                                : 'bg-green-500 text-white'
                                                            : 'bg-gray-200 text-gray-400'
                                                            }`}>
                                                            <Icon size={20} className="md:w-6 md:h-6" />
                                                        </div>
                                                        <div className="ml-3 md:ml-4 flex-1">
                                                            <h3 className={`font-medium text-sm md:text-base ${step.isCurrent
                                                                ? (step.key === 'cancelled' || step.key === 'returned' ? 'text-red-600' : 'text-primary-yellow')
                                                                : 'text-gray-900'
                                                                }`}>
                                                                {step.label}
                                                            </h3>
                                                            {step.isCurrent && (
                                                                <p className={`text-xs md:text-sm mt-1 ${step.key === 'cancelled' ? 'text-red-600' :
                                                                    step.key === 'returned' ? 'text-purple-600' :
                                                                        'text-gray-500'
                                                                    }`}>
                                                                    {step.key === 'cancelled' ? 'This order has been cancelled' :
                                                                        step.key === 'returned' ? 'This order has been returned' :
                                                                            'Your order is currently being processed'}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>

                                        {/* Track Live Shipment Button */}
                                        {(selectedOrderDetails.orderStatus === 'shipped' || selectedOrderDetails.orderStatus === 'shipping') && (
                                            <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200">
                                                <a
                                                    href="https://www.shiprocket.in/tracking"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center w-full px-4 md:px-6 py-2 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
                                                >
                                                    <FaTruck className="mr-2" />
                                                    Track Live Shipment
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    {/* Order Items */}
                                    <div className="bg-white rounded-lg shadow p-4 md:p-6">
                                        <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">Order Details</h2>

                                        <div className="space-y-3 md:space-y-4">
                                            {selectedOrderDetails.items.map((item, index) => (
                                                <div key={index} className="flex items-start gap-2 md:gap-4 pb-3 md:pb-4 border-b border-gray-200 last:border-0">
                                                    <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-lg overflow-hidden">
                                                        {item.featuredImage && Array.isArray(item.featuredImage) && item.featuredImage.length > 0 ? (
                                                            <Image
                                                                src={typeof item.featuredImage[0] === 'string' ? item.featuredImage[0] : item.featuredImage[0].imgUrl}
                                                                alt={typeof item.featuredImage[0] === 'object' ? item.featuredImage[0].imgAlt : item.name}
                                                                width={80}
                                                                height={80}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                                                <FaBox className="text-gray-400 text-base md:text-2xl" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-medium text-gray-900 text-sm md:text-base line-clamp-2">{item.name}</h3>
                                                        {item.variation && item.variation.variationValues && (
                                                            <p className="text-xs md:text-sm text-gray-500 mt-1">
                                                                {item.variation.variationValues.map((v, idx) => (
                                                                    <span key={idx}>
                                                                        {v.label}: {v.value}
                                                                        {idx < item.variation.variationValues.length - 1 && ' | '}
                                                                    </span>
                                                                ))}
                                                            </p>
                                                        )}
                                                        <p className="text-xs md:text-sm text-gray-500">Qty: {item.quantity}</p>

                                                        {/* Tracking Info */}
                                                        {item.trackingCode && (
                                                            <div className="mt-2 flex items-center gap-2">
                                                                <FaTruck className="text-blue-500 text-xs" />
                                                                <span className="text-xs text-blue-600 font-medium">{item.trackingCode}</span>
                                                                {item.deliveryCompany && (
                                                                    <span className="text-xs text-gray-500">• {item.deliveryCompany}</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <p className="font-medium text-gray-900 text-sm md:text-base">{formatPrice(item.lineTotalAfter)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Shipping Address */}
                                        {selectedOrderDetails.shippingAddress && (
                                            <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200">
                                                <h3 className="font-medium text-gray-900 mb-2 md:mb-3 flex items-center text-sm md:text-base">
                                                    <FaMapMarkerAlt className="mr-2 text-primary-yellow text-base md:text-lg" />
                                                    Shipping Address
                                                </h3>
                                                <p className="text-xs md:text-sm text-gray-600">{selectedOrderDetails.shippingAddress}</p>
                                                {selectedOrderDetails.contactNumber && (
                                                    <p className="text-xs md:text-sm text-gray-600 mt-2 flex items-center">
                                                        <FaPhone className="mr-2 text-base md:text-sm" />
                                                        {selectedOrderDetails.contactNumber}
                                                    </p>
                                                )}
                                                {selectedOrderDetails.email && (
                                                    <p className="text-xs md:text-sm text-gray-600 mt-2 flex items-center">
                                                        <FaEnvelope className="mr-2 text-base md:text-sm" />
                                                        {selectedOrderDetails.email}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Order Summary */}
                                        <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200">
                                            <div className="flex justify-between items-center text-base md:text-lg font-semibold text-gray-900">
                                                <span>Total Amount</span>
                                                <span>{formatPrice(selectedOrderDetails.total)}</span>
                                            </div>
                                            <p className="text-xs md:text-sm text-gray-600 mt-2">
                                                Payment Method: <span className="font-medium capitalize">{selectedOrderDetails.paymentMode}</span>
                                            </p>
                                            <p className="text-xs md:text-sm text-gray-600 mt-1">
                                                Payment Status: <span className={`font-medium capitalize ${selectedOrderDetails.paymentStatus === 'paid' || selectedOrderDetails.paymentStatus === 'successful' ? 'text-green-600' : 'text-orange-600'
                                                    }`}>
                                                    {selectedOrderDetails.paymentStatus}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="bg-white rounded-lg shadow p-8 text-center">
                                    <FaBox className="text-gray-300 text-5xl mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Order</h3>
                                    <p className="text-gray-600">Choose an order from the list to view details</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TrackOrder
