'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axiosInstance from '@/lib/axiosInstance'
import { FaEye, FaTruck, FaCreditCard, FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { ClipLoader } from 'react-spinners'

const PreBookedHistory = () => {
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalBookings, setTotalBookings] = useState(0)
    const router = useRouter()

    const BOOKINGS_PER_PAGE = 10

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true)
                const response = await axiosInstance.get(`/presale/my-bookings?page=${currentPage}&limit=${BOOKINGS_PER_PAGE}`)

                if (response.data?.success) {
                    const bookingsData = response.data.bookings || []
                    setBookings(bookingsData)
                    setTotalBookings(response.data.pagination?.totalBookings || 0)
                    setTotalPages(response.data.pagination?.totalPages || 1)
                } else {
                    setError('Failed to load pre-bookings')
                }
            } catch (err) {
                console.error('Error fetching pre-bookings:', err)
                setError('Failed to load pre-bookings')
            } finally {
                setLoading(false)
            }
        }

        fetchBookings()
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

    const getOrderStatusColor = (orderStatus) => {
        switch (orderStatus?.toLowerCase()) {
            case 'confirmed':
                return 'bg-blue-100 text-blue-800'
            case 'preparing':
                return 'bg-blue-100 text-blue-800'
            case 'shipping':
                return 'bg-orange-100 text-orange-800'
            case 'delivered':
                return 'bg-green-100 text-green-800'
            case 'cancelled':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getOrderStatusText = (orderStatus) => {
        switch (orderStatus?.toLowerCase()) {
            case 'pending':
                return 'Getting Confirmed...'
            case 'confirmed':
                return 'Confirmed'
            case 'preparing':
                return 'Preparing'
            case 'shipping':
                return 'Shipping'
            case 'delivered':
                return 'Delivered'
            case 'cancelled':
                return 'Cancelled'
            default:
                return orderStatus || 'Pending'
        }
    }

    const getPaymentStatusColor = (paymentStatus, paymentMode) => {
        if (paymentMode === 'COD') {
            return 'bg-gray-100 text-gray-800'
        }
        switch (paymentStatus?.toLowerCase()) {
            case 'successful':
            case 'paid':
                return 'bg-green-100 text-green-800'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'failed':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getPaymentStatusText = (paymentStatus, paymentMode) => {
        if (paymentMode === 'COD') {
            return 'Pay on Delivery'
        }
        switch (paymentStatus?.toLowerCase()) {
            case 'successful':
            case 'paid':
                return 'Paid'
            case 'pending':
                return 'Payment Pending'
            case 'failed':
                return 'Payment Failed'
            default:
                return paymentStatus || 'Pending'
        }
    }

    const handleViewBooking = (preBookingID) => {
        // Normalize path to prevent double slashes
        const path = `/presale/order-status/${preBookingID}`.replace(/\/+/g, '/');
        router.push(path)
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

    if (bookings.length === 0) {
        return (
            <div className="text-center py-12">
                <FaTruck className="text-gray-400 text-6xl mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pre-Bookings Yet</h3>
                <p className="text-gray-600 mb-6">You haven't placed any pre-bookings yet.</p>
                <button
                    onClick={() => router.push('/presale')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Browse Pre-Sale Products
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Pre-Booked History</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Track your pre-booking history and manage your pre-bookings
                    </p>
                </div>
                <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * BOOKINGS_PER_PAGE) + 1} to {Math.min(currentPage * BOOKINGS_PER_PAGE, totalBookings)} of {totalBookings} pre-bookings
                </div>
            </div>

            <div className="space-y-4">
                {bookings.map((booking) => (
                    <div key={booking.preBookingID} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        {/* Booking Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <FaTruck className="text-blue-500 text-lg" />
                                <div>
                                    <h3 className="font-medium text-gray-900">Pre-Booking #{booking.preBookingID}</h3>
                                    <p className="text-sm text-gray-500 flex items-center">
                                        <FaCalendarAlt className="mr-1" />
                                        {formatDate(booking.createdAt)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(booking.orderStatus)}`}>
                                    <FaTruck className="mr-1" />
                                    {getOrderStatusText(booking.orderStatus)}
                                </span>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus, booking.paymentMode)}`}>
                                    <FaCreditCard className="mr-1" />
                                    {getPaymentStatusText(booking.paymentStatus, booking.paymentMode)}
                                </span>
                                <button
                                    onClick={() => handleViewBooking(booking.preBookingID)}
                                    className="inline-flex items-center px-4 cursor-pointer py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                    <FaEye className="mr-2" />
                                    View Details
                                </button>
                            </div>
                        </div>

                        {/* Booking Summary */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-600">
                                    {booking.itemCount} item{booking.itemCount !== 1 ? 's' : ''}
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-gray-900">
                                        Total: {formatPrice(booking.total)}
                                    </p>
                                    {booking.totalDiscount > 0 && (
                                        <p className="text-sm text-green-600">
                                            Discount: -{formatPrice(booking.totalDiscount)}
                                        </p>
                                    )}
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
                                Showing <span className="font-medium">{((currentPage - 1) * BOOKINGS_PER_PAGE) + 1}</span> to{' '}
                                <span className="font-medium">{Math.min(currentPage * BOOKINGS_PER_PAGE, totalBookings)}</span> of{' '}
                                <span className="font-medium">{totalBookings}</span> results
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

export default PreBookedHistory

