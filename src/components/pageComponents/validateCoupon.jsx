import React, { useState } from 'react'
import axiosInstance from '@/lib/axiosInstance'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import confetti from 'canvas-confetti'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ValidateCoupon = ({ onCouponApplied, appliedCoupon, onRemoveCoupon }) => {
    const [couponCode, setCouponCode] = useState('')
    const [loading, setLoading] = useState(false)
    const cartRedux = useSelector((state) => state.cart)

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            toast.error('Please enter a coupon code')
            return
        }

        setLoading(true)
        try {
            const response = await axiosInstance.post('/user-coupon/apply-coupon', {
                couponCode: couponCode.trim(), // Fixed: changed from couponID to couponCode
                // cartID is optional - backend will find it using UID
                ...(cartRedux.cartDetail?.cartID && { cartID: cartRedux.cartDetail.cartID })
            })

            if (response.data.success) {
                // Trigger confetti celebration
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#ffc107', '#28a745', '#17a2b8', '#6f42c1']
                })

                toast.success('Coupon applied successfully! 🎉')
                onCouponApplied(response.data)
                setCouponCode('')
            } else {
                toast.error(response.data.message || 'Failed to apply coupon')
            }
        } catch (error) {
            console.error('Error applying coupon:', error)
            toast.error(error.response?.data?.message || 'Failed to apply coupon')
        } finally {
            setLoading(false)
        }
    }

    const handleRemoveCoupon = () => {
        onRemoveCoupon()
        setCouponCode('')
        toast.info('Coupon removed')
    }

    return (
        <div className='flex grow gap-2'>
            {appliedCoupon ? (
                <div className='flex items-center justify-between w-full bg-green-50 border border-green-200 rounded-lg px-3 py-2 transition-all duration-300'>
                    <div className='flex items-center gap-2'>
                        <span className='text-green-600 text-sm font-medium'>
                            {appliedCoupon.couponCode || appliedCoupon.couponID} Applied
                        </span>
                        <span className='text-green-600 text-xs font-semibold'>
                            -₹{appliedCoupon.discount}
                        </span>
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <button
                                className='bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-md font-medium transition-colors duration-200'
                            >
                                Remove
                            </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Remove Coupon</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to remove this coupon? You will lose the discount applied to your order.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleRemoveCoupon}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                    Remove Coupon
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            ) : (
                <>
                    <input
                        type='text'
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className='border outline-none border-gray-200 rounded-lg flex-1/2 min-h-[35px] text-xs px-2'
                        placeholder='Enter Coupon Code to Avail Discount'
                        disabled={loading}
                    />
                    <button
                        onClick={handleApplyCoupon}
                        disabled={loading || !couponCode.trim()}
                        className='bg-primary-yellow text-xs px-3 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        {loading ? 'Applying...' : 'Apply Coupon'}
                    </button>
                </>
            )}
        </div>
    )
}

export default ValidateCoupon
