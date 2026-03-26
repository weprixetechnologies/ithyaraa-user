"use client";
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import axiosInstance from '../lib/axiosInstance';
import { getCookie, setCookieEasy } from '../lib/setCookie';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import EnterOtp from './ui/enterOtp';
import logo from '../../public/ithyaraa-logo.png';

// ─── Constants ────────────────────────────────────────────────────────────────
const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry',
    'Chandigarh', 'Andaman and Nicobar Islands',
    'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep',
];

const EMPTY_FORM = {
    name: '', email: '', phone: '',
    line1: '', line2: '', city: '', state: '', pincode: '', landmark: '',
};

const BuyNowModal = ({
    onClose,
    product,
    productType,
    selectedVariation,
    selectedItems = [],
    customInputs = {},
    initialQuantity = 1,
    selectedDressType = null, // [NEW]
}) => {
    const router = useRouter();

    const [step, setStep] = useState('details');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressID, setSelectedAddressID] = useState('');
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [useNewAddress, setUseNewAddress] = useState(false);
    const [paymentMode, setPaymentMode] = useState('COD');

    const [couponCode, setCouponCode] = useState('');
    const [couponApplied, setCouponApplied] = useState(false);
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponError, setCouponError] = useState('');
    const [applyingCoupon, setApplyingCoupon] = useState(false);
    const [couponAnimKey, setCouponAnimKey] = useState(0);

    const [offerDetails, setOfferDetails] = useState(null);
    const [offerAnimKey, setOfferAnimKey] = useState(0);
    const [globalShippingFee, setGlobalShippingFee] = useState(0);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [guestStep, setGuestStep] = useState('phone');
    const [guestPhone, setGuestPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpCooldown, setOtpCooldown] = useState(0);
    const [sendOtpLoading, setSendOtpLoading] = useState(false);
    const [verifyOtpLoading, setVerifyOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState('');

    const safeQty = Math.max(1, Number(initialQuantity) || 1);

    const unitPrice = useMemo(() => {
        if (!product) return 0;
        // [NEW] Use dress type price if provided
        if (productType === 'customproduct' && selectedDressType && selectedDressType.price) {
            return Number(selectedDressType.price);
        }
        if (productType === 'variable' && selectedVariation)
            return selectedVariation.variationSalePrice ?? selectedVariation.variationPrice ?? 0;
        return product.salePrice ?? product.regularPrice ?? 0;
    }, [product, productType, selectedVariation, selectedDressType]);

    const subtotal = useMemo(() => Number((unitPrice * safeQty).toFixed(2)), [unitPrice, safeQty]);

    const shippingFee = useMemo(() => {
        const afterCoupon = Math.max(0, subtotal - couponDiscount);
        return afterCoupon < 799 ? globalShippingFee : 0;
    }, [subtotal, couponDiscount, globalShippingFee]);

    const offerSaving = useMemo(() =>
        offerDetails?.offerApplied ? Number(offerDetails.savedAmount || 0) : 0,
        [offerDetails]);

    const handlingFee = useMemo(() => paymentMode === 'COD' ? 8 : 0, [paymentMode]);

    const grandTotal = useMemo(() =>
        Math.max(0, Number(
            (subtotal - offerSaving - (couponApplied ? couponDiscount : 0) + shippingFee + handlingFee).toFixed(2)
        )),
    [subtotal, offerSaving, couponApplied, couponDiscount, shippingFee, handlingFee]);

    const fetchSettings = useCallback(async () => {
        try {
            const res = await axiosInstance.get('/settings');
            if (res.data?.success) setGlobalShippingFee(Number(res.data.data?.shipping_fee) || 0);
        } catch { }
    }, []);

    const checkOffer = useCallback(async (pid, qty) => {
        if (!pid || qty < 1 || productType !== 'variable') {
            setOfferDetails(null);
            return;
        }
        try {
            const res = await axiosInstance.get('/order/buy-now/check-offer', {
                params: { 
                    productID: pid, 
                    quantity: qty,
                    variationID: selectedVariation?.variationID || null,
                    selectedDressType: selectedDressType,
                    productType: productType
                },
            });
            if (res.data?.success) { setOfferDetails(res.data); setOfferAnimKey(k => k + 1); }
            else setOfferDetails(null);
        } catch { setOfferDetails(null); }
    }, [selectedDressType, productType, selectedVariation]);

    useEffect(() => {
        const logged = !!getCookie('_at') || getCookie('isLoggedIn') === 'true';
        setIsLoggedIn(logged);
        fetchSettings();
        if (logged) {
            axiosInstance.get('/address/all-address')
                .then(res => {
                    const list = res.data?.addresses || res.data?.address || [];
                    setAddresses(list);
                    if (list.length > 0) { setSelectedAddressID(list[0].addressID); setUseNewAddress(false); }
                    else setUseNewAddress(true);
                })
                .catch(console.error);
        } else {
            setUseNewAddress(true);
        }
    }, [fetchSettings]);

    useEffect(() => {
        const pid = product?.productID || product?.id;
        if (pid) checkOffer(pid, safeQty);
    }, [product?.productID, product?.id, safeQty, checkOffer]);

    useEffect(() => {
        if (offerDetails?.offerApplied) {
            setCouponApplied(false); setCouponDiscount(0);
            setCouponCode(''); setCouponError('');
        }
    }, [offerDetails?.offerApplied]);

    useEffect(() => {
        if (otpCooldown <= 0) return;
        const t = setInterval(() => setOtpCooldown(c => c - 1), 1000);
        return () => clearInterval(t);
    }, [otpCooldown]);

    useEffect(() => {
        const fn = (e) => { if (e.key === 'Escape' && step !== 'processing') onClose(); };
        document.addEventListener('keydown', fn);
        return () => document.removeEventListener('keydown', fn);
    }, [step, onClose]);

    const handleChange = (field) => (e) => setFormData(p => ({ ...p, [field]: e.target.value }));

    const validateFields = () => {
        const err = {};
        const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRx = /^[0-9]{10}$/;
        const pincodeRx = /^[0-9]{6}$/;
        if (!isLoggedIn) {
            if (!formData.name.trim()) err.name = 'Required';
            if (!emailRx.test(formData.email)) err.email = 'Invalid email';
            if (!phoneRx.test(formData.phone)) err.phone = '10 digits required';
        }
        if (!isLoggedIn || useNewAddress) {
            if (!formData.line1.trim()) err.line1 = 'Required';
            if (!formData.city.trim()) err.city = 'Required';
            if (!formData.state.trim()) err.state = 'Required';
            if (!pincodeRx.test(formData.pincode)) err.pincode = '6 digits required';
        }
        if (isLoggedIn && useNewAddress) {
            if (!phoneRx.test(formData.phone)) err.phone = '10 digits required';
            if (!emailRx.test(formData.email)) err.email = 'Invalid email';
        }
        return err;
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setApplyingCoupon(true); setCouponError(''); setCouponApplied(false);
        try {
            const res = await axiosInstance.get('/order/buy-now/validate-coupon', {
                params: { code: couponCode.trim(), subtotal, email: formData.email || undefined },
            });
            const data = res.data || {};
            if (!data.success) {
                setCouponDiscount(0);
                setCouponError(data.message || 'Invalid coupon');
                toast.error(data.message || 'Invalid coupon');
                return;
            }
            const disc = Number(data.couponDiscount || 0);
            setCouponDiscount(disc); setCouponApplied(true); setCouponAnimKey(k => k + 1);
            toast.success(data.message || `Coupon applied — you saved ₹${disc.toFixed(2)}`);
        } catch (err) {
            setCouponDiscount(0);
            setCouponError(err.response?.data?.message || 'Failed to apply coupon');
            toast.error('Failed to apply coupon');
        } finally { setApplyingCoupon(false); }
    };

    const submitOrder = useCallback(async (afterOtp = false) => {
        setLoading(true); setError(''); setStep('processing');
        if (afterOtp) setGuestStep('otp');
        try {
            const hasSession = !!getCookie('_at');
            const resolvedUid = hasSession ? (getCookie('uid') || getCookie('_uid') || null) : null;

            const body = {
                productType,
                productID: product?.productID || product?.presaleProductID || product?.productId,
                quantity: safeQty,
                variationID: selectedVariation?.variationID || null,
                selectedItems: productType === 'make_combo' ? selectedItems : [],
                customInputs: productType === 'customproduct' ? customInputs : {},
                selectedDressType, // [NEW] Pass the object {label, price}
                couponCode: couponApplied ? couponCode.trim() : null,
                paymentMode,
                guestDetails: !isLoggedIn
                    ? { name: formData.name, email: formData.email, phone: formData.phone }
                    : null,
                address: (!isLoggedIn || useNewAddress)
                    ? {
                        name: formData.name, fullName: formData.name,
                        line1: formData.line1, line2: formData.line2,
                        city: formData.city, state: formData.state,
                        pincode: formData.pincode, landmark: formData.landmark,
                        phoneNumber: formData.phone, emailID: formData.email,
                    } : null,
                existingAddressID: isLoggedIn && !useNewAddress ? selectedAddressID : null,
                uid: isLoggedIn ? resolvedUid : null,
            };

            const res = await axiosInstance.post('/order/buy-now', body);
            const data = res.data || {};
            if (!data.success) throw new Error(data.message || 'Failed to place order');

            if (data.isNewUser && data.sessionToken) {
                try {
                    setCookieEasy('_at', data.sessionToken, 7);
                    document.cookie = `isLoggedIn=true;path=/;max-age=${7 * 24 * 60 * 60}`;
                } catch { }
            }

            if (paymentMode === 'PREPAID') {
                if (data.phonePeRedirectURL) { window.location.href = data.phonePeRedirectURL; }
                else { toast.error('Payment init failed'); setError('Payment init failed'); setStep('details'); }
                return;
            }

            setStep('success');
            if (data.redirectURL) {
                setTimeout(() => { router.push(data.redirectURL.replace(/\/+/g, '/')); onClose(); }, 1800);
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Failed to place order';
            setError(msg); toast.error(msg); setStep('details');
        } finally { setLoading(false); }
    }, [
        productType, product, safeQty, selectedVariation, selectedItems, customInputs,
        couponApplied, couponCode, paymentMode, isLoggedIn, formData,
        useNewAddress, selectedAddressID, onClose, router,
    ]);

    const handleConfirmOrder = async () => {
        const errs = validateFields();
        if (Object.keys(errs).length > 0) {
            setError('Please fix the highlighted fields');
            toast.error('Please correct errors before continuing');
            return;
        }
        setError(''); setOtpError('');

        if (isLoggedIn) { await submitOrder(); return; }

        const phone = formData.phone.replace(/\D/g, '').slice(-10);
        if (phone.length !== 10) { setError('Phone must be 10 digits'); return; }

        try {
            const check = await axiosInstance.get('/user/check-phone', { params: { phone } });
            if (check.data?.exists) { await submitOrder(); return; }
        } catch (err) {
            setError(err.response?.data?.message || 'Could not verify phone');
            toast.error('Could not verify phone'); return;
        }

        setSendOtpLoading(true); setOtpError('');
        try {
            const res = await axiosInstance.post('/user/send-otp', { phoneNumber: `+91${phone}` });
            const data = res.data || {};
            if (res.status !== 200 || !data.success) {
                setOtpError(data.message || 'Failed to send OTP');
                toast.error(data.message || 'Failed to send OTP'); return;
            }
            setGuestPhone(phone); setGuestStep('otp'); setOtpCooldown(60); setOtp('');
            toast.success('OTP sent to your number');
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to send OTP';
            setOtpError(msg); toast.error(msg);
        } finally { setSendOtpLoading(false); }
    };

    const handleVerifyOtp = async () => {
        const clean = otp.replace(/\D/g, '');
        if (clean.length < 6) { setOtpError('Enter the complete 6-digit OTP'); return; }
        const phone = guestPhone.replace(/\D/g, '').slice(-10);
        if (phone.length !== 10) { setOtpError('Session issue — go back and re-enter your number'); return; }
        setVerifyOtpLoading(true); setOtpError('');
        try {
            const res = await axiosInstance.post('/user/verify-otp', { phoneNumber: `+91${phone}`, otp: clean });
            const data = res.data || {};
            if (res.status !== 200 || !data.success) {
                const msg = data.message || 'OTP verification failed';
                setOtpError(/expired/i.test(msg) ? 'OTP expired — request a new one' : msg);
                toast.error(msg); return;
            }
            await submitOrder(true);
        } catch (err) {
            const msg = err.response?.data?.message || 'Could not verify OTP';
            setOtpError(msg); toast.error(msg);
        } finally { setVerifyOtpLoading(false); }
    };

    const handleResendOtp = async () => {
        if (otpCooldown > 0) return;
        const phone = guestPhone.replace(/\D/g, '').slice(-10);
        if (phone.length !== 10) { setOtpError('Use "Change number" to re-enter your phone'); return; }
        setSendOtpLoading(true); setOtpError('');
        try {
            const res = await axiosInstance.post('/user/send-otp', { phoneNumber: `+91${phone}` });
            const data = res.data || {};
            if (res.status !== 200 || !data.success) {
                setOtpError(data.message || 'Failed to send OTP');
                toast.error(data.message || 'Failed to send OTP'); return;
            }
            setOtpCooldown(60); setOtp(''); toast.success('New OTP sent');
        } catch (err) {
            setOtpError(err.response?.data?.message || 'Failed to send OTP');
        } finally { setSendOtpLoading(false); }
    };

    // ── Order Summary ─────────────────────────────────────────────────────────
    const OrderSummary = () => (
        <div className="bm-summary">
            <div className="bm-summary-header">
                <span className="bm-summary-eyebrow">Order Summary</span>
            </div>

            <div className="bm-product-row">
                <div className="bm-product-img-wrap">
                    <img
                        src={product?.featuredImage?.[0]?.imgUrl || product?.featuredImage?.[0] || logo?.src || ''}
                        alt={product?.name || 'Product'}
                        className="bm-product-img"
                        onError={e => { e.target.style.display = 'none'; }}
                    />
                </div>
                <div className="bm-product-info">
                    <p className="bm-product-name">{product?.name}</p>
                    {selectedVariation?.variationName && (
                        <p className="bm-product-meta">{selectedVariation.variationName}</p>
                    )}
                    <p className="bm-product-qty">Qty: {safeQty}</p>
                </div>
                <p className="bm-product-price">₹{Number(unitPrice).toFixed(2)}</p>
            </div>

            {offerDetails?.offerApplied && (
                <div key={`ob-${offerAnimKey}`} className="bm-offer-banner">
                    <div className="bm-offer-glow" />
                    <div className="bm-offer-inner">
                        <div className="bm-offer-left">
                            <span className="bm-offer-fire">🔥</span>
                            <div>
                                <p className="bm-offer-name">{offerDetails.offerName}</p>
                                <p className="bm-offer-sub">
                                    {offerDetails.freeUnits} item{offerDetails.freeUnits > 1 ? 's' : ''} FREE
                                </p>
                            </div>
                        </div>
                        <div className="bm-offer-right">
                            <p className="bm-saving-lbl">You save</p>
                            <p className="bm-saving-amt">-₹{Number(offerDetails.savedAmount).toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            )}

            {offerDetails && !offerDetails.offerApplied && offerDetails.offerStatus === 'missing' && (
                <p className="bm-offer-nudge">
                    💡 Add {offerDetails.requiredQty - safeQty} more to unlock &quot;{offerDetails.offerName}&quot;
                </p>
            )}

            <div className="bm-breakdown">
                <div className="bm-breakdown-row">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {offerDetails?.offerApplied && (
                    <div className="bm-breakdown-row --amber">
                        <span>🔥 Offer Discount</span>
                        <span>-₹{offerSaving.toFixed(2)}</span>
                    </div>
                )}
                {couponApplied && couponDiscount > 0 && (
                    <div className="bm-breakdown-row --green">
                        <span>🏷️ {couponCode.toUpperCase()}</span>
                        <span>-₹{couponDiscount.toFixed(2)}</span>
                    </div>
                )}
                <div className="bm-breakdown-row">
                    <span>Shipping</span>
                    <span className={shippingFee === 0 ? '--free' : ''}>
                        {shippingFee === 0 ? 'FREE' : `₹${shippingFee.toFixed(2)}`}
                    </span>
                </div>
                {handlingFee > 0 && (
                    <div className="bm-breakdown-row">
                        <span>Handling Fee (COD)</span>
                        <span>₹{handlingFee.toFixed(2)}</span>
                    </div>
                )}
                <div className="bm-breakdown-total">
                    <span>Total</span>
                    <span className="bm-total-amt">₹{grandTotal.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );

    // ── CSS ───────────────────────────────────────────────────────────────────
    const css = `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

        .bm-root {
            --ink:      #0e0c0a;
            --ink-soft: #3d3830;
            --muted:    #8c8278;
            --border:   rgba(180,165,148,0.28);
            --border-strong: rgba(140,120,100,0.45);
            --surface:  #faf7f3;
            --surface-2:#f4f0e8;
            --surface-3:#ede8de;
            --gold:     #9a7c45;
            --gold-lt:  #c9a96e;
            --gold-glow:rgba(154,124,69,0.18);
            --green:    #2a5e40;
            --green-lt: #d1f0e0;
            --red:      #8b2020;
            --amber:    #b86a00;
            --r:        14px;
            --r-sm:     8px;
            --shadow-sm: 0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
            --shadow-md: 0 4px 16px rgba(0,0,0,.08), 0 2px 6px rgba(0,0,0,.05);
            --shadow-lg: 0 12px 40px rgba(0,0,0,.13), 0 4px 12px rgba(0,0,0,.06);
            font-family: 'DM Sans', sans-serif;
            color: var(--ink);
            background: #fff;
        }

        /* ─ Layout ─────────────────────────────────────── */
        .bm-root      { display: flex; flex-direction: column; }

        .bm-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 22px 28px 18px;
            border-bottom: 1px solid var(--border);
            position: sticky; top: 0;
            background: rgba(255,255,255,0.96);
            backdrop-filter: blur(12px);
            z-index: 10;
            border-radius: 20px 20px 0 0;
            flex-shrink: 0;
        }
        .bm-header-left { display: flex; align-items: center; gap: 10px; }
        .bm-header-badge {
            display: flex; align-items: center; justify-content: center;
            width: 30px; height: 30px;
            background: linear-gradient(135deg, #0e0c0a 0%, #3d3830 100%);
            border-radius: 8px;
            font-size: 14px;
            box-shadow: var(--shadow-sm);
        }
        .bm-header-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 20px; font-weight: 600; color: var(--ink); margin: 0;
            letter-spacing: 0.01em;
        }
        .bm-close-btn {
            width: 32px; height: 32px; border-radius: 50%;
            border: 1px solid var(--border); background: var(--surface);
            font-size: 18px; line-height: 1; cursor: pointer; color: var(--muted);
            display: flex; align-items: center; justify-content: center;
            transition: all .2s ease; flex-shrink: 0;
        }
        .bm-close-btn:hover { background: var(--surface-2); color: var(--ink); border-color: var(--border-strong); transform: rotate(90deg); }

        .bm-body { padding: 24px 28px 32px; overflow-y: auto; }

        .bm-grid {
            display: grid;
            grid-template-columns: 1fr 320px;
            gap: 28px;
            align-items: stretch;
        }
        /* Left column stretches to fill grid row height */
        .bm-grid > *:first-child {
            display: flex;
            flex-direction: column;
        }
        /* Address list eats all remaining space in the left column */
        .bm-addr-list-wrap {
            display: flex;
            flex-direction: column;
            flex: 1;
            min-height: 0;
        }
        @media (max-width: 700px) {
            .bm-grid    { grid-template-columns: 1fr; gap: 20px; align-items: start; }
            .bm-grid > *:first-child { display: block; }
            .bm-body    { padding: 18px 18px 28px; }
            .bm-header  { padding: 18px 18px 14px; }
        }

        /* ─ Section labels ──────────────────────────────── */
        .bm-section-lbl {
            display: flex; align-items: center; gap: 8px;
            font-size: 9px; font-weight: 600; letter-spacing: 3px;
            text-transform: uppercase; color: var(--muted);
            margin-bottom: 14px;
        }
        .bm-section-lbl::after {
            content: ''; flex: 1; height: 1px;
            background: linear-gradient(to right, var(--border), transparent);
        }
        .bm-divider {
            border: none;
            height: 1px;
            background: linear-gradient(to right, transparent, var(--border), transparent);
            margin: 20px 0;
        }

        /* ─ Fields ──────────────────────────────────────── */
        .bm-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 0 14px; }
        .bm-field  { margin-bottom: 12px; }
        .bm-field.--full { grid-column: 1 / -1; }
        @media (max-width: 420px) { .bm-fields { grid-template-columns: 1fr; } }

        .bm-label {
            display: block; font-size: 10px; font-weight: 600;
            letter-spacing: 1.5px; text-transform: uppercase;
            color: var(--muted); margin-bottom: 6px;
        }
        .bm-label em { color: var(--red); font-style: normal; margin-left: 2px; }

        .bm-input, .bm-select {
            width: 100%; padding: 10px 13px;
            border: 1.5px solid var(--border); border-radius: var(--r-sm);
            font-size: 13.5px; color: var(--ink); background: var(--surface);
            outline: none; transition: all .2s ease;
            box-sizing: border-box; font-family: 'DM Sans', sans-serif;
        }
        .bm-input::placeholder { color: #c5bdb3; }
        .bm-input:focus, .bm-select:focus {
            border-color: var(--gold);
            background: #fff;
            box-shadow: 0 0 0 3px var(--gold-glow);
        }
        .bm-field-err {
            font-size: 11px; color: var(--red);
            margin-top: 4px; display: flex; align-items: center; gap: 4px;
        }
        .bm-field-err::before { content: '⚠'; font-size: 10px; }

        /* ─ Saved addresses ─────────────────────────────── */
        .bm-addr-toggle-row {
            display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;
        }
        .bm-addr-count { font-size: 12px; color: var(--muted); }
        .bm-addr-toggle {
            font-size: 12px; color: var(--gold); cursor: pointer;
            background: none; border: none; padding: 0;
            font-family: inherit; font-weight: 500;
            display: flex; align-items: center; gap: 4px;
            transition: color .15s;
        }
        .bm-addr-toggle:hover { color: var(--ink); }
        .bm-addr-list {
            display: flex; flex-direction: column; gap: 8px;
            flex: 1; overflow-y: auto; margin-bottom: 8px;
            scrollbar-width: thin; scrollbar-color: var(--border) transparent;
        }
        .bm-addr-card {
            display: flex; gap: 12px; padding: 12px 14px;
            border: 1.5px solid var(--border); border-radius: var(--r-sm);
            cursor: pointer; transition: all .2s ease; text-align: left;
            background: var(--surface);
        }
        .bm-addr-card:hover  { border-color: var(--gold-lt); background: #fff; }
        .bm-addr-card.--sel  { border-color: var(--gold); background: #fff; box-shadow: 0 0 0 3px var(--gold-glow); }
        .bm-addr-card input  { margin-top: 3px; flex-shrink: 0; accent-color: var(--gold); }
        .bm-addr-name { font-size: 13.5px; font-weight: 500; color: var(--ink); margin: 0 0 3px; }
        .bm-addr-meta { font-size: 11.5px; color: var(--muted); line-height: 1.6; margin: 0; }

        /* ─ Payment cards ───────────────────────────────── */
        .bm-pay-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .bm-pay-card {
            border: 1.5px solid var(--border); border-radius: var(--r-sm);
            padding: 14px 15px; cursor: pointer;
            transition: all .2s ease;
            background: var(--surface); text-align: left;
            font-family: 'DM Sans', sans-serif; position: relative; overflow: hidden;
        }
        .bm-pay-card::before {
            content: ''; position: absolute; inset: 0;
            background: linear-gradient(135deg, rgba(154,124,69,0.06) 0%, transparent 60%);
            opacity: 0; transition: opacity .2s;
        }
        .bm-pay-card:hover { border-color: var(--gold-lt); background: #fff; }
        .bm-pay-card:hover::before { opacity: 1; }
        .bm-pay-card.--sel {
            border-color: var(--gold); background: #fff;
            box-shadow: 0 0 0 3px var(--gold-glow);
        }
        .bm-pay-card.--sel::before { opacity: 1; }
        .bm-pay-icon { font-size: 20px; margin-bottom: 6px; display: block; }
        .bm-pay-title { font-size: 13px; font-weight: 600; color: var(--ink); margin: 0 0 3px; }
        .bm-pay-sub   { font-size: 11px; color: var(--muted); margin: 0; line-height: 1.5; }

        /* ─ Order summary card ──────────────────────────── */
        .bm-summary {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: var(--r);
            overflow: hidden;
        }
        .bm-summary-header {
            padding: 14px 18px 12px;
            border-bottom: 1px solid var(--border);
            background: linear-gradient(to bottom, #fff, var(--surface));
        }
        .bm-summary-eyebrow {
            font-size: 9px; font-weight: 600; letter-spacing: 3px;
            text-transform: uppercase; color: var(--muted);
        }
        .bm-product-row {
            display: flex; align-items: center; gap: 14px;
            padding: 16px 18px;
            border-bottom: 1px solid var(--border);
        }
        .bm-product-img-wrap {
            width: 62px; height: 62px; border-radius: 10px;
            overflow: hidden; flex-shrink: 0;
            border: 1px solid var(--border);
            background: var(--surface-2);
            box-shadow: var(--shadow-sm);
        }
        .bm-product-img { width: 100%; height: 100%; object-fit: cover; }
        .bm-product-info { flex: 1; min-width: 0; }
        .bm-product-name {
            font-size: 13.5px; font-weight: 500; color: var(--ink);
            margin: 0 0 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            font-family: 'Cormorant Garamond', serif; font-size: 15px;
        }
        .bm-product-meta { font-size: 11.5px; color: var(--muted); margin: 0 0 1px; }
        .bm-product-qty  {
            display: inline-flex; align-items: center;
            font-size: 11px; color: var(--muted);
            background: var(--surface-3); border-radius: 4px;
            padding: 1px 7px; margin-top: 4px;
        }
        .bm-product-price {
            font-family: 'Cormorant Garamond', serif;
            font-size: 17px; font-weight: 700; color: var(--ink);
            flex-shrink: 0;
        }

        /* Offer banner */
        .bm-offer-banner {
            margin: 0; position: relative; overflow: hidden;
            border-bottom: 1px solid rgba(217,119,6,.2);
            animation: bmSlideDown .4s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes bmSlideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:none; } }
        .bm-offer-glow {
            position: absolute; top: 0; left: 0; right: 0; height: 1px;
            background: linear-gradient(90deg, transparent, #f59e0b, transparent);
        }
        .bm-offer-inner {
            background: linear-gradient(135deg,#fffbeb,#fef3c7 50%,#fde68a);
            padding: 12px 18px; display: flex; align-items: center; justify-content: space-between;
        }
        .bm-offer-left  { display: flex; align-items: center; gap: 10px; }
        .bm-offer-fire  { font-size: 18px; animation: bmFireRock 2s ease-in-out infinite; display: inline-block; }
        @keyframes bmFireRock { 0%,100%{transform:rotate(0) scale(1)} 25%{transform:rotate(-7deg) scale(1.08)} 75%{transform:rotate(7deg) scale(1.08)} }
        .bm-offer-name  { font-size: 13px; font-weight: 600; color: #92400e; margin: 0 0 2px; }
        .bm-offer-sub   { font-size: 11px; color: #b45309; margin: 0; }
        .bm-offer-right { text-align: right; }
        .bm-saving-lbl  { font-size: 9px; color: #b45309; margin: 0; letter-spacing: 1px; text-transform: uppercase; }
        .bm-saving-amt  {
            font-family: 'Cormorant Garamond', serif;
            font-size: 18px; font-weight: 700; color: #92400e; margin: 0;
            animation: bmPop .3s cubic-bezier(.34,1.56,.64,1) .2s both;
        }
        @keyframes bmPop { from{transform:scale(.7);opacity:0} to{transform:scale(1);opacity:1} }
        .bm-offer-nudge {
            font-size: 11.5px; color: var(--amber);
            padding: 10px 18px; margin: 0;
            background: rgba(184,106,0,.05);
            border-bottom: 1px solid var(--border);
        }

        /* Price breakdown */
        .bm-breakdown { padding: 14px 18px; display: flex; flex-direction: column; gap: 8px; }
        .bm-breakdown-row {
            display: flex; justify-content: space-between;
            font-size: 12.5px; color: var(--muted);
        }
        .bm-breakdown-row.--amber { color: var(--amber); font-weight: 500; }
        .bm-breakdown-row.--green { color: var(--green); font-weight: 500; }
        .bm-breakdown-row .--free { color: var(--green); font-weight: 600; font-size: 11px; letter-spacing: .5px; text-transform: uppercase; }
        .bm-breakdown-total {
            display: flex; justify-content: space-between; align-items: baseline;
            border-top: 1px solid var(--border); padding-top: 12px; margin-top: 4px;
            font-size: 13px; font-weight: 600; color: var(--ink-soft);
        }
        .bm-total-amt {
            font-family: 'Cormorant Garamond', serif;
            font-size: 22px; font-weight: 700; color: var(--ink);
        }

        /* ─ Coupon ──────────────────────────────────────── */
        .bm-coupon-row { display: flex; gap: 8px; }
        .bm-coupon-input {
            flex: 1; padding: 10px 13px;
            border: 1.5px solid var(--border); border-radius: var(--r-sm);
            font-size: 13px; outline: none; font-family: 'DM Sans', sans-serif;
            transition: all .2s ease; background: var(--surface); color: var(--ink);
            letter-spacing: 1px; text-transform: uppercase;
            box-sizing: border-box;
        }
        .bm-coupon-input::placeholder { text-transform: none; letter-spacing: 0; color: #c5bdb3; }
        .bm-coupon-input:focus { border-color: var(--gold); background: #fff; box-shadow: 0 0 0 3px var(--gold-glow); }
        .bm-coupon-btn {
            padding: 10px 16px; border: 1.5px solid var(--border); border-radius: var(--r-sm);
            font-size: 12px; font-weight: 600; cursor: pointer; background: #fff;
            color: var(--ink); transition: all .2s ease;
            white-space: nowrap; letter-spacing: .5px; font-family: 'DM Sans', sans-serif;
        }
        .bm-coupon-btn:hover:not(:disabled) {
            background: var(--ink); color: #fff; border-color: var(--ink);
        }
        .bm-coupon-btn:disabled { opacity: .4; cursor: not-allowed; }
        .bm-coupon-err { font-size: 11px; color: var(--red); margin-top: 6px; }

        /* Coupon applied */
        .bm-coupon-applied {
            border-radius: var(--r-sm); overflow: hidden;
            border: 1.5px solid #86efac; margin-top: 10px;
            animation: bmSlideDown .35s cubic-bezier(.22,1,.36,1) both;
        }
        .bm-coupon-inner {
            background: linear-gradient(120deg,#f0fdf4,#dcfce7,#bbf7d0 80%,#dcfce7);
            padding: 11px 14px; display: flex; align-items: center; justify-content: space-between;
        }
        .bm-coupon-left { display: flex; align-items: center; gap: 10px; }
        .bm-coupon-title { font-size: 13px; font-weight: 600; color: #15803d; margin: 0 0 2px; }
        .bm-coupon-code  { font-size: 11px; color: #16a34a; font-family: monospace; letter-spacing: 1.5px; margin: 0; }
        .bm-coupon-right { text-align: right; }
        .bm-coupon-save-lbl { font-size: 9px; color: #15803d; margin: 0; letter-spacing: 1px; text-transform: uppercase; }
        .bm-coupon-save-amt {
            font-family: 'Cormorant Garamond', serif;
            font-size: 18px; font-weight: 700; color: #15803d; margin: 0;
            animation: bmPop .3s cubic-bezier(.34,1.56,.64,1) .2s both;
        }

        /* Offer beats coupon */
        .bm-offer-celeb {
            border-radius: var(--r-sm); overflow: hidden;
            border: 1.5px solid rgba(245,158,11,.4);
            box-shadow: 0 4px 20px rgba(245,158,11,.1);
            animation: bmSlideDown .4s cubic-bezier(.22,1,.36,1) both;
        }
        .bm-occ-inner {
            background: linear-gradient(135deg,#fffbeb,#fef3c7 60%,#fde68a);
            padding: 14px 16px;
        }
        .bm-occ-row   { display: flex; align-items: center; gap: 12px; margin-bottom: 6px; }
        .bm-occ-badge {
            width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0;
            background: rgba(245,158,11,.14); border: 1.5px solid rgba(245,158,11,.3);
            display: flex; align-items: center; justify-content: center;
            animation: bmBadgePulse 2s ease-in-out .5s infinite;
        }
        @keyframes bmBadgePulse { 0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,.3)} 50%{box-shadow:0 0 0 8px rgba(245,158,11,0)} }
        .bm-occ-emoji  { font-size: 18px; animation: bmPop .4s cubic-bezier(.34,1.56,.64,1) .3s both; display: inline-block; }
        .bm-occ-text   { flex: 1; }
        .bm-occ-lbl    { font-size: 9px; font-weight: 600; color: #b45309; text-transform: uppercase; letter-spacing: 1.5px; margin: 0; }
        .bm-occ-amount {
            font-family: 'Cormorant Garamond', serif;
            font-size: 24px; font-weight: 700; margin: 0; line-height: 1.1;
            color: #92400e;
        }
        .bm-occ-tag   { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
        .bm-occ-fire  { font-size: 16px; animation: bmFireRock 1.8s ease-in-out .8s infinite; display: inline-block; }
        .bm-occ-name  {
            font-size: 10.5px; font-weight: 600; color: #78350f;
            background: rgba(217,119,6,.12); border: 1px solid rgba(217,119,6,.25);
            border-radius: 5px; padding: 2px 8px; letter-spacing: .3px;
        }
        .bm-occ-sub   { font-size: 11px; color: #b45309; margin: 0; opacity: .85; }

        /* ─ Buttons ─────────────────────────────────────── */
        .bm-btn-primary {
            width: 100%; padding: 14px 20px;
            background: linear-gradient(135deg, #1a1612 0%, #2d2820 100%);
            color: #fff; border: none; border-radius: var(--r-sm);
            font-size: 13.5px; font-weight: 600;
            cursor: pointer; letter-spacing: .5px;
            transition: all .25s ease;
            font-family: 'DM Sans', sans-serif;
            position: relative; overflow: hidden;
        }
        .bm-btn-primary::before {
            content: ''; position: absolute; inset: 0;
            background: linear-gradient(135deg, rgba(201,169,110,.15) 0%, transparent 60%);
            opacity: 0; transition: opacity .25s;
        }
        .bm-btn-primary:hover:not(:disabled) {
            background: linear-gradient(135deg, #2d2820 0%, #3d3830 100%);
            box-shadow: 0 8px 28px rgba(14,12,10,.25), 0 2px 8px rgba(14,12,10,.12);
            transform: translateY(-1px);
        }
        .bm-btn-primary:hover:not(:disabled)::before { opacity: 1; }
        .bm-btn-primary:active:not(:disabled) { transform: translateY(0); }
        .bm-btn-primary:disabled { opacity: .4; cursor: not-allowed; }

        .bm-btn-secondary {
            width: 100%; padding: 11px 16px; background: var(--surface); color: var(--ink);
            border: 1.5px solid var(--border); border-radius: var(--r-sm);
            font-size: 13px; font-weight: 500; cursor: pointer;
            transition: all .2s ease; font-family: 'DM Sans', sans-serif;
        }
        .bm-btn-secondary:hover:not(:disabled) { background: var(--surface-2); border-color: var(--border-strong); }
        .bm-btn-secondary:disabled { opacity: .4; cursor: not-allowed; }

        .bm-link {
            background: none; border: none; padding: 0;
            font-size: 12.5px; color: var(--gold); cursor: pointer;
            font-family: 'DM Sans', sans-serif; font-weight: 500;
            display: inline-flex; align-items: center; gap: 4px;
            transition: color .15s;
        }
        .bm-link:hover { color: var(--ink); }

        /* ─ Error ───────────────────────────────────────── */
        .bm-error {
            font-size: 12.5px; color: var(--red);
            padding: 10px 14px;
            background: rgba(139,32,32,.06);
            border: 1px solid rgba(139,32,32,.15);
            border-radius: var(--r-sm);
            display: flex; align-items: center; gap: 8px;
        }
        .bm-error::before { content: '⚠'; flex-shrink: 0; }

        /* ─ OTP ─────────────────────────────────────────── */
        .bm-otp-card {
            background: var(--surface); border: 1px solid var(--border);
            border-radius: var(--r); padding: 24px;
        }
        .bm-otp-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 22px; font-weight: 600; color: var(--ink); margin: 0 0 6px;
        }
        .bm-otp-desc {
            font-size: 13px; color: var(--muted); margin: 0 0 20px; line-height: 1.6;
        }
        .bm-otp-desc strong { color: var(--ink); font-weight: 500; }
        .bm-otp-actions { display: flex; flex-direction: column; gap: 10px; margin-top: 18px; }

        /* ─ Center states ───────────────────────────────── */
        .bm-state {
            display: flex; flex-direction: column; align-items: center;
            justify-content: center; padding: 64px 0; gap: 16px; text-align: center;
        }
        .bm-spinner-wrap {
            position: relative; width: 52px; height: 52px;
        }
        .bm-spinner-ring {
            position: absolute; inset: 0;
            border: 2px solid var(--border);
            border-top-color: var(--gold);
            border-radius: 50%;
            animation: bmSpin .8s cubic-bezier(.4,0,.2,1) infinite;
        }
        .bm-spinner-inner {
            position: absolute; inset: 8px;
            border: 1.5px solid var(--border);
            border-top-color: var(--ink);
            border-radius: 50%;
            animation: bmSpin .5s cubic-bezier(.4,0,.2,1) reverse infinite;
        }
        @keyframes bmSpin { to { transform: rotate(360deg); } }
        .bm-success-ring {
            width: 60px; height: 60px; border-radius: 50%;
            background: linear-gradient(135deg, #f0fdf4, #dcfce7);
            border: 2px solid #86efac;
            display: flex; align-items: center; justify-content: center;
            animation: bmSuccessReveal .5s cubic-bezier(.34,1.56,.64,1) both;
        }
        @keyframes bmSuccessReveal { from{transform:scale(0) rotate(-45deg);opacity:0} to{transform:none;opacity:1} }
        .bm-success-check {
            font-size: 26px; color: var(--green);
            animation: bmPop .4s cubic-bezier(.34,1.56,.64,1) .2s both;
        }
        .bm-state-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 22px; font-weight: 600; color: var(--ink); margin: 0;
        }
        .bm-state-sub { font-size: 13px; color: var(--muted); margin: 0; }

        /* ─ Right column ────────────────────────────────── */
        .bm-right-stack { display: flex; flex-direction: column; gap: 16px; }

        /* ─ Security note ───────────────────────────────── */
        .bm-secure-note {
            display: flex; align-items: center; justify-content: center;
            gap: 6px; font-size: 11px; color: var(--muted);
            padding-top: 4px;
        }
        .bm-secure-note svg { flex-shrink: 0; }
    `;

    // ── Step: OTP ─────────────────────────────────────────────────────────────
    if (!isLoggedIn && guestStep === 'otp') {
        return (
            <div className="bm-root">
                <style>{css}</style>
                <div className="bm-header">
                    <div className="bm-header-left">
                        <div className="bm-header-badge">🔐</div>
                        <h1 className="bm-header-title">Verify Your Number</h1>
                    </div>
                </div>
                <div className="bm-body">
                    <div className="bm-grid">
                        <div>
                            <div className="bm-otp-card">
                                <p className="bm-otp-title">Enter OTP</p>
                                <p className="bm-otp-desc">
                                    We sent a 6-digit code to <strong>+91 {guestPhone}</strong>
                                </p>
                                <EnterOtp length={6} onChange={(val) => { setOtp(val); setOtpError(''); }} />
                                {otpError && <p className="bm-field-err" style={{ marginTop: 10 }}>{otpError}</p>}
                                <div className="bm-otp-actions">
                                    <button
                                        type="button"
                                        className="bm-btn-primary"
                                        onClick={handleVerifyOtp}
                                        disabled={verifyOtpLoading || otp.replace(/\D/g, '').length < 6}
                                    >
                                        {verifyOtpLoading ? 'Verifying…' : 'Verify & Place Order →'}
                                    </button>
                                    <button
                                        type="button"
                                        className="bm-btn-secondary"
                                        onClick={handleResendOtp}
                                        disabled={otpCooldown > 0 || sendOtpLoading}
                                    >
                                        {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : 'Resend OTP'}
                                    </button>
                                    <button
                                        type="button"
                                        className="bm-link"
                                        onClick={() => { setGuestStep('phone'); setOtp(''); setOtpError(''); setGuestPhone(''); setOtpCooldown(0); }}
                                    >
                                        ← Change number
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div><OrderSummary /></div>
                    </div>
                </div>
            </div>
        );
    }

    // ── Step: Processing ──────────────────────────────────────────────────────
    if (step === 'processing') {
        return (
            <div className="bm-root">
                <style>{css}</style>
                <div className="bm-header">
                    <div className="bm-header-left">
                        <div className="bm-header-badge">⚡</div>
                        <h1 className="bm-header-title">Placing Your Order</h1>
                    </div>
                </div>
                <div className="bm-body">
                    <div className="bm-state">
                        <div className="bm-spinner-wrap">
                            <div className="bm-spinner-ring" />
                            <div className="bm-spinner-inner" />
                        </div>
                        <p className="bm-state-title">Processing…</p>
                        <p className="bm-state-sub">Please wait, this will only take a moment.</p>
                    </div>
                </div>
            </div>
        );
    }

    // ── Step: Success ─────────────────────────────────────────────────────────
    if (step === 'success') {
        return (
            <div className="bm-root">
                <style>{css}</style>
                <div className="bm-header">
                    <div className="bm-header-left">
                        <div className="bm-header-badge">✓</div>
                        <h1 className="bm-header-title">Order Confirmed</h1>
                    </div>
                </div>
                <div className="bm-body">
                    <div className="bm-state">
                        <div className="bm-success-ring">
                            <span className="bm-success-check">✓</span>
                        </div>
                        <p className="bm-state-title">Order Placed Successfully</p>
                        <p className="bm-state-sub">Redirecting to your order summary…</p>
                    </div>
                </div>
            </div>
        );
    }

    // ── Step: Details (main form) ─────────────────────────────────────────────
    return (
        <div className="bm-root">
            <style>{css}</style>

            <div className="bm-header">
                <div className="bm-header-left">
                    <div className="bm-header-badge">⚡</div>
                    <h1 className="bm-header-title">Instant Checkout</h1>
                </div>
                <button className="bm-close-btn" onClick={onClose} aria-label="Close">×</button>
            </div>

            <div className="bm-body">
                <div className="bm-grid">

                    {/* ── LEFT: form ── */}
                    <div>
                        {!isLoggedIn && (
                            <>
                                <span className="bm-section-lbl">Contact Details</span>
                                <div className="bm-fields">
                                    <div className="bm-field --full">
                                        <label className="bm-label">Full Name <em>*</em></label>
                                        <input className="bm-input" type="text" value={formData.name} onChange={handleChange('name')} placeholder="John Doe" />
                                    </div>
                                    <div className="bm-field">
                                        <label className="bm-label">Phone <em>*</em></label>
                                        <input className="bm-input" type="tel" value={formData.phone} onChange={handleChange('phone')} placeholder="10-digit number" maxLength={10} />
                                    </div>
                                    <div className="bm-field">
                                        <label className="bm-label">Email <em>*</em></label>
                                        <input className="bm-input" type="email" value={formData.email} onChange={handleChange('email')} placeholder="you@email.com" />
                                    </div>
                                </div>
                                <hr className="bm-divider" />
                            </>
                        )}

                        <span className="bm-section-lbl">Delivery Address</span>

                        {isLoggedIn && addresses.length > 0 && (
                            <div className="bm-addr-list-wrap">
                                <div className="bm-addr-toggle-row">
                                    <span className="bm-addr-count">
                                        {useNewAddress
                                            ? 'Entering new address'
                                            : `${addresses.length} saved address${addresses.length > 1 ? 'es' : ''}`}
                                    </span>
                                    <button
                                        type="button"
                                        className="bm-addr-toggle"
                                        onClick={() => { setUseNewAddress(p => !p); if (!useNewAddress) setFormData(EMPTY_FORM); }}
                                    >
                                        {useNewAddress ? '← Use saved' : '+ New address'}
                                    </button>
                                </div>

                                {!useNewAddress && (
                                    <div className="bm-addr-list">
                                        {addresses.map(addr => (
                                            <label
                                                key={addr.addressID}
                                                className={`bm-addr-card${selectedAddressID === addr.addressID ? ' --sel' : ''}`}
                                            >
                                                <input
                                                    type="radio"
                                                    checked={selectedAddressID === addr.addressID}
                                                    onChange={() => setSelectedAddressID(addr.addressID)}
                                                />
                                                <div>
                                                    <p className="bm-addr-name">{addr.name || addr.fullName || 'Recipient'}</p>
                                                    <p className="bm-addr-meta">
                                                        {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} – {addr.pincode}
                                                    </p>
                                                    {(addr.phoneNumber || addr.phone) && (
                                                        <p className="bm-addr-meta">{addr.phoneNumber || addr.phone}</p>
                                                    )}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {(!isLoggedIn || useNewAddress || addresses.length === 0) && (
                            <div className="bm-fields">
                                {isLoggedIn && (
                                    <>
                                        <div className="bm-field">
                                            <label className="bm-label">Phone <em>*</em></label>
                                            <input className="bm-input" type="tel" value={formData.phone} onChange={handleChange('phone')} placeholder="10-digit number" maxLength={10} />
                                        </div>
                                        <div className="bm-field">
                                            <label className="bm-label">Email <em>*</em></label>
                                            <input className="bm-input" type="email" value={formData.email} onChange={handleChange('email')} placeholder="you@email.com" />
                                        </div>
                                    </>
                                )}
                                <div className="bm-field --full">
                                    <label className="bm-label">Address Line 1 <em>*</em></label>
                                    <input className="bm-input" type="text" value={formData.line1} onChange={handleChange('line1')} placeholder="House / Flat / Block no." />
                                </div>
                                <div className="bm-field --full">
                                    <label className="bm-label">Address Line 2</label>
                                    <input className="bm-input" type="text" value={formData.line2} onChange={handleChange('line2')} placeholder="Street / Colony (optional)" />
                                </div>
                                <div className="bm-field">
                                    <label className="bm-label">City <em>*</em></label>
                                    <input className="bm-input" type="text" value={formData.city} onChange={handleChange('city')} />
                                </div>
                                <div className="bm-field">
                                    <label className="bm-label">Pincode <em>*</em></label>
                                    <input className="bm-input" type="text" value={formData.pincode} onChange={handleChange('pincode')} maxLength={6} placeholder="6 digits" />
                                </div>
                                <div className="bm-field">
                                    <label className="bm-label">State <em>*</em></label>
                                    <select className="bm-select" value={formData.state} onChange={handleChange('state')}>
                                        <option value="">Select state</option>
                                        {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="bm-field">
                                    <label className="bm-label">Landmark</label>
                                    <input className="bm-input" type="text" value={formData.landmark} onChange={handleChange('landmark')} placeholder="Optional" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT: summary + coupon + payment + CTA ── */}
                    <div className="bm-right-stack">
                        <OrderSummary />

                        {/* Coupon / Offer */}
                        {offerDetails?.offerApplied ? (
                            <div key={`occ-${offerAnimKey}`} className="bm-offer-celeb">
                                <div className="bm-occ-inner">
                                    <div className="bm-occ-row">
                                        <div className="bm-occ-badge">
                                            <span className="bm-occ-emoji">🎉</span>
                                        </div>
                                        <div className="bm-occ-text">
                                            <p className="bm-occ-lbl">You&apos;re saving</p>
                                            <p className="bm-occ-amount">₹{offerSaving.toFixed(2)}</p>
                                        </div>
                                        <div className="bm-occ-tag">
                                            <span className="bm-occ-fire">🔥</span>
                                            <span className="bm-occ-name">{offerDetails?.offerName || 'Active Offer'}</span>
                                        </div>
                                    </div>
                                    <p className="bm-occ-sub">Coupon not needed — your offer beats it!</p>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <span className="bm-section-lbl">Coupon Code</span>
                                <div className="bm-coupon-row">
                                    <input
                                        className="bm-coupon-input"
                                        type="text"
                                        value={couponCode}
                                        onChange={e => {
                                            setCouponCode(e.target.value);
                                            setCouponApplied(false); setCouponDiscount(0); setCouponError('');
                                        }}
                                        placeholder="Enter coupon"
                                    />
                                    <button
                                        className="bm-coupon-btn"
                                        onClick={handleApplyCoupon}
                                        disabled={applyingCoupon || !couponCode.trim()}
                                    >
                                        {applyingCoupon ? '…' : 'Apply'}
                                    </button>
                                </div>
                                {couponError && !couponApplied && (
                                    <p className="bm-coupon-err">{couponError}</p>
                                )}
                                {couponApplied && (
                                    <div key={couponAnimKey} className="bm-coupon-applied">
                                        <div className="bm-coupon-inner">
                                            <div className="bm-coupon-left">
                                                <span style={{ fontSize: 20 }}>🏷️</span>
                                                <div>
                                                    <p className="bm-coupon-title">Coupon Applied!</p>
                                                    <p className="bm-coupon-code">{couponCode.toUpperCase()}</p>
                                                </div>
                                            </div>
                                            <div className="bm-coupon-right">
                                                <p className="bm-coupon-save-lbl">You Save</p>
                                                <p className="bm-coupon-save-amt">-₹{couponDiscount.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Payment mode */}
                        <div>
                            <span className="bm-section-lbl">Payment Method</span>
                            <div className="bm-pay-grid">
                                <button
                                    type="button"
                                    className={`bm-pay-card${paymentMode === 'COD' ? ' --sel' : ''}`}
                                    onClick={() => setPaymentMode('COD')}
                                >
                                    <span className="bm-pay-icon">💵</span>
                                    <p className="bm-pay-title">Cash on Delivery</p>
                                    <p className="bm-pay-sub">Pay when your order arrives</p>
                                </button>
                                <button
                                    type="button"
                                    className={`bm-pay-card${paymentMode === 'PREPAID' ? ' --sel' : ''}`}
                                    onClick={() => setPaymentMode('PREPAID')}
                                >
                                    <span className="bm-pay-icon">⚡</span>
                                    <p className="bm-pay-title">Online Payment</p>
                                    <p className="bm-pay-sub">PhonePe · UPI · Cards</p>
                                </button>
                            </div>
                        </div>

                        {error && <p className="bm-error">{error}</p>}

                        <button
                            type="button"
                            className="bm-btn-primary"
                            onClick={handleConfirmOrder}
                            disabled={loading || sendOtpLoading}
                        >
                            {loading
                                ? 'Placing your order…'
                                : sendOtpLoading
                                    ? 'Sending OTP…'
                                    : 'Confirm Order →'}
                        </button>

                        <p className="bm-secure-note">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            Secured checkout · 256-bit encryption
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuyNowModal;