"use client"

import axiosInstance from '@/lib/axiosInstance';
import { getCartAsync } from '@/redux/slices/cartSlice';
import React, { useEffect, useState, Suspense, lazy } from 'react'
import { CiDeliveryTruck } from "react-icons/ci";
import { RiSecurePaymentLine } from "react-icons/ri";
import { useDispatch, useSelector } from 'react-redux';
import { ClipLoader } from "react-spinners";
import CheckoutLoadingModal from '@/components/ui/CheckoutLoadingModal';

// Lazy load cart components for better performance
const BreakdownCart = lazy(() => import('@/components/pageComponents/breakdownCart'));
const CartItems = lazy(() => import('@/components/pageComponents/cartItems'));
const SelectAddress = lazy(() => import('@/components/pageComponents/selectAddress'));
const SelectPayment = lazy(() => import('@/components/pageComponents/selectPayment'));
const ValidateCoupon = lazy(() => import('@/components/pageComponents/validateCoupon'));

const Page = () => {
  const dispatch = useDispatch();
  const cartRedux = useSelector((state) => state.cart);
  const [loading, setLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedAddressID, setSelectedAddressID] = useState(null);
  const [confirmAddress, setConfirmAddress] = useState(false)
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMode, setPaymentMode] = useState('cod')
  const [placing, setPlacing] = useState(false)
  const [placeError, setPlaceError] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [walletApplied, setWalletApplied] = useState(0)
  const steps = [
    { id: 1, label: 'Cart' },
    { id: 2, label: 'Address & Payment' }
  ];

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setSelectedAddressID(address?.addressID || null);
  };
  const handlePaymentModeSelect = (mode) => {
    // Map UI selection to backend expected values
    const mapped = mode === 'phonepe' ? 'PREPAID' : 'COD';
    setPaymentMode(mapped);
  }

  const handleCouponApplied = (couponData) => {
    setAppliedCoupon(couponData);
    setCouponDiscount(couponData.discount || 0);
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
  }

  // Handle cart item removal - clear coupon if cart becomes empty
  const handleCartItemRemoved = () => {
    if (cartRedux.cart?.length === 0) {
      setAppliedCoupon(null);
      setCouponDiscount(0);
    }
  }
  const handlePlaceOrder = async () => {
    setPlaceError('')
    // First click: move to address/payment confirmation step
    if (!confirmAddress) {
      setConfirmAddress(true)
      setCurrentStep(2)
      return
    }

    // Require selected address
    if (!selectedAddressID) {
      setPlaceError('Please select a delivery address')
      return
    }

    try {
      setPlacing(true)
      setShowCheckoutModal(true)
      const response = await axiosInstance.post('/order/place-order', {
        addressID: selectedAddressID,
        paymentMode,
        couponCode: appliedCoupon?.couponCode || null,
        walletApplied: walletApplied || 0
      });

      // PhonePe redirect (online payments)
      const redirectUrlRaw = response?.data?.checkoutPageUrl
      const redirectUrl = typeof redirectUrlRaw === 'string'
        ? redirectUrlRaw
        : redirectUrlRaw?.data?.instrumentResponse?.redirectInfo?.url

      if (redirectUrl) {
        // Show checkout loading modal for PhonePe
        window.location.href = redirectUrl
        return
      }

      // Check if it's a COD order
      if (response?.data?.paymentMode === 'COD' && response?.data?.success) {
        const orderId = response?.data?.orderID || response?.data?.orderId;
        if (orderId) {
          window.location.href = `/order-success/order-summary/${orderId}`;
          return;
        }
      }

      // Fallback to profile page if no specific page exists
      if (typeof window !== 'undefined') {
        window.location.href = '/profile?tab=orders'
      }
    } catch (error) {
      console.error('Error placing order:', error)
      setPlaceError(error?.response?.data?.error || 'Failed to place order')
      setShowCheckoutModal(false) // Hide modal on error
    } finally {
      setPlacing(false)
    }
  };



  useEffect(() => {
    dispatch(getCartAsync())
      .finally(() => setLoading(false));
  }, [dispatch]);

  // Clear coupon if cart becomes empty
  useEffect(() => {
    if (cartRedux.cart?.length === 0 && appliedCoupon) {
      setAppliedCoupon(null);
      setCouponDiscount(0);
    }
  }, [cartRedux.cart?.length, appliedCoupon]);

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
                <Suspense fallback={<div className="h-16 bg-gray-200 animate-pulse rounded-lg" />}>
                  <ValidateCoupon
                    onCouponApplied={handleCouponApplied}
                    appliedCoupon={appliedCoupon}
                    onRemoveCoupon={handleRemoveCoupon}
                  />
                </Suspense>
              </div>
              <Suspense fallback={<div className="h-64 bg-gray-200 animate-pulse rounded-lg" />}>
                <CartItems />
              </Suspense>
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
                <Suspense fallback={<div className="h-32 bg-gray-200 animate-pulse rounded-lg" />}>
                  <SelectAddress onSelect={handleAddressSelect} showAll={true} />
                </Suspense>
                <Suspense fallback={<div className="h-32 bg-gray-200 animate-pulse rounded-lg" />}>
                  <SelectPayment
                    onSelect={handlePaymentModeSelect}
                    onWalletChange={setWalletApplied}
                    cartTotal={cartRedux?.cartDetail?.total || 0}
                    couponDiscount={couponDiscount}
                  />
                </Suspense>
              </div>
            </>
          }

        </div>
        <div className="md:col-span-1 py-3 flex flex-col md:px-3 gap-2 mb-15">
          {/* {
            !confirmAddress && <SelectAddress onSelect={handleAddressSelect} />
          } */}
          <Suspense fallback={<div className="h-48 bg-gray-200 animate-pulse rounded-lg" />}>
            <BreakdownCart
              breakdownData={cartRedux.cartDetail}
              couponDiscount={couponDiscount}
              appliedCoupon={appliedCoupon}
            />
          </Suspense>
          {/* Coins notice */}
          {(() => {
            const payable = Math.max(0, (Number(cartRedux?.cartDetail?.total) || 0) - (Number(couponDiscount) || 0));
            const coins = Math.floor(payable / 100);
            if (coins <= 0) return null;
            return (
              <div className="mt-2 border border-amber-200 bg-amber-50 text-amber-800 rounded-lg p-3 text-xs">
                You will earn <span className="font-semibold">{coins} Ithyaraa coin{coins > 1 ? 's' : ''}</span> on this order.
              </div>
            );
          })()}
          {placeError && (
            <p className="text-red-600 text-sm mt-1">{placeError}</p>
          )}
          <button onClick={handlePlaceOrder} disabled={placing} className='hidden md:flex text-center text-sm md:text-lg bg-primary-yellow w-full py-3 font-medium mt-4 rounded-lg cursor-pointer justify-center items-center gap-2 disabled:opacity-60'>
            <RiSecurePaymentLine size={18} />{!confirmAddress ? 'Proceed to Address & Payment' : placing ? 'Placing...' : 'Place Order Now'}
          </button>
          <div className="bg-white py-2 px-3 fixed bottom-0 left-1/2 -translate-x-1/2 w-[90%] md:hidden">
            <button onClick={handlePlaceOrder} disabled={placing}
              className="text-center text-sm md:text-lg bg-primary-yellow w-full py-3 font-medium rounded-lg cursor-pointer flex justify-center items-center gap-2 disabled:opacity-60"
            >
              <RiSecurePaymentLine size={18} />
              {!confirmAddress ? 'Proceed to Address & Payment' : placing ? 'Placing...' : 'Place Order Now'}
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Loading Modal */}
      <CheckoutLoadingModal isOpen={showCheckoutModal} />
    </div>
  )
}

export default Page;