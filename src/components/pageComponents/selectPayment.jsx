import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import phonepelogo from './../../../public/logophonepe.svg'
import axiosInstance from '@/lib/axiosInstance'

const SelectPayment = ({ onSelect, onWalletChange, cartTotal, couponDiscount = 0 }) => {
    const [paymentMethod, setPaymentMethod] = useState('cod'); // default selection
    const [walletBalance, setWalletBalance] = useState(0)
    const [walletApply, setWalletApply] = useState('')

    useEffect(() => {
        async function loadWallet() {
            try {
                const res = await axiosInstance.get('/user/detail-by-user')
                setWalletBalance(parseFloat(res?.data?.balance || 0))
            } catch (e) {
                setWalletBalance(0)
            }
        }
        loadWallet()
    }, [])

    const handleSelect = (mode) => {
        setPaymentMethod(mode);
        onSelect?.(mode);
    };

    const payable = Math.max(0, (cartTotal || 0) - (couponDiscount || 0))
    const walletMax = Math.min(walletBalance, payable)
    const walletValue = Math.max(0, Math.min(Number(walletApply) || 0, walletMax))
    const remaining = payable - walletValue

    useEffect(() => {
        onWalletChange?.(walletValue)
    }, [walletValue, onWalletChange])

    return (
        <div className="w-full bg-white">
            <p className="text-lg font-medium mb-3">Suggested For You</p>

            {/* Wallet Option */}
            {walletBalance > 0 && (
                <div className="relative mb-4 overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-indigo-200/50 shadow-sm">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50"></div>
                    <div className="relative p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                                <span className="text-sm font-semibold text-gray-800">Wallet Balance</span>
                            </div>
                            <div className="px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg border border-indigo-200/50">
                                <span className="text-base font-bold text-indigo-700">₹{walletBalance.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="relative mb-3">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</div>
                            <input
                                type="number"
                                min={1}
                                max={walletMax}
                                step="0.01"
                                className="w-full pl-8 pr-20 py-3 text-sm font-medium bg-white border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-gray-400"
                                placeholder="Enter amount"
                                value={walletApply}
                                onChange={(e) => setWalletApply(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setWalletApply(String(walletMax.toFixed(2)))}
                                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md hover:from-indigo-700 hover:to-purple-700 active:scale-95 transition-all shadow-sm"
                            >
                                Max
                            </button>
                        </div>

                        {walletValue > 0 && (
                            <div className="mt-3 pt-3 border-t border-indigo-200/50">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-600 font-medium">Wallet Applied:</span>
                                    <span className="font-bold text-indigo-700">₹{walletValue.toFixed(2)}</span>
                                </div>
                                {remaining > 0 ? (
                                    <div className="flex items-center justify-between text-xs mt-1.5">
                                        <span className="text-gray-600 font-medium">Remaining:</span>
                                        <span className="font-bold text-gray-800">₹{remaining.toFixed(2)}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 mt-1.5">
                                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-green-600 font-semibold text-xs">Fully paid with wallet!</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-3">
                {/* Cash on Delivery */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <label className="flex items-center px-3 py-2 cursor-pointer">
                        <input
                            type="radio"
                            name="payment"
                            value="cod"
                            checked={paymentMethod === 'cod'}
                            onChange={() => handleSelect('cod')}
                            className="accent-primary-yellow"
                            disabled={remaining <= 0}
                        />
                        <span className="ml-2 text-sm font-medium">Cash on Delivery</span>
                        {remaining <= 0 && <span className="ml-2 text-xs text-gray-500">(Not needed - wallet covers total)</span>}
                    </label>
                    {remaining > 0 && (
                        <p className="text-xs bg-gray-100 px-3 py-1">
                            Nominal handling fee applicable: ₹8
                        </p>
                    )}
                </div>

                {/* PhonePe */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <label className="flex items-center justify-between px-3 py-2 cursor-pointer">
                        <div className="flex items-center">
                            <input
                                type="radio"
                                name="payment"
                                value="phonepe"
                                checked={paymentMethod === 'phonepe'}
                                onChange={() => handleSelect('phonepe')}
                                className="accent-primary-yellow"
                                disabled={remaining <= 0}
                            />
                            <span className="ml-2 text-sm font-medium">Pay with PhonePe</span>
                            {remaining <= 0 && <span className="ml-2 text-xs text-gray-500">(Not needed)</span>}
                        </div>
                        <div className="relative h-[30px] w-[100px]">
                            <Image src={phonepelogo} alt="PhonePe" fill className="object-contain" />
                        </div>
                    </label>
                    {remaining > 0 && (
                        <p className="text-xs bg-green-100 text-green-700 font-medium px-3 py-1">
                            Hassle Free Delivery & Fast Payments
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SelectPayment;
