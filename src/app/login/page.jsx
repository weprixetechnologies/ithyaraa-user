"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import LoginAction from '@/components/pageComponents/loginAction';
import Loading from '@/components/ui/loading';

const LoginPage = () => {
    const router = useRouter();
    const loginImage = 'https://images.bewakoof.com/web/rm-login-mobile-v3.jpg?dt=23:10:2024:15';
    const loginImageDesktop = 'https://images.bewakoof.com/web/rm-login-desk-v2.jpg';
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // Check cookies to see if user is already logged in
        const iil = document.cookie.split('; ').find(c => c.startsWith('_iil='))?.split('=')[1];
        const at = document.cookie.split('; ').find(c => c.startsWith('_at='))?.split('=')[1];
        const rt = document.cookie.split('; ').find(c => c.startsWith('_rt='))?.split('=')[1];

        if (iil === 'true' && at && rt) {
            // If you want, redirect to home
            router.replace('/');
            return;
        }
        setLoading(false);
    }, []);

    if (isLoading) {
        return <Loading />; // Show loader while checking cookies
    }

    return (
        <div className='bg-white h-[100dvh] w-full flex flex-col md:grid md:grid-cols-2 md:gap-5'>
            {/* Image Section */}
            <div className="relative w-full aspect-[400/245] md:aspect-[591/898] h-[250px] md:h-auto">
                <Image
                    src={loginImageDesktop}
                    fill
                    alt='Login Image'
                    className='object-contain'
                />
                <Image
                    src={loginImage}
                    fill
                    alt='Login Image'
                    className='object-cover block md:hidden'
                />
            </div>

            {/* Content Section */}
            <div className="flex-1 flex flex-col w-full bg-white rounded-[30px] py-7 px-5 md:py-30 md:items-center relative -top-5 md:top-0">
                <div className="min-w-[70%]">
                    <p className='text-2xl font-medium'>Sign In Now</p>
                    <p className='text-sm font-medium text-secondary-text-deep mb-5'>Join Us Today to enjoy unlimited benefits</p>
                    <LoginAction />
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
