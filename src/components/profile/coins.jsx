"use client"
import React, { useEffect, useState } from 'react'
import axiosInstance from '@/lib/axiosInstance'

const Coins = () => {
    const [balance, setBalance] = useState(0)
    const [history, setHistory] = useState([])
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [redeemCoins, setRedeemCoins] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const fetchData = async (p = 1) => {
        setLoading(true)
        try {
            const [b, h] = await Promise.all([
                axiosInstance.get('/coins/balance'),
                axiosInstance.get(`/coins/history?page=${p}&limit=20`)
            ])
            setBalance(b.data?.balance || 0)
            setHistory(h.data?.rows || [])
            setTotal(h.data?.total || 0)
            setPage(p)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData(1) }, [])

    const handleRedeem = async (e) => {
        e.preventDefault()
        const coins = parseInt(redeemCoins || '0', 10)
        if (!coins || coins <= 0) return
        setSubmitting(true)
        try {
            await axiosInstance.post('/coins/redeem', { coins })
            setRedeemCoins('')
            await fetchData(page)
        } catch (e) {
            alert(e?.response?.data?.message || 'Failed to redeem')
        } finally {
            setSubmitting(false)
        }
    }

    const totalPages = Math.max(1, Math.ceil(total / 20))

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-2">Ithyaraa Coins</h2>
            <p className="text-sm text-gray-600 mb-4">Earn 1 coin for every ₹100 spent. Coins expire after 365 days (FIFO). Coins are credited only after your order is delivered.</p>
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 mb-4">
                <div>
                    <div className="text-sm text-gray-600">Current Balance</div>
                    <div className="text-2xl font-bold">{balance} coins</div>
                </div>
                <form onSubmit={handleRedeem} className="flex items-center gap-2">
                    <input
                        type="number"
                        min={1}
                        className="border rounded px-3 py-2 text-sm w-28"
                        placeholder="Coins"
                        value={redeemCoins}
                        onChange={(e) => setRedeemCoins(e.target.value)}
                    />
                    <button disabled={submitting} className="px-3 py-2 bg-blue-600 text-white rounded text-sm">
                        {submitting ? 'Redeeming...' : 'Redeem to Wallet'}
                    </button>
                </form>
            </div>

            <h3 className="text-base font-semibold mb-2">History</h3>
            {loading ? (
                <div className="text-sm text-gray-500">Loading...</div>
            ) : history.length === 0 ? (
                <div className="text-sm text-gray-500">No history yet.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-gray-600">
                                <th className="text-left py-2">Type</th>
                                <th className="text-left py-2">Coins</th>
                                <th className="text-left py-2">Reference</th>
                                <th className="text-left py-2">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((row) => {
                                const getTypeStyle = (type) => {
                                    switch (type) {
                                        case 'earn':
                                            return 'text-green-600 font-medium';
                                        case 'pending':
                                            return 'text-yellow-600 font-medium';
                                        case 'reversal':
                                            return 'text-red-600 font-medium';
                                        case 'redeem':
                                            return 'text-blue-600 font-medium';
                                        case 'expire':
                                            return 'text-gray-600';
                                        default:
                                            return 'text-gray-700';
                                    }
                                };
                                const getTypeLabel = (type) => {
                                    switch (type) {
                                        case 'earn':
                                            return 'Earned';
                                        case 'pending':
                                            return 'Pending';
                                        case 'reversal':
                                            return 'Reversed';
                                        case 'redeem':
                                            return 'Redeemed';
                                        case 'expire':
                                            return 'Expired';
                                        default:
                                            return type.charAt(0).toUpperCase() + type.slice(1);
                                    }
                                };
                                const getTypeBadge = (type) => {
                                    switch (type) {
                                        case 'earn':
                                            return 'bg-green-100 text-green-800';
                                        case 'pending':
                                            return 'bg-yellow-100 text-yellow-800';
                                        case 'reversal':
                                            return 'bg-red-100 text-red-800';
                                        case 'redeem':
                                            return 'bg-blue-100 text-blue-800';
                                        case 'expire':
                                            return 'bg-gray-100 text-gray-800';
                                        default:
                                            return 'bg-gray-100 text-gray-800';
                                    }
                                };
                                return (
                                    <tr key={row.txnID} className="border-b hover:bg-gray-50">
                                        <td className="py-2">
                                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getTypeBadge(row.type)}`}>
                                                {getTypeLabel(row.type)}
                                            </span>
                                            {row.type === 'pending' && (
                                                <span className="ml-2 text-xs text-gray-500">(Will be credited on delivery)</span>
                                            )}
                                        </td>
                                        <td className={`py-2 ${getTypeStyle(row.type)}`}>
                                            {row.type === 'reversal' || row.type === 'redeem' || row.type === 'expire' ? '-' : '+'}
                                            {row.coins}
                                        </td>
                                        <td className="py-2 text-gray-600">
                                            {row.refType === 'order' ? `Order #${row.refID}` : row.refType || '-'}
                                        </td>
                                        <td className="py-2 text-gray-600">
                                            {new Date(row.createdAt).toLocaleDateString('en-IN', { 
                                                year: 'numeric', 
                                                month: 'short', 
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex justify-end gap-2 mt-3">
                    <button disabled={page <= 1} onClick={() => fetchData(page - 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Prev</button>
                    <span className="text-sm text-gray-600">Page {page} / {totalPages}</span>
                    <button disabled={page >= totalPages} onClick={() => fetchData(page + 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Next</button>
                </div>
            )}
        </div>
    )
}

export default Coins


