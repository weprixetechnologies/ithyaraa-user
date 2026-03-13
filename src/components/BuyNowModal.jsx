import React, { useEffect, useMemo, useState, useCallback } from 'react';
import axiosInstance from '../lib/axiosInstance';
import { getCookie, setCookieEasy } from '../lib/setCookie';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

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

    const [offerDetails, setOfferDetails] = useState(null);
    const [checkingOffer, setCheckingOffer] = useState(false);
    const [couponAnimKey, setCouponAnimKey] = useState(0);
    const [offerAnimKey, setOfferAnimKey] = useState(0);

    const safeQuantity = Math.max(1, Number(initialQuantity) || 1);

    const unitPrice = useMemo(() => {
        if (!product) return 0;
        if (productType === 'variable' && selectedVariation) {
            return selectedVariation.variationSalePrice ?? selectedVariation.variationPrice ?? 0;
        }
        if (productType === 'presale' && product.salePrice != null) {
            return product.salePrice ?? product.regularPrice ?? 0;
        }
        return product.salePrice ?? product.regularPrice ?? 0;
    }, [product, productType, selectedVariation]);

    const subtotal = useMemo(() => {
        return Number((unitPrice * safeQuantity).toFixed(2));
    }, [unitPrice, safeQuantity]);

    const totalAfterCoupon = useMemo(() => {
        const raw = subtotal - couponDiscount;
        return raw > 0 ? Number(raw.toFixed(2)) : 0;
    }, [subtotal, couponDiscount]);

    const checkOffer = useCallback(async (pid, qty) => {
        if (!pid || !qty || qty < 1) return;
        try {
            setCheckingOffer(true);
            const res = await axiosInstance.get('/order/buy-now/check-offer', {
                params: { productID: pid, quantity: qty },
            });
            if (res.data?.success) {
                setOfferDetails(res.data);
                setOfferAnimKey(prev => prev + 1);
            } else {
                setOfferDetails(null);
            }
        } catch {
            setOfferDetails(null);
        } finally {
            setCheckingOffer(false);
        }
    }, []);

    useEffect(() => {
        if (!isOpen) return;

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
        }
    }, [isOpen]);

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
            setCouponDiscount(discount);
            setCouponApplied(true);
            setCouponAnimKey(prev => prev + 1);
            setCouponSuccess(data.message || `Coupon applied! You save ₹${discount.toFixed(2)}`);
            toast.success(data.message || `Coupon applied. You saved ₹${discount.toFixed(2)}`);
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

    const handleConfirmOrder = async () => {
        const fieldErrors = validateFields();
        if (Object.keys(fieldErrors).length > 0) {
            setError('Please fix highlighted fields');
            toast.error('Please correct the errors before continuing.');
            return;
        }

        setLoading(true);
        setError('');
        setStep('processing');

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
            };

            const res = await axiosInstance.post('/order/buy-now', body);
            const data = res.data || {};

            if (!data.success) {
                throw new Error(data.message || 'Failed to place order');
            }

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
            setError(err.response?.data?.message || err.message || 'Failed to place order');
            setStep('details');
        } finally {
            setLoading(false);
        }
    };

    const renderOrderSummary = () => {
        return (
            <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold mb-2">Order Summary</h3>
                <div className="flex items-center gap-3 mb-2">
                    <img
                        src={product?.featuredImage?.[0]?.imgUrl || product?.featuredImage?.[0] || '/placeholder.jpg'}
                        alt={product?.name}
                        className="w-16 h-16 rounded object-cover"
                    />
                    <div className="flex-1">
                        <p className="font-medium text-sm">{product?.name}</p>
                        {selectedVariation?.variationName && (
                            <p className="text-xs text-gray-600">{selectedVariation.variationName}</p>
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
                                fontSize: '16px',
                                fontWeight: 700,
                                borderTop: '1px solid #e5e7eb',
                                paddingTop: '8px',
                                marginTop: '4px',
                            }}
                        >
                            <span>Total</span>
                            <span>
                                ₹
                                {Math.max(
                                    0,
                                    Number(subtotal) -
                                    (offerDetails?.offerApplied
                                        ? Number(offerDetails.savedAmount || 0)
                                        : 0) -
                                    (couponApplied ? Number(couponDiscount || 0) : 0)
                                ).toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderDetailsStep = () => {
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
                                        className="mt-1 w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-700">Phone</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleChange('phone')}
                                        className="mt-1 w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-xs font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange('email')}
                                        className="mt-1 w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                        required
                                    />
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
                                                    const currentAddr = addresses.find(a => a.addressID === selectedAddressID);
                                                    if (currentAddr) {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            phone: currentAddr.phoneNumber || currentAddr.phonenumber || currentAddr.phone || prev.phone || '',
                                                            email: currentAddr.emailID || currentAddr.email || prev.email || '',
                                                            line1: currentAddr.line1 || '',
                                                            line2: currentAddr.line2 || '',
                                                            city: currentAddr.city || '',
                                                            state: currentAddr.state || '',
                                                            pincode: currentAddr.pincode || '',
                                                            landmark: currentAddr.landmark || '',
                                                        }));
                                                    }
                                                }
                                                setUseNewAddress(prev => !prev);
                                            }}
                                            className="text-xs text-blue-600 hover:underline"
                                        >
                                            {useNewAddress ? 'Use saved address' : 'Use a new address'}
                                        </button>
                                    </div>
                                    {!useNewAddress && (
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
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
                                                    className="mt-1 w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                                    placeholder="10-digit mobile number"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-700">
                                                    Email Address <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={handleChange('email')}
                                                    className="mt-1 w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                                    placeholder="your@email.com"
                                                    required
                                                />
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
                                            className="mt-1 w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-medium text-gray-700">
                                            Address Line 2 (optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.line2}
                                            onChange={handleChange('line2')}
                                            className="mt-1 w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-700">City</label>
                                        <input
                                            type="text"
                                            value={formData.city}
                                            onChange={handleChange('city')}
                                            className="mt-1 w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-700">State</label>
                                        <select
                                            value={formData.state}
                                            onChange={handleChange('state')}
                                            className="mt-1 w-full px-3 py-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                                            required
                                        >
                                            <option value="">Select state</option>
                                            {INDIAN_STATES.map((s) => (
                                                <option key={s} value={s}>
                                                    {s}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-700">Pincode</label>
                                        <input
                                            type="text"
                                            value={formData.pincode}
                                            onChange={handleChange('pincode')}
                                            className="mt-1 w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-700">
                                            Landmark (optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.landmark}
                                            onChange={handleChange('landmark')}
                                            className="mt-1 w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
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
                        disabled={loading}
                        className="w-full py-2.5 rounded-md bg-black text-white text-sm font-medium hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Placing your order...' : 'Confirm Order'}
                    </button>
                </div>
            </div>
        );
    };

    const renderProcessingStep = () => (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-gray-300 border-t-black rounded-full animate-spin mb-4" />
            <p className="font-medium mb-1">Placing your order...</p>
            <p className="text-xs text-gray-600">Please wait, this will only take a moment.</p>
        </div>
    );

    const renderSuccessStep = () => (
        <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 text-2xl">✓</span>
            </div>
            <h2 className="text-lg font-semibold">Order placed successfully!</h2>
            <p className="text-xs text-gray-600 max-w-xs">
                You’ll be redirected to your order summary shortly.
            </p>
        </div>
    );

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
        >
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-5 md:p-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-base md:text-lg font-semibold">Instant Checkout</h1>
                    {closeAllowed && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-800 text-xl leading-none"
                        >
                            ×
                        </button>
                    )}
                </div>

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

