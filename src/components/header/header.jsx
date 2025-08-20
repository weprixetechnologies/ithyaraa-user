"use client";

import Link from "next/link"
import Image from "next/image"
import logo from "../../../public/ithyaraa-logo.png"
import SearchNavbar from "../ui/searchNavbar"
import { Suspense, useEffect, useState } from "react"
import { IoMdHeartEmpty } from "react-icons/io";
import { LuShoppingCart } from "react-icons/lu";
import { HiBars3BottomLeft } from "react-icons/hi2";
import { CiSearch, CiHeart, CiShoppingCart } from "react-icons/ci";
import HamburgerChildMenu from "./hamburgerChildMenu";
import { IoPersonOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
const ShopWithUs = () => {


    return (
        <div className="absolute bg-transaparent w-full top-full p-5 z-10">
            <div className="bg-muted rounded-2xl grid grid-cols-4 gap-4 ">
                <div className="col-span-2 p-2">
                    <div className=" w-full max-w-full grid grid-cols-2 gap-1">
                        <Suspense>
                            <img src="https://images.bewakoof.com/uploads/grid/app/444x666-Desktop-Plus-size-Trending-Category-Icon-1747726805.jpg" alt="" className="rounded-2xl" />
                        </Suspense>
                        <Suspense>
                            <img src="https://images.bewakoof.com/uploads/grid/app/444x666-Desktop-Plus-size-Trending-Category-Icon-1747726805.jpg" alt="" className="rounded-2xl" />
                        </Suspense>
                    </div>
                </div>
                <div className="grid grid-cols-3 col-span-2">
                    <div className="col-span-1 p-4">
                        <p className="text-lg font-semibold text-green-800">Our Specials</p>
                        <ul className="mt-2">
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap"><Link href={'/'}>Ethnic Wear</Link> </li>
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap"><Link href={'/'}>Ethnic Wear</Link> </li>
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap"><Link href={'/'}>Ethnic Wear</Link> </li>
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap"><Link href={'/'}>Ethnic Wear</Link> </li>
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap"><Link href={'/'}>Ethnic Wear</Link> </li>

                        </ul>
                        <p className="text-lg text-green-800 font-semibold mt-5">Must Try </p>
                        <ul className="mt-2">
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap"><Link href={'/'}>Ethnic Wear</Link> </li>
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap"><Link href={'/'}>Ethnic Wear</Link> </li>
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap"><Link href={'/'}>Ethnic Wear</Link> </li>
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap"><Link href={'/'}>Ethnic Wear</Link> </li>
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap"><Link href={'/'}>Ethnic Wear</Link> </li>

                        </ul>
                    </div>
                    <div className="col-span-1 p-4">
                        <p className="text-lg font-semibold text-green-800">Latest Arrival </p>
                        <ul className="mt-2">
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap"><Link href={'/'}>Under 199</Link> </li>
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap"><Link href={'/'}>Under 399</Link> </li>
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap"><Link href={'/'}>Under 599</Link> </li>
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap"><Link href={'/'}>Under 799</Link> </li>
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap"><Link href={'/'}>Under 999</Link> </li>
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap"><Link href={'/'}>Under 1099</Link> </li>

                        </ul>
                        <p className="text-lg text-green-800 font-semibold mt-5">Combo Festive </p>
                        <ul className="mt-2">
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap"><Link href={'/'}>Make Your Combo</Link> </li>
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap"><Link href={'/'}>Try Our Combo</Link> </li>


                        </ul>
                        <ul>

                        </ul>
                    </div>
                    <div className="col-span-1 p-4">
                        <p className="text-lg font-semibold text-green-800">Trend Check </p>
                        <ul className="mt-2">
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap"><Link href={'/'}>Hoodies</Link> </li>
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap"><Link href={'/'}>Sweatshirts</Link> </li>
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap"><Link href={'/'}>Joggers</Link> </li>


                        </ul>
                        <p className="text-lg text-green-800 font-semibold mt-5">Exclusive For You </p>
                        <ul className="mt-2">
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap"><Link href={'/'}>Try Your Luck</Link> </li>
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap"><Link href={'/'}>Buy 1 Get 1 Free</Link> </li>
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap"><Link href={'/'}>Buy 2 Get 2 Free</Link> </li>
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap"><Link href={'/'}>Buy 2 Get 3 Free</Link> </li>
                        </ul>
                        <ul>

                        </ul>
                    </div>
                </div>

            </div>
        </div>
    )
}

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

            <div className="mt-3 bg-secondary h-0.5 opacity-40 mb-3"></div>
            <HamburgerChildMenu />

        </div>)
}

const Header = () => {
    const router = useRouter()
    const [auth, setAuth] = useState(false);
    const [user, setUser] = useState({
        name: "John Doe",
        email: ""
    });

    const [megaMenu, setMegaMenu] = useState({
        isOpen: false,
        menuName: ''
    });

    const [hamburgerOpen, setHamburgerOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect(() => {
        setIsLoggedIn(false)
        // Check cookies to see if user is already logged in
        const iil = document.cookie.split('; ').find(c => c.startsWith('_iil='))?.split('=')[1];
        const at = document.cookie.split('; ').find(c => c.startsWith('_at='))?.split('=')[1];
        const rt = document.cookie.split('; ').find(c => c.startsWith('_rt='))?.split('=')[1];

        if (iil === 'true' && at && rt) {
            // If you want, redirect to home
            setIsLoggedIn(true)
        }
        setIsLoggedIn(true)

    }, []);

    return (
        <div>
            <div className="w-full h-auto flex-col md:flex hidden z-50 bg-white shadow-md" onMouseLeave={() => setMegaMenu({ isOpen: false, menuName: '' })}>
                {/* Top Bar */}
                <div className="w-full bg-primary py-3 flex flex-row justify-between items-center px-4">
                    <div className="flex-row flex items-center gap-2">
                        <p className="text-xs text-white">
                            Enjoy Free Delivery on Orders Over 500 INR
                        </p>
                    </div>
                    <div className="flex flex-row items-center gap-4">
                        <Link href="/track-order" className="text-xs text-white hover:text-gray-300">
                            Track Your Order
                        </Link>
                        <Link href="/join-newsletter" className="text-xs text-white hover:text-gray-300">
                            Join Our Newsletters
                        </Link>
                        <Link href="/download-mobile" className="text-xs text-white hover:text-gray-300">
                            Download Our Mobile Application
                        </Link>
                    </div>
                </div>

                {/* Logo & Search */}
                <nav className="flex justify-center  bg-white">
                    <section className="flex w-[80%] justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Image src={logo} alt="Site Logo is Loading" width={"auto"} height={100} />
                        </div>
                        <div className="flex gap-4 flex-row items-center">
                            <SearchNavbar />
                            <IoMdHeartEmpty size={24} className="cursor-pointer" onClick={() => (router.push('/wishlist'))} />
                            <LuShoppingCart size={24} className="cursor-pointer" onClick={() => (router.push('/cart'))} />
                            <IoPersonOutline size={24} className="cursor-pointer" onClick={() => (router.push('/profile'))} />
                            <div className="border-l border-black h-6"></div>
                            <div className="section">
                                {isLoggedIn ? (
                                    <aside className="flex flex-col items-center">
                                        <p className="text-xs">Welcome Back</p>
                                        <p className="text-sm font-semibold">{user.name}</p>
                                    </aside>
                                ) : (
                                    <button className="text-sm font-medium bg-primary text-white px-4 py-2 rounded hover:bg-secondary transition-colors cursor-pointer">
                                        LOGIN / SIGNUP
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>
                </nav>

                {/* Navigation Bar */}
                <section
                    className="w-full h-auto py-1 relative"
                    style={{
                        background: "#FFF",
                        backgroundImage: "linear-gradient(102deg,rgba(255, 255, 255, 1) 0%, rgba(234, 234, 234, 1) 28%, rgba(234, 234, 234, 1) 71%, rgba(255, 255, 255, 1) 100%)"
                    }}
                >

                    <div className="relative flex justify-center">
                        {/* Scrollable nav items */}
                        <ul className="flex flex-row items-center gap-10 px-4 min-w-max overflow-x-auto">
                            <li
                                className="relative"
                                onMouseEnter={() => setMegaMenu({ isOpen: false, menuName: '' })}>
                                <Link href="/" className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">
                                    Home
                                </Link>
                            </li>
                            <li onMouseEnter={() => setMegaMenu({ isOpen: true, menuName: 'home' })}
                            >
                                <Link href="/products" className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">
                                    Shop With Us
                                </Link>
                            </li>
                            <li onMouseEnter={() => setMegaMenu({ isOpen: false, menuName: '' })}>
                                <Link href="/products" className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">
                                    Combo
                                </Link>
                            </li>
                            <li onMouseEnter={() => setMegaMenu({ isOpen: false, menuName: '' })}>
                                <Link href="/products" className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">
                                    Our Combos
                                </Link>
                            </li>
                            <li onMouseEnter={() => setMegaMenu({ isOpen: false, menuName: '' })}>
                                <Link href="/products" className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">
                                    Make Your Combo
                                </Link>
                            </li>


                            <li onMouseEnter={() => setMegaMenu({ isOpen: false, menuName: '' })}>
                                <Link href="/products" className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">
                                    Customise Your Own
                                </Link>
                            </li>

                            <li onMouseEnter={() => setMegaMenu({ isOpen: false, menuName: '' })}>
                                <Link href="/products" className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">
                                    Brands
                                </Link>
                            </li>
                            {/* Other nav items */}
                        </ul>

                        {/* Mega Menu Dropdown */}
                        {megaMenu.isOpen && megaMenu.menuName === 'home' && (
                            <ShopWithUs />
                        )}
                    </div>
                </section>


            </div>

            <div className="md:hidden  w-full h-[70px] px-4 bg-white border-b border-gray-200 flex items-center justify-between relative">
                {/* Left: hamburger + logo */}
                <div className="flex flex-row items-center gap-1">
                    <div
                        className="hamburger h-auto flex items-center justify-center cursor-pointer"
                        onClick={() => setHamburgerOpen(!hamburgerOpen)}
                    >
                        <HiBars3BottomLeft size={30} />
                    </div>
                    <Image src={logo} alt="Site Logo" height={70} />
                </div>

                {/* Right icons */}
                <div className="icons flex flex-row items-center">
                    <CiSearch size={24} className="ml-3" />
                    <CiHeart size={24} className="ml-3" />
                    <CiShoppingCart size={24} className="ml-3" />
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


        </div>
    )
}

export default Header;


