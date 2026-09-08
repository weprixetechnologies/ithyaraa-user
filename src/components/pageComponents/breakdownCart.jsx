import React from 'react';
import Image from 'next/image';
import breakdown from './../../../public/breakdown-image.png';

const BreakdownCart = ({ breakdownData = {}, couponDiscount = 0, appliedCoupon = null, paymentMode = 'cod' }) => {
    const isCOD = paymentMode === 'cod' || paymentMode === 'COD';
    const handlingFee = isCOD ? 8 : 0;

    const baseSubtotal = Number(breakdownData?.subtotal || 0);
    const itemDiscount = Number(breakdownData?.totalDiscount || 0);
    const productDiscount = Number(breakdownData?.productDiscount ?? 0);
    const offerDiscount = Number(breakdownData?.offerDiscount ?? 0);
    const appliedOffers = breakdownData?.appliedOffers || [];
    const totalCouponDisc = Number(couponDiscount || 0);

    // Calculate net item price after item offer discounts and coupon discounts (excluding handling and shipping)
    const itemNetPrice = Math.max(0, baseSubtotal - itemDiscount - totalCouponDisc);

    // Determine active shipping charge: free only if net item total >= 999
    let activeShipping = Number(breakdownData?.shipping || 0);
    if (itemNetPrice < 999 && activeShipping === 0) {
        activeShipping = 50; // Standard shipping fee below free threshold
    } else if (itemNetPrice >= 999) {
        activeShipping = 0; // Free shipping threshold met
    }

    const finalTotal = itemNetPrice + activeShipping + handlingFee;

    // Total savings across product discount, offer discount, and coupon
    const knownItemDiscounts = (productDiscount > 0 || offerDiscount > 0)
        ? (productDiscount + offerDiscount)
        : itemDiscount;
    const totalSavings = knownItemDiscounts + totalCouponDisc;

    return (
        <div className='border border-gray-200 px-3 py-3 w-full rounded-lg bg-white shadow-xs'>
            <p className='font-medium text-lg text-gray-900'>
                Your Cart Breakdown
            </p>
            <div className="relative w-full aspect-[434/122] mt-2">
                <Image src={breakdown} alt='Breakdown Image' fill className="object-contain" />
            </div>
            <div className="h-3"></div>
            <p className='text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2'>Price Details</p>
            
            <div className="grid grid-cols-2 justify-between gap-y-2">
                <div className='font-medium text-sm text-gray-700'>Base Price (MRP)</div>
                <div className="text-right font-medium text-sm text-gray-900">₹{baseSubtotal}</div>

                {productDiscount > 0 && (
                    <>
                        <div className='font-medium text-sm text-green-700'>Product Discount</div>
                        <div className="text-right font-medium text-sm text-green-700">-₹{productDiscount}</div>
                    </>
                )}

                {offerDiscount > 0 && (
                    <>
                        <div className='font-medium text-sm text-emerald-700 font-semibold'>Offer Discount</div>
                        <div className="text-right font-medium text-sm text-emerald-700 font-bold">-₹{offerDiscount}</div>

                        {/* Breakdown per applied offer */}
                        {appliedOffers.length > 0 && (
                            <div className="col-span-2 bg-emerald-50/70 border border-emerald-200/70 rounded-lg p-2.5 my-1 flex flex-col gap-1.5">
                                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">Applied Offers Breakdown</span>
                                {appliedOffers.map((off, idx) => (
                                    <div key={off.offerID || idx} className="flex justify-between items-center text-xs text-emerald-950">
                                        <span className="truncate max-w-[210px] text-[11px] font-medium">• {off.offerName}</span>
                                        <span className="font-semibold text-emerald-700">-₹{Number(off.discountAmount || 0)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Fallback if breakdown not split but itemDiscount > 0 */}
                {productDiscount === 0 && offerDiscount === 0 && itemDiscount > 0 && (
                    <>
                        <div className='font-medium text-sm text-green-700'>Discount Applied</div>
                        <div className="text-right font-medium text-sm text-green-700">-₹{itemDiscount}</div>
                    </>
                )}

                {appliedCoupon && (
                    <>
                        <div className='font-medium text-sm text-green-600'>
                            Coupon Discount <span className="text-xs font-bold text-green-700">({appliedCoupon.couponCode || appliedCoupon.couponID})</span>
                        </div>
                        <div className="text-right font-medium text-sm text-green-600 font-semibold">-₹{totalCouponDisc}</div>
                    </>
                )}

                <div className='font-medium text-sm text-gray-700'>Shipping Charges</div>
                <div className="text-right font-medium text-sm font-bold text-green-600">
                    {activeShipping > 0 ? `₹${activeShipping}` : 'Free'}
                </div>

                {isCOD && (
                    <>
                        <div className='font-medium text-sm text-gray-700'>Handling Fee (COD)</div>
                        <div className="text-right font-medium text-sm text-gray-900">₹{handlingFee}</div>
                    </>
                )}

                <div className="col-span-2 my-1">
                    <hr className='border-gray-200' />
                </div>
                <div className='font-bold text-base text-gray-900'>Total <span className="text-[10px] font-normal text-gray-500">(incl. taxes)</span></div>
                <div className="text-right font-bold text-lg text-gray-900">₹{finalTotal}</div>
            </div>

            {/* Total Savings Highlight Badge */}
            {totalSavings > 0 && (
                <div className="mt-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-900 text-xs font-medium p-2.5 rounded-lg flex items-center justify-between shadow-2xs">
                    <span className="flex items-center gap-1 font-semibold text-green-800">
                        🎉 Total Savings on this order
                    </span>
                    <span className="font-bold text-green-800 text-sm">₹{totalSavings}</span>
                </div>
            )}
        </div>
    );
}

export default BreakdownCart;
