"use client";
import React, { useState, useEffect } from 'react';
import InputDynamic from '../ui/inputDynamic';
import { TfiWrite } from "react-icons/tfi";
import { toast } from 'react-toastify';
import EnterOtp from '../ui/enterOtp';
import { useRouter } from 'next/navigation';

const ForgotAction = () => {
    const router = useRouter()
    const [identifier, setIdentifier] = useState('');
    const [sentOTP, setSentOTP] = useState(false);
    const [otp, setOtp] = useState('');
    const [messageShow, setMessageShow] = useState('');
    const [buttonState, setButtonState] = useState(false)
    const [resendTimer, setResendTimer] = useState(0); // countdown seconds

    // Detect API URL based on environment
    const getApiUrl = () => {
        if (typeof window !== 'undefined') {
            const hostname = window.location.hostname;
            if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
                return 'http://localhost:3300/api';
            }
        }
        return 'http://localhost:3300/api';
    };

    // Reusable identifier validation
    const validateIdentifier = (value) => {
        let cleaned = value.trim();

        // Case 1: Email
        if (cleaned.includes('@')) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(cleaned)) {
                toast.error('Please enter a valid email address');
                return null;
            }
            return { identifier: cleaned, type: 'email' };
        }
        // Case 2: Phone
        else if (/^[+]?[0-9]+$/.test(cleaned)) {
            if (cleaned.startsWith('+91')) {
                cleaned = cleaned.slice(3);
            }
            if (cleaned.length < 10) {
                toast.error('Please enter a valid phone number (at least 10 digits)');
                return null;
            }
            return { identifier: cleaned, type: 'phone' };
        }
        // Case 3: Invalid
        else {
            toast.error('Please enter a valid email address or phone number');
            return null;
        }
    };

    // Handle OTP sending
    const sendOTP = async () => {
        setButtonState(true)
        if (!identifier) {
            toast.error('Please enter Email or Phone Number');
            setButtonState(false)

            return;
        }

        const validated = validateIdentifier(identifier);
        if (!validated) {
            setButtonState(false)
            return;
        };

        try {
            const res = await fetch(`${getApiUrl()}/user/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier: validated.identifier,
                    identifierType: validated.type
                })
            });
            const data = await res.json();
            if (data.success) {
                // toast.success('OTP Sent');
                setMessageShow(`OTP sent to ${identifier}`);
                setSentOTP(true);
                setResendTimer(30); // start cooldown (30s)
            } else {
                setMessageShow('');
                toast.error(data.message || 'Failed to send OTP');
                setButtonState(false)
            }
        } catch (error) {
            toast.error('Failed to send OTP');
            setButtonState(false)
        }
    };

    // Handle OTP verification
    const verifyOTP = async () => {
        if (otp.length !== 6) {
            toast.error('OTP must be 6 digits');
            return;

        }

        const validated = validateIdentifier(identifier);
        if (!validated) return;

        try {
            const res = await fetch(
                `${getApiUrl()}/user/verify-otp-reset-password`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        identifier: validated.identifier,
                        identifierType: validated.type,
                        otp,
                    }),
                }
            );

            const data = await res.json();

            if (data.resetToken) {
                // toast.success(data.message || 'OTP Verified');
                console.log('verification success');

                let countdown = 1;
                setMessageShow(`Redirecting you in ${countdown}s`);

                const interval = setInterval(() => {
                    countdown -= 1;
                    setMessageShow(`Redirecting you in ${countdown}s`);
                    if (countdown <= 0) {
                        clearInterval(interval);
                        router.push(`/login/forgot-password/reset-password/${data.resetToken}`);
                    }
                }, 1000);

            } else {
                toast.error(data.message || 'OTP verification failed');
                console.log('verification failed');
            }
        } catch (error) {
            console.error(error);
            toast.error('Network error: Could not verify OTP');
        }
    };
    // Countdown effect for resend button
    useEffect(() => {
        if (resendTimer <= 0) return;
        const interval = setInterval(() => {
            setResendTimer((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [resendTimer]);

    return (
        <div>
            <p className='text-xs text-center font-medium mb-5 text-green-500'>{messageShow}</p>
            <InputDynamic
                placeholder={'Enter Your Email ID / Phone Number'}
                value={identifier}
                disabled={sentOTP}
                icon={<TfiWrite />}
                setState={(e) => setIdentifier(e)}
            />
            <div className="h-4"></div>

            {sentOTP && (
                <EnterOtp length={6} onChange={(val) => setOtp(val)} />
            )}

            {!sentOTP ? (
                <button
                    onClick={sendOTP}
                    disabled={buttonState}
                    className={`w-full rounded-xl py-2 font-semibold text-white  mt-5 flex items-center justify-center gap-2 ${buttonState ? 'bg-gray-400' : 'bg-black'}`}
                >
                    {buttonState && (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    )}
                    {!buttonState ? 'Send OTP' : 'Sending OTP'}
                </button>

            ) : (
                <>
                    <button
                        onClick={verifyOTP}
                        className="w-full rounded-xl py-2 font-semibold text-white bg-black mt-5"
                    >
                        Verify OTP
                    </button>
                    <div className="text-center mt-4">
                        {resendTimer > 0 ? (
                            <p className="text-gray-500 text-sm">
                                Resend OTP in {resendTimer}s
                            </p>
                        ) : (
                            <button
                                onClick={sendOTP}
                                className="text-blue-600 font-medium text-sm underline"
                            >
                                Resend OTP
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default ForgotAction;
