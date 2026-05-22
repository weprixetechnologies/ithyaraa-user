'use client'

import { useState } from "react";
import Link from "next/link";
import { FaCaretUp, FaCaretDown } from "react-icons/fa6";
const hamburgerMenuItems = [
    {
        label: "HOME",
        href: "/",
        subItems: [],
    },
    {
        label: "SHOP",
        href: "/shop",
        subItems: [
            { label: "UNDER 299", href: "/shop?maxPrice=299" },
            { label: "UNDER 399", href: "/shop?maxPrice=399" },
            { label: "UNDER 599", href: "/shop?maxPrice=599" },
            { label: "UNDER 799", href: "/shop?maxPrice=799" },
            { label: "UNDER 999", href: "/shop?maxPrice=999" }
        ],
    },
    {
        label: "SHOP BY CATEGORIES",
        href: "/categories",
        subItems: [],
    },
    {
        label: "SHOP BY BRAND",
        href: "/brands",
        subItems: [],
    },
    {
        label: "MAKE YOU COMBO",
        href: "/shop?type=make_combo",
        subItems: [],
    },
    {
        label: "OUR COMBO",
        href: "/shop?type=combo",
        subItems: [],
    },
    {
        label: "OFFERS",
        href: "/offers",
        subItems: [],
    },
    {
        label: "FLASH SALE",
        href: "/flash-sale",
        subItems: [],
    }
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