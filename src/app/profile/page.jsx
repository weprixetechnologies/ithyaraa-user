"use client"
import React, { useState } from "react"
import Image from "next/image"
import { CgProfile } from "react-icons/cg";
import { IoExitOutline } from "react-icons/io5";
import AccountDetail from "@/components/profile/accountDetail";
import Addresses from "@/components/profile/addresses";
import GiftCard from "@/components/profile/giftcard";
import { useRouter } from "next/navigation";

const ProfilePage = () => {
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
    return (
        <div className="flex w-full justify-center">

            <div className="grid grid-cols-12 w-[90%] items-start py-5 gap-2">
                {/* Tab buttons */}
                <div className="flex flex-col border border-gray-200 mb-4 col-span-3 px-2 py-2">
                    <div className="flex flex-col items-center w-full">
                        <Image unoptimized alt="Profile Image" src={'https://images.bewakoof.com/uploads/grid/app/1x1-trackpantsjoggers-men-gif-ezgif-com-optimize-1755442861.gif'} height={100} width={100} className="rounded-full p-2 ring-1:" ></Image>
                        <p className="text-sm font-medium">Ronit Sarkar</p>
                        <p className="text-xs text-secondary underline cursor-pointer mb-3">edit</p>
                    </div>
                    <div className="profile-options flex flex-col items-center w-full px-2 gap-2 mt-5">
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
                                Apply Affiliate
                            </p>
                        </section>
                        <button className="flex justify-between text-white border-none items-center w-full cursor-pointer bg-red-500 p-3 rounded-lg" onClick={redirectToLogin}>
                            {/* <CgProfile size={20} /> */}
                            <p className="text-[15px] text-white hover:text-gray-500 font-normal ">
                                Logout
                            </p>
                            <IoExitOutline size={20} />
                        </button>

                    </div>
                </div>

                {/* Tab content */}
                <div className="  col-span-9 ">
                    {activeTab === "accountdetail" && <AccountDetail />}
                    {activeTab === "addresses" && <Addresses />}
                    {activeTab === "giftcard" && <GiftCard />}
                    {activeTab === "applyaffiliate" && <GiftCard />}
                </div>
            </div>
        </div>
    )
}

export default ProfilePage
