"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axiosInstance from '@/lib/axiosInstance';
import { FaUndo, FaCalendarAlt, FaTruck, FaBox, FaExternalLinkAlt, FaArrowLeft } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';

const RETURN_STATUS_LABELS = {
    none: 'No return',
    return_requested: 'Return requested',
    return_initiated: 'Return initiated',
    return_picked: 'Return picked',
    replacement_processing: 'Replacement in progress',
    replacement_shipped: 'Replacement shipped',
    replacement_complete: 'Replacement complete',
    returnRejected: 'Return rejected',
    returned: 'Returned',
    refund_pending: 'Refund pending',
    refund_completed: 'Refund completed'
};

export default function ReturnDetailPage() {
    const params = useParams();
    const router = useRouter();
    const orderID = params.orderID;
    const orderItemID = params.orderItemID;

    const [order, setOrder] = useState(null);
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!orderID || !orderItemID) return;
        const fetchData = async () => {
            try {
                setLoading(true);
                const { data } = await axiosInstance.get(`/order/order-details/${orderID}`);
                if (!data?.success || !data.items?.length) {
                    setError('Order not found');
                    return;
                }
                const detail = data.orderDetail || {};
                const found = data.items.find((i) => String(i.orderItemID) === String(orderItemID));
                if (!found) {
                    setError('Return item not found');
                    return;
                }
                setOrder({
                    orderID: detail.orderID || orderID,
                    orderStatus: detail.orderStatus,
                    deliveredAt: detail.deliveredAt,
                    createdAt: detail.createdAt,
                    total: detail.total
                });
                setItem(found);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load return details');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [orderID, orderItemID]);

    const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');
    const formatPrice = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(p) || 0);

    let parsedImage = item?.featuredImage;
    if (typeof item?.featuredImage === 'string') {
        try {
            parsedImage = JSON.parse(item.featuredImage);
        } catch (_) {
            parsedImage = [];
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <ClipLoader size={40} color="#3B82F6" />
            </div>
        );
    }

    if (error || !order || !item) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <p className="text-red-600 mb-4">{error || 'Return not found'}</p>
                    <Link href="/profile?tab=returns" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <FaArrowLeft className="mr-2" /> Back to Returns
                    </Link>
                </div>
            </div>
        );
    }

    const statusLabel = RETURN_STATUS_LABELS[item.returnStatus] || item.returnStatus;
    const statusClassName = item.returnStatus === 'returnRejected'
        ? 'bg-red-100 text-red-800'
        : 'bg-amber-100 text-amber-800';

    return (
        <div className="min-h-screen bg-gray-50 py-6 sm:py-10">
            <div className="max-w-3xl mx-auto px-4">
                <Link
                    href="/profile?tab=returns"
                    className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 text-sm"
                >
                    <FaArrowLeft className="mr-2" /> Back to Returns
                </Link>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-amber-50 border-b border-amber-100 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-amber-200 flex items-center justify-center">
                                <FaUndo className="text-amber-700 text-xl" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Return Details</h1>
                                <p className="text-sm text-gray-600">Order #{order.orderID} · Item return</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        <section>
                            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Returning item</h2>
                            <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                                <img
                                    src={parsedImage?.[0]?.imgUrl || '/placeholder-product.jpg'}
                                    alt={item.name}
                                    className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                                />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                                    {item.variationName && (
                                        <p className="text-sm text-gray-500 mt-0.5">Variant: {item.variationName}</p>
                                    )}
                                    <p className="text-sm text-gray-600 mt-1">Qty: {item.quantity} · {formatPrice(item.lineTotalAfter)}</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Return status</h2>
                            <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${statusClassName}`}>
                                    {statusLabel}
                                </span>
                                {item.returnRequestedAt && (
                                    <span className="text-sm text-gray-500">
                                        Requested on {formatDate(item.returnRequestedAt)}
                                    </span>
                                )}
                            </div>
                        </section>

                        {(item.returnTrackingCode || item.returnDeliveryCompany || item.returnTrackingUrl) && (
                            <section>
                                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Pickup & tracking</h2>
                                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                                    {item.returnTrackingCode && (
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Pickup / AWB number</p>
                                            <p className="font-mono font-semibold text-gray-900 mt-0.5">{item.returnTrackingCode}</p>
                                            {item.returnDeliveryCompany && (
                                                <p className="text-sm text-gray-600 mt-0.5">Courier: {item.returnDeliveryCompany}</p>
                                            )}
                                        </div>
                                    )}
                                    {item.returnTrackingUrl && (
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Tracking link</p>
                                            <a
                                                href={item.returnTrackingUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center mt-1 text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                Track return <FaExternalLinkAlt className="ml-1 text-sm" />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {item.replacementOrderID && (
                            <section>
                                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Replacement order</h2>
                                <p className="text-sm text-gray-600 mb-2">A replacement order has been created for this item.</p>
                                <Link
                                    href={`/order-status/order-summary/${item.replacementOrderID}`}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                >
                                    <FaBox className="mr-2" /> View replacement order #{item.replacementOrderID}
                                </Link>
                            </section>
                        )}

                        {item.returnStatus === 'refund_pending' && (
                            <section className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                <p className="text-sm font-medium text-amber-800">
                                    Our team will contact you to complete the refund. You don’t need to take any further action.
                                </p>
                            </section>
                        )}

                        {item.returnRejectionReason && (
                            <section className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Rejection Reason</p>
                                <p className="mt-2 text-sm text-red-700">
                                    {item.returnRejectionReason}
                                </p>
                            </section>
                        )}

                        <section className="pt-4 border-t border-gray-200">
                            <Link
                                href={`/order-status/order-summary/${order.orderID}`}
                                className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                <FaTruck className="mr-2" /> View full order #{order.orderID}
                            </Link>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
