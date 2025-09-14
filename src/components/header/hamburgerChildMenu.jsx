'use client'

import { useState } from "react";
import Link from "next/link";
import { FaCaretUp, FaCaretDown } from "react-icons/fa6";
const hamburgerMenuItems = [
    {
        label: "Home",
        href: "/",
        subItems: [],
    },
    {
        label: "Shop With Us",
        href: "/products",
        subItems: [
            { label: "Dresses", href: "/products/western" },
            { label: "Top Picks", href: "/products/western" },
            { label: "Ethnic Wear", href: "/products/ethnic" },
            { label: "Celeb Choices", href: "/products/western" }
        ],
    },
    {
        label: "Combo",
        href: "/products",
        subItems: [
            { label: "Make Your Combo", href: "/products/combo/make" },
            { label: "Try Our Combo", href: "/products/combo/try" },
        ],
    },
    {
        label: "Our Combo",
        href: "/",
        subItems: [],
    },
    {
        label: "Make Your Combo",
        href: "/",
        subItems: [],
    },
    {
        label: "Customise Product",
        href: "/",
        subItems: [],
    },
    {
        label: "Offers",
        href: "/offers",
        subItems: [],
    },
    {
        label: "Categories",
        href: "/categories",
        subItems: [],
    },
    // ...other items
];

const HamburgerChildMenu = () => {
    const [openDropdown, setOpenDropdown] = useState(null);

    return (
        <div className="hamburger-child-list">
            <ul className="flex flex-col gap-2">
                {hamburgerMenuItems.map((item, idx) => (
                    <li
                        key={item.label}
                        className="relative text-sm font-medium hover:text-gray-900 py-2 border-b border-gray-200"
                    >
                        <div
                            className="flex justify-between items-center cursor-pointer"
                            onClick={() =>
                                setOpenDropdown(openDropdown === idx ? null : idx)
                            }
                        >
                            <Link href={item.href} className="text-black">{item.label}</Link>
                            {item.subItems.length > 0 && (
                                <span>{openDropdown === idx ? <FaCaretUp /> : <FaCaretDown />}</span>
                            )}
                        </div>
                        {item.subItems.length > 0 && openDropdown === idx && (
                            <ul className="ml-4 mt-2 flex flex-col ">
                                {item.subItems.map((sub) => (
                                    <li key={sub.label} className="border-l-1 border-[#c0c0c0] p-2">
                                        <Link
                                            href={sub.href}
                                            className=" text-gray-600 hover:text-primary"
                                        >
                                            {sub.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default HamburgerChildMenu;