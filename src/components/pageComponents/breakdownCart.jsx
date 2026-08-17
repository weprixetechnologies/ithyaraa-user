import React from 'react';
import Image from 'next/image';
import breakdown from './../../../public/breakdown-image.png';

const BreakdownCart = ({ breakdownData, couponDiscount = 0, appliedCoupon = null, paymentMode = 'cod' }) => {
    const isCOD = paymentMode === 'cod' || paymentMode === 'COD';
    const handlingFee = isCOD ? 8 : 0;

    const baseSubtotal = Number(breakdownData.subtotal || 0);
    const itemDiscount = Number(breakdownData.totalDiscount || 0);
    const totalCouponDisc = Number(couponDiscount || 0);

    // Calculate net item price after item offer discounts and coupon discounts (excluding handling and shipping)
    const itemNetPrice = Math.max(0, baseSubtotal - itemDiscount - totalCouponDisc);

    // Determine active shipping charge: free only if net item total >= 999
    let activeShipping = Number(breakdownData.shipping || 0);
    if (itemNetPrice < 999 && activeShipping === 0) {
        activeShipping = 50; // Standard shipping fee below free threshold
    } else if (itemNetPrice >= 999) {
        activeShipping = 0; // Free shipping threshold met
    }

    const finalTotal = itemNetPrice + activeShipping + handlingFee;

    return (
        <div className='border border-gray-200 px-2 py-3 w-full rounded-lg'>
            <p className='font-medium text-lg'>
                Your Cart Breakdown
            </p>
            <div className="relative w-full aspect-[434/122] mt-2">
                <Image src={breakdown} alt='Breakdown Image' fill className="object-contain" />
            </div>
            <div className="h-3"></div>
            <p className='text-sm text-secondary-text-deep'>Price Details</p>
            <div className="grid grid-cols-2 justify-between">
                <div className='font-medium text-sm'>Base Price</div>
                <div className="text-right font-medium text-sm">₹{baseSubtotal}</div>

                <div className='font-medium text-sm'>Discount Applied</div>
                <div className="text-right font-medium text-sm">-₹{itemDiscount}</div>

                {appliedCoupon && (
                    <>
                        <div className='font-medium text-sm text-green-600'>Coupon Discount ({appliedCoupon.couponCode || appliedCoupon.couponID})</div>
                        <div className="text-right font-medium text-sm text-green-600">-₹{totalCouponDisc}</div>
                    </>
                )}

                <div className='font-medium text-sm'>Shipping Charges</div>
                <div className="text-right font-medium text-sm font-bold text-green-600">
                    {activeShipping > 0 ? `₹${activeShipping}` : 'Free'}
                </div>

                {isCOD && (
                    <>
                        <div className='font-medium text-sm'>Handling Fee (COD)</div>
                        <div className="text-right font-medium text-sm">₹{handlingFee}</div>
                    </>
                )}

                <div className="col-span-2 my-2">
                    <hr className='border-gray-200' />
                </div>
                <div className='font-semibold'>Total <span className="text-[10px] font-normal text-gray-500">(incl. taxes)</span></div>
                <div className="text-right font-semibold">₹{finalTotal}</div>
            </div>

        </div>
    );
}

export default BreakdownCart;
