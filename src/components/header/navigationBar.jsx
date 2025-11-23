"use client";
import Link from "next/link";
import { Suspense, useState } from "react";

const ShopWithUs = () => {
    return (
        <div className="absolute bg-transaparent w-full top-full p-5 ">
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


const NavigationBar = () => {
    const [megaMenu, setMegaMenu] = useState({
        isOpen: false,
        menuName: ''
    });
    return (
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

                    >
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
                    <li>
                        <Link href="/products" className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">
                            Combo
                        </Link>
                    </li>
                    <li>
                        <Link href="/products" className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">
                            Our Combos
                        </Link>
                    </li>
                    <li>
                        <Link href="/products" className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">
                            Make Your Combo
                        </Link>
                    </li>


                    <li>
                        <Link href="/products" className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">
                            Customise Your Own
                        </Link>
                    </li>

                    <li>
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
    )
}

export default NavigationBar;