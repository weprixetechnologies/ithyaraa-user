"use client";

import React, { useState } from 'react';
import { RxCross2 } from 'react-icons/rx';
import InputPhone from '@/components/ui/inputPhone';
import InputPassword from '@/components/ui/inputPassword';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { setCookie } from '@/lib/setCookie';
import { getOrCreateGuestToken, clearGuestToken } from '@/lib/guestToken';
import { useAuth } from '@/contexts/AuthContext';
import { useDispatch } from 'react-redux';
import { getCartAsync } from '@/redux/slices/cartSlice';
import Image from 'next/image';
import logo from '../../../public/ithyaraa-logo.png';

const LoginModal = ({ isOpen, onClose, onSuccess }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { checkAuthStatus } = useAuth();
    const dispatch = useDispatch();

    if (!isOpen) return null;

    const getApiUrl = () => {
        if (typeof window !== 'undefined') {
            const hostname = window.location.hostname;
            if (hostname === '192.168.1.12' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
                return 'https://backend.ithyaraa.com/api';
            }
        }
        return 'https://backend.ithyaraa.com/api';
    };

    const isActive = phoneNumber.replace(/\D/g, '').length === 10 && password !== '';

    const handleSignIn = async (e) => {
        if (e) e.preventDefault();
        if (!isActive || loading) return;

        setLoading(true);
        try {
            const guestToken = getOrCreateGuestToken();
            const res = await fetch(`${getApiUrl()}/user/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(guestToken ? { 'x-guest-token': guestToken } : {})
                },
                body: JSON.stringify({ phonenumber: phoneNumber, password, guestToken }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                console.error("Login failed", data);
                toast.error(data.message || "Login failed. Check credentials.");
                setLoading(false);
                return;
            }

            if (data.accessToken && data.refreshToken) {
                setCookie('_at', data.accessToken, { days: 7 });
                setCookie('_rt', data.refreshToken, { days: 7 });
                setCookie('_iil', true, { days: 7 });

                // Clear guest token as backend merged guest cart into user account
                clearGuestToken();

                // Update auth state in context
                if (checkAuthStatus) {
                    checkAuthStatus();
                }

                // Refresh cart with merged items
                dispatch(getCartAsync());

                toast.success('Signed in successfully!');

                if (onSuccess) {
                    onSuccess();
                } else {
                    onClose();
                }
            }
        } catch (err) {
            console.error("Error during login modal submit:", err);
            toast.error("Something went wrong during sign in!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Dialog */}
            <div
                className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Close"
                >
                    <RxCross2 size={20} />
                </button>

                {/* Header */}
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-24 mb-3">
                        <Image src={logo} alt="Ithyaraa" className="w-full object-contain" priority />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Sign In to Proceed</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Sign in to select your delivery address and checkout
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                        <InputPhone value={phoneNumber} setState={setPhoneNumber} />
                    </div>

                    <div>
                        <InputPassword value={password} placeholder="Enter Your Password" setState={setPassword} />
                    </div>

                    <div className="flex justify-end">
                        <Link
                            href="/login/forgot-password"
                            onClick={onClose}
                            className="text-xs text-blue-600 font-medium hover:underline"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={!isActive || loading}
                        className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                            isActive && !loading
                                ? 'bg-black hover:bg-gray-800 cursor-pointer shadow-md'
                                : 'bg-gray-300 cursor-not-allowed'
                        }`}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Signing in...
                            </span>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                {/* Footer Link */}
                <div className="mt-6 text-center text-xs text-gray-600">
                    Don&apos;t have an account?{' '}
                    <Link
                        href="/signup?redirect=/cart"
                        onClick={onClose}
                        className="text-blue-600 font-semibold hover:underline"
                    >
                        Sign Up Now
                    </Link>
                </div>

                <p className="text-[11px] text-gray-400 text-center mt-4">
                    By signing in, you agree to our terms and conditions.
                </p>
            </div>
        </div>
    );
};

export default LoginModal;
