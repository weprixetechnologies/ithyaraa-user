"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import axiosInstance from "@/lib/axiosInstance";

const CategoriesDropdown = () => {
    const [categories, setCategories] = useState([]);
    const [brandsMap, setBrandsMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch categories and categories-brands map concurrently
                const [catRes, mapRes] = await Promise.allSettled([
                    axiosInstance.get("/categories/public?limit=100"),
                    axiosInstance.get("/categories/brands-map")
                ]);

                if (!isMounted) return;

                let fetchedCategories = [];
                if (catRes.status === "fulfilled" && catRes.value?.data?.success && Array.isArray(catRes.value.data.data)) {
                    fetchedCategories = catRes.value.data.data;
                } else {
                    // Fallback to filters endpoint if public categories fails
                    const filterRes = await axiosInstance.get("/filters");
                    if (filterRes.data?.success && Array.isArray(filterRes.data.data?.categories)) {
                        fetchedCategories = filterRes.data.data.categories;
                    }
                }

                setCategories(fetchedCategories);
                if (fetchedCategories.length > 0) {
                    setActiveCategory(fetchedCategories[0]);
                }

                if (mapRes.status === "fulfilled" && mapRes.value?.data?.success && mapRes.value.data.data) {
                    setBrandsMap(mapRes.value.data.data);
                }
            } catch (error) {
                console.error("Error fetching data for Categories MegaMenu:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);

    // Fallback: fetch brands for active category dynamically if not present in bulk brandsMap
    useEffect(() => {
        if (!activeCategory || !activeCategory.categoryID) return;
        const catIDStr = String(activeCategory.categoryID);

        // If category is already in brandsMap with items or explicitly loaded, skip
        if (brandsMap && catIDStr in brandsMap && brandsMap[catIDStr]?.length > 0) return;

        let isMounted = true;
        const fetchSingleCategoryBrands = async () => {
            try {
                const res = await axiosInstance.get(`/categories/${activeCategory.categoryID}/brands`);
                if (isMounted && res.data?.success && Array.isArray(res.data.data)) {
                    setBrandsMap((prev) => ({
                        ...prev,
                        [catIDStr]: res.data.data
                    }));
                }
            } catch (err) {
                console.error("[CategoriesDropdown] Error fetching brands for category:", err);
            }
        };

        fetchSingleCategoryBrands();

        return () => {
            isMounted = false;
        };
    }, [activeCategory, brandsMap]);

    // Get brands for current active category
    const activeCategoryIDStr = activeCategory?.categoryID ? String(activeCategory.categoryID) : "";
    const activeBrands = activeCategory && brandsMap ? (brandsMap[activeCategoryIDStr] || brandsMap[activeCategory.categoryID] || []) : [];

    return (
        <div className="absolute bg-transparent w-full top-full px-5 py-4 z-50 left-0">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-150 max-w-6xl mx-auto flex flex-col md:flex-row gap-6 items-stretch min-h-[420px] max-h-[520px]">
                {/* Left Side: Categories List */}
                <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-100 pr-0 md:pr-4 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <span className="text-[#ff7aa2] text-sm">✦</span>
                                <h3 className="font-semibold text-gray-900 text-base">Categories</h3>
                                <span className="bg-[#ff7aa2]/10 text-[#ff7aa2] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                    {categories.length}
                                </span>
                            </div>
                            <Link
                                href="/categories"
                                className="text-xs font-semibold text-[#fb4a6f] hover:underline"
                            >
                                View All &rarr;
                            </Link>
                        </div>

                        {loading ? (
                            <div className="space-y-2 py-1">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 animate-pulse">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-200" />
                                            <div className="h-4 w-24 bg-gray-200 rounded" />
                                        </div>
                                        <div className="h-3 w-8 bg-gray-200 rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : categories.length === 0 ? (
                            <p className="text-xs text-gray-500 py-6 text-center">No categories found.</p>
                        ) : (
                            <div className="max-h-[360px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                {categories.map((category) => {
                                    const isSelected = activeCategory?.categoryID === category.categoryID;
                                    const catIDStr = String(category.categoryID);
                                    const categoryBrands = brandsMap[catIDStr] || brandsMap[category.categoryID] || [];
                                    const brandCount = categoryBrands.length;

                                    return (
                                        <div
                                            key={category.categoryID}
                                            onMouseEnter={() => setActiveCategory(category)}
                                            className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                                                isSelected
                                                    ? "bg-pink-50/80 text-[#fb4a6f] shadow-xs border-l-4 border-[#fb4a6f]"
                                                    : "hover:bg-gray-50 text-gray-700 hover:text-gray-900 border-l-4 border-transparent"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                {/* Category Image / Avatar */}
                                                <div className={`relative w-8 h-8 rounded-lg overflow-hidden shrink-0 flex items-center justify-center transition-transform duration-200 ${isSelected ? "scale-105" : ""}`}>
                                                    {category.featuredImage ? (
                                                        <Image
                                                            src={category.featuredImage}
                                                            alt={category.categoryName || "Category"}
                                                            fill
                                                            sizes="32px"
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-pink-100 text-[#fb4a6f] font-bold text-xs flex items-center justify-center">
                                                            {(category.categoryName || "C").charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>

                                                <Link
                                                    href={`/shop?categoryID=${category.categoryID}`}
                                                    className="text-xs md:text-sm font-medium truncate"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {category.categoryName}
                                                </Link>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                {brandCount > 0 && (
                                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors ${
                                                        isSelected
                                                            ? "bg-[#fb4a6f] text-white"
                                                            : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                                                    }`}>
                                                        {brandCount} {brandCount === 1 ? 'brand' : 'brands'}
                                                    </span>
                                                )}
                                                <svg
                                                    width="12"
                                                    height="12"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className={`transition-transform duration-200 ${
                                                        isSelected ? "translate-x-0.5 text-[#fb4a6f]" : "text-gray-400 opacity-0 group-hover:opacity-100"
                                                    }`}
                                                >
                                                    <polyline points="9 18 15 12 9 6" />
                                                </svg>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Bottom CTA for Left Column */}
                    <div className="pt-3 border-t border-gray-100">
                        <Link
                            href="/categories"
                            className="text-xs font-semibold text-gray-600 hover:text-[#fb4a6f] flex items-center justify-between"
                        >
                            <span>Browse All Categories</span>
                            <span>&rarr;</span>
                        </Link>
                    </div>
                </div>

                {/* Right Side: Available Brands for Hovered Category */}
                <div className="flex-1 pl-0 md:pl-2 flex flex-col justify-between">
                    <div>
                        {/* Header for Right Side */}
                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                            <div>
                                <span className="text-[10px] font-bold tracking-wider uppercase text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">
                                    Brands Available
                                </span>
                                <h4 className="font-bold text-gray-900 text-sm md:text-base leading-snug mt-1">
                                    {activeCategory ? activeCategory.categoryName : "Select a Category"}
                                </h4>
                            </div>

                            {activeCategory && (
                                <Link
                                    href={`/shop?categoryID=${activeCategory.categoryID}`}
                                    className="text-xs font-semibold text-[#fb4a6f] hover:underline flex items-center gap-1 bg-pink-50/60 px-3 py-1.5 rounded-full border border-pink-100"
                                >
                                    Explore Category Products &rarr;
                                </Link>
                            )}
                        </div>

                        {/* Brands Grid Content */}
                        {loading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="flex flex-col items-center p-3 rounded-xl bg-gray-50 animate-pulse">
                                        <div className="w-12 h-12 rounded-full bg-gray-200 mb-2" />
                                        <div className="h-3 w-16 bg-gray-200 rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : !activeCategory ? (
                            <p className="text-xs text-gray-500 py-12 text-center">Hover over a category on the left to see brands.</p>
                        ) : activeBrands.length === 0 ? (
                            /* Empty State when Category has no partner brands */
                            <div className="py-10 text-center flex flex-col items-center justify-center bg-gray-50/60 rounded-2xl border border-dashed border-gray-200 p-6">
                                <div className="w-12 h-12 bg-pink-50 text-[#fb4a6f] rounded-full flex items-center justify-center mb-3">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                        <line x1="3" y1="6" x2="21" y2="6" />
                                        <path d="M16 10a4 4 0 0 1-8 0" />
                                    </svg>
                                </div>
                                <h5 className="font-semibold text-gray-800 text-sm">No Specific Brands Listed</h5>
                                <p className="text-xs text-gray-500 max-w-sm mt-1 mb-4">
                                    There are currently no partner brands explicitly tagged under <span className="font-medium text-gray-700">{activeCategory.categoryName}</span>, but products are available!
                                </p>
                                <Link
                                    href={`/shop?categoryID=${activeCategory.categoryID}`}
                                    className="bg-gray-900 hover:bg-[#fb4a6f] text-white text-xs font-semibold py-2 px-4 rounded-xl transition-colors shadow-xs"
                                >
                                    Browse {activeCategory.categoryName} Collection
                                </Link>
                            </div>
                        ) : (
                            /* Brands Grid */
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[340px] overflow-y-auto pr-1">
                                {activeBrands.map((brand) => {
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
                                                        <span className="font-bold text-gray-700 text-xs">{initial}</span>
                                                    )}
                                                </div>

                                                {brand.verifiedEmail === 1 && (
                                                    <span className="absolute -bottom-0.5 -right-0.5 bg-[#00b894] text-white p-0.5 rounded-full border border-white" title="Verified Brand">
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

                    {/* Bottom Info Banner */}
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                        <span>Showing brands for <strong className="text-gray-800">{activeCategory?.categoryName}</strong></span>
                        <Link href="/brands" className="text-[#fb4a6f] hover:underline font-semibold">
                            Explore All Brands &rarr;
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoriesDropdown;
