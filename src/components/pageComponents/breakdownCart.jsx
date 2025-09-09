import React from 'react';
import Image from 'next/image';
import breakdown from './../../../public/breakdown-image.png';

const BreakdownCart = ({ breakdownData }) => {
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
                <div className="text-right font-medium text-sm">{breakdownData.subtotal}</div>

                <div className='font-medium text-sm'>Discount Applied</div>
                <div className="text-right font-medium text-sm">{breakdownData.totalDiscount}</div>

                <div className='font-medium text-sm'>Shipping Charges</div>
                <div className="text-right font-medium text-sm">0</div>
                <div className="col-span-2 my-2">
                    <hr className='border-gray-200' />
                </div>
                <div className='font-semibold'>Sub - Total</div>
                <div className="text-right font-semibold">{breakdownData.total}</div>
            </div>

        </div>
    );
}

export default BreakdownCart;
