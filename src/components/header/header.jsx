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
import { useRouter, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux"
import { getCartAsync } from "@/redux/slices/cartSlice"
import WishlistIcon from "../ui/WishlistIcon"
import { useAuth } from "@/contexts/AuthContext"
import CartDrawer from "../ui/CartDrawer"
import SearchDrawer from "../ui/SearchDrawer"
import menu1 from "../../../public/menu1.jpeg"
import menu2 from "../../../public/menu2.jpeg"
import { motion, AnimatePresence } from "framer-motion"

/* ===== Fullscreen Menu (Desktop Sticky Hamburger) ===== */
const fullscreenMenuItems = [
    { label: 'Home', href: '/' },
    { label: 'Shop With Us', href: '/shop' },
    { label: 'Combo', href: '/shop?type=combo' },
    { label: 'Make Your Combo', href: '/shop?type=make_combo' },
    { label: 'Customise Your Own', href: '/shop?type=customproduct' },
    { label: 'Offers', href: '/offers' },
    { label: 'Categories', href: '/categories' },
    { label: 'Flash Sale', href: '/flash-sale', isSale: true },
    { label: 'Brands', href: '/brands' },
]

const FullscreenMenu = ({ isOpen, onClose }) => {
    const pathname = usePathname()

    // Check if a menu item is currently active
    const isActive = (href) => {
        const cleanHref = href.split('?')[0]
        if (cleanHref === '/') return pathname === '/'
        return pathname === cleanHref || pathname.startsWith(cleanHref + '/')
    }

    // Lock body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fullscreen-menu-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                    {/* Background pattern layer */}
                    <motion.div
                        className="fullscreen-menu-bg"
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 1.05 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    />

                    {/* Close button */}
                    <motion.button
                        className="fullscreen-menu-close"
                        onClick={onClose}
                        initial={{ opacity: 0, rotate: -90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 90 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        whileHover={{ scale: 1.15, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </motion.button>

                    {/* Logo at top */}
                    <motion.div
                        className="fullscreen-menu-logo"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, delay: 0.15 }}
                    >
                        <Image src={logo} alt="Ithyaraa" width={180} height={60} style={{ objectFit: 'contain' }} />
                    </motion.div>

                    {/* Menu items */}
                    <nav className="fullscreen-menu-nav">
                        {fullscreenMenuItems.map((item, index) => (
                            <motion.div
                                key={item.href + item.label}
                                initial={{ opacity: 0, x: -60, filter: 'blur(8px)' }}
                                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, x: 40, filter: 'blur(4px)' }}
                                transition={{
                                    duration: 0.45,
                                    delay: 0.08 + index * 0.06,
                                    ease: [0.22, 1, 0.36, 1]
                                }}
                            >
                                <Link
                                    href={item.href}
                                    className={`fullscreen-menu-item ${item.isSale ? 'fullscreen-menu-sale' : ''} ${isActive(item.href) ? 'fullscreen-menu-active' : ''}`}
                                    onClick={onClose}
                                >
                                    <motion.span
                                        whileHover={{ x: 12, scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                        className="fullscreen-menu-item-inner"
                                    >
                                        <span className="fullscreen-menu-number">0{index + 1}</span>
                                        {item.label}
                                    </motion.span>
                                </Link>
                            </motion.div>
                        ))}
                    </nav>

                    {/* Bottom info */}
                    <motion.div
                        className="fullscreen-menu-footer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, delay: 0.5 }}
                    >
                        <span>Free Shipping above ₹1499</span>
                        <span className="fullscreen-menu-dot">•</span>
                        <span>Easy 7-day Returns</span>
                        <span className="fullscreen-menu-dot">•</span>
                        <span>COD Available</span>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

const ShopWithUs = () => {


    return (
        <div className="absolute bg-transaparent w-full top-full p-5 z-10">
            <div className="bg-muted rounded-2xl grid grid-cols-4 gap-4 ">
                <div className="col-span-2 p-2">
                    <div className="w-full max-w-full grid grid-cols-2 gap-2">
                        <Suspense fallback={<div className="w-full aspect-[222/333] bg-gray-200 animate-pulse rounded-2xl" />}>
                            <div className="relative w-full aspect-[222/333]">
                                <Image
                                    src={menu1}
                                    alt="Category"
                                    fill
                                    className="rounded-2xl object-cover"
                                />
                            </div>
                        </Suspense>
                        <Suspense fallback={<div className="w-full aspect-[222/333] bg-gray-200 animate-pulse rounded-2xl" />}>
                            <div className="relative w-full aspect-[222/333]">
                                <Image
                                    src={menu2}
                                    alt="Category"
                                    fill
                                    className="rounded-2xl object-cover"
                                />
                            </div>
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
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap"><Link href={'/'}>Under 999</Link> </li>
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

const HamburgerMenu = ({ isLoggedIn, user, closeMenu }) => {
    const router = useRouter()

    const handleProfileClick = () => {
        if (closeMenu) closeMenu();
        if (isLoggedIn) {
            router.push('/profile');
        } else {
            router.push('/login');
        }
    };

    return (
        <div className="px-3 py-5">
            {isLoggedIn ? (
                <div
                    className="auth-content-hamburger flex flex-row gap-3 items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    onClick={handleProfileClick}
                >
                    {user?.profilePhoto ? (
                        <Image
                            src={user.profilePhoto}
                            alt="Profile"
                            width={40}
                            height={40}
                            className="h-[40px] w-[40px] rounded-full ring-1 ring-gray-200 object-cover"
                        />
                    ) : (
                        <div className="h-[40px] w-[40px] rounded-full border bg-gray-100 flex items-center justify-center">
                            <IoPersonOutline size={20} className="text-gray-500" />
                        </div>
                    )}
                    <div className="flex flex-col items-start">
                        <p className="text-xs text-gray-500 font-medium">Welcome Back</p>
                        <p className="text-sm font-semibold">{user?.name || user?.username || 'User'}</p>
                    </div>
                </div>
            ) : (
                <button
                    className="w-full text-sm font-medium bg-primary text-white px-4 py-2 rounded hover:bg-secondary transition-colors cursor-pointer"
                    onClick={() => {
                        if (closeMenu) closeMenu();
                        router.push('/login')
                    }}
                >
                    LOGIN / SIGNUP
                </button>
            )}

            <div className="mt-3 bg-secondary h-0.5 opacity-40 mb-3"></div>
            <HamburgerChildMenu />

        </div>)
}

const Header = () => {
    const router = useRouter()
    const pathname = usePathname()
    const [auth, setAuth] = useState(false);
    const [megaMenu, setMegaMenu] = useState({
        isOpen: false,
        menuName: ''
    });

    const [hamburgerOpen, setHamburgerOpen] = useState(false);
    const [cartDrawerOpen, setCartDrawerOpen] = useState(false)
    const [searchDrawerOpen, setSearchDrawerOpen] = useState(false)
    const [showStickyHeader, setShowStickyHeader] = useState(false)
    const [fullscreenMenuOpen, setFullscreenMenuOpen] = useState(false)

    const dispatch = useDispatch()
    const cartCounter = useSelector((state) => state.cart.cartCount)
    const { user, isAuthenticated } = useAuth()
    const isLoggedIn = isAuthenticated

    useEffect(() => {
        if (isLoggedIn && pathname !== '/login') {
            dispatch(getCartAsync())
        }
    }, [isLoggedIn, dispatch, pathname])

    // Scroll detection for sticky header
    useEffect(() => {
        const handleScroll = () => {
            // Show sticky header after scrolling past 150px (past the normal header)
            setShowStickyHeader(window.scrollY > 150)
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div>
            {/* ===== NORMAL DESKTOP HEADER ===== */}
            <div className="w-full h-auto flex-col md:flex hidden z-50 bg-white shadow-md" onMouseLeave={() => setMegaMenu({ isOpen: false, menuName: '' })}>
                {/* Top Bar */}
                <div className="w-full bg-primary py-3 flex flex-row justify-between items-center px-4">
                    <div className="flex-row flex items-center gap-2">
                        <p className="text-xs text-white">
                            Enjoy Free Delivery on Orders Over 999 INR
                        </p>
                    </div>
                    <div className="flex flex-row items-center gap-4">
                        <Link href="/track-order" className="text-xs text-white hover:text-gray-300">
                            Track Your Order
                        </Link>
                        <Link href="/collab" className="text-xs text-white hover:text-gray-300">
                            Collab with Ithyaraa
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
                            <WishlistIcon />
                            <div className="relative cursor-pointer" onClick={() => setCartDrawerOpen(true)}>
                                <LuShoppingCart size={28} />
                                {cartCounter > 0 && (
                                    <span className="absolute -top-3 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                        {cartCounter > 99 ? '99+' : cartCounter}
                                    </span>
                                )}
                            </div>
                            <IoPersonOutline size={24} className="cursor-pointer" onClick={() => (router.push('/profile'))} />
                            <div className="border-l border-black h-6"></div>
                            <div className="section">
                                {isLoggedIn ? (
                                    <aside className="flex flex-col items-center">
                                        <p className="text-xs">Welcome Back</p>
                                        <p className="text-sm font-semibold">{user?.name || user?.username || 'User'}</p>
                                    </aside>
                                ) : (
                                    <button className="text-sm font-medium bg-primary text-white px-4 py-2 rounded hover:bg-secondary transition-colors cursor-pointer" onClick={() => (router.push('/login'))}>
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
                                <Link href="/shop" className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">
                                    Shop With Us
                                </Link>
                            </li>
                            <li onMouseEnter={() => setMegaMenu({ isOpen: false, menuName: '' })}>
                                <Link href="/shop?type=combo" className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">
                                    Combo
                                </Link>
                            </li>
                            {/* <li onMouseEnter={() => setMegaMenu({ isOpen: false, menuName: '' })}>
                                <Link href="/shop?type=combo" className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">
                                    Our Combos
                                </Link>
                            </li> */}
                            <li onMouseEnter={() => setMegaMenu({ isOpen: false, menuName: '' })}>
                                <Link href="/shop?type=make_combo" className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">
                                    Make Your Combo
                                </Link>
                            </li>

                            <li onMouseEnter={() => setMegaMenu({ isOpen: false, menuName: '' })}>
                                <Link href="/offers" className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">
                                    Offers
                                </Link>
                            </li>
                            <li onMouseEnter={() => setMegaMenu({ isOpen: false, menuName: '' })}>
                                <Link href="/categories" className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">
                                    Categories
                                </Link>
                            </li>
                            <li onMouseEnter={() => setMegaMenu({ isOpen: false, menuName: '' })}>
                                <Link
                                    href="/shop?type=customproduct"
                                    className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap"
                                    prefetch={false}
                                >
                                    Customise Your Own
                                </Link>
                            </li>

                            <li
                                className="relative"
                                onMouseEnter={() => setMegaMenu({ isOpen: false, menuName: '' })}>
                                <Link href="/flash-sale" className="text-sm text-red-600 font-bold hover:text-red-700 whitespace-nowrap">
                                    Flash Sale
                                </Link>
                            </li>

                            <li onMouseEnter={() => setMegaMenu({ isOpen: false, menuName: '' })}>
                                <Link
                                    href="/brands"
                                    className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap"
                                    prefetch={false}
                                >
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

            {/* ===== STICKY DESKTOP HEADER (appears on scroll) ===== */}
            <div
                className={`sticky-header-desktop ${showStickyHeader ? 'sticky-header-visible' : 'sticky-header-hidden'}`}
            >
                {/* Top info strip */}
                <div className="sticky-header-top-strip">
                    <div className="sticky-header-inner">
                        <div className="sticky-strip-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>
                            <span>Free Shipping on orders above ₹1499</span>
                        </div>
                        <div className="sticky-strip-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                            <span>Easy 7-day returns</span>
                        </div>
                        <div className="sticky-strip-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
                            <span>Cash on Delivery available</span>
                        </div>
                    </div>
                </div>

                {/* Main sticky nav */}
                <div className="sticky-header-main">
                    <div className="sticky-header-inner">
                        {/* Hamburger + Logo group */}
                        <div className="sticky-header-left-group">
                            {/* Hamburger icon */}
                            <button
                                className="sticky-hamburger-btn"
                                onClick={() => setFullscreenMenuOpen(true)}
                                aria-label="Open menu"
                            >
                                <span className="sticky-hamburger-line" />
                                <span className="sticky-hamburger-line sticky-hamburger-line--short" />
                                <span className="sticky-hamburger-line" />
                            </button>

                            {/* Logo */}
                            <Link href="/" className="sticky-header-logo">
                                <Image src={logo} alt="Ithyaraa" width={200} height={80} style={{ objectFit: 'contain' }} />
                            </Link>
                        </div>

                        {/* Navigation Links */}
                        <nav className="sticky-header-nav">
                            <Link href="/" className="sticky-nav-link">Home</Link>
                            <div className="sticky-nav-dropdown-wrapper">
                                <Link href="/shop" className="sticky-nav-link sticky-nav-dropdown-trigger">
                                    Shop
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sticky-chevron"><polyline points="6 9 12 15 18 9"/></svg>
                                </Link>
                                <div className="sticky-nav-dropdown">
                                    <Link href="/shop?type=customproduct" className="sticky-dropdown-item">Customise Your Own</Link>
                                    <Link href="/shop?type=combo" className="sticky-dropdown-item">Combo</Link>
                                    <Link href="/shop?type=make_combo" className="sticky-dropdown-item">Make Your Combo</Link>
                                </div>
                            </div>
                            <Link href="/offers" className="sticky-nav-link">Offers</Link>
                            <Link href="/categories" className="sticky-nav-link">Categories</Link>
                            <Link href="/flash-sale" className="sticky-nav-link sticky-nav-sale">Flash Sale</Link>
                        </nav>

                        {/* Right section: search + icons */}
                        <div className="sticky-header-actions">
                            <div className="sticky-header-search">
                                <svg className="sticky-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                                <SearchNavbar />
                            </div>
                            <IoPersonOutline
                                size={22}
                                className="sticky-action-icon"
                                onClick={() => router.push('/profile')}
                            />
                            <WishlistIcon />
                            <div className="relative cursor-pointer" onClick={() => setCartDrawerOpen(true)}>
                                <LuShoppingCart size={22} className="sticky-action-icon" />
                                {cartCounter > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                                        {cartCounter > 99 ? '99+' : cartCounter}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== FULLSCREEN MENU (Desktop Sticky Hamburger) ===== */}
            <FullscreenMenu isOpen={fullscreenMenuOpen} onClose={() => setFullscreenMenuOpen(false)} />

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
                <div className="icons flex flex-row items-center gap-3">
                    <div className="cursor-pointer" onClick={() => setSearchDrawerOpen(true)}>
                        <CiSearch size={28} />
                    </div>
                    <WishlistIcon />
                    <div className="relative cursor-pointer" onClick={() => setCartDrawerOpen(true)}>
                        <CiShoppingCart size={28} />
                        {cartCounter > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                {cartCounter > 99 ? '99+' : cartCounter}
                            </span>
                        )}
                    </div>
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
                    <HamburgerMenu isLoggedIn={isLoggedIn} user={user} closeMenu={() => setHamburgerOpen(false)} />
                </div>
            </div>

            {/* Cart Drawer */}
            <CartDrawer isOpen={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />

            {/* Search Drawer */}
            <SearchDrawer isOpen={searchDrawerOpen} onClose={() => setSearchDrawerOpen(false)} />

        </div>
    )
}

export default Header;


