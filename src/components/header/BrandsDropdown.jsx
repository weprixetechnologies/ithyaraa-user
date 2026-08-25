"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import axiosInstance from "@/lib/axiosInstance";

const BrandsDropdown = () => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                setLoading(true);
                const res = await axiosInstance.get("/admin/brands");
                if (res.data?.success && Array.isArray(res.data.data)) {
                    setBrands(res.data.data);
                }
            } catch (error) {
                console.error("Error fetching brands in BrandsDropdown:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBrands();
    }, []);

    // Show top 8-10 brands in dropdown
    const displayBrands = brands.slice(0, 10);

    return (
        <div className="absolute bg-transparent w-full top-full px-5 py-4 z-50 left-0">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-150 max-w-5xl mx-auto flex flex-col md:flex-row gap-6 items-stretch">
                {/* Left Side: Brand Highlights / Grid */}
                <div className="flex-1">
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <span className="text-[#ff7aa2] text-sm">✦</span>
                            <h3 className="font-semibold text-gray-900 text-base">Partner Brands</h3>
                            <span className="bg-[#ff7aa2]/10 text-[#ff7aa2] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                Featured
                            </span>
                        </div>
                        <Link
                            href="/brands"
                            className="text-xs font-semibold text-[#fb4a6f] hover:underline flex items-center gap-1"
                        >
                            View All Brands ({brands.length}) &rarr;
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="flex flex-col items-center p-3 rounded-xl bg-gray-50 animate-pulse">
                                    <div className="w-12 h-12 rounded-full bg-gray-200 mb-2" />
                                    <div className="h-3 w-16 bg-gray-200 rounded" />
                                </div>
                            ))}
                        </div>
                    ) : displayBrands.length === 0 ? (
                        <p className="text-xs text-gray-500 py-4 text-center">No brands available at the moment.</p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                            {displayBrands.map((brand) => {
                                const brandName = brand.name || brand.username || "Brand";
                                const initial = brandName.charAt(0).toUpperCase();

                                return (
                                    <Link
                                        key={brand.uid}
                                        href={`/brands/${brand.uid}`}
                                        className="group flex flex-col items-center p-3 rounded-xl bg-gray-50 hover:bg-pink-50/50 hover:shadow-sm border border-transparent hover:border-pink-100 transition-all text-center"
                                    >
                                        <div className="relative w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-[#fb4a6f] to-[#ffb6c6] mb-2 shadow-xs">
                                            <div className="w-full h-full rounded-full overflow-hidden relative bg-white flex items-center justify-center">
                                                {brand.profilePhoto ? (
                                                    <Image
                                                        src={brand.profilePhoto}
                                                        alt={brandName}
                                                        fill
                                                        sizes="48px"
                                                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <span className="font-bold text-gray-700 text-sm">{initial}</span>
                                                )}
                                            </div>

                                            {brand.verifiedEmail === 1 && (
                                                <span className="absolute -bottom-0.5 -right-0.5 bg-[#00b894] text-white p-0.5 rounded-full border border-white">
                                                    <svg width="8" height="8" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs font-medium text-gray-800 group-hover:text-[#fb4a6f] transition-colors line-clamp-1 w-full">
                                            {brandName}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right Side: Featured Banner Card */}
                <div className="w-full md:w-56 bg-gradient-to-br from-pink-50 via-amber-50 to-rose-50 rounded-xl p-4 flex flex-col justify-between border border-pink-100">
                    <div>
                        <span className="text-[10px] font-bold tracking-wider uppercase text-pink-600 bg-white/80 px-2 py-0.5 rounded-full inline-block mb-2">
                            Explore
                        </span>
                        <h4 className="font-bold text-gray-900 text-sm leading-snug mb-1">
                            Curated Fashion Collections
                        </h4>
                        <p className="text-xs text-gray-600 leading-relaxed">
                            Discover exclusive designs directly from verified partner brands & independent labels.
                        </p>
                    </div>

                    <Link
                        href="/brands"
                        className="mt-4 w-full text-center bg-gray-900 hover:bg-[#fb4a6f] text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors shadow-xs"
                    >
                        Explore All Brands
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default BrandsDropdown;
