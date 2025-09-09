"use client"
import { useState, useEffect } from 'react'
import InputPhone from '@/components/ui/inputPhone';
import InputPassword from '@/components/ui/inputPassword';
import Link from 'next/link';
import InputDynamic from '../ui/inputDynamic';
import { FaPersonRays } from "react-icons/fa6";
import { toast } from 'react-toastify';
import EnterOtp from '../ui/enterOtp';
import { useRouter } from 'next/navigation';

const SignUpAction = () => {
    const [password, setPassword] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [name, setName] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [email, setEmail] = useState('')
    const [referCode, setReferCode] = useState('')
    const [showOtpScreen, setShowOtpScreen] = useState(false)
    const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState(false)
    const [cooldown, setCooldown] = useState(0)
    const router = useRouter();

    const isActive = phoneNumber.replace(/\D/g, '').length === 10
        && password !== '' && confirmPassword !== ''
        && name !== '' && email !== ''

    // Countdown timer for resend
    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setInterval(() => {
                setCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [cooldown]);

    // Send OTP function (used for both signup start and resend)
    const sendOtp = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3300/api/user/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber: `+91${phoneNumber}` })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("OTP sent successfully");
                setShowOtpScreen(true);
                setCooldown(60); // start cooldown on each OTP send
            } else {
                toast.error(data.message || "Failed to send OTP");
            }
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong while sending OTP");
        }
        setLoading(false);
    };

    // STEP 1: send OTP before showing OTP screen
    const handleStartSignUp = async () => {
        if (!name || !phoneNumber || !email || !password || !confirmPassword) {
            toast.error("Please fill all required fields");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (phoneNumber.replace(/\D/g, '').length !== 10) {
            toast.error("Enter a valid 10-digit phone number");
            return;
        }
        await sendOtp();
    };

    // STEP 2: verify OTP then create user
    const handleVerifyOtp = async () => {
        if (!otp || otp.length < 6) {
            toast.error("Enter complete OTP");
            return;
        }

        setLoading(true);
        try {
            // verify OTP
            const verifyRes = await fetch('http://localhost:3300/api/user/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber: `+91${phoneNumber}`, otp })
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
                toast.error(verifyData.message || "OTP verification failed");
                setLoading(false);
                return;
            }
            toast.success("OTP verified");

            // create user
            const createRes = await fetch('http://localhost:3300/api/user/create-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    password,
                    confirmPassword,
                    name,
                    email,
                    phonenumber: phoneNumber,
                    referCode
                })
            });
            const createData = await createRes.json();
            if (createRes.ok) {
                toast.success("User created successfully");
                setTimeout(() => {
                    router.push('/login');
                }, 2000); // 2000ms = 2 seconds
            } else {
                toast.error(createData.message || "Sign up failed");
            }

        } catch (err) {
            console.error(err);
            toast.error("Something went wrong during sign up");
        }
        setLoading(false);
    };

    if (showOtpScreen) {
        return (
            <div>
                <p className="text-sm text-center mb-4">
                    Enter the OTP sent to <span className="font-semibold">{phoneNumber}</span>
                </p>
                <EnterOtp length={6} onChange={(val) => setOtp(val)} />
                <div className="h-4"></div>
                <button
                    onClick={handleVerifyOtp}
                    disabled={loading}
                    className={`w-full rounded-xl py-2 font-semibold text-white ${loading ? 'bg-gray-400' : 'bg-black cursor-pointer'}`}
                >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                </button>

                <div className="h-4"></div>
                <button
                    onClick={sendOtp}
                    disabled={cooldown > 0 || loading}
                    className={`w-full rounded-xl py-2 font-semibold text-white ${cooldown > 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 cursor-pointer'}`}
                >
                    {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
                </button>
            </div>
        );
    }

    return (
        <div>
            <InputDynamic icon={<FaPersonRays />} placeholder={'Enter Your Name'} setState={setName} value={name} />
            <div className="h-2"></div>
            <InputPhone value={phoneNumber} setState={setPhoneNumber} />
            <div className="h-2"></div>
            <InputDynamic icon={<FaPersonRays />} placeholder={'Enter Your Email ID'} setState={setEmail} value={email} />
            <div className="h-2"></div>
            <InputPassword value={password} setState={setPassword} placeholder={'Enter Your Password'} />
            <div className="h-2"></div>
            <InputPassword value={confirmPassword} setState={setConfirmPassword} placeholder={'Confirm Your Password'} />
            <div className="h-2"></div>
            <InputDynamic icon={<FaPersonRays />} placeholder={'Have a Refer Code? Enter Here'} setState={setReferCode} value={referCode} />
            <div className="h-2"></div>

            <button
                onClick={handleStartSignUp}
                disabled={!isActive || loading}
                className={`w-full rounded-xl py-2 font-semibold text-white ${isActive && !loading ? 'bg-black cursor-pointer' : 'bg-gray-300 cursor-not-allowed'}`}
            >
                {loading ? 'Sending OTP...' : 'Sign Up'}
            </button>

            <div className="flex w-full justify-center">
                <Link href={'/login'} className='text-blue-600 text-xs mt-2'>Already Have Account? Login Now</Link>
            </div>

            <p className='font-medium text-xs text-center mt-6'>
                By Logging into your account, you agree to our terms and policies. To read please visit our page.
            </p>
        </div>
    )
}

export default SignUpAction;
