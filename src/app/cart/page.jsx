import BreakdownCart from '@/components/pageComponents/breakdownCart'
import CartItems from '@/components/pageComponents/cartItems'
import SelectAddress from '@/components/pageComponents/selectAddress';
import ValidateCoupon from '@/components/pageComponents/validateCoupon'
import React from 'react'
import { CiDeliveryTruck } from "react-icons/ci";
import { RiSecurePaymentLine } from "react-icons/ri";

const page = () => {
  return (
    <div className='flex w-full flex-col items-center '>
      <div className=" flex justify-center pb-3 pt-4 md:py-10 w-[50%] md:w-[50%]">
        <div className="w-full flex justify-center items-center space-x-4">
          {/* Step 1 */}
          <div className="flex  items-center">
            <div className="w-5 h-2 rounded-full bg-green-500"></div>
            <span className="ml-2 text-green-500 font-medium text-xs">Cart</span>
          </div>

          {/* Line */}
          <div className="flex-1 h-0.5 hidden md:block bg-green-500"></div>

          {/* Step 2 */}
          <div className="flex  items-center">
            <div className="w-5 h-2 rounded-full bg-gray-300"></div>
            <span className="ml-2 text-gray-400 font-medium text-xs">Address</span>
          </div>

          {/* Line */}
          <div className="flex-1 h-0.5 hidden md:block bg-gray-300"></div>

          {/* Step 3 */}
          <div className="flex  items-center">
            <div className="w-5 h-2 rounded-full bg-gray-300"></div>
            <span className="ml-2 text-gray-400 font-medium text-xs">Payment</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 md:grid md:grid-cols-3 md:w-[80%] w-full px-4 md:px-0">
        <div className="md:flex md:col-span-2  md:flex-col">
          <CartItems />
          <div className="border border-gray-200 rounded-lg">
            <p className='text-xs text-green-500 p-4 flex gap-2 items-center font-medium'><CiDeliveryTruck size={16} /> Yay! Your order is eligible for free delivery...</p>
          </div>
          <div className="py-2 md:mt-5">
            <ValidateCoupon />
          </div>
        </div>
        <div className="md:col-span-1 py-3 flex flex-col md:px-3 gap-2">
          <SelectAddress />
          <BreakdownCart />
          <button className='text-center text-sm md:text-lg bg-primary-yellow w-full py-3 font-medium mt-4 rounded-lg cursor-pointer flex justify-center items-center gap-2
          '><RiSecurePaymentLine size={18} />Place Order Now</button>
        </div>
      </div>

    </div>
  )
}

export default page
