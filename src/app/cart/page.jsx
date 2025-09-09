"use client"

import BreakdownCart from '@/components/pageComponents/breakdownCart'
import CartItems from '@/components/pageComponents/cartItems'
import SelectAddress from '@/components/pageComponents/selectAddress';
import SelectPayment from '@/components/pageComponents/selectPayment';
import ValidateCoupon from '@/components/pageComponents/validateCoupon'
import axiosInstance from '@/lib/axiosInstance';
import { getCartAsync } from '@/redux/slices/cartSlice';
import React, { useEffect, useState } from 'react'
import { CiDeliveryTruck } from "react-icons/ci";
import { RiSecurePaymentLine } from "react-icons/ri";
import { useDispatch, useSelector } from 'react-redux';
import { ClipLoader } from "react-spinners";
const Page = () => {
  const dispatch = useDispatch();
  const cartRedux = useSelector((state) => state.cart);
  const [loading, setLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [confirmAddress, setConfirmAddress] = useState(false)
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMode, setPaymentMode] = useState('cod')
  const steps = [
    { id: 1, label: 'Cart' },
    { id: 2, label: 'Address & Payment' }
  ];

  const handleAddressSelect = (address) => {
    setSelectedAddress(address); // Save selected address in parent state
  };
  const handlePaymentModeSelect = (mode) => {
    setPaymentMode(mode)
  }
  const handlePlaceOrder = async () => {
    setCurrentStep(currentStep + 1);
    setConfirmAddress(true);

    if (confirmAddress && selectedAddress) {
      try {
        const response = await axiosInstance.post('/order/place-order', {
          address: selectedAddress,
          paymentMode,
        });

        console.log("Placing order with address:", selectedAddress, paymentMode);

        const redirectUrl = response.data.checkoutPageUrl.data.instrumentResponse.redirectInfo.url

        if (redirectUrl) {
          console.log("Redirecting to:", redirectUrl);
          window.location.href = redirectUrl; // Full page redirect
          // OR open in new tab → window.open(redirectUrl, "_blank");
        } else {
          console.error("No redirect URL in response", response.data);
        }
      } catch (error) {
        console.error("Error placing order:", error);
      }
    }
  };



  useEffect(() => {
    dispatch(getCartAsync())
      .finally(() => setLoading(false));
  }, [dispatch]);

  if (loading || !cartRedux.cartDetail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-yellow-50 to-green-50">
        <ClipLoader color="#ffc107" size={60} speedMultiplier={1} />
        <span className="text-yellow-700 font-semibold mt-4 text-base">Loading your cart...</span>
      </div>
    );
  }

  return (
    <div className='flex w-full flex-col items-center '>

      <div className="flex justify-center pb-3 pt-4 md:py-10 md:w-[50%]">
        <div className="w-full flex justify-center items-center space-x-4">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              {/* Step Circle + Label */}
              <div
                className="flex items-center cursor-pointer"
                onClick={() => setCurrentStep(step.id)}
              >
                <div
                  className={`w-5 h-2 rounded-full transition-all 
                  ${currentStep >= step.id ? 'bg-green-500' : 'bg-gray-300'}`}
                ></div>
                <span
                  className={`ml-2 font-medium text-xs transition-all 
                  ${currentStep >= step.id ? 'text-green-500' : 'text-gray-400'}`}
                >
                  {step.label}
                </span>
              </div>

              {/* Line (skip after last step) */}
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 hidden md:block transition-all 
                  ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'}`}
                ></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 md:grid md:grid-cols-3 md:w-[80%] w-full px-4 md:px-0">
        <div className="md:flex md:col-span-2  md:flex-col">
          {!confirmAddress ? (
            <>
              <div className="py-2 md:mt-5">
                <ValidateCoupon />
              </div>
              <CartItems />
              <div className="border border-gray-200 rounded-lg">
                {cartRedux.cartDetail.total > 499 &&
                  <p className='text-xs text-green-500 p-4 flex gap-2 items-center font-medium'>
                    <CiDeliveryTruck size={16} /> Yay! Your order is eligible for free delivery...
                  </p>
                }
              </div>
            </>
          )
            :
            <>


              <div className="rounded-lg flex-col flex gap-2">
                <SelectAddress onSelect={handleAddressSelect} showAll={true} />
                <SelectPayment />

              </div>
            </>
          }

        </div>
        <div className="md:col-span-1 py-3 flex flex-col md:px-3 gap-2 mb-15">
          {/* {
            !confirmAddress && <SelectAddress onSelect={handleAddressSelect} />
          } */}
          <BreakdownCart breakdownData={cartRedux.cartDetail} />
          <button onClick={handlePlaceOrder} className='hidden md:flex text-center text-sm md:text-lg bg-primary-yellow w-full py-3 font-medium mt-4 rounded-lg cursor-pointer justify-center items-center gap-2'>
            <RiSecurePaymentLine size={18} />Place Order Now
          </button>
          <div className="bg-white py-2 px-3 fixed bottom-0 left-1/2 -translate-x-1/2 w-[90%] md:hidden">
            <button onClick={handlePlaceOrder}
              className="text-center text-sm md:text-lg bg-primary-yellow w-full py-3 font-medium rounded-lg cursor-pointer flex justify-center items-center gap-2"
            >
              <RiSecurePaymentLine size={18} />
              Place Order Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page;
