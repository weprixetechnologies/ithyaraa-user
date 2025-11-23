import Link from "next/link";
import Image from "next/image";
import logo from "../../../public/ithyaraa-logo.png";
import ShopWithUs from "./ShopWithUsServer";

export default function HeaderServer({ megaMenuOpen, megaMenuName }) {
    return (
        <div className="w-full h-auto flex-col md:flex hidden">
            {/* Top Bar */}
            <div className="w-full bg-primary py-3 flex flex-row justify-between items-center px-4">
                <p className="text-xs text-white">Enjoy Free Delivery on Orders Over 500 INR</p>
                <div className="flex flex-row items-center gap-4">
                    <Link href="/track-order" className="text-xs text-white hover:text-gray-300">Track Your Order</Link>
                    <Link href="/join-newsletter" className="text-xs text-white hover:text-gray-300">Join Our Newsletters</Link>
                    <Link href="/download-mobile" className="text-xs text-white hover:text-gray-300">Download Our Mobile Application</Link>
                </div>
            </div>

            {/* Logo & Search placeholder */}
            <nav className="flex justify-center bg-white">
                <section className="flex w-[80%] justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Image src={logo} alt="Site Logo" width={150} height={50} />
                    </div>
                    <div className="flex gap-4 flex-row items-center">
                        {/* Placeholder for client-side search/icons */}
                    </div>
                </section>
            </nav>

            {/* Navigation Bar */}
            <section
                className="w-full h-auto py-1 relative"
                style={{
                    background: "#FFF",
                    backgroundImage: "linear-gradient(102deg,rgba(255,255,255,1) 0%, rgba(234,234,234,1) 28%, rgba(234,234,234,1) 71%, rgba(255,255,255,1) 100%)"
                }}
            >
                <div className="relative flex justify-center">
                    <ul className="flex flex-row items-center gap-10 px-4 min-w-max overflow-x-auto">
                        <li><Link href="/" className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">Home</Link></li>
                        <li><Link href="/products" className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">Shop With Us</Link></li>
                        <li><Link href="/products" className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">Combo</Link></li>
                        <li><Link href="/products" className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">Our Combos</Link></li>
                        <li><Link href="/products" className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">Make Your Combo</Link></li>
                        <li><Link href="/products" className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">Customise Your Own</Link></li>
                        <li><Link href="/products" className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">Brands</Link></li>
                    </ul>

                    {/* Mega Menu */}
                    {megaMenuOpen && megaMenuName === "home" && <ShopWithUs />}
                </div>
            </section>
        </div>
    );
}
