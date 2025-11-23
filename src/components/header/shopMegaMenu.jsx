const { useState } = require("react");

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

const ShopMegaMenu = () => {
    const [megaMenu, setMegaMenu] = useState({
        isOpen: false,
        menuName: ''
    });
    return (
        <li
            className="relative"

        >
            <Link href="/" className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">
                Home
            </Link>
        </li>
    )
}
export default ShopMegaMenu;