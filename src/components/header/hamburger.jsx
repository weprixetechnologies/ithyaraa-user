"use client"

import { useState } from 'react'
import { HiBars3BottomLeft } from "react-icons/hi2";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { CgProfile } from 'react-icons/cg';
const HamburgerMenu = ({ closeMenu }) => {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    const handleProfileClick = () => {
        closeMenu();
        if (isAuthenticated) {
            router.push('/profile');
        } else {
            router.push('/login');
        }
    };

    return (
        <div className="px-100 py-5">
            <div
                className="auth-content-hamburger flex flex-row gap-3 items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                onClick={handleProfileClick}
            >
                {isAuthenticated && user?.profilePhoto ? (
                    <Image
                        src={user.profilePhoto}
                        alt="Profile"
                        width={40}
                        height={40}
                        className="rounded-full ring-1 ring-gray-200"
                    />
                ) : (
                    <div className="h-[40px] w-[40px] rounded-full border bg-gray-100 flex items-center justify-center">
                        <CgProfile size={24} className="text-gray-400" />
                    </div>
                )}


                <div className="flex flex-col items-start">
                    <p className="text-xs text-gray-500 font-medium">{isAuthenticated ? 'Welcome Back' : 'Welcome to Ithyaraa'}</p>
                    <p className="text-sm font-semibold">{isAuthenticated ? (user?.name || user?.username || 'User') : 'Login / Register'}</p>
                </div>
            </div>

            <div className="mt-3 bg-secondary h-0.5 opacity-40"></div>
        </div>
    )
}

const Hamburger = () => {
    const [hamburgerOpen, setHamburgerOpen] = useState(false);
    return (
        <div>
            <div
                className="hamburger h-auto flex items-center justify-center cursor-pointer"
                onClick={() => setHamburgerOpen(!hamburgerOpen)}
            >
                <HiBars3BottomLeft size={30} />
            </div>
            <div
                className={`fixed  inset-0 bg-secondary/30 z-40 transition-opacity duration-300 ${hamburgerOpen ? "opacity-100 visible" : "opacity-0 invisible"
                    }`}
                onClick={() => setHamburgerOpen(false)}
            />

            {/* Hamburger dropdown */}
            <div
                className={`absolute top-0 left-0 w-[70%] rounded-r-2xl h-[100dvh] bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${hamburgerOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                <HamburgerMenu closeMenu={() => setHamburgerOpen(false)} />
            </div>
        </div>
    )
}

export default Hamburger
