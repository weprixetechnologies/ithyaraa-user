"use client";
import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import axiosInstance from "@/lib/axiosInstance";
import menu1 from "../../../public/menu1.jpeg";
import menu2 from "../../../public/menu2.jpeg";

const ShopWithUs = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axiosInstance.get("/categories/public");
                if (res.data?.success && Array.isArray(res.data.data)) {
                    setCategories(res.data.data);
                } else {
                    const filterRes = await axiosInstance.get("/filters");
                    if (filterRes.data?.success && Array.isArray(filterRes.data.data?.categories)) {
                        setCategories(filterRes.data.data.categories);
                    }
                }
            } catch (error) {
                console.error("Error fetching categories in MegaMenu:", error);
            }
        };

        fetchCategories();
    }, []);

    const getCategoryHref = (title) => {
        if (!title) return "/shop";
        const cleanTitle = title.toLowerCase().trim();
        const normTitle = cleanTitle.replace(/[^a-z0-9]/g, "");

        if (categories.length > 0) {
            // 1. Exact match by categoryName or slug
            let match = categories.find((c) => {
                const cName = (c.categoryName || "").toLowerCase().trim();
                const cSlug = (c.slug || "").toLowerCase().trim();
                return cName === cleanTitle || cSlug === cleanTitle.replace(/\s+/g, "_");
            });

            // 2. Normalized match
            if (!match) {
                match = categories.find((c) => {
                    const cNameNorm = (c.categoryName || "").toLowerCase().replace(/[^a-z0-9]/g, "");
                    return cNameNorm === normTitle;
                });
            }

            // 3. Substring match
            if (!match) {
                match = categories.find((c) => {
                    const cName = (c.categoryName || "").toLowerCase();
                    return cName.includes(cleanTitle) || cleanTitle.includes(cName);
                });
            }

            if (match && match.categoryID) {
                return `/shop?categoryID=${match.categoryID}`;
            }
        }

        // Fallback if categories not loaded yet or not matched
        return `/shop?search=${encodeURIComponent(title)}`;
    };

    return (
        <div className="absolute bg-transparent w-full top-full p-5 z-10">
            <div className="bg-muted rounded-2xl grid grid-cols-4 gap-4 shadow-lg border border-gray-100">
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
                    {/* Column 1: Our Specials & Must try */}
                    <div className="col-span-1 p-4">
                        <p className="text-lg font-semibold text-green-800">Our Specials</p>
                        <ul className="mt-2">
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap">
                                <Link href={getCategoryHref("Ethnic wear")}>Ethnic wear</Link>
                            </li>
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap">
                                <Link href={getCategoryHref("Festive wear")}>Festive wear</Link>
                            </li>
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap">
                                <Link href={getCategoryHref("Office wear")}>Office wear</Link>
                            </li>
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap">
                                <Link href={getCategoryHref("Casual wear")}>Casual wear</Link>
                            </li>
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap">
                                <Link href={getCategoryHref("Western wear")}>Western wear</Link>
                            </li>
                        </ul>

                        <p className="text-lg text-green-800 font-semibold mt-5">Must try</p>
                        <ul className="mt-2">
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap">
                                <Link href={getCategoryHref("Ethnic Wear")}>Ethnic Wear</Link>
                            </li>
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap">
                                <Link href={getCategoryHref("Office wear")}>Office wear</Link>
                            </li>
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap">
                                <Link href={getCategoryHref("Co-ord sets")}>Co-ord sets</Link>
                            </li>
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap">
                                <Link href={getCategoryHref("Trendy Kurtis")}>Trendy Kurtis</Link>
                            </li>
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap">
                                <Link href={getCategoryHref("Trendy Tops")}>Trendy Tops</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 2: Latest arrival & Combo Festive */}
                    <div className="col-span-1 p-4">
                        <p className="text-lg font-semibold text-green-800">Latest arrival</p>
                        <ul className="mt-2">
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap">
                                <Link href="/shop?maxPrice=299">Under 299</Link>
                            </li>
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap">
                                <Link href="/shop?maxPrice=399">Under 399</Link>
                            </li>
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap">
                                <Link href="/shop?maxPrice=599">Under 599</Link>
                            </li>
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap">
                                <Link href="/shop?maxPrice=799">Under 799</Link>
                            </li>
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap">
                                <Link href="/shop?maxPrice=999">Under 999</Link>
                            </li>
                        </ul>

                        <p className="text-lg text-green-800 font-semibold mt-5">Combo Festive</p>
                        <ul className="mt-2">
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap">
                                <Link href="/shop?type=combo">Try our Combo</Link>
                            </li>
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap">
                                <Link href="/shop?type=make_combo">Make your combo</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Trend check & Exclusive for you */}
                    <div className="col-span-1 p-4">
                        <p className="text-lg font-semibold text-green-800">Trend check</p>
                        <ul className="mt-2">
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap">
                                <Link href={getCategoryHref("Co-ord Sets")}>Co-ord Sets</Link>
                            </li>
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap">
                                <Link href={getCategoryHref("Kurtis")}>Kurtis</Link>
                            </li>
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap">
                                <Link href={getCategoryHref("Trendy Tops")}>Trendy Tops</Link>
                            </li>
                        </ul>

                        <p className="text-lg text-green-800 font-semibold mt-5">Exclusive for you</p>
                        <ul className="mt-2">
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap">
                                <Link href="/shop?type=customproduct">Design your own</Link>
                            </li>
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap">
                                <Link href="/presale">Pre-booking</Link>
                            </li>
                            <li className="text-lg mb-1 text-black hover:text-primary-logo-yellow whitespace-nowrap">
                                <Link href="/flash-sale">Flash Deals</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShopWithUs;
