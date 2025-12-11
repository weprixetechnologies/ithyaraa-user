"use client"
import React, { useEffect, useState } from 'react'
import axiosInstance from '@/lib/axiosInstance'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from '@/components/ui/alert-dialog'
import { FaCoins, FaWallet, FaLock, FaCheckCircle } from 'react-icons/fa'
import { ClipLoader } from 'react-spinners'

const Coins = () => {
    const [balance, setBalance] = useState(0)
    const [redeemableBalance, setRedeemableBalance] = useState(0)
    const [lockedBalance, setLockedBalance] = useState(0)
    const [history, setHistory] = useState([])
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [redeemCoins, setRedeemCoins] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [showRedeemModal, setShowRedeemModal] = useState(false)
    const [showNoCoinsAlert, setShowNoCoinsAlert] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')

    const fetchData = async (p = 1) => {
        setLoading(true)
        try {
            const [b, h] = await Promise.all([
                axiosInstance.get('/coins/balance'),
                axiosInstance.get(`/coins/history?page=${p}&limit=20`)
            ])
            setBalance(b.data?.balance || 0)
            setRedeemableBalance(b.data?.redeemableBalance ?? (b.data?.balance || 0))
            setLockedBalance(b.data?.lockedBalance || 0)
            setHistory(h.data?.rows || [])
            setTotal(h.data?.total || 0)
            setPage(p)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData(1) }, [])

    const handleRedeemClick = () => {
        if (redeemableBalance <= 0) {
            setShowNoCoinsAlert(true)
            return
        }
        setShowRedeemModal(true)
    }

    const handleRedeem = async (e) => {
        e.preventDefault()
        const coins = parseInt(redeemCoins || '0', 10)
        if (!coins || coins <= 0) {
            return
        }
        
        if (coins > redeemableBalance) {
            setShowNoCoinsAlert(true)
            return
        }
        
        setSubmitting(true)
        try {
            await axiosInstance.post('/coins/redeem', { coins })
            setRedeemCoins('')
            setShowRedeemModal(false)
            setSuccessMessage(`${coins} coins have been successfully redeemed to your wallet!`)
            setShowSuccessModal(true)
            await fetchData(page)
        } catch (e) {
            const errorMsg = e?.response?.data?.message || 'Failed to redeem coins'
            if (errorMsg.includes('No Coins Available') || errorMsg.includes('Insufficient')) {
                setShowNoCoinsAlert(true)
            } else {
                alert(errorMsg)
            }
        } finally {
            setSubmitting(false)
        }
    }

    const totalPages = Math.max(1, Math.ceil(total / 20))

    return (
        <>
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-2">
                <FaCoins className="text-amber-500 text-xl" />
                <h2 className="text-lg sm:text-xl font-semibold">Ithyaraa Coins</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">Earn 1 coin for every ₹100 spent. Coins expire after 365 days (FIFO). Coins are credited only after your order is delivered.</p>
            
            {/* Balance Card */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4 sm:p-6 mb-4">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <div className="text-sm text-gray-600 mb-1">Current Balance</div>
                        <div className="text-3xl font-bold text-amber-700">{balance} coins</div>
                    </div>
                    <div className="text-4xl text-amber-400 opacity-50">
                        <FaCoins />
                    </div>
                </div>
                
                {lockedBalance > 0 && (
                    <div className="mt-3 pt-3 border-t border-amber-200">
                        <div className="flex items-center gap-2 text-sm">
                            <FaLock className="text-amber-600" />
                            <span className="text-gray-600">
                                <span className="font-medium text-amber-700">{lockedBalance} coins</span> locked (available after 7 days)
                            </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            {redeemableBalance} coins available for redemption
                        </div>
                    </div>
                )}
                
                <button
                    onClick={handleRedeemClick}
                    disabled={redeemableBalance <= 0 || submitting}
                    className="mt-4 w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <FaWallet className="text-sm" />
                    {submitting ? 'Processing...' : 'Redeem to Wallet'}
                </button>
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

        {/* Redeem Modal */}
        <Dialog open={showRedeemModal} onOpenChange={setShowRedeemModal}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <FaWallet className="text-blue-500" />
                        Redeem Coins to Wallet
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-600 mt-2">
                        Convert your Ithyaraa coins to wallet balance. 1 coin = ₹1 wallet credit.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="py-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Available to Redeem:</span>
                            <span className="text-lg font-bold text-blue-700">{redeemableBalance} coins</span>
                        </div>
                        {lockedBalance > 0 && (
                            <div className="mt-2 pt-2 border-t border-blue-200">
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <FaLock className="text-amber-500" />
                                    <span>{lockedBalance} coins locked (available after 7 days)</span>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <form onSubmit={handleRedeem} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Enter Amount to Redeem
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={redeemableBalance}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                placeholder="Enter coins"
                                value={redeemCoins}
                                onChange={(e) => {
                                    const val = e.target.value
                                    if (val === '' || (parseInt(val) >= 1 && parseInt(val) <= redeemableBalance)) {
                                        setRedeemCoins(val)
                                    }
                                }}
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Maximum: {redeemableBalance} coins
                            </p>
                        </div>
                        
                        {redeemCoins && parseInt(redeemCoins) > 0 && (
                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">You will receive:</span>
                                    <span className="font-semibold text-gray-900">₹{parseInt(redeemCoins) || 0}</span>
                                </div>
                            </div>
                        )}
                        
                        <DialogFooter className="gap-2 sm:gap-0">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowRedeemModal(false)
                                    setRedeemCoins('')
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || !redeemCoins || parseInt(redeemCoins) <= 0 || parseInt(redeemCoins) > redeemableBalance}
                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <ClipLoader size={16} color="#ffffff" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <FaWallet className="text-sm" />
                                        Redeem Now
                                    </>
                                )}
                            </button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>

        {/* No Coins Available Alert */}
        <AlertDialog open={showNoCoinsAlert} onOpenChange={setShowNoCoinsAlert}>
            <AlertDialogContent className="sm:max-w-md">
                <AlertDialogHeader>
                    <div className="flex items-center justify-center mb-4">
                        <div className="bg-amber-100 rounded-full p-4">
                            <FaCoins className="text-4xl text-amber-600" />
                        </div>
                    </div>
                    <AlertDialogTitle className="text-center text-xl">
                        No Coins Available
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-center text-gray-600 mt-2">
                        {balance === 0 ? (
                            <>
                                You don't have any coins to redeem yet. Start shopping to earn coins!
                                <br />
                                <span className="text-sm mt-2 block">Earn 1 coin for every ₹100 spent.</span>
                            </>
                        ) : (
                            <>
                                You have {balance} coins, but {lockedBalance > 0 ? `${lockedBalance} coins are still locked` : 'none are available for redemption'}.
                                {lockedBalance > 0 && (
                                    <span className="block mt-2 text-sm">
                                        Coins become redeemable 7 days after order delivery.
                                    </span>
                                )}
                            </>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction
                        onClick={() => setShowNoCoinsAlert(false)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                        Got it
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        {/* Success Modal */}
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center justify-center mb-4">
                        <div className="bg-green-100 rounded-full p-4">
                            <FaCheckCircle className="text-4xl text-green-600" />
                        </div>
                    </div>
                    <DialogTitle className="text-center text-xl">
                        Success!
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-600 mt-2">
                        {successMessage}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <button
                        onClick={() => setShowSuccessModal(false)}
                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                    >
                        Close
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    )
}

export default Coins


