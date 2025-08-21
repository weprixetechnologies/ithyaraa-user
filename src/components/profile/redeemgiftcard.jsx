import React, { useState } from 'react'
import axios from 'axios'
import axiosInstance from '@/lib/axiosInstance'

const RedeemGiftcard = ({ currentBalance = 0, onBalanceUpdate }) => {
    const [giftcode, setGiftcode] = useState('')
    const [pin, setPin] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState(null)

    const handleRedeem = async () => {
        setMessage(null)

        // Basic validation
        if (!/^\d{16}$/.test(giftcode)) {
            setMessage({ type: 'error', text: 'Gift card must be 16 digits.' })
            return
        }
        if (!/^\d{6}$/.test(pin)) {
            setMessage({ type: 'error', text: 'PIN must be 6 digits.' })
            return
        }

        try {
            setLoading(true)
            const res = await axiosInstance.post('/giftcard/redeem', {
                cardNumber: giftcode,
                pin,
            })

            if (res.data.success) {
                setMessage({ type: 'success', text: 'Gift card redeemed successfully!' })
                if (onBalanceUpdate) {
                    onBalanceUpdate(currentBalance + res.data.data.amountCredited)
                }
                setGiftcode('')
                setPin('')
            } else {
                setMessage({ type: 'error', text: res.data.message || 'Redemption failed.' })
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Server error.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <div className="flex justify-between mb-3 mt-4 pt-4">
                <div className="flex flex-col">
                    <p className='text-lg font-medium'>Account Balance</p>
                </div>
                <div className="flex gap-2">
                    <p className='font-semibold text-lg'>{currentBalance} INR</p>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="flex flex-col pr-3 gap-3">
                    <div className="w-full ">
                        <p className='text-sm font-medium mb-2'>Enter Giftcard Code</p>
                        <input
                            type="text"
                            value={giftcode}
                            onChange={(e) => setGiftcode(e.target.value)}
                            className='w-full text-sm border border-gray-200 h-[40px] px-3 rounded-lg outline-none '
                            placeholder='Enter Your Giftcard Code Here'
                            maxLength={16}
                        />
                    </div>

                    <div className="w-full ">
                        <p className='text-sm font-medium mb-2'>Enter Pin (Received in email)</p>
                        <input
                            type="password"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            className='w-full text-sm border border-gray-200 h-[40px] px-3 rounded-lg outline-none'
                            placeholder='Enter Your PIN received via email'
                            maxLength={6}
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            className='border w-[35%] py-2 rounded-lg text-sm border-primary-yellow cursor-pointer'
                            onClick={() => alert('Purchase flow TBD')}
                        >
                            Purchase One
                        </button>
                        <button
                            disabled={loading}
                            className={`border w-[65%] py-2 rounded-lg text-sm bg-primary-yellow cursor-pointer ${loading && 'opacity-50 cursor-not-allowed'}`}
                            onClick={handleRedeem}
                        >
                            {loading ? 'Redeeming...' : 'Redeem Card Now'}
                        </button>
                    </div>

                    {message && (
                        <div className={`text-sm mt-2 ${message.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                            {message.text}
                        </div>
                    )}
                </div>

                <div className="flex gap-2 justify-end">
                    <section
                        className="aspect-[525/275] w-full px-3 rounded-lg relative"
                        style={{
                            background: 'center/contain no-repeat url("https://ithyaraa.b-cdn.net/PROUDLY%20INDIAN-2.png")'
                        }}
                    >
                        <div className="absolute top-2 right-2">
                            <p className='text-white'>11 / 12 / 2025</p>
                        </div>
                        <div className="flex w-full justify-between items-center h-full">
                            <div className="text-white">
                                <p>Giftcard Code No</p>
                                <p className='text-lg text-white tracking-widest font-bold'>
                                    {giftcode || 'XXXX XXXX XXXX XXXX'}
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}

export default RedeemGiftcard
