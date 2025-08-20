import React from 'react'
import Image from 'next/image';


import SignUpAction from '@/components/pageComponents/signupAction';

const LoginPage = () => {
    const loginImage = 'https://images.bewakoof.com/web/rm-login-mobile-v3.jpg?dt=23:10:2024:15';
    const loginImageDesktop = 'https://images.bewakoof.com/web/rm-login-desk-v2.jpg';

    return (
        <div className='bg-white min-h-[100dvh] w-full flex flex-col md:grid md:grid-cols-2 md:gap-5'>
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
            <div className="flex-1 flex flex-col w-full bg-white rounded-[30px] py-7 px-5 md:py-15 md:items-center relative -top-5 md:top-0">
                <div className="min-w-[70%]">
                    <p className='text-2xl font-medium'>Sign Up Now</p>
                    <p className='text-sm font-medium text-secondary-text-deep mb-5'>Join Us Today to enjoy unlimited benefits</p>
                    <SignUpAction />


                </div>
            </div>

        </div>
    )
}

export default LoginPage;
