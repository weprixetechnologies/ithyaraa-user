'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axiosInstance from '@/lib/axiosInstance'
import { FaEye, FaTruck, FaCreditCard, FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { ClipLoader } from 'react-spinners'

const OrderHistory = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalOrders, setTotalOrders] = useState(0)
    const router = useRouter()

    const ORDERS_PER_PAGE = 10

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true)
                const response = await axiosInstance.get('/order/get-order-items')

                if (response.data?.success) {
                    // Group orders by orderID
                    const groupedOrders = response.data.items.reduce((acc, item) => {
                        const orderId = item.orderID
                        if (!acc[orderId]) {
                            acc[orderId] = {
                                orderID: orderId,
                                items: [],
                                createdAt: item.orderCreatedAt || item.createdAt,
                                paymentMode: item.paymentMode,
                                paymentStatus: item.paymentStatus,
                                orderStatus: item.orderStatus
                            }
                        }

                        // Parse featuredImage if it's a JSON string
                        let parsedFeaturedImage = []
                        if (item.featuredImage && typeof item.featuredImage === 'string') {
                            try {
                                let jsonString = item.featuredImage
                                // Handle triple-encoded JSON strings
                                if (jsonString.startsWith('"') && jsonString.endsWith('"')) {
                                    jsonString = JSON.parse(jsonString) // First decode
                                }
                                if (jsonString.startsWith('"') && jsonString.endsWith('"')) {
                                    jsonString = JSON.parse(jsonString) // Second decode
                                }
                                parsedFeaturedImage = JSON.parse(jsonString) // Final decode
                            } catch (e) {
                                console.error('Error parsing featuredImage:', e)
                                parsedFeaturedImage = []
                            }
                        } else if (Array.isArray(item.featuredImage)) {
                            parsedFeaturedImage = item.featuredImage
                        }

                        acc[orderId].items.push({
                            ...item,
                            featuredImage: parsedFeaturedImage
                        })
                        return acc
                    }, {})

                    // Convert to array and sort by date
                    const ordersArray = Object.values(groupedOrders).sort((a, b) =>
                        new Date(b.createdAt) - new Date(a.createdAt)
                    )

                    // Calculate pagination
                    const total = ordersArray.length
                    const totalPages = Math.ceil(total / ORDERS_PER_PAGE)

                    setTotalOrders(total)
                    setTotalPages(totalPages)

                    // Get current page orders
                    const startIndex = (currentPage - 1) * ORDERS_PER_PAGE
                    const endIndex = startIndex + ORDERS_PER_PAGE
                    const currentOrders = ordersArray.slice(startIndex, endIndex)

                    setOrders(currentOrders)


                } else {
                    setError('Failed to load orders')
                }
            } catch (err) {
                console.error('Error fetching orders:', err)
                setError('Failed to load orders')
            } finally {
                setLoading(false)
            }
        }

        fetchOrders()
    }, [currentPage])

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const formatPrice = (price) => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(numPrice || 0)
    }

    const getTotalAmount = (items) => {
        return items.reduce((total, item) => {
            return total + (parseFloat(item.lineTotalAfter) || 0)
        }, 0)
    }

    const getOrderStatusColor = (orderStatus) => {
        switch (orderStatus?.toLowerCase()) {
            case 'preparing':
                return 'bg-blue-100 text-blue-800'
            case 'shipping':
                return 'bg-orange-100 text-orange-800'
            case 'delivered':
                return 'bg-green-100 text-green-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getOrderStatusText = (orderStatus) => {
        switch (orderStatus?.toLowerCase()) {
            case 'pending':
                return 'Getting Confirmed...'
            case 'preparing':
                return 'Preparing'
            case 'shipping':
                return 'Shipping'
            case 'delivered':
                return 'Delivered'
            default:
                return 'Error'
        }
    }

    const handleViewOrder = (orderId) => {
        router.push(`/order-success/order-summary/${orderId}`)
    }

    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1)
        }
    }

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1)
        }
    }

    const getPageNumbers = () => {
        const pages = []
        const maxVisiblePages = 5

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            const startPage = Math.max(1, currentPage - 2)
            const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i)
            }
        }

        return pages
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <ClipLoader size={40} color="#3B82F6" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        )
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-12">
                <FaTruck className="text-gray-400 text-6xl mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
                <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
                <button
                    onClick={() => router.push('/shop')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Start Shopping
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Track your order history and manage your orders
                    </p>
                </div>
                <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * ORDERS_PER_PAGE) + 1} to {Math.min(currentPage * ORDERS_PER_PAGE, totalOrders)} of {totalOrders} orders
                </div>
            </div>

            <div className="space-y-4">
                {orders.map((order) => (
                    <div key={order.orderID} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        {/* Order Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <FaTruck className="text-blue-500 text-lg" />
                                <div>
                                    <h3 className="font-medium text-gray-900">Order #{order.orderID}</h3>
                                    <p className="text-sm text-gray-500 flex items-center">
                                        <FaCalendarAlt className="mr-1" />
                                        {formatDate(order.createdAt)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.orderStatus)}`}>
                                    <FaTruck className="mr-1" />
                                    {getOrderStatusText(order.orderStatus)}
                                </span>
                                <button
                                    onClick={() => handleViewOrder(order.orderID)}
                                    className="inline-flex items-center px-4 cursor-pointer py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                    <FaEye className="mr-2" />
                                    View Details
                                </button>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-3">
                            {order.items.map((item, index) => (
                                <div key={index} className="space-y-2">
                                    {/* Main Item */}
                                    <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                                        <img
                                            src={item.featuredImage?.[0]?.imgUrl || '/placeholder-product.jpg'}
                                            alt={item.name}
                                            className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                                        />
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900 line-clamp-1">{item.name}</h4>
                                            {item.variationName && (
                                                <p className="text-sm text-gray-500">Variant: {item.variationName}</p>
                                            )}
                                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900">
                                                {formatPrice(item.lineTotalAfter || (item.salePrice || item.regularPrice || 0) * item.quantity)}
                                            </p>
                                            {item.salePrice && item.regularPrice && item.salePrice < item.regularPrice && (
                                                <p className="text-xs text-gray-500 line-through">
                                                    {formatPrice(item.regularPrice * item.quantity)}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Combo Items */}
                                    {item.comboItems && item.comboItems.length > 0 && (
                                        <div className="ml-4 pl-4 border-l-2 border-gray-300 space-y-2">
                                            <p className="text-xs font-medium text-gray-600">Includes:</p>
                                            {item.comboItems.map((comboItem, comboIndex) => (
                                                <div key={comboIndex} className="flex items-center space-x-3 p-2 bg-white rounded border">
                                                    <img
                                                        src={comboItem.featuredImage?.[0]?.imgUrl || '/placeholder-product.jpg'}
                                                        alt={comboItem.name}
                                                        className="w-12 h-12 rounded object-cover border border-gray-200"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-700">{comboItem.name}</p>
                                                        {comboItem.variationName && (
                                                            <p className="text-xs text-gray-500">Variant: {comboItem.variationName}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-600">
                                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-gray-900">
                                        Total: {formatPrice(getTotalAmount(order.items))}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
                    <div className="flex flex-1 justify-between sm:hidden">
                        <button
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="relative ml-3 inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{((currentPage - 1) * ORDERS_PER_PAGE) + 1}</span> to{' '}
                                <span className="font-medium">{Math.min(currentPage * ORDERS_PER_PAGE, totalOrders)}</span> of{' '}
                                <span className="font-medium">{totalOrders}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-lg shadow-sm" aria-label="Pagination">
                                <button
                                    onClick={handlePreviousPage}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center rounded-l-lg px-3 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="sr-only">Previous</span>
                                    <FaChevronLeft className="h-4 w-4" aria-hidden="true" />
                                </button>

                                {getPageNumbers().map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${page === currentPage
                                            ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center rounded-r-lg px-3 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="sr-only">Next</span>
                                    <FaChevronRight className="h-4 w-4" aria-hidden="true" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default OrderHistory
