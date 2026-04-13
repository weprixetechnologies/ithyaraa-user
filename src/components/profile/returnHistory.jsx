'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axiosInstance from '@/lib/axiosInstance'
import { FaEye, FaTruck, FaCalendarAlt, FaChevronLeft, FaChevronRight, FaUndo } from 'react-icons/fa'
import { ClipLoader } from 'react-spinners'

const RETURN_STATUS_LABELS = {
    return_requested: 'Return requested',
    return_initiated: 'Return initiated',
    return_picked: 'Return picked',
    replacement_processing: 'Replacement in progress',
    replacement_shipped: 'Replacement shipped',
    replacement_complete: 'Replacement complete',
    returnRejected: 'Return rejected',
    returned: 'Returned',
    refund_pending: 'Refund pending – executive will contact you',
    refund_completed: 'Refund completed'
}

const ReturnHistory = () => {
    const [returns, setReturns] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalReturns, setTotalReturns] = useState(0)
    const router = useRouter()

    const PER_PAGE = 10

    useEffect(() => {
        const fetchReturns = async () => {
            try {
                setLoading(true)
                const response = await axiosInstance.get('/order/my-returns')
                if (response.data?.success && Array.isArray(response.data.returns)) {
                    const list = response.data.returns
                    setTotalReturns(list.length)
                    setTotalPages(Math.max(1, Math.ceil(list.length / PER_PAGE)))
                    const start = (currentPage - 1) * PER_PAGE
                    setReturns(list.slice(start, start + PER_PAGE))
                } else {
                    setReturns([])
                    setTotalReturns(0)
                    setTotalPages(1)
                }
            } catch (err) {
                console.error('Fetch returns error:', err)
                setError('Failed to load returns')
            } finally {
                setLoading(false)
            }
        }
        fetchReturns()
    }, [currentPage])

    const formatDate = (dateString) => {
        if (!dateString) return '—'
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatPrice = (price) => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(numPrice || 0)
    }

    const getReturnStatusColor = (status) => {
        const s = String(status || '').toLowerCase()
        if (s.includes('returnrejected')) return 'bg-red-100 text-red-800'
        if (s.includes('refund_pending')) return 'bg-amber-100 text-amber-800'
        if (s.includes('refund_completed') || s.includes('returned') || s.includes('replacement_complete')) return 'bg-green-100 text-green-800'
        if (s.includes('replacement_shipped')) return 'bg-blue-100 text-blue-800'
        return 'bg-gray-100 text-gray-800'
    }

    const handleViewOrder = (orderId) => {
        router.push(`/order-status/order-summary/${orderId}`)
    }

    const handleViewReturnDetail = (orderID, orderItemID) => {
        router.push(`/returns/${orderID}/${orderItemID}`)
    }

    const handlePageChange = (page) => setCurrentPage(page)
    const handlePrev = () => { if (currentPage > 1) setCurrentPage(p => p - 1) }
    const handleNext = () => { if (currentPage < totalPages) setCurrentPage(p => p + 1) }

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
                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Retry
                </button>
            </div>
        )
    }

    if (returns.length === 0) {
        return (
            <div className="text-center py-12">
                <FaUndo className="text-gray-400 text-6xl mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Returns</h3>
                <p className="text-gray-600 mb-6">You don’t have any return or refund in progress.</p>
                <button
                    onClick={() => router.push('/profile?tab=orderhistory')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    View Order History
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Returns & Refunds</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Track return status, pickup code and tracking link
                    </p>
                </div>
                <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * PER_PAGE) + 1} to {Math.min(currentPage * PER_PAGE, totalReturns)} of {totalReturns} return(s)
                </div>
            </div>

            <div className="space-y-4">
                {returns.map((order) => (
                    <div key={order.orderID} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <FaUndo className="text-amber-500 text-lg" />
                                <div>
                                    <h3 className="font-medium text-gray-900">Order #{order.orderID}</h3>
                                    <p className="text-sm text-gray-500 flex items-center">
                                        <FaCalendarAlt className="mr-1" />
                                        Ordered {formatDate(order.orderCreatedAt)}
                                        {order.deliveredAt && (
                                            <span className="ml-2">· Delivered {formatDate(order.deliveredAt)}</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleViewOrder(order.orderID)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <FaEye className="mr-2" />
                                View Order
                            </button>
                        </div>

                        <div className="space-y-3">
                            {order.items.map((item) => {
                                let parsedImage = []
                                if (item.featuredImage && typeof item.featuredImage === 'string') {
                                    try {
                                        let jsonString = item.featuredImage
                                        if (jsonString.startsWith('"') && jsonString.endsWith('"')) {
                                            jsonString = JSON.parse(jsonString)
                                        }
                                        if (typeof jsonString === 'string' && jsonString.startsWith('"') && jsonString.endsWith('"')) {
                                            jsonString = JSON.parse(jsonString)
                                        }
                                        parsedImage = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString
                                        if (!Array.isArray(parsedImage)) parsedImage = []
                                    } catch (_) {
                                        parsedImage = []
                                    }
                                } else if (Array.isArray(item.featuredImage)) {
                                    parsedImage = item.featuredImage
                                }
                                const imgUrl = parsedImage?.[0]?.imgUrl
                                return (
                                    <div key={item.orderItemID} className="flex flex-wrap items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <img
                                            src={imgUrl || '/placeholder-product.jpg'}
                                            alt={item.name}
                                            className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                                            {item.variationName && (
                                                <p className="text-sm text-gray-500">Variant: {item.variationName}</p>
                                            )}
                                            <p className="text-sm text-gray-600">Qty: {item.quantity} · {formatPrice(item.lineTotalAfter)}</p>
                                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getReturnStatusColor(item.returnStatus)}`}>
                                                    {RETURN_STATUS_LABELS[item.returnStatus] || item.returnStatus}
                                                </span>
                                                {item.returnRequestedAt && (
                                                    <span className="text-xs text-gray-500">
                                                        Return requested {formatDate(item.returnRequestedAt)}
                                                    </span>
                                                )}
                                            </div>
                                            {item.returnRejectionReason && (
                                                <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Rejection Reason</p>
                                                    <p className="mt-1 text-sm text-red-700">{item.returnRejectionReason}</p>
                                                </div>
                                            )}
                                            {(item.returnTrackingCode || item.returnTrackingUrl) && (
                                                <div className="mt-2 space-y-1">
                                                    {item.returnTrackingCode && (
                                                        <p className="text-sm">
                                                            <span className="text-gray-500">Pickup / AWB:</span>{' '}
                                                            <span className="font-mono font-medium">{item.returnTrackingCode}</span>
                                                            {item.returnDeliveryCompany && (
                                                                <span className="text-gray-500 ml-1">({item.returnDeliveryCompany})</span>
                                                            )}
                                                        </p>
                                                    )}
                                                    {item.returnTrackingUrl && (
                                                        <p className="text-sm">
                                                            <a
                                                                href={item.returnTrackingUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:underline"
                                                            >
                                                                Track return →
                                                            </a>
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleViewReturnDetail(order.orderID, item.orderItemID)}
                                            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            <FaEye className="mr-1" />
                                            View return details
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                    <button
                        onClick={handlePrev}
                        disabled={currentPage <= 1}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaChevronLeft className="mr-1" /> Previous
                    </button>
                    <span className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={handleNext}
                        disabled={currentPage >= totalPages}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next <FaChevronRight className="ml-1" />
                    </button>
                </div>
            )}
        </div>
    )
}

export default ReturnHistory
