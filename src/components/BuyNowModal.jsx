import React, { useEffect, useMemo, useState, useCallback } from 'react';
import axiosInstance from '../lib/axiosInstance';
import { getCookie, setCookieEasy } from '../lib/setCookie';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import EnterOtp from './ui/enterOtp';
import logo from '../../public/ithyaraa-logo.png';

const INDIAN_STATES = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
    'Delhi',
    'Jammu and Kashmir',
    'Ladakh',
    'Puducherry',
    'Chandigarh',
    'Andaman and Nicobar Islands',
    'Dadra and Nagar Haveli and Daman and Diu',
    'Lakshadweep',
];

const emptyForm = {
    name: '',
    email: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
};

const BuyNowModal = ({
    isOpen,
    onClose,
    product,
    productType,
    selectedVariation,
    selectedItems = [],
    customInputs = {},
    initialQuantity = 1,
    selectedDressType = null,
    brandID = null,
    referBy = null,
}) => {
    const router = useRouter();

    const [step, setStep] = useState('details'); // 'details' | 'processing' | 'success'
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressID, setSelectedAddressID] = useState('');
    const [formData, setFormData] = useState(emptyForm);
    const [paymentMode, setPaymentMode] = useState('COD');
    const [couponCode, setCouponCode] = useState('');
    const [couponApplied, setCouponApplied] = useState(false);
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponError, setCouponError] = useState('');
    const [couponSuccess, setCouponSuccess] = useState('');
    const [applyingCoupon, setApplyingCoupon] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [useNewAddress, setUseNewAddress] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const [offerDetails, setOfferDetails] = useState(null);
    const [checkingOffer, setCheckingOffer] = useState(false);
    const [couponAnimKey, setCouponAnimKey] = useState(0);
    const [offerAnimKey, setOfferAnimKey] = useState(0);

    const [globalShippingFee, setGlobalShippingFee] = useState(0);
    const [serverShippingFee, setServerShippingFee] = useState(null);

    // Guest OTP gate: 'phone' | 'otp' | 'creating' (only when !isLoggedIn and no account for phone)
    const [guestStep, setGuestStep] = useState('phone');
    const [guestPhoneForOtp, setGuestPhoneForOtp] = useState('');
    const [otp, setOtp] = useState('');
    const [otpCooldown, setOtpCooldown] = useState(0);
    const [sendOtpLoading, setSendOtpLoading] = useState(false);
    const [verifyOtpLoading, setVerifyOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState('');

    const safeQuantity = Math.max(1, Number(initialQuantity) || 1);

    const unitPrice = useMemo(() => {
        if (!product) return 0;
        if (productType === 'customproduct' && selectedDressType && selectedDressType.price) {
            return Number(selectedDressType.price);
        }
        if (productType === 'variable' && selectedVariation) {
            return selectedVariation.variationSalePrice ?? selectedVariation.variationPrice ?? 0;
        }
        if (productType === 'presale' && product.salePrice != null) {
            return product.salePrice ?? product.regularPrice ?? 0;
        }
        return product.salePrice ?? product.regularPrice ?? 0;
    }, [product, productType, selectedVariation, selectedDressType]);

    const subtotal = useMemo(() => {
        return Number((unitPrice * safeQuantity).toFixed(2));
    }, [unitPrice, safeQuantity]);

    const shippingFee = useMemo(() => serverShippingFee, [serverShippingFee]);

    const handlingFee = useMemo(() => (paymentMode === 'COD' ? 8 : 0), [paymentMode]);

    const totalAfterCoupon = useMemo(() => {
        if (serverShippingFee === null) return null; // Indicate loading
        const offerSaving = offerDetails?.offerApplied ? Number(offerDetails.savedAmount || 0) : 0;
        const raw = subtotal - offerSaving - couponDiscount + (serverShippingFee || 0) + handlingFee;
        return raw > 0 ? Number(raw.toFixed(2)) : 0;
    }, [subtotal, couponDiscount, offerDetails, serverShippingFee, handlingFee]);

    const fetchShippingFee = useCallback(async () => {
        const pid = product?.productID || product?.id;
        if (!pid) return;
        try {
            const res = await axiosInstance.get('/order/buy-now/shipping-fee', {
                params: {
                    productID: pid,
                    brandID: brandID || product?.brandID,
                    subtotal: subtotal
                }
            });
            if (res.data?.success) {
                setServerShippingFee(Number(res.data.shippingFee) || 0);
            }
        } catch (err) {
            console.error('Failed to fetch shipping fee', err);
        }
    }, [product, brandID, subtotal]);

    const activeCoupon = couponApplied ? couponCode.trim() : undefined;

    const checkOffer = useCallback(async (pid, qty) => {
        if (!pid || !qty || qty < 1) return;
        try {
            setCheckingOffer(true);
            const res = await axiosInstance.get('/order/buy-now/check-offer', {
                params: {
                    productID: pid,
                    quantity: qty,
                    variationID: selectedVariation?.variationID || null,
                    selectedDressType: selectedDressType,
                    productType: productType,
                    couponCode: activeCoupon
                },
            });
            if (res.data?.success) {
                setOfferDetails(res.data);
                setServerShippingFee(Number(res.data.shippingFee) || 0);
                setOfferAnimKey(prev => prev + 1);
            } else {
                setOfferDetails(null);
            }
        } catch {
            setOfferDetails(null);
        } finally {
            setCheckingOffer(false);
        }
    }, [productType, selectedVariation, selectedDressType, activeCoupon]);

    useEffect(() => {
        if (!isOpen) return;

        fetchShippingFee();

        const at = getCookie('_at');
        const loggedFlag = getCookie('isLoggedIn');
        const logged = !!at || loggedFlag === 'true';
        setIsLoggedIn(logged);

        if (logged) {
            // Fetch saved addresses
            axiosInstance
                .get('/address/all-address')
                .then((res) => {
                    const list = res.data?.addresses || res.data?.address || [];
                    setAddresses(list);
                    if (list.length > 0) {
                        setSelectedAddressID(list[0].addressID);
                        setUseNewAddress(false);
                    } else {
                        setUseNewAddress(true);
                    }
                })
                .catch((err) => {
                    console.error('Failed to fetch addresses', err);
                });
        } else {
            setAddresses([]);
            setSelectedAddressID('');
            setUseNewAddress(true);
            setGuestStep('phone');
            setOtp('');
            setOtpError('');
            setGuestPhoneForOtp('');
        }
    }, [isOpen, fetchShippingFee]);

    // OTP resend cooldown
    useEffect(() => {
        let timer;
        if (otpCooldown > 0) {
            timer = setInterval(() => setOtpCooldown((c) => c - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [otpCooldown]);

    useEffect(() => {
        const pid = product?.productID || product?.id;
        const qty = safeQuantity;
        if (pid && qty) {
            checkOffer(pid, qty);
        }
    }, [product?.productID, product?.id, safeQuantity, checkOffer]);

    useEffect(() => {
        const isOfferLocked = offerDetails?.offerApplied === true;
        if (isOfferLocked) {
            setCouponApplied(false);
            setCouponDiscount(0);
            setCouponCode('');
            setCouponError('');
            setCouponSuccess('');
        }
    }, [offerDetails?.offerApplied]);

    if (!isOpen) return null;

    const closeAllowed = step !== 'processing';

    const handleChange = (field) => (e) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
        if (formErrors[field]) {
            setFormErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const validateFields = () => {
        const errors = {};

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{10}$/;
        const pincodeRegex = /^[0-9]{6}$/;

        if (!isLoggedIn) {
            if (!formData.name.trim()) errors.name = 'Full name is required';
            if (!emailRegex.test(formData.email.trim())) errors.email = 'Valid email is required';
            if (!phoneRegex.test(formData.phone.trim())) errors.phone = 'Phone must be 10 digits';
        }

        if (!isLoggedIn || useNewAddress) {
            if (!formData.line1.trim()) errors.line1 = 'Address line 1 is required';
            if (!formData.city.trim()) errors.city = 'City is required';
            if (!formData.state.trim()) errors.state = 'State is required';
            if (!pincodeRegex.test(formData.pincode.trim())) errors.pincode = 'Pincode must be 6 digits';
        }

        if (isLoggedIn && useNewAddress) {
            if (!phoneRegex.test(formData.phone.trim())) errors.phone = 'Phone must be 10 digits';
            if (!emailRegex.test(formData.email.trim())) errors.email = 'Valid email is required';
        }

        if (productType === 'make_combo') {
            if (!Array.isArray(selectedItems) || selectedItems.length === 0) {
                errors.make_combo = 'Please select required combo items';
            }
        }

        if (productType === 'customproduct') {
            if (Array.isArray(product?.custom_inputs)) {
                product.custom_inputs.forEach((input) => {
                    if (input.required) {
                        const val = customInputs[input.id];
                        if (val === undefined || val === null || String(val).trim() === '') {
                            errors[`custom_${input.id}`] = 'Required';
                        }
                    }
                });
            }
        }

        if (productType === 'presale') {
            const min = Number(product.minOrderQuantity || 1);
            const max = Number(product.maxOrderQuantity || safeQuantity);
            if (safeQuantity < min || safeQuantity > max) {
                errors.quantity = `Quantity must be between ${min} and ${max}`;
            }
        }

        return errors;
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setApplyingCoupon(true);
        setCouponError('');
        setCouponSuccess('');
        setCouponApplied(false);
        try {
            const res = await axiosInstance.get('/order/buy-now/validate-coupon', {
                params: {
                    code: couponCode.trim(),
                    subtotal,
                    productID: product?.productID || product?.id,
                    email: formData.email || undefined,
                    uid: undefined,
                },
            });

            const data = res.data || {};
            if (!data.success) {
                setCouponDiscount(0);
                setCouponApplied(false);
                setCouponError(data.message || 'Invalid coupon');
                toast.error(data.message || 'Invalid coupon');
                return;
            }

            const discount = Number(data.couponDiscount || 0);
            const newShipping = Number(data.shippingFee) || 0;
            setCouponDiscount(discount);
            setServerShippingFee(newShipping);
            setCouponApplied(true);
            setCouponAnimKey(prev => prev + 1);
            const saveMsg = `Coupon applied! You save ₹${discount.toFixed(2)}`;
            const shippingMsg = newShipping > 0 ? ` (Shipping: ₹${newShipping})` : ' (Free Shipping!)';
            setCouponSuccess(data.message || (saveMsg + shippingMsg));
            toast.success(data.message || (saveMsg + shippingMsg));
        } catch (err) {
            console.error('Coupon validation failed', err);
            setCouponApplied(false);
            setCouponDiscount(0);
            setCouponError(err.response?.data?.message || err.message || 'Failed to apply coupon');
            toast.error('Failed to apply coupon');
        } finally {
            setApplyingCoupon(false);
        }
    };

    const submitOrder = useCallback(async (afterOtpVerify = false) => {
        setLoading(true);
        setError('');
        setStep('processing');
        if (afterOtpVerify) setGuestStep('creating');

        try {
            const hasSession = !!getCookie('_at');
            const resolvedUid = hasSession ? (getCookie('uid') || getCookie('_uid') || null) : null;

            const body = {
                productType,
                productID: product?.productID || product?.presaleProductID || product?.productId,
                quantity: safeQuantity,
                variationID: selectedVariation?.variationID || null,
                selectedItems: productType === 'make_combo' ? selectedItems : [],
                customInputs: productType === 'customproduct' ? customInputs : {},
                selectedDressType,
                couponCode: couponApplied ? couponCode.trim() : null,
                paymentMode,
                guestDetails: !isLoggedIn
                    ? {
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                    }
                    : null,
                address: (!isLoggedIn || useNewAddress)
                    ? {
                        name: formData.name,
                        fullName: formData.name,
                        line1: formData.line1,
                        line2: formData.line2,
                        city: formData.city,
                        state: formData.state,
                        pincode: formData.pincode,
                        landmark: formData.landmark,
                        phoneNumber: formData.phone,
                        emailID: formData.email,
                    }
                    : null,
                existingAddressID: isLoggedIn && !useNewAddress ? selectedAddressID : null,
                uid: isLoggedIn ? resolvedUid : null,
                referBy: referBy || localStorage.getItem('referBy'),
            };

            const res = await axiosInstance.post('/order/buy-now', body);
            const data = res.data || {};

            if (!data.success) {
                throw new Error(data.message || 'Failed to place order');
            }

            // Clear referral after successful use
            localStorage.removeItem("referBy");

            if (data.isNewUser && data.sessionToken) {
                try {
                    setCookieEasy('_at', data.sessionToken, 7);
                    document.cookie = `isLoggedIn=true; path=/; max-age=${7 * 24 * 60 * 60}`;
                    setIsLoggedIn(true);
                    toast.success("Account created automatically — you're now logged in!");
                } catch (e) {
                    console.error('Failed to store session token', e);
                }
            }

            if (paymentMode === 'PREPAID') {
                const redirectUrl = data.phonePeRedirectURL;
                if (redirectUrl) {
                    if (typeof window !== 'undefined') {
                        window.location.href = redirectUrl;
                    }
                } else {
                    toast.error('Payment initialization failed');
                    setError('Payment initialization failed');
                    setStep('details');
                }
                return;
            }

            setStep('success');

            if (data.redirectURL) {
                setTimeout(() => {
                    router.push(data.redirectURL.replace(/\/+/g, '/'));
                    if (onClose) onClose();
                }, 1500);
            }
        } catch (err) {
            console.error('Buy Now order failed', err);
            const serverMsg = err.response?.data?.message || err.message || 'Failed to place order';
            setError(serverMsg);
            toast.error(serverMsg);
            setStep('details');
            setGuestStep((s) => (s === 'creating' ? 'otp' : s));
        } finally {
            setLoading(false);
        }
    }, [
        productType, product, safeQuantity, selectedVariation, selectedItems, customInputs,
        selectedDressType, couponApplied, couponCode, paymentMode, isLoggedIn, formData,
        useNewAddress, selectedAddressID, onClose, router
    ]);

    const handleConfirmOrder = async () => {
        const fieldErrors = validateFields();
        if (Object.keys(fieldErrors).length > 0) {
            setFormErrors(fieldErrors);
            setError('Please fix highlighted fields');
            toast.error('Please correct the errors before continuing.');
            return;
        }

        setFormErrors({});
        setError('');
        setOtpError('');

        if (isLoggedIn) {
            await submitOrder();
            return;
        }

        const phone = (formData.phone || '').replace(/\D/g, '').slice(-10);
        if (phone.length !== 10) {
            setError('Phone must be 10 digits');
            toast.error('Enter a valid 10-digit phone number');
            return;
        }

        try {
            const checkRes = await axiosInstance.get('/user/check-phone', { params: { phone } });
            const data = checkRes.data || {};
            if (data.exists) {
                await submitOrder();
                return;
            }
        } catch (err) {
            console.error('Check phone failed', err);
            setError(err.response?.data?.message || 'Could not verify phone. Try again.');
            toast.error('Could not verify phone. Try again.');
            return;
        }

        setSendOtpLoading(true);
        setOtpError('');
        try {
            const phoneForApi = `+91${phone}`;
            const res = await axiosInstance.post('/user/send-otp', {
                phoneNumber: phoneForApi,
            });
            const data = res.data || {};
            if (res.status !== 200 || !data.success) {
                setOtpError(data.message || 'Failed to send OTP. Try again.');
                toast.error(data.message || 'Failed to send OTP. Try again.');
                return;
            }
            setGuestPhoneForOtp(phone);
            setGuestStep('otp');
            setOtpCooldown(60);
            setOtp('');
            toast.success('OTP sent to your number');
        } catch (err) {
            console.error('Send OTP failed', err);
            const msg = err.response?.data?.message || err.message || 'Failed to send OTP. Try again.';
            setOtpError(msg);
            toast.error(msg);
        } finally {
            setSendOtpLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        const trimmed = (otp || '').replace(/\D/g, '');
        if (trimmed.length < 6) {
            setOtpError('Enter complete 6-digit OTP');
            toast.error('Enter complete 6-digit OTP');
            return;
        }
        const phone = (guestPhoneForOtp || '').replace(/\D/g, '').slice(-10);
        if (phone.length !== 10) {
            setOtpError('Session issue. Please go back and enter your number again.');
            toast.error('Please use "Change number" and enter your phone again.');
            return;
        }
        setVerifyOtpLoading(true);
        setOtpError('');
        try {
            const res = await axiosInstance.post('/user/verify-otp', {
                phoneNumber: `+91${phone}`,
                otp: trimmed,
            });
            const data = res.data || {};
            if (res.status !== 200 || !data.success) {
                const msg = data.message || 'OTP verification failed';
                if (/expired/i.test(msg)) {
                    setOtpError('OTP expired. Please request a new one.');
                    toast.error('OTP expired. Please request a new one.');
                } else {
                    setOtpError(msg);
                    toast.error(msg);
                }
                return;
            }
            await submitOrder(true);
        } catch (err) {
            console.error('Verify OTP failed', err);
            const msg = err.response?.data?.message || err.message || 'Could not verify OTP.';
            const hint = err.response?.status === 400
                ? ' You can use "Resend OTP" to get a new code.'
                : '';
            setOtpError(msg + hint);
            toast.error(msg);
        } finally {
            setVerifyOtpLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (otpCooldown > 0) return;
        const phone = (guestPhoneForOtp || '').replace(/\D/g, '').slice(-10);
        if (phone.length !== 10) {
            setOtpError('Session issue. Please use "Change number" and enter your phone again.');
            toast.error('Please use "Change number" and enter your phone again.');
            return;
        }
        setSendOtpLoading(true);
        setOtpError('');
        try {
            const res = await axiosInstance.post('/user/send-otp', {
                phoneNumber: `+91${phone}`,
            });
            const data = res.data || {};
            if (res.status !== 200 || !data.success) {
                setOtpError(data.message || 'Failed to send OTP.');
                toast.error(data.message || 'Failed to send OTP.');
                return;
            }
            setOtpCooldown(60);
            setOtp('');
            toast.success('New OTP sent');
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to send OTP.';
            setOtpError(msg);
            toast.error(msg);
        } finally {
            setSendOtpLoading(false);
        }
    };

    const handleChangeNumber = () => {
        setGuestStep('phone');
        setOtp('');
        setOtpError('');
        setGuestPhoneForOtp('');
        setOtpCooldown(0);
    };

    const renderOrderSummary = () => {
        return (
            <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold mb-2">Order Summary</h3>
                <div className="flex items-center gap-3 mb-2">
                    <img
                        src={product?.featuredImage?.[0]?.imgUrl || product?.featuredImage?.[0] || logo.src || logo}
                        alt={product?.name}
                        className="w-16 h-16 rounded object-cover"
                    />
                    <div className="flex-1">
                        <p className="font-medium text-sm">{product?.name}</p>
                        {selectedVariation?.variationName && (
                            <p className="text-xs text-gray-600">{selectedVariation.variationName}</p>
                        )}
                        {selectedDressType?.label && (
                            <p className="text-xs text-indigo-600 font-medium">Service: {selectedDressType.label}</p>
                        )}
                        <p className="text-xs text-gray-600">Qty: {safeQuantity}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold text-sm">₹{Number(unitPrice || 0).toFixed(2)}</p>
                    </div>
                </div>

                {/* Offer Banner */}
                {offerDetails?.offerApplied && (
                    <div
                        key={offerAnimKey}
                        className="offer-banner-wrapper"
                        style={{
                            borderRadius: '12px',
                            overflow: 'hidden',
                            marginTop: '8px',
                            marginBottom: '8px',
                            border: '1.5px solid #d97706',
                            position: 'relative',
                        }}
                    >
                        <div className="offer-shimmer-bg offer-reveal" style={{ padding: '12px 16px' }}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                    }}
                                >
                                    <span className="offer-fire-pop" style={{ fontSize: '20px' }}>🔥</span>
                                    <div>
                                        <p
                                            style={{
                                                fontWeight: 700,
                                                fontSize: '14px',
                                                color: '#92400e',
                                                margin: 0,
                                            }}
                                        >
                                            {offerDetails.offerName}
                                        </p>
                                        <p
                                            style={{
                                                fontSize: '12px',
                                                color: '#b45309',
                                                margin: 0,
                                            }}
                                        >
                                            {offerDetails.freeUnits} item
                                            {offerDetails.freeUnits > 1 ? 's' : ''} FREE with your order!
                                        </p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p
                                        style={{
                                            fontSize: '11px',
                                            color: '#92400e',
                                            margin: 0,
                                        }}
                                    >
                                        Offer Saving
                                    </p>
                                    <p
                                        className="offer-savings-pop"
                                        style={{
                                            fontSize: '18px',
                                            fontWeight: 800,
                                            color: '#b45309',
                                            margin: 0,
                                        }}
                                    >
                                        -₹{Number(offerDetails.savedAmount).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                            <div
                                style={{
                                    marginTop: '8px',
                                    height: '3px',
                                    background: 'rgba(217,119,6,0.2)',
                                    borderRadius: '99px',
                                    overflow: 'hidden',
                                }}
                            >
                                <div className="offer-progress-fill" style={{ height: '100%' }} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Offer nudge — shown when offer exists but quantity is not enough */}
                {offerDetails &&
                    !offerDetails.offerApplied &&
                    offerDetails.offerStatus === 'missing' && (
                        <p
                            style={{
                                fontSize: '12px',
                                color: '#d97706',
                                marginTop: '4px',
                            }}
                        >
                            💡 Add {offerDetails.requiredQty - safeQuantity} more to unlock "
                            {offerDetails.offerName}"
                        </p>
                    )}

                {productType === 'make_combo' && Array.isArray(selectedItems) && selectedItems.length > 0 && (
                    <div className="mt-2 border-t pt-2">
                        <p className="text-xs font-semibold mb-1">Selected Combo Items</p>
                        <ul className="space-y-1 max-h-24 overflow-y-auto text-xs text-gray-700">
                            {selectedItems.map((item, idx) => (
                                <li key={`${item.productID}-${item.variationID || 'base'}-${idx}`}>
                                    {item.productName || item.productID}{' '}
                                    {item.variationName ? `(${item.variationName})` : ''}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {productType === 'customproduct' &&
                    Array.isArray(product?.custom_inputs) &&
                    product.custom_inputs.length > 0 && (
                        <div className="mt-2 border-t pt-2">
                            <p className="text-xs font-semibold mb-1">Customizations</p>
                            <ul className="space-y-1 max-h-24 overflow-y-auto text-xs text-gray-700">
                                {product.custom_inputs.map((input) => (
                                    <li key={input.id}>
                                        <span className="font-medium">{input.label}:</span>{' '}
                                        {customInputs[input.id] || 'Not provided'}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                <div className="mt-3 text-sm space-y-1">
                    <div
                        style={{
                            borderTop: '1px solid #e5e7eb',
                            paddingTop: '12px',
                            marginTop: '8px',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '14px',
                                color: '#6b7280',
                                marginBottom: '4px',
                            }}
                        >
                            <span>Subtotal</span>
                            <span>₹{Number(subtotal).toFixed(2)}</span>
                        </div>
                        {offerDetails?.offerApplied && (
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '14px',
                                    color: '#b45309',
                                    marginBottom: '4px',
                                }}
                            >
                                <span>🔥 Offer Discount</span>
                                <span>
                                    -₹{Number(offerDetails.savedAmount || 0).toFixed(2)}
                                </span>
                            </div>
                        )}
                        {couponApplied && Number(couponDiscount) > 0 && (
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '14px',
                                    color: '#16a34a',
                                    marginBottom: '4px',
                                }}
                            >
                                <span>
                                    🏷️ Coupon ({couponCode.toUpperCase()})
                                </span>
                                <span>
                                    -₹{Number(couponDiscount || 0).toFixed(2)}
                                </span>
                            </div>
                        )}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '14px',
                                color: '#6b7280',
                                marginBottom: '4px',
                            }}
                        >
                            <span>Shipping Fee</span>
                            <span style={{ color: serverShippingFee === 0 ? '#16a34a' : 'inherit', fontWeight: serverShippingFee === 0 ? '700' : '400' }}>
                                {checkingOffer || serverShippingFee === null ? (
                                    <span className="animate-pulse bg-gray-200 h-4 w-12 rounded inline-block" />
                                ) : (
                                    serverShippingFee === 0 ? 'FREE' : `₹${serverShippingFee.toFixed(2)}`
                                )}
                            </span>
                        </div>
                        {handlingFee > 0 && (
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '14px',
                                    color: '#6b7280',
                                    marginBottom: '4px',
                                }}
                            >
                                <span>COD Handling Fee</span>
                                <span>₹{handlingFee.toFixed(2)}</span>
                            </div>
                        )}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '16px',
                                fontWeight: 700,
                                borderTop: '1px solid #e5e7eb',
                                paddingTop: '8px',
                                marginTop: '4px',
                            }}
                        >
                            <span>Total <span style={{ fontSize: '10px', fontWeight: 400, color: '#6b7280' }}>(incl. taxes)</span></span>
                            <span>
                                {totalAfterCoupon === null ? (
                                    <span className="animate-pulse bg-gray-200 h-5 w-16 rounded inline-block" />
                                ) : (
                                    `₹${totalAfterCoupon.toFixed(2)}`
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderDetailsStep = () => {
        if (!isLoggedIn && guestStep === 'otp') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Verify your number</h2>
                        <p className="text-sm text-gray-600">
                            Enter the OTP sent to <span className="font-semibold">{guestPhoneForOtp}</span>
                        </p>
                        <EnterOtp length={6} onChange={(val) => { setOtp(val); setOtpError(''); }} />
                        {otpError && <p className="text-xs text-red-600">{otpError}</p>}
                        <div className="flex flex-col gap-2">
                            <button
                                type="button"
                                onClick={handleVerifyOtp}
                                disabled={verifyOtpLoading || (otp || '').replace(/\D/g, '').length < 6}
                                className="w-full py-2.5 rounded-md bg-black text-white text-sm font-medium hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {verifyOtpLoading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={otpCooldown > 0 || sendOtpLoading}
                                className="w-full py-2 rounded-md border border-gray-300 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {otpCooldown > 0 ? `Resend OTP in ${otpCooldown}s` : 'Resend OTP'}
                            </button>
                            <button
                                type="button"
                                onClick={handleChangeNumber}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Change number
                            </button>
                        </div>
                    </div>
                    <div className="space-y-4">{renderOrderSummary()}</div>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    {!isLoggedIn && (
                        <>
                            <h2 className="text-lg font-semibold">Contact</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-gray-700">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={handleChange('name')}
                                        className={`mt-1 w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black ${formErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                                        required
                                    />
                                    {formErrors.name && <p className="text-[10px] text-red-500 mt-1">{formErrors.name}</p>}
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-700">Phone</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleChange('phone')}
                                        className={`mt-1 w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black ${formErrors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                                        required
                                    />
                                    {formErrors.phone && <p className="text-[10px] text-red-500 mt-1">{formErrors.phone}</p>}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-xs font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange('email')}
                                        className={`mt-1 w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black ${formErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                                        required
                                    />
                                    {formErrors.email && <p className="text-[10px] text-red-500 mt-1">{formErrors.email}</p>}
                                </div>
                            </div>
                        </>
                    )}

                    {(isLoggedIn || !isLoggedIn) && (
                        <>
                            <h2 className="text-lg font-semibold mt-4">Delivery Address</h2>
                            {isLoggedIn && addresses.length > 0 && (
                                <div className="space-y-2 mb-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium">Saved Addresses</p>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (!useNewAddress) {
                                                    setFormData(emptyForm);
                                                }
                                                setUseNewAddress(!useNewAddress);
                                            }}
                                            className="text-xs text-blue-600 hover:underline"
                                        >
                                            {useNewAddress ? 'Use saved address' : 'Use a new address'}
                                        </button>
                                    </div>
                                    {!useNewAddress && (
                                        <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                                            {addresses.map((addr) => (
                                                <label
                                                    key={addr.addressID}
                                                    className={`flex items-start gap-2 p-2 border rounded-md cursor-pointer text-sm ${selectedAddressID === addr.addressID
                                                        ? 'border-black bg-gray-50'
                                                        : 'border-gray-200 hover:border-gray-400'
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        className="mt-1"
                                                        checked={selectedAddressID === addr.addressID}
                                                        onChange={() => setSelectedAddressID(addr.addressID)}
                                                    />
                                                    <div>
                                                        <p className="font-medium">
                                                            {addr.name || addr.fullName || 'Recipient'}
                                                        </p>
                                                        <p className="text-xs text-gray-700">
                                                            {addr.line1}, {addr.line2 && `${addr.line2}, `}
                                                            {addr.city}, {addr.state} - {addr.pincode}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {addr.phoneNumber || addr.phone}
                                                        </p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {(!isLoggedIn || useNewAddress || addresses.length === 0) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {isLoggedIn && (
                                        <>
                                            <div>
                                                <label className="text-xs font-medium text-gray-700">
                                                    Phone Number <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={handleChange('phone')}
                                                    className={`mt-1 w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black ${formErrors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                                                    placeholder="10-digit mobile number"
                                                    required
                                                />
                                                {formErrors.phone && <p className="text-[10px] text-red-500 mt-1">{formErrors.phone}</p>}
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-700">
                                                    Email Address <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={handleChange('email')}
                                                    className={`mt-1 w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black ${formErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                                                    placeholder="your@email.com"
                                                    required
                                                />
                                                {formErrors.email && <p className="text-[10px] text-red-500 mt-1">{formErrors.email}</p>}
                                            </div>
                                        </>
                                    )}
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-medium text-gray-700">
                                            Address Line 1
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.line1}
                                            onChange={handleChange('line1')}
                                            className={`mt-1 w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black ${formErrors.line1 ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                                            required
                                        />
                                        {formErrors.line1 && <p className="text-[10px] text-red-500 mt-1">{formErrors.line1}</p>}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-medium text-gray-700">
                                            Address Line 2 (optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.line2}
                                            onChange={handleChange('line2')}
                                            className="mt-1 w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black border-gray-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-700">City</label>
                                        <input
                                            type="text"
                                            value={formData.city}
                                            onChange={handleChange('city')}
                                            className={`mt-1 w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black ${formErrors.city ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                                            required
                                        />
                                        {formErrors.city && <p className="text-[10px] text-red-500 mt-1">{formErrors.city}</p>}
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-700">State</label>
                                        <select
                                            value={formData.state}
                                            onChange={handleChange('state')}
                                            className={`mt-1 w-full px-3 py-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black ${formErrors.state ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                                            required
                                        >
                                            <option value="">Select state</option>
                                            {INDIAN_STATES.map((s) => (
                                                <option key={s} value={s}>
                                                    {s}
                                                </option>
                                            ))}
                                        </select>
                                        {formErrors.state && <p className="text-[10px] text-red-500 mt-1">{formErrors.state}</p>}
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-700">Pincode</label>
                                        <input
                                            type="text"
                                            value={formData.pincode}
                                            onChange={handleChange('pincode')}
                                            className={`mt-1 w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black ${formErrors.pincode ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                                            required
                                        />
                                        {formErrors.pincode && <p className="text-[10px] text-red-500 mt-1">{formErrors.pincode}</p>}
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-700">
                                            Landmark (optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.landmark}
                                            onChange={handleChange('landmark')}
                                            className="mt-1 w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black border-gray-200"
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="space-y-4">
                    {renderOrderSummary()}

                    {/* Coupon / Offer Savings Section */}
                    {(() => {
                        const isOfferLocked = offerDetails?.offerApplied === true;
                        return isOfferLocked ? (
                            /* When offer is active — hide input, show savings celebration */
                            <div
                                className="offer-savings-celebration"
                                key={`celebration-${offerAnimKey}`}
                            >
                                <div className="osc-inner">
                                    <div className="osc-top-row">
                                        <div className="osc-badge-wrap">
                                            <span className="osc-badge-emoji">🎉</span>
                                        </div>
                                        <div className="osc-title-block">
                                            <p className="osc-you-saved-label">You&apos;re saving</p>
                                            <p className="osc-amount">
                                                ₹{Number(offerDetails?.savedAmount || 0).toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="osc-tag-block">
                                            <span className="osc-fire">🔥</span>
                                            <span className="osc-offer-name">
                                                {offerDetails?.offerName || 'Active Offer'}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="osc-sub">
                                        Coupon not needed — your offer beats it!
                                    </p>
                                </div>
                                <div className="osc-bar-track">
                                    <div className="osc-bar-fill" />
                                </div>
                            </div>
                        ) : (
                            /* Normal coupon input when no offer */
                            <div className="border rounded-lg p-4">
                                <h3 className="font-semibold mb-2 text-sm">Coupon</h3>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(e) => {
                                            setCouponCode(e.target.value);
                                            setCouponApplied(false);
                                            setCouponDiscount(0);
                                            setCouponError('');
                                            setCouponSuccess('');
                                        }}
                                        className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                        placeholder="Enter coupon code"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleApplyCoupon}
                                        className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-100"
                                        disabled={applyingCoupon || !couponCode.trim()}
                                    >
                                        {applyingCoupon ? 'Applying...' : 'Apply'}
                                    </button>
                                </div>
                                {couponError && !couponApplied && (
                                    <p className="mt-1 text-xs text-red-600">{couponError}</p>
                                )}
                                {couponApplied && (
                                    <div className="coupon-success-banner" key={couponAnimKey}>
                                        <div className="coupon-shimmer-bg" style={{ position: 'relative' }}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="coupon-tag-icon">🏷️</span>
                                                    <div>
                                                        <p className="coupon-title">Coupon Applied!</p>
                                                        <p className="coupon-code-label">
                                                            {couponCode.toUpperCase()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="coupon-savings">
                                                    <p className="savings-label">You Save</p>
                                                    <p className="savings-amount">
                                                        -₹{couponDiscount.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="coupon-scan-line" aria-hidden="true" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                    {/* Payment Mode */}
                    <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-2 text-sm">Payment Mode</h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <button
                                type="button"
                                onClick={() => setPaymentMode('COD')}
                                className={`border rounded-md p-3 text-left ${paymentMode === 'COD'
                                    ? 'border-black bg-gray-50'
                                    : 'border-gray-200 hover:border-gray-400'
                                    }`}
                            >
                                <p className="font-medium">Cash on Delivery</p>
                                <p className="text-xs text-gray-600">
                                    Pay with cash or UPI when the order is delivered.
                                </p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMode('PREPAID')}
                                className={`border rounded-md p-3 text-left ${paymentMode === 'PREPAID'
                                    ? 'border-black bg-gray-50'
                                    : 'border-gray-200 hover:border-gray-400'
                                    }`}
                            >
                                <p className="font-medium">Online Payment</p>
                                <p className="text-xs text-gray-600">
                                    Pay securely via PhonePe (cards, UPI, wallets).
                                </p>
                            </button>
                        </div>
                    </div>

                    {error && <p className="text-xs text-red-600">{error}</p>}

                    <button
                        type="button"
                        onClick={handleConfirmOrder}
                        disabled={loading || sendOtpLoading}
                        className="w-full py-2.5 rounded-md bg-black text-white text-sm font-medium hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Placing your order...' : sendOtpLoading ? 'Sending OTP...' : 'Confirm Order'}
                    </button>
                </div>
            </div>
        );
    };

    const renderProcessingStep = () => (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <style>{`
                @keyframes pulse-ring {
                    0% { transform: scale(0.6); opacity: 1; }
                    100% { transform: scale(1.4); opacity: 0; }
                }
                @keyframes float-y {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                .pulse-circle {
                    position: absolute; width: 100px; height: 100px;
                    border: 2px solid #ffd232; border-radius: 50%;
                    animation: pulse-ring 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
                }
                .loader-container {
                    animation: float-y 3s ease-in-out infinite;
                }
                .spinner-inner {
                    border-top: 4px solid #ffd232;
                    border-right: 4px solid transparent;
                    border-bottom: 4px solid transparent;
                    border-left: 4px solid transparent;
                    border-radius: 50%;
                }
            `}</style>

            <div className="relative flex items-center justify-center mb-10 loader-container">
                <div className="pulse-circle" />
                <div className="pulse-circle" style={{ animationDelay: '0.6s' }} />
                <div className="pulse-circle" style={{ animationDelay: '1.2s' }} />
                
                <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center shadow-2xl z-10">
                    <div className="w-16 h-16 spinner-inner animate-spin" />
                    <div className="absolute font-black text-[#ffd232] text-xs uppercase tracking-widest animate-pulse">
                        wait
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center justify-center gap-2">
                    SECURELY PLACING ORDER
                </h2>
                <div className="flex items-center justify-center gap-1">
                    {[0, 1, 2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 bg-[#ffd232] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                </div>
                <p className="text-gray-500 font-medium text-sm px-6">
                    Sit tight while we finalize your payment and confirm your purchase at <span className="text-black font-bold">Ithyaraa</span>.
                </p>
            </div>
            
            <div className="mt-8 flex flex-col items-center gap-2 opacity-60">
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-gray-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    Bank Grade Security
                </div>
            </div>
        </div>
    );

    const renderSuccessStep = () => (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <style>{`
                @keyframes successPop {
                    0% { transform: scale(0.5); opacity: 0; }
                    60% { transform: scale(1.1); }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes successRing {
                    0% { transform: scale(0.5); opacity: 0; border-width: 10px; }
                    50% { opacity: 0.5; }
                    100% { transform: scale(1.2); opacity: 0; border-width: 0; }
                }
                @keyframes checkDraw {
                    from { stroke-dashoffset: 50; }
                    to { stroke-dashoffset: 0; }
                }
                .success-check-icon { animation: successPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
                .success-ring { 
                    position: absolute; width: 100px; height: 100px; 
                    border: 4px solid #ffd232; border-radius: 50%; opacity: 0;
                    animation: successRing 1.5s ease-out infinite; 
                }
                .redirect-bar { height: 3px; width: 0; background: #ffd232; animation: redirectProgress 3s linear forwards; }
                @keyframes redirectProgress { from { width: 0; } to { width: 100%; } }
            `}</style>

            <div className="relative flex items-center justify-center mb-8">
                <div className="success-ring" />
                <div className="success-ring" style={{ animationDelay: '0.5s' }} />
                <div className="w-24 h-24 bg-[#ffd232]/10 rounded-full flex items-center justify-center success-check-icon border-2 border-[#ffd232]/20">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffd232" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" style={{ strokeDasharray: 50, strokeDashoffset: 50, animation: 'checkDraw 0.8s ease forwards 0.3s' }} />
                    </svg>
                </div>
            </div>

            <div className="space-y-2 mb-10">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">ORDER PLACED!</h2>
                <p className="text-gray-500 font-medium text-sm">Thank you for choosing Ithyaraa</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 w-full max-w-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#ffd232] rounded-full animate-pulse" />
                        <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Processing Summary</span>
                    </div>
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">NEW ORDER</span>
                </div>
                <p className="text-xs text-gray-500 text-left leading-relaxed mb-4">
                    We're preparing your order details. You'll receive a confirmation email and SMS shortly.
                </p>
                <div className="w-full bg-gray-200 rounded-full h-[3px] overflow-hidden">
                    <div className="redirect-bar" />
                </div>
                <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">
                    Redirecting to Dashboard in 3s...
                </p>
            </div>
        </div>
    );

    return (
        <div className="bm-container bg-white w-full h-full max-w-full">
            <style>{`
                .offer-banner-wrapper { animation: offerSlice 0.4s ease both; clip-path: inset(0 100% 0 0 round 12px); }
                @keyframes offerSlice { 100% { clip-path: inset(0 0% 0 0 round 12px); } }
                .offer-shimmer-bg { background: linear-gradient(120deg, #fffbeb, #fef3c7, #fde68a, #fef3c7, #fffbeb); background-size: 300% 100%; animation: offerShimmer 2s ease infinite; }
                @keyframes offerShimmer { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
                .coupon-success-banner { border-radius: 12px; overflow: hidden; border: 1.5px solid #16a34a; }
                .coupon-shimmer-bg { background: linear-gradient(120deg, #f0fdf4, #dcfce7, #bbf7d0, #dcfce7, #f0fdf4); background-size: 300% 100%; animation: couponShimmer 2.5s ease infinite; }
                @keyframes couponShimmer { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
                .offer-savings-celebration { border-radius: 16px; overflow: hidden; border: 2px solid #f59e0b; box-shadow: 0 4px 24px rgba(245, 158, 11, 0.18); }
                .osc-inner { background: linear-gradient(135deg, #fffbeb, #fde68a, #fffbeb); background-size: 300% 300%; animation: oscBgMove 4s ease infinite; padding: 16px; }
                @keyframes oscBgMove { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
                .osc-top-row { display: flex; align-items: center; gap: 12px; }
                .osc-amount { font-size: 24px; font-weight: 800; color: #92400e; }
                .osc-bar-track { height: 4px; background: rgba(245,158,11,0.15); }
                .osc-bar-fill { height: 100%; width: 45%; background: linear-gradient(90deg, transparent, #f59e0b, transparent); animation: oscBarSweep 1.8s ease infinite; }
                @keyframes oscBarSweep { 0% { transform: translateX(-120%); } 100% { transform: translateX(320%); } }
                @keyframes shimmer { 100% { transform: translateX(100%); } }
                .animate-shimmer { animation: shimmer 2.5s infinite; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f9fafb; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
            `}</style>

            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                    <img src={logo.src || logo} alt="Ithyaraa" className="h-5 w-auto" />
                    <div className="h-4 w-[1px] bg-gray-200" />
                    <h1 className="text-sm font-black tracking-tight text-gray-900 uppercase">Checkout</h1>
                </div>
                {closeAllowed && (
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-black">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                )}
            </div>

            <div className="p-5 overflow-x-hidden">
                {step === 'details' && renderDetailsStep()}
                {step === 'processing' && renderProcessingStep()}
                {step === 'success' && renderSuccessStep()}
            </div>
        </div>
    );
};

export default BuyNowModal;

/* Inline styles for premium coupon banner */
if (typeof window !== 'undefined') {
    const styleId = 'buy-now-modal-coupon-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
        .coupon-success-banner {
            border-radius: 12px;
            overflow: hidden;
            margin-top: 8px;
            border: 1.5px solid #16a34a;
            position: relative;
            animation: couponSlice 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            clip-path: inset(0 100% 0 0);
        }
        .coupon-shimmer-bg {
            position: relative;
            background: linear-gradient(120deg, #f0fdf4, #dcfce7, #bbf7d0, #dcfce7, #f0fdf4);
            background-size: 300% 100%;
            animation: couponShimmer 2.5s ease infinite;
            padding: 12px 16px;
        }
        @keyframes couponShimmer {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        @keyframes couponSlice {
            0%   { clip-path: inset(0 100% 0 0 round 12px); }
            100% { clip-path: inset(0 0%   0 0 round 12px); }
        }
        .coupon-title { font-weight: 700; font-size: 14px; color: #15803d; }
        .coupon-code-label { font-size: 12px; color: #16a34a; font-family: monospace; letter-spacing: 1px; }
        .coupon-savings { text-align: right; }
        .savings-label { font-size: 11px; color: #15803d; }
        .savings-amount {
            font-size: 18px;
            font-weight: 800;
            color: #15803d;
            animation: savingsPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s both;
        }
        @keyframes savingsPop {
            0%   { transform: scale(0.7); opacity: 0; }
            100% { transform: scale(1);   opacity: 1; }
        }

        .coupon-scan-line {
            position: absolute;
            top: 0;
            left: -10%;
            width: 6px;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
            animation: scanSweep 0.5s ease 0.45s forwards;
            opacity: 0;
            pointer-events: none;
        }
        @keyframes scanSweep {
            0%   { left: -10%; opacity: 1; }
            100% { left: 110%; opacity: 0; }
        }

        .offer-banner-wrapper {
            animation: offerSlice 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            clip-path: inset(0 100% 0 0 round 12px);
        }
        @keyframes offerSlice {
            0%   { clip-path: inset(0 100% 0 0 round 12px); }
            60%  { clip-path: inset(0 0%   0 0 round 12px); }
            75%  { clip-path: inset(0 -2%  0 0 round 12px); }
            100% { clip-path: inset(0 0%   0 0 round 12px); }
        }

        .offer-shimmer-bg {
            background: linear-gradient(120deg, #fffbeb, #fef3c7, #fde68a, #fef3c7, #fffbeb);
            background-size: 300% 100%;
            animation: offerShimmer 2s ease infinite;
        }
        @keyframes offerShimmer {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .offer-progress-fill {
            background: linear-gradient(90deg, #f59e0b, #d97706, #f59e0b);
            background-size: 200% 100%;
            animation: progressSweep 1.5s ease infinite;
        }
        @keyframes progressSweep {
            0% { background-position: 0% 50%; }
            100% { background-position: 200% 50%; }
        }

        .offer-fire-pop {
            display: inline-block;
            animation: firePop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.35s both;
        }
        @keyframes firePop {
            0%   { transform: scale(0) rotate(-20deg); opacity: 0; }
            100% { transform: scale(1) rotate(0deg);   opacity: 1; }
        }
        .offer-savings-pop {
            animation: savingsPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0.45s both;
        }

        /* Offer Savings Celebration Block */
        .offer-savings-celebration {
            border-radius: 16px;
            overflow: hidden;
            border: 2px solid #f59e0b;
            animation: celebrationSlice 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            clip-path: inset(0 100% 0 0 round 16px);
            box-shadow: 0 4px 24px rgba(245, 158, 11, 0.18);
        }
        @keyframes celebrationSlice {
            0%   { clip-path: inset(0 100%  0 0 round 16px); }
            60%  { clip-path: inset(0 0%    0 0 round 16px); }
            75%  { clip-path: inset(0 -2%   0 0 round 16px); }
            100% { clip-path: inset(0 0%    0 0 round 16px); }
        }
        .osc-inner {
            background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 30%, #fde68a 60%, #fef3c7 80%, #fffbeb 100%);
            background-size: 300% 300%;
            animation: oscBgMove 4s ease infinite;
            padding: 16px 18px 12px 18px;
            position: relative;
        }
        @keyframes oscBgMove {
            0%   { background-position: 0%   50%; }
            50%  { background-position: 100% 50%; }
            100% { background-position: 0%   50%; }
        }
        .osc-top-row {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;
        }
        .osc-badge-wrap {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            background: rgba(245,158,11,0.18);
            border: 2px solid rgba(245,158,11,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            animation: badgePulse 2s ease-in-out 0.5s infinite;
        }
        @keyframes badgePulse {
            0%,100% { transform: scale(1);    box-shadow: 0 0 0 0   rgba(245,158,11,0.3); }
            50%     { transform: scale(1.08); box-shadow: 0 0 0 8px rgba(245,158,11,0);   }
        }
        .osc-badge-emoji {
            font-size: 20px;
            animation: emojiSpin 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.3s both;
            display: inline-block;
        }
        @keyframes emojiSpin {
            0%   { transform: rotate(-30deg) scale(0.5); opacity: 0; }
            100% { transform: rotate(0deg)   scale(1);   opacity: 1; }
        }
        .osc-title-block {
            display: flex;
            flex-direction: column;
            gap: 0px;
            flex: 1;
        }
        .osc-you-saved-label {
            font-size: 11px;
            font-weight: 600;
            color: #b45309;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin: 0;
            animation: oscFadeUp 0.4s ease 0.3s both;
        }
        .osc-amount {
            font-size: 28px;
            font-weight: 900;
            color: #92400e;
            margin: 0;
            line-height: 1.1;
            letter-spacing: -0.5px;
            background: linear-gradient(135deg, #d97706, #92400e, #b45309);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: amountPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.35s both;
        }
        @keyframes amountPop {
            0%   { transform: scale(0.6); opacity: 0; }
            100% { transform: scale(1);   opacity: 1; }
        }
        .osc-tag-block {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 3px;
            flex-shrink: 0;
            animation: oscFadeUp 0.4s ease 0.45s both;
        }
        .osc-fire {
            font-size: 20px;
            animation: fireShake 1.5s ease-in-out 0.8s infinite;
            display: inline-block;
        }
        @keyframes fireShake {
            0%,100% { transform: rotate(0deg)   scale(1);    }
            25%     { transform: rotate(-8deg)  scale(1.1);  }
            75%     { transform: rotate(8deg)   scale(1.1);  }
        }
        .osc-offer-name {
            font-size: 12px;
            font-weight: 800;
            color: #78350f;
            background: rgba(217,119,6,0.15);
            border: 1px solid rgba(217,119,6,0.3);
            border-radius: 8px;
            padding: 3px 10px;
            font-style: italic;
            letter-spacing: 0.3px;
            text-align: right;
            max-width: 120px;
            line-height: 1.3;
        }
        .osc-sub {
            font-size: 11px;
            color: #b45309;
            font-weight: 500;
            margin: 0;
            font-style: italic;
            opacity: 0.85;
            animation: oscFadeUp 0.4s ease 0.55s both;
        }
        @keyframes oscFadeUp {
            0%   { opacity: 0; transform: translateY(6px); }
            100% { opacity: 1; transform: translateY(0);   }
        }
        .osc-bar-track {
            height: 4px;
            background: rgba(245,158,11,0.15);
            overflow: hidden;
        }
        .osc-bar-fill {
            height: 100%;
            width: 45%;
            background: linear-gradient(90deg, transparent, #f59e0b, #fbbf24, #f59e0b, transparent);
            animation: oscBarSweep 1.8s ease-in-out infinite;
        }
        @keyframes oscBarSweep {
            0%   { transform: translateX(-120%); }
            100% { transform: translateX(320%);  }
        }
        `;
        document.head.appendChild(style);
    }
}