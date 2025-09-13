import React, { useEffect, useState } from 'react'
import { MdAccountBalanceWallet, MdPayment, MdHistory, MdPending } from "react-icons/md";
import Loading from '../ui/loading';
import axiosInstance from '../../lib/axiosInstance'

const Payout = ({ user }) => {
    const [payoutData, setPayoutData] = useState({
        pendingAmount: 0,
        totalEarnings: 0,
        requestedAmount: 0,
        lastPayout: null,
        payoutHistory: []
    });
    const [loading, setLoading] = useState(false);
    const [payoutLoading, setPayoutLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState('');
    const [selectedAmount, setSelectedAmount] = useState('');
    const [modalStep, setModalStep] = useState(1); // 1: amount selection, 2: OTP verification
    const [otp, setOtp] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);

    // Fetch payout data
    useEffect(() => {
        const fetchPayoutData = async () => {
            setLoading(true);
            try {
                // Get requestable payouts (new API)
                const requestableRes = await axiosInstance.get('/affiliate/requestable-payouts');
                if (requestableRes.data?.success && requestableRes.data?.data) {
                    const requestableData = requestableRes.data.data;
                    setPayoutData(prev => ({
                        ...prev,
                        pendingAmount: requestableData.requestableAmount || 0,
                        totalEarnings: requestableData.breakdown?.totalEarnings || 0,
                        requestedAmount: requestableData.breakdown?.requestedPayout || 0,
                        lastPayout: requestableData.breakdown?.totalPaid || 0
                    }));
                }

                // Get payout history
                const historyRes = await axiosInstance.get('/affiliate/payout-history');
                if (historyRes.data?.success) {
                    const { payoutHistory } = historyRes.data.data;
                    setPayoutData(prev => ({
                        ...prev,
                        payoutHistory: payoutHistory || []
                    }));
                }
            } catch (err) {
                console.error('Failed to load payout data:', err);
                setMessage('Failed to load payout information');
            } finally {
                setLoading(false);
            }
        };

        if (user?.affiliate === 'approved') {
            fetchPayoutData();
        }
    }, [user]);

    // Function to refresh payout data
    const refreshPayoutData = async () => {
        try {
            const requestableRes = await axiosInstance.get('/affiliate/requestable-payouts');
            if (requestableRes.data?.success && requestableRes.data?.data) {
                const requestableData = requestableRes.data.data;
                setPayoutData(prev => ({
                    ...prev,
                    pendingAmount: requestableData.requestableAmount || 0,
                    totalEarnings: requestableData.breakdown?.totalEarnings || 0,
                    requestedAmount: requestableData.breakdown?.requestedPayout || 0,
                    lastPayout: requestableData.breakdown?.totalPaid || 0
                }));
            }
        } catch (err) {
            console.error('Failed to refresh payout data:', err);
        }
    };

    const handlePayoutRequest = () => {
        if (payoutData.pendingAmount <= 0) {
            setMessage('No pending amount available for payout');
            return;
        }
        setPayoutAmount(payoutData.pendingAmount.toString());
        setSelectedAmount(payoutData.pendingAmount.toString());
        setShowModal(true);
        setMessage('');
    };

    const handleModalSubmit = async () => {
        if (modalStep === 1) {
            // Step 1: Validate amount and proceed to OTP
            const amount = parseFloat(payoutAmount);

            if (!amount || amount <= 0) {
                setMessage('Please enter a valid amount');
                return;
            }

            if (amount < 50) {
                setMessage('Minimum payout amount is ₹50');
                return;
            }

            if (amount > payoutData.pendingAmount) {
                setMessage('Amount cannot exceed pending balance');
                return;
            }

            // Send OTP for payout verification
            setOtpLoading(true);
            setMessage('');

            try {
                const otpResponse = await axiosInstance.post('/user/send-payout-otp', {
                    purpose: 'payout_verification'
                });

                if (otpResponse.data?.success) {
                    setMessage('OTP sent to your registered phone number');
                    setModalStep(2);
                } else {
                    setMessage(otpResponse.data?.error || 'Failed to send OTP');
                }
            } catch (err) {
                console.error('OTP send failed:', err);
                setMessage(err.response?.data?.error || 'Failed to send OTP');
            } finally {
                setOtpLoading(false);
            }
        } else {
            // Step 2: Verify OTP and submit payout
            if (!otp || otp.length !== 6) {
                setMessage('Please enter a valid 6-digit OTP');
                return;
            }

            setPayoutLoading(true);
            setMessage('');

            try {
                const response = await axiosInstance.post('/affiliate/request-payout', {
                    amount: parseFloat(payoutAmount),
                    otp: otp
                });

                if (response.data?.success) {
                    setMessage('Payout request submitted successfully!');
                    setShowModal(false);
                    setPayoutAmount('');
                    setOtp('');
                    setModalStep(1);
                    const payload = response.data?.data || {};
                    const txnID = payload.txnID;
                    // Refresh payout data to get accurate calculations
                    await refreshPayoutData();

                    // Add new payout to history
                    const newHistoryEntry = {
                        id: txnID || `temp-${Date.now()}`,
                        amount: parseFloat(payoutAmount),
                        status: 'pending',
                        type: 'outgoing',
                        date: new Date().toISOString()
                    };
                    setPayoutData(prev => ({
                        ...prev,
                        payoutHistory: [newHistoryEntry, ...(prev.payoutHistory || [])]
                    }));
                } else {
                    setMessage(response.data?.error || 'Failed to submit payout request');
                }
            } catch (err) {
                console.error('Payout request failed:', err);
                setMessage(err.response?.data?.error || 'Failed to submit payout request');
            } finally {
                setPayoutLoading(false);
            }
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
        setPayoutAmount('');
        setSelectedAmount('');
        setOtp('');
        setModalStep(1);
        setMessage('');
    };

    const handleBackToAmount = () => {
        setModalStep(1);
        setOtp('');
        setMessage('');
    };

    const handleAmountSelect = (amount) => {
        setSelectedAmount(amount.toString());
        setPayoutAmount(amount.toString());
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center w-full py-20">
                <Loading />
            </div>
        );
    }

    return (
        <div className="flex items-start justify-center w-full py-10 px-4">
            <div className="w-full max-w-[1000px]">
                {/* Header */}
                <div className="mb-8">
                    <p className="text-2xl font-medium mb-2">Payout Center</p>
                    <p className="text-sm text-gray-500">
                        Manage your affiliate earnings and request payouts
                    </p>
                </div>

                {/* Payout Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white border rounded-2xl shadow-sm p-6 hover:shadow-md transition">
                        <div className="flex items-center gap-3 mb-3">
                            <MdPending className="text-orange-500 text-2xl" />
                            <div>
                                <p className="text-xs text-gray-500">Pending Payout</p>
                                <p className="text-2xl font-bold">₹ {Number(payoutData.pendingAmount).toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400">Available for withdrawal</p>
                    </div>

                    <div className="bg-white border rounded-2xl shadow-sm p-6 hover:shadow-md transition">
                        <div className="flex items-center gap-3 mb-3">
                            <MdAccountBalanceWallet className="text-green-500 text-2xl" />
                            <div>
                                <p className="text-xs text-gray-500">Total Earnings</p>
                                <p className="text-2xl font-bold">₹ {Number(payoutData.totalEarnings).toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400">All time earnings</p>
                    </div>

                    <div className="bg-white border rounded-2xl shadow-sm p-6 hover:shadow-md transition">
                        <div className="flex items-center gap-3 mb-3">
                            <MdAccountBalanceWallet className="text-purple-500 text-2xl" />
                            <div>
                                <p className="text-xs text-gray-500">Requested Payout</p>
                                <p className="text-2xl font-bold">₹ {Number(payoutData.requestedAmount).toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400">Pending payout requests</p>
                    </div>

                    <div className="bg-white border rounded-2xl shadow-sm p-6 hover:shadow-md transition">
                        <div className="flex items-center gap-3 mb-3">
                            <MdPayment className="text-blue-500 text-2xl" />
                            <div>
                                <p className="text-xs text-gray-500">Total Paid</p>
                                <p className="text-2xl font-bold">₹ {Number(payoutData.lastPayout).toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400">Completed payouts</p>
                    </div>
                </div>

                {/* Payout Request Section */}
                <div className="bg-white border rounded-2xl shadow-sm p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-lg font-medium">Request Payout</p>
                            <p className="text-sm text-gray-500">Withdraw your pending earnings</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={refreshPayoutData}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                            >
                                <MdHistory className="text-lg" />
                                Refresh
                            </button>
                            <button
                                onClick={handlePayoutRequest}
                                disabled={payoutData.pendingAmount <= 0}
                                className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <MdPayment className="text-lg" />
                                Request Payout
                            </button>
                        </div>
                    </div>

                    {message && (
                        <div className={`p-3 rounded-lg text-sm ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {message}
                        </div>
                    )}

                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">
                            <strong>Payout Information:</strong>
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Minimum payout amount: ₹50</li>
                            <li>• Payouts are processed within 3-5 business days</li>
                            <li>• Payouts are sent to your registered bank account</li>
                            <li>• Only earnings from delivered orders are eligible for payout</li>
                            <li>• Pending Payout = Total Earnings - Requested Payouts</li>
                        </ul>
                    </div>
                </div>

                {/* Payout History */}
                <div className="bg-white border rounded-2xl shadow-sm">
                    <div className="p-6 border-b">
                        <div className="flex items-center gap-2">
                            <MdHistory className="text-gray-500" />
                            <p className="text-lg font-medium">Payout History</p>
                        </div>
                    </div>

                    <div className="p-6">
                        {payoutData.payoutHistory.filter(payout => payout.type === 'outgoing').length === 0 ? (
                            <div className="text-center py-8">
                                <MdHistory className="text-gray-300 text-4xl mx-auto mb-3" />
                                <p className="text-gray-500">No payout history available</p>
                                <p className="text-sm text-gray-400">Your payout requests will appear here</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {payoutData.payoutHistory
                                    .filter(payout => payout.type === 'outgoing')
                                    .map((payout, index) => (
                                        <div key={index} className={`flex items-center justify-between p-4 border rounded-lg ${payout.status === 'completed'
                                            ? 'bg-green-50 border-green-200'
                                            : payout.status === 'pending'
                                                ? 'bg-yellow-50 border-yellow-200'
                                                : payout.status === 'rejected' || payout.status === 'failed'
                                                    ? 'bg-red-50 border-red-200'
                                                    : 'bg-gray-50 border-gray-200'
                                            }`}>
                                            <div>
                                                <p className="font-medium">₹ {Number(payout.amount).toLocaleString('en-IN')}</p>
                                                <p className={`text-sm font-medium ${payout.status === 'completed'
                                                    ? 'text-green-700'
                                                    : payout.status === 'pending'
                                                        ? 'text-yellow-700'
                                                        : payout.status === 'rejected' || payout.status === 'failed'
                                                            ? 'text-red-700'
                                                            : 'text-gray-500'
                                                    }`}>{payout.status}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {payout.status === 'pending' && (
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                const res = await axiosInstance.post('/affiliate/cancel-payout', { txnID: payout.id });
                                                                if (res.data?.success) {
                                                                    setMessage('Payout cancelled successfully');
                                                                    const amt = Number(payout.amount) || 0;
                                                                    setPayoutData(prev => {
                                                                        const newRequested = Math.max(0, Number(prev.requestedAmount || 0) - amt);
                                                                        const newPending = Number(prev.totalEarnings || 0) - newRequested;
                                                                        const newHistory = (prev.payoutHistory || []).filter(ph => ph.id !== payout.id);
                                                                        return {
                                                                            ...prev,
                                                                            requestedAmount: newRequested,
                                                                            pendingAmount: newPending < 0 ? 0 : newPending,
                                                                            payoutHistory: newHistory
                                                                        };
                                                                    });
                                                                } else {
                                                                    setMessage(res.data?.error || 'Failed to cancel payout');
                                                                }
                                                            } catch (err) {
                                                                console.error('Cancel payout failed:', err);
                                                                setMessage(err.response?.data?.error || 'Failed to cancel payout');
                                                            }
                                                        }}
                                                        className="px-3 py-2 text-xs border border-gray-300 rounded-md hover:bg-gray-50"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-600">{new Date(payout.date).toLocaleDateString()}</p>
                                                    <p className="text-xs text-gray-400">#{payout.id}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Payout Amount Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium">
                                {modalStep === 1 ? 'Request Payout' : 'Verify OTP'}
                            </h3>
                            <button
                                onClick={handleModalClose}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Step 1: Amount Selection */}
                        {modalStep === 1 && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payout Amount (₹)
                                </label>

                                {/* Quick Amount Selection */}
                                <div className="mb-3">
                                    <p className="text-xs text-gray-500 mb-2">Quick select:</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleAmountSelect(50)}
                                            className={`px-3 py-2 text-sm border rounded-md transition ${selectedAmount === '50'
                                                ? 'bg-black text-white border-black'
                                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            ₹50
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleAmountSelect(100)}
                                            className={`px-3 py-2 text-sm border rounded-md transition ${selectedAmount === '100'
                                                ? 'bg-black text-white border-black'
                                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            ₹100
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleAmountSelect(500)}
                                            className={`px-3 py-2 text-sm border rounded-md transition ${selectedAmount === '500'
                                                ? 'bg-black text-white border-black'
                                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            ₹500
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleAmountSelect(payoutData.pendingAmount)}
                                            className={`px-3 py-2 text-sm border rounded-md transition ${selectedAmount === payoutData.pendingAmount.toString()
                                                ? 'bg-black text-white border-black'
                                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            All (₹{Number(payoutData.pendingAmount).toLocaleString('en-IN')})
                                        </button>
                                    </div>
                                </div>

                                {/* Custom Amount Input */}
                                <input
                                    type="number"
                                    value={payoutAmount}
                                    onChange={(e) => {
                                        setPayoutAmount(e.target.value);
                                        setSelectedAmount(e.target.value);
                                    }}
                                    placeholder="Enter custom amount"
                                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                                    min="50"
                                    max={payoutData.pendingAmount}
                                    step="0.01"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Available: ₹{Number(payoutData.pendingAmount).toLocaleString('en-IN')} | Minimum: ₹50
                                </p>
                            </div>
                        )}

                        {/* Step 2: OTP Verification */}
                        {modalStep === 2 && (
                            <div className="mb-4">
                                <div className="text-center mb-4">
                                    <p className="text-sm text-gray-600 mb-2">
                                        We've sent a 6-digit OTP to your registered phone number
                                    </p>
                                    <p className="text-lg font-medium">
                                        Payout Amount: ₹{Number(payoutAmount).toLocaleString('en-IN')}
                                    </p>
                                </div>

                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Enter OTP
                                </label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    className="w-full border border-gray-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-center text-lg tracking-widest"
                                    maxLength="6"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Didn't receive OTP? <button onClick={() => setModalStep(1)} className="text-blue-600 hover:underline">Go back</button>
                                </p>
                            </div>
                        )}

                        {message && (
                            <div className={`p-3 rounded-lg text-sm mb-4 ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                {message}
                            </div>
                        )}

                        <div className="flex gap-3">
                            {modalStep === 2 && (
                                <button
                                    onClick={handleBackToAmount}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
                                >
                                    Back
                                </button>
                            )}
                            <button
                                onClick={handleModalClose}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleModalSubmit}
                                disabled={payoutLoading || otpLoading}
                                className="flex-1 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {(payoutLoading || otpLoading) ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        {modalStep === 1 ? 'Sending OTP...' : 'Processing...'}
                                    </>
                                ) : (
                                    modalStep === 1 ? 'Send OTP' : 'Submit Request'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payout;
