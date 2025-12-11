"use client"
import React, { useEffect, useState, Suspense, lazy } from "react"
import Image from "next/image"
import { CgProfile } from "react-icons/cg";
import { IoExitOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import Loading from "@/components/ui/loading";
import { CardSkeleton } from "@/components/ui/skeleton";
import OrderHistory from "@/components/profile/orderHistory";
import PreBookedHistory from "@/components/profile/preBookedHistory";

// Lazy load profile components for code splitting
const AccountDetail = lazy(() => import("@/components/profile/accountDetail"));
const Addresses = lazy(() => import("@/components/profile/addresses"));
const GiftCard = lazy(() => import("@/components/profile/giftcard"));
const ApplyAffiliate = lazy(() => import("@/components/profile/applyAffiliate"));
const Payout = lazy(() => import("@/components/profile/payout"));
const Coins = lazy(() => import("@/components/profile/coins"));

const ProfilePage = () => {
    const [user, setUser] = useState({})
    const [activeTab, setActiveTab] = useState("accountdetail")
    const router = useRouter()
    const redirectToLogin = () => {
        console.log('[redirectToLogin] Clearing cookies and redirecting to login');
        document.cookie = '_at=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = '_rt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

        // Full page reload — no SPA history
        router.push('/login')
    };

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const res = await axiosInstance.get('/user/detail-by-user')
                console.log(res.data);

                setUser(res.data)
            } catch (err) {
                console.error('Error fetching user details:', err)
            }
        }

        fetchUserDetails()
    }, [])

    return (
        <div className="flex w-full justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 items-start py-4 sm:py-5 gap-4 sm:gap-6">
                    {/* Tab buttons */}
                    <div className="lg:col-span-3 order-2 lg:order-1">
                        <div className="bg-white border border-gray-200 rounded-lg mb-4 p-3 sm:p-4">
                            <div className="flex flex-col sm:flex-col items-center w-full">
                                <Image
                                    unoptimized
                                    alt="Profile Image"
                                    src={'https://images.bewakoof.com/uploads/grid/app/1x1-trackpantsjoggers-men-gif-ezgif-com-optimize-1755442861.gif'}
                                    height={80}
                                    width={80}
                                    className="rounded-full p-1 ring-1 sm:w-20 sm:h-20 w-16 h-16"
                                />
                                <p className="text-sm sm:text-base font-medium mt-2">Ronit Sarkar</p>
                                <p className="text-xs text-secondary underline cursor-pointer mb-3">edit</p>
                            </div>
                        </div>

                        {/* Mobile Navigation - Horizontal Scroll */}
                        <div className="lg:hidden mb-4">
                            <div className="flex overflow-x-auto space-x-2 pb-2">
                                {[
                                    { key: 'accountdetail', label: 'Account', icon: <CgProfile size={16} /> },
                                    { key: 'addresses', label: 'Addresses', icon: <CgProfile size={16} /> },
                                    { key: 'orderhistory', label: 'Orders', icon: <CgProfile size={16} /> },
                                    { key: 'prebookedhistory', label: 'Pre-Booked', icon: <CgProfile size={16} /> },
                                    { key: 'coins', label: 'Ithyaraa Coins', icon: <CgProfile size={16} /> },
                                    { key: 'giftcard', label: 'Giftcard', icon: <CgProfile size={16} /> },
                                    { key: 'mycart', label: 'Cart', icon: <CgProfile size={16} /> },
                                    { key: 'mywishlist', label: 'Wishlist', icon: <CgProfile size={16} /> },
                                    { key: 'applyaffiliate', label: user?.affiliate === 'approved' ? 'Affiliate' : 'Apply', icon: <CgProfile size={16} /> },
                                    ...(user?.affiliate === 'approved' ? [{ key: 'payout', label: 'Payout', icon: <CgProfile size={16} /> }] : [])
                                ].map((item) => (
                                    <button
                                        key={item.key}
                                        onClick={() => setActiveTab(item.key)}
                                        className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${activeTab === item.key
                                            ? 'bg-black text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Desktop Navigation - Vertical */}
                        <div className="hidden lg:block bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                            <div className="profile-options flex flex-col items-center w-full px-2 gap-2">
                                <section className={`flex justify-start items-center w-full border border-gray-200 p-3 rounded-lg hover:bg-gray-200 cursor-pointer ${activeTab === 'accountdetail' ? 'bg-black text-white' : 'bg-white text-black'}`} onClick={() => { setActiveTab('accountdetail') }}>
                                    <CgProfile size={20} />
                                    <p className={`text-[15px] font-light hover:text-gray-500 pl-4 `} style={{ fontFamily: "'Poppins', sans-serif" }}>
                                        Account Details
                                    </p>
                                </section>
                                <section className={`flex justify-start hover:bg-gray-200 hover:text-black items-center w-full cursor-pointer border border-gray-200 p-3 rounded-lg ${activeTab === 'addresses' ? 'bg-black text-white' : 'bg-white text-black'}`} onClick={() => { setActiveTab('addresses') }} >
                                    <CgProfile size={20} />
                                    <p className="text-[15px] font-normal pl-4">
                                        Addresses
                                    </p>
                                </section>
                                <section className={`flex justify-start hover:bg-gray-200 hover:text-black items-center w-full cursor-pointer border border-gray-200 p-3 rounded-lg ${activeTab === 'orderhistory' ? 'bg-black text-white' : 'bg-white text-black'}`} onClick={() => { setActiveTab('orderhistory') }} >
                                    <CgProfile size={20} />
                                    <p className="text-[15px] font-normal pl-4">
                                        Order History
                                    </p>
                                </section>
                                <section className={`flex justify-start hover:bg-gray-200 hover:text-black items-center w-full cursor-pointer border border-gray-200 p-3 rounded-lg ${activeTab === 'prebookedhistory' ? 'bg-black text-white' : 'bg-white text-black'}`} onClick={() => { setActiveTab('prebookedhistory') }} >
                                    <CgProfile size={20} />
                                    <p className="text-[15px] font-normal pl-4">
                                        Pre-Booked History
                                    </p>
                                </section>
                                <section className={`flex justify-start hover:bg-gray-200 hover:text-black items-center w-full cursor-pointer border border-gray-200 p-3 rounded-lg ${activeTab === 'coins' ? 'bg-black text-white' : 'bg-white text-black'}`} onClick={() => { setActiveTab('coins') }} >
                                    <CgProfile size={20} />
                                    <p className="text-[15px] font-normal pl-4">
                                        Ithyaraa Coins
                                    </p>
                                </section>
                                <section className={`flex justify-start hover:bg-gray-200 hover:text-black items-center w-full cursor-pointer border border-gray-200 p-3 rounded-lg ${activeTab === 'giftcard' ? 'bg-black text-white' : 'bg-white text-black'}`} onClick={() => { setActiveTab('giftcard') }} >
                                    <CgProfile size={20} />
                                    <p className="text-[15px] font-normal pl-4">
                                        Giftcard
                                    </p>
                                </section>
                                <section className={`flex justify-start hover:bg-gray-200 hover:text-black items-center w-full cursor-pointer border border-gray-200 p-3 rounded-lg ${activeTab === 'mycart' ? 'bg-black text-white' : 'bg-white text-black'}`} onClick={() => { setActiveTab('mycart') }} >
                                    <CgProfile size={20} />
                                    <p className="text-[15px] font-normal pl-4">
                                        My Cart
                                    </p>
                                </section>
                                <section className={`flex justify-start hover:bg-gray-200 hover:text-black items-center w-full cursor-pointer border border-gray-200 p-3 rounded-lg ${activeTab === 'mywishlist' ? 'bg-black text-white' : 'bg-white text-black'}`} onClick={() => { setActiveTab('mywishlist') }} >
                                    <CgProfile size={20} />
                                    <p className="text-[15px] font-normal pl-4">
                                        My Wishlist
                                    </p>
                                </section>
                                <section className={`flex justify-start hover:bg-gray-200 hover:text-black items-center w-full cursor-pointer border border-gray-200 p-3 rounded-lg ${activeTab === 'applyaffiliate' ? 'bg-black text-white' : 'bg-white text-black'}`} onClick={() => { setActiveTab('applyaffiliate') }} >
                                    <CgProfile size={20} />
                                    <p className="text-[15px] font-normal pl-4">
                                        {user?.affiliate === 'approved' ? 'Affiliate Dashboard' : 'Apply Affiliate'}
                                    </p>
                                </section>
                                {user?.affiliate === 'approved' && (
                                    <section className={`flex justify-start hover:bg-gray-200 hover:text-black items-center w-full cursor-pointer border border-gray-200 p-3 rounded-lg ${activeTab === 'payout' ? 'bg-black text-white' : 'bg-white text-black'}`} onClick={() => { setActiveTab('payout') }} >
                                        <CgProfile size={20} />
                                        <p className="text-[15px] font-normal pl-4">
                                            Payout
                                        </p>
                                    </section>
                                )}
                                <button className="flex justify-between text-white border-none items-center w-full cursor-pointer bg-red-500 p-3 rounded-lg" onClick={redirectToLogin}>
                                    <p className="text-[15px] text-white hover:text-gray-500 font-normal ">
                                        Logout
                                    </p>
                                    <IoExitOutline size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tab content */}
                    <div className="lg:col-span-9 order-1 lg:order-2">
                        <div className=" rounded-lg  min-h-[400px]">
                            <Suspense fallback={<CardSkeleton className="h-96" />}>
                                {activeTab === "accountdetail" && <AccountDetail user={user} />}
                                {activeTab === "addresses" && <Addresses />}
                                {activeTab === "orderhistory" && <OrderHistory />}
                                {activeTab === "prebookedhistory" && <PreBookedHistory />}
                                {activeTab === "coins" && <Coins />}
                                {activeTab === "giftcard" && <GiftCard />}
                                {activeTab === "applyaffiliate" && <ApplyAffiliate user={user} />}
                                {activeTab === "payout" && <Payout user={user} />}
                            </Suspense>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfilePage
