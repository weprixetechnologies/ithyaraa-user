"use client"

import { useState } from 'react'
import { HiBars3BottomLeft } from "react-icons/hi2";
const HamburgerMenu = () => {
    return (
        <div className="px-3 py-5">

            <div className="auth-content-hamburger flex flex-row gap-2">
                <button className="h-[30px] w-[30px] rounded-full border"></button>
                <div className="flex flex-col items-start">
                    <p className="text-xs">Welcome Back</p>
                    <p className="text-sm">Deepak Mutthularu</p>
                </div>
            </div>

            <div className="mt-3 bg-secondary h-0.5 opacity-40"></div>
        </div>)
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
                <HamburgerMenu />
            </div>
        </div>
    )
}

export default Hamburger
