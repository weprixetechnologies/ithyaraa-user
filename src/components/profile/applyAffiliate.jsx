import React, { useEffect, useState } from 'react'
import InputDynamic from '../ui/inputDynamic'
import InputPassword from '../ui/inputPassword'
import { MdOutlineMarkEmailRead } from "react-icons/md";
import Loading from '../ui/loading';
import success from '../../../public/success.svg'
import Image from 'next/image';
import axiosInstance from '../../lib/axiosInstance'  // <-- make sure this path is correct

const AffiliateDashboard = ({ user }) => {
    const [activeTab, setActiveTab] = useState('transactions');
    const [transactions, setTransactions] = useState([]);
    const [txLoading, setTxLoading] = useState(false);
    const [txError, setTxError] = useState('');
    const [txPage, setTxPage] = useState(1);
    const [txTotal, setTxTotal] = useState(0);
    const txLimit = 10;
    const [filters, setFilters] = useState({
        status: '',
        type: '',
        startDate: '',
        endDate: '',
        minAmount: '',
        maxAmount: '',
        sortBy: 'createdOn',
        sortOrder: 'DESC'
    });
    const [appliedFilters, setAppliedFilters] = useState({});

    // Analytics state
    const [analytics, setAnalytics] = useState({
        totalClicks: 0,
        totalOrders: 0,
        totalEarnings: 0,
        totalPendingEarnings: 0
    });
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    // Orders state
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersError, setOrdersError] = useState('');
    const [ordersPage, setOrdersPage] = useState(1);
    const [ordersTotal, setOrdersTotal] = useState(0);
    const ordersLimit = 10;
    const [ordersFilters, setOrdersFilters] = useState({
        startDate: '',
        endDate: '',
        minTotal: '',
        maxTotal: '',
        sortBy: 'createdAt',
        sortOrder: 'DESC'
    });
    const [appliedOrdersFilters, setAppliedOrdersFilters] = useState({});

    // Fetch analytics data
    useEffect(() => {
        const fetchAnalytics = async () => {
            setAnalyticsLoading(true);
            try {
                const res = await axiosInstance.get('/affiliate/analytics');
                if (res.data?.success && res.data?.data) {
                    setAnalytics(res.data.data);
                    setLastUpdated(new Date());
                }
            } catch (err) {
                console.error('Failed to load analytics:', err);
                // Set default values on error
                setAnalytics({
                    totalClicks: 0,
                    totalOrders: 0,
                    totalEarnings: 0,
                    totalPendingEarnings: 0
                });
            } finally {
                setAnalyticsLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    useEffect(() => {
        const fetchTransactions = async () => {
            if (activeTab !== 'transactions') return;
            setTxLoading(true);
            setTxError('');
            try {
                const res = await axiosInstance.get('/affiliate/transactions', {
                    params: { page: txPage, limit: txLimit, ...appliedFilters }
                });
                const { data, total, page } = res.data || {};
                setTransactions(Array.isArray(data) ? data : []);
                setTxTotal(typeof total === 'number' ? total : 0);
                if (typeof page === 'number') setTxPage(page);
            } catch (err) {
                console.error(err);
                setTxError(err?.response?.data?.error || 'Failed to load transactions');
            } finally {
                setTxLoading(false);
            }
        };
        fetchTransactions();
    }, [activeTab, txPage, appliedFilters]);

    // Fetch Orders when Orders tab active
    useEffect(() => {
        const fetchOrders = async () => {
            if (activeTab !== 'orders') return;
            setOrdersLoading(true);
            setOrdersError('');
            try {
                const res = await axiosInstance.get('/affiliate/orders', {
                    params: { page: ordersPage, limit: ordersLimit, ...appliedOrdersFilters }
                });
                const { data, total, page } = res.data || {};
                setOrders(Array.isArray(data) ? data : []);
                setOrdersTotal(typeof total === 'number' ? total : 0);
                if (typeof page === 'number') setOrdersPage(page);
            } catch (err) {
                console.error(err);
                setOrdersError(err?.response?.data?.error || 'Failed to load orders');
            } finally {
                setOrdersLoading(false);
            }
        };
        fetchOrders();
    }, [activeTab, ordersPage, appliedOrdersFilters]);
    return (
        <div className="flex items-start justify-center w-full py-10 px-4">
            <div className="w-full max-w-[1000px]">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="text-2xl font-medium mb-2">Affiliate Dashboard</p>
                        <p className="text-sm text-gray-500">
                            Welcome back, {user?.name || "Partner"}! Here's a quick snapshot.
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setAnalyticsLoading(true);
                            const fetchAnalytics = async () => {
                                try {
                                    const res = await axiosInstance.get('/affiliate/analytics');
                                    if (res.data?.success && res.data?.data) {
                                        setAnalytics(res.data.data);
                                        setLastUpdated(new Date());
                                    }
                                } catch (err) {
                                    console.error('Failed to refresh analytics:', err);
                                } finally {
                                    setAnalyticsLoading(false);
                                }
                            };
                            fetchAnalytics();
                        }}
                        disabled={analyticsLoading}
                        className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-50"
                    >
                        {analyticsLoading ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>

                {/* Stats */}
                <div className="mb-2">
                    {lastUpdated && (
                        <p className="text-xs text-gray-400">
                            Last updated: {lastUpdated.toLocaleTimeString()}
                        </p>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white border rounded-2xl shadow-sm p-6 hover:shadow-md transition">
                        <div className="flex items-center gap-2 mb-2">
                            <p className="text-xs text-gray-500">Total Clicks</p>
                        </div>
                        <p className="text-3xl font-bold mt-1">{analyticsLoading ? '...' : analytics.totalClicks}</p>
                        <p className="text-xs text-gray-400 mt-1">From all referrals</p>
                    </div>

                    <div className="bg-white border rounded-2xl shadow-sm p-6 hover:shadow-md transition">
                        <div className="flex items-center gap-2 mb-2">
                            <p className="text-xs text-gray-500">Total Orders</p>
                        </div>
                        <p className="text-3xl font-bold mt-1">{analyticsLoading ? '...' : analytics.totalOrders}</p>
                        <p className="text-xs text-gray-400 mt-1">Completed purchases</p>
                    </div>

                    <div className="bg-white border rounded-2xl shadow-sm p-6 hover:shadow-md transition">
                        <div className="flex items-center gap-2 mb-2">
                            <p className="text-xs text-gray-500">Total Earnings</p>
                        </div>
                        <p className="text-3xl font-bold mt-1">₹ {analyticsLoading ? '...' : Number(analytics.totalEarnings).toLocaleString('en-IN')}</p>
                        <p className="text-xs text-gray-400 mt-1">All time earnings</p>
                    </div>

                    <div className="bg-white border rounded-2xl shadow-sm p-6 hover:shadow-md transition">
                        <div className="flex items-center gap-2 mb-2">
                            <p className="text-xs text-gray-500">Pending Earnings</p>
                        </div>
                        <p className="text-3xl font-bold mt-1">₹ {analyticsLoading ? '...' : Number(analytics.totalPendingEarnings).toLocaleString('en-IN')}</p>
                        <p className="text-xs text-gray-400 mt-1">From undelivered orders</p>
                    </div>
                </div>

                {/* Referral Link */}
                <div className="bg-white border rounded-2xl shadow-sm p-6 mb-8">
                    <p className="text-sm font-medium mb-2">Your referral link</p>
                    <div className="flex flex-col md:flex-row gap-2 md:items-center">
                        <div className="flex items-center justify-between w-full md:w-auto bg-gray-50 border rounded-md px-3 py-2 text-xs">
                            <span className="truncate">
                                https://ithyaraa.com/?ref={user?.uid || "your-id"}
                            </span>
                        </div>
                        <button
                            className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition"
                            onClick={() =>
                                navigator.clipboard.writeText(
                                    `https://ithyaraa.com/?ref=${user?.uid || ""}`
                                )
                            }
                        >
                            Copy
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white border rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 px-4 pt-4">
                        <button
                            className={`${activeTab === 'transactions' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'} text-sm px-3 py-2 rounded-lg`}
                            onClick={() => setActiveTab('transactions')}
                        >
                            Transactions
                        </button>
                        <button
                            className={`${activeTab === 'orders' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'} text-sm px-3 py-2 rounded-lg`}
                            onClick={() => setActiveTab('orders')}
                        >
                            Orders
                        </button>
                    </div>

                    {activeTab === 'transactions' && (
                        <div className="p-6">
                            <p className="text-sm font-medium mb-4">Recent transactions</p>
                            {/* Filters */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-medium text-gray-700">Filters</h3>
                                    <button
                                        onClick={() => {
                                            setFilters({ status: '', type: '', startDate: '', endDate: '', minAmount: '', maxAmount: '', sortBy: 'createdOn', sortOrder: 'DESC' });
                                            setAppliedFilters({});
                                            setTxPage(1);
                                        }}
                                        className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        Clear all
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Status</label>
                                        <select
                                            className="w-full border border-gray-200 bg-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer"
                                            value={filters.status}
                                            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                                        >
                                            <option value="">All statuses</option>
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="paid">Paid</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Type</label>
                                        <select
                                            className="w-full border border-gray-200 bg-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer"
                                            value={filters.type}
                                            onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
                                        >
                                            <option value="">All types</option>
                                            <option value="commission">Commission</option>
                                            <option value="payout">Payout</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Date Range</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="date"
                                                className="flex-1 border border-gray-200 bg-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                                                value={filters.startDate}
                                                onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
                                            />
                                            <input
                                                type="date"
                                                className="flex-1 border border-gray-200 bg-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                                                value={filters.endDate}
                                                onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">Amount Range</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    className="w-20 border border-gray-200 bg-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                                                    value={filters.minAmount}
                                                    onChange={(e) => setFilters((f) => ({ ...f, minAmount: e.target.value }))}
                                                    placeholder="Min"
                                                />
                                                <span className="text-gray-400">-</span>
                                                <input
                                                    type="number"
                                                    className="w-20 border border-gray-200 bg-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                                                    value={filters.maxAmount}
                                                    onChange={(e) => setFilters((f) => ({ ...f, maxAmount: e.target.value }))}
                                                    placeholder="Max"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">Sort by</label>
                                            <div className="flex items-center gap-2">
                                                <select
                                                    className="border border-gray-200 bg-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer"
                                                    value={filters.sortBy}
                                                    onChange={(e) => setFilters((f) => ({ ...f, sortBy: e.target.value }))}
                                                >
                                                    <option value="createdOn">Date</option>
                                                    <option value="amount">Amount</option>
                                                    <option value="status">Status</option>
                                                    <option value="type">Type</option>
                                                </select>
                                                <select
                                                    className="border border-gray-200 bg-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer"
                                                    value={filters.sortOrder}
                                                    onChange={(e) => setFilters((f) => ({ ...f, sortOrder: e.target.value }))}
                                                >
                                                    <option value="DESC">↓</option>
                                                    <option value="ASC">↑</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        className="px-4 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800 transition-colors"
                                        onClick={() => {
                                            const cleaned = Object.fromEntries(
                                                Object.entries(filters).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
                                            );
                                            setAppliedFilters(cleaned);
                                            setTxPage(1);
                                        }}
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </div>
                            {txLoading ? (
                                <div className="py-6"><Loading /></div>
                            ) : txError ? (
                                <div className="text-red-600 text-sm mb-2">{txError}</div>
                            ) : (
                                <>
                                    <div className="w-full overflow-x-auto">
                                        <table className="w-full text-sm border-collapse min-w-[600px]">
                                            <thead>
                                                <tr className="text-xs text-gray-500 border-b bg-gray-50">
                                                    <th className="py-3 px-2 text-left w-24">Date</th>
                                                    <th className="py-3 px-2 text-left w-32">Type</th>
                                                    <th className="py-3 px-2 text-left w-24">Status</th>
                                                    <th className="py-3 px-2 text-right w-24">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {transactions.length === 0 ? (
                                                    <tr>
                                                        <td className="py-6 text-center text-gray-500" colSpan={4}>No transactions found</td>
                                                    </tr>
                                                ) : (
                                                    transactions.map((t) => {
                                                        const amountNum = Number(t.amount || 0);
                                                        const isIncoming = (String(t.type).toLowerCase() === 'commission') || amountNum > 0;
                                                        const pillClass = isIncoming ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
                                                        return (
                                                            <tr key={t.txnID} className="border-b hover:bg-gray-50 transition-colors">
                                                                <td className="py-3 px-2 text-gray-600">{t.createdOn ? new Date(t.createdOn).toLocaleDateString() : '-'}</td>
                                                                <td className="py-3 px-2">
                                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${pillClass}`}>
                                                                        {t.type || '-'}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 px-2">
                                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.status === 'confirmed' || t.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                                        t.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                            'bg-gray-100 text-gray-700'
                                                                        }`}>
                                                                        {t.status || '-'}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 px-2 text-right">
                                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${pillClass}`}>
                                                                        ₹ {Math.abs(amountNum).toLocaleString('en-IN')}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="flex items-center justify-between mt-4 text-xs text-gray-600">
                                        <span>
                                            Page {txPage} of {Math.max(1, Math.ceil(txTotal / txLimit))} • {txTotal} total
                                        </span>
                                        <div className="flex gap-2">
                                            <button
                                                className="px-3 py-1 rounded border disabled:opacity-50"
                                                onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                                                disabled={txPage <= 1}
                                            >
                                                Prev
                                            </button>
                                            <button
                                                className="px-3 py-1 rounded border disabled:opacity-50"
                                                onClick={() => {
                                                    const maxPage = Math.max(1, Math.ceil(txTotal / txLimit));
                                                    setTxPage((p) => Math.min(maxPage, p + 1))
                                                }}
                                                disabled={txPage >= Math.max(1, Math.ceil(txTotal / txLimit))}
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="p-6">
                            <p className="text-sm font-medium mb-4">Recent orders from your referrals</p>
                            {/* Order Filters */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-medium text-gray-700">Filters</h3>
                                    <button
                                        onClick={() => {
                                            setOrdersFilters({ startDate: '', endDate: '', minTotal: '', maxTotal: '', paymentStatus: '', sortBy: 'createdAt', sortOrder: 'DESC' });
                                            setAppliedOrdersFilters({});
                                            setOrdersPage(1);
                                        }}
                                        className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        Clear all
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Date Range</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="date"
                                                className="flex-1 border border-gray-200 bg-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                                                value={ordersFilters.startDate}
                                                onChange={(e) => setOrdersFilters((f) => ({ ...f, startDate: e.target.value }))}
                                            />
                                            <input
                                                type="date"
                                                className="flex-1 border border-gray-200 bg-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                                                value={ordersFilters.endDate}
                                                onChange={(e) => setOrdersFilters((f) => ({ ...f, endDate: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Order Total Range</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                className="w-20 border border-gray-200 bg-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                                                value={ordersFilters.minTotal}
                                                onChange={(e) => setOrdersFilters((f) => ({ ...f, minTotal: e.target.value }))}
                                                placeholder="Min"
                                            />
                                            <span className="text-gray-400">-</span>
                                            <input
                                                type="number"
                                                className="w-20 border border-gray-200 bg-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                                                value={ordersFilters.maxTotal}
                                                onChange={(e) => setOrdersFilters((f) => ({ ...f, maxTotal: e.target.value }))}
                                                placeholder="Max"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Sort by</label>
                                        <div className="flex items-center gap-2">
                                            <select
                                                className="flex-1 border border-gray-200 bg-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer"
                                                value={ordersFilters.sortBy}
                                                onChange={(e) => setOrdersFilters((f) => ({ ...f, sortBy: e.target.value }))}
                                            >
                                                <option value="createdAt">Date</option>
                                                <option value="total">Total</option>
                                                <option value="orderID">Order ID</option>
                                                <option value="buyerUID">Buyer UID</option>
                                            </select>
                                            <select
                                                className="border border-gray-200 bg-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer"
                                                value={ordersFilters.sortOrder}
                                                onChange={(e) => setOrdersFilters((f) => ({ ...f, sortOrder: e.target.value }))}
                                            >
                                                <option value="DESC">↓</option>
                                                <option value="ASC">↑</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        className="px-4 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800 transition-colors"
                                        onClick={() => {
                                            const cleaned = Object.fromEntries(
                                                Object.entries(ordersFilters).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
                                            );
                                            setAppliedOrdersFilters(cleaned);
                                            setOrdersPage(1);
                                        }}
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </div>
                            {ordersLoading ? (
                                <div className="py-6"><Loading /></div>
                            ) : ordersError ? (
                                <div className="text-red-600 text-sm mb-2">{ordersError}</div>
                            ) : (
                                <>
                                    <div className="w-full overflow-x-auto">
                                        <table className="w-full text-sm border-collapse min-w-[800px]">
                                            <thead>
                                                <tr className="text-xs text-gray-500 border-b bg-gray-50">
                                                    <th className="py-3 px-2 text-left w-20">Order ID</th>
                                                    <th className="py-3 px-2 text-left w-24">Date</th>
                                                    <th className="py-3 px-2 text-left w-32">Buyer UID</th>
                                                    <th className="py-3 px-2 text-left min-w-[150px]">Item</th>
                                                    <th className="py-3 px-2 text-center w-16">Qty</th>
                                                    <th className="py-3 px-2 text-left w-24">Status</th>
                                                    <th className="py-3 px-2 text-right w-20">Per Unit</th>
                                                    <th className="py-3 px-2 text-right w-24">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orders.length === 0 ? (
                                                    <tr>
                                                        <td className="py-6 text-center text-gray-500" colSpan={8}>No orders found</td>
                                                    </tr>
                                                ) : (
                                                    orders.map((o, index) => (
                                                        <tr key={`${o.orderID}-${o.productID}-${index}`} className="border-b hover:bg-gray-50 transition-colors">
                                                            <td className="py-3 px-2 font-medium">#{o.orderID}</td>
                                                            <td className="py-3 px-2 text-gray-600">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '-'}</td>
                                                            <td className="py-3 px-2">
                                                                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded inline-block">
                                                                    {o.buyerUID || '-'}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-2 truncate max-w-[150px]" title={o.name || '-'}>
                                                                {o.name || '-'}
                                                            </td>
                                                            <td className="py-3 px-2 text-center">{o.quantity || 0}</td>
                                                            <td className="py-3 px-2">
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${o.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' :
                                                                    o.orderStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                        o.orderStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                                            'bg-gray-100 text-gray-700'
                                                                    }`}>
                                                                    {o.orderStatus || '-'}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-2 text-right font-medium">₹ {Number(o.unitPriceAfter || 0).toLocaleString('en-IN')}</td>
                                                            <td className="py-3 px-2 text-right font-medium">₹ {Number(o.lineTotalAfter || 0).toLocaleString('en-IN')}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="flex items-center justify-between mt-4 text-xs text-gray-600">
                                        <span>
                                            Page {ordersPage} of {Math.max(1, Math.ceil(ordersTotal / ordersLimit))} • {ordersTotal} total
                                        </span>
                                        <div className="flex gap-2">
                                            <button
                                                className="px-3 py-1 rounded border disabled:opacity-50"
                                                onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                                                disabled={ordersPage <= 1}
                                            >
                                                Prev
                                            </button>
                                            <button
                                                className="px-3 py-1 rounded border disabled:opacity-50"
                                                onClick={() => {
                                                    const maxPage = Math.max(1, Math.ceil(ordersTotal / ordersLimit));
                                                    setOrdersPage((p) => Math.min(maxPage, p + 1))
                                                }}
                                                disabled={ordersPage >= Math.max(1, Math.ceil(ordersTotal / ordersLimit))}
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


const ApplyAffiliate = ({ user }) => {
    const [isLoading, setIsLoading] = useState(true);   // start loading
    const [submitted, setIsSubmitted] = useState(false);

    useEffect(() => {

        setIsLoading(true)
        // Check affiliate status when component mounts
        if (user?.affiliate === 'approved') {
            setIsSubmitted(false);  // user already approved → keep form but disable button if needed
        } else if (user?.affiliate === 'pending') {
            setIsSubmitted(true);   // already applied
        } else if (user?.affiliate !== 'pending' && user?.affiliate !== 'approved') {
            setIsSubmitted(false);  // new applicant
        }
        setIsLoading(false);


    }, [user]);

    const handleSubmit = async () => {
        setIsLoading(true);
        try {

            await axiosInstance.post('/affiliate/apply-affiliate')

            setIsSubmitted(true);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Something went wrong. Try again!');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <Loading />;

    if (user?.affiliate === 'approved') {
        return <AffiliateDashboard user={user} />
    }

    if (submitted) {
        return (
            <div className="flex items-center justify-center w-full py-[100px]">
                <div className="rounded px-4 py-8 max-w-[600px] w-full flex flex-col items-center justify-center">
                    <Image src={success} alt="Success" height={150} width={150} />
                    <p className='text-2xl font-medium mt-4'>Your Application is Submitted !!</p>
                    <p className='text-sm font-medium text-center text-secondary-text-deep'>
                        We've received your application. We will review and inform you via email soon.
                        You know what we mean? We'll make you our partner within 24 hours. Sounds amazing, right?!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center w-full py-[100px]">
            <div className="border rounded p-4 max-w-[600px] w-full">
                <p className='text-lg font-medium text-center'>Apply Affiliate for More Earnings</p>
                <p className="text-xs text-secondary-text-deep text-center max-w-[500px] mx-auto">
                    By filling this form you will apply to our Affiliate Program — which unlocks greater income.
                    Click &amp; read <a href="#" className='underline'>Affiliate Program Policies</a>.
                </p>

                <div className="flex gap-2 flex-col my-10">
                    <InputDynamic
                        icon={<MdOutlineMarkEmailRead />}
                        placeholder="Enter Your Email ID"
                        value={user.emailID || ''}
                        readOnly
                    />
                    <InputPassword
                        placeholder="Enter Your Password"
                        value=""
                    />
                </div>

                <button
                    className="flex justify-center px-2 py-2 border w-full bg-primary-yellow rounded-lg"
                    onClick={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? 'Submitting...' : 'Send for Approval'}
                </button>
            </div>
        </div>
    );
};

export default ApplyAffiliate;


