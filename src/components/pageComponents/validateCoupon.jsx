import React from 'react'

const ValidateCoupon = () => {
    return (
        <div className='flex grow gap-2'>
            <input type='text' className='border outline-none border-gray-200 rounded-lg flex-1/2 min-h-[35px] text-xs px-2' placeholder='Enter Coupon Code to Avail Discount' />
            <button className='bg-primary-yellow text-xs px-3 py-2 rounded-lg font-medium'>Apply Coupon</button>
        </div>
    )
}

export default ValidateCoupon
