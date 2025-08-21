"use client"
import { useState } from 'react'
import InputPhone from '@/components/ui/inputPhone';
import InputPassword from '@/components/ui/inputPassword';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { setCookie } from '../../lib/setCookie'; // import the util
import { useRouter } from 'next/navigation';

const LoginAction = () => {
    const [password, setPassword] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const router = useRouter()
    const isActive = phoneNumber.replace(/\D/g, '').length === 10 && password !== '';

    const handleSignIn = async () => {
        if (!isActive) return;

        try {
            const res = await fetch('http://192.168.1.9:3300/api/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phonenumber: phoneNumber, password }),
            });

            if (!res.ok) {
                console.error("Login failed");
                toast.error("Login failed. Check credentials.");
                return;
            }

            const data = await res.json();
            console.log("Login success:", data);

            if (data.accessToken && data.refreshToken) {
                // ✅ Use universal cookie util
                setCookie('_at', data.accessToken, { days: 7 });
                setCookie('_rt', data.refreshToken, { days: 7 });
                setCookie('_iil', true, { days: 7 });

                toast.success('Login Success');
                router.push('/')
            }

        } catch (err) {
            console.error("Error during login:", err);
            toast.error("Something went wrong!");
        }
    };

    return (
        <div>
            <InputPhone value={phoneNumber} setState={setPhoneNumber} />
            <div className="h-2"></div>

            <InputPassword value={password} placeholder="Enter Your Password" setState={setPassword} />

            <div className="flex justify-end mb-2 mt-1">
                <Link href="/login/forgot-password" className="text-xs text-right text-blue-600 font-medium">
                    Forgot Password?
                </Link>
            </div>
            <div className="h-2"></div>

            <button
                onClick={handleSignIn}
                className={`w-full rounded-xl py-2 font-semibold text-white ${isActive ? 'bg-black cursor-pointer' : 'bg-gray-300 cursor-not-allowed'}`}
                disabled={!isActive}
            >
                Sign In
            </button>

            <div className="flex w-full justify-center">
                <Link href="/signup" className="text-blue-600 text-xs mt-2 font-medium">
                    Don't Have Account? Sign Up Now
                </Link>
            </div>

            <p className="font-medium text-xs text-center mt-6">
                By Logging into your account, you agree to our terms and policies.
                To read please visit our page.
            </p>
        </div>
    )
}

export default LoginAction
