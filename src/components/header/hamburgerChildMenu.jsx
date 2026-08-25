'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import { FaCaretUp, FaCaretDown } from "react-icons/fa6";
import axiosInstance from "@/lib/axiosInstance";

const initialMenuItems = [
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
        isBrandSection: true,
        subItems: [],
    },
    {
        label: "MAKE YOUR COMBO",
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
    },
    {
        label: "PROFILE",
        href: "/profile",
        subItems: [],
    }
];

const HamburgerChildMenu = () => {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [brandSubItems, setBrandSubItems] = useState([]);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const res = await axiosInstance.get("/admin/brands");
                if (res.data?.success && Array.isArray(res.data.data)) {
                    const topBrands = res.data.data.slice(0, 6).map((b) => ({
                        label: (b.name || b.username || "Brand").toUpperCase(),
                        href: `/brands/${b.uid}`
                    }));
                    topBrands.push({ label: "VIEW ALL BRANDS →", href: "/brands" });
                    setBrandSubItems(topBrands);
                }
            } catch (err) {
                console.error("Error fetching brands for mobile menu:", err);
            }
        };
        fetchBrands();
    }, []);

    return (
        <div className="hamburger-child-list">
            <ul className="flex flex-col gap-2">
                {initialMenuItems.map((item, idx) => {
                    const subItems = item.isBrandSection ? brandSubItems : item.subItems;

                    return (
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
                                {subItems.length > 0 && (
                                    <span>{openDropdown === idx ? <FaCaretUp /> : <FaCaretDown />}</span>
                                )}
                            </div>
                            {subItems.length > 0 && openDropdown === idx && (
                                <ul className="ml-4 mt-2 flex flex-col">
                                    {subItems.map((sub) => (
                                        <li key={sub.label} className="border-l-1 border-[#c0c0c0] p-2">
                                            <Link
                                                href={sub.href}
                                                className="text-gray-600 hover:text-primary text-xs"
                                            >
                                                {sub.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default HamburgerChildMenu;