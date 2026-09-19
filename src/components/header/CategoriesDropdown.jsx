"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import axiosInstance from "@/lib/axiosInstance";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useWishlist } from "@/contexts/WishlistContext";
import logo from "../../../public/ithyaraa-logo.png";

const CategoriesDropdown = () => {
    const [categories, setCategories] = useState([]);
    const [brandsMap, setBrandsMap] = useState({});
    const [categoryProductsMap, setCategoryProductsMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [activeCategory, setActiveCategory] = useState(null);

    const { isInWishlist, toggleWishlist } = useWishlist();

    // Fetch categories and megamenu brands map on mount
    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                setLoading(true);

                const [catRes, mapRes] = await Promise.allSettled([
                    axiosInstance.get("/categories/public?limit=100"),
                    axiosInstance.get("/categories/megamenu-brands")
                ]);

                if (!isMounted) return;

                let fetchedCategories = [];
                if (catRes.status === "fulfilled" && catRes.value?.data?.success && Array.isArray(catRes.value.data.data)) {
                    fetchedCategories = catRes.value.data.data;
                } else {
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

    // Fetch products & single-category brands when activeCategory changes
    useEffect(() => {
        if (!activeCategory || !activeCategory.categoryID) return;
        const catIDStr = String(activeCategory.categoryID);

        let isMounted = true;

        // 1. Fetch single category brands if not available
        if (!brandsMap || !(catIDStr in brandsMap)) {
            axiosInstance.get(`/categories/${activeCategory.categoryID}/brands`)
                .then((res) => {
                    if (isMounted && res.data?.success && Array.isArray(res.data.data)) {
                        setBrandsMap((prev) => ({
                            ...prev,
                            [catIDStr]: res.data.data
                        }));
                    }
                })
                .catch((err) => console.error("Error fetching brands for category:", err));
        }

        // 2. Fetch products if not in categoryProductsMap
        if (!categoryProductsMap[catIDStr]) {
            setLoadingProducts(true);
            axiosInstance.get(`/products/shop`, {
                params: {
                    categoryID: activeCategory.categoryID,
                    limit: 12
                }
            })
                .then((res) => {
                    if (isMounted && res.data?.success && Array.isArray(res.data.data)) {
                        setCategoryProductsMap((prev) => ({
                            ...prev,
                            [catIDStr]: res.data.data
                        }));
                    }
                })
                .catch((err) => console.error("Error fetching products for category:", err))
                .finally(() => {
                    if (isMounted) setLoadingProducts(false);
                });
        }

        return () => {
            isMounted = false;
        };
    }, [activeCategory, brandsMap, categoryProductsMap]);

    const activeCategoryIDStr = activeCategory?.categoryID ? String(activeCategory.categoryID) : "";
    const rawCategoryBrands = activeCategory && brandsMap ? (brandsMap[activeCategoryIDStr] || brandsMap[activeCategory.categoryID] || []) : [];
    const activeCategoryProducts = activeCategory && categoryProductsMap ? (categoryProductsMap[activeCategoryIDStr] || []) : [];

    // Filter inhouse products (ITHYARAA products)
    const inhouseProducts = activeCategoryProducts.filter((p) => {
        if (!p.brandID || p.brandID === "ithyaraa-inhouse") return true;
        const b = String(p.brand || p.brandID).toLowerCase();
        return b === "ithyaraa" || b === "inhouse" || b === "in house" || b === "";
    });

    const hasInhouseProducts = inhouseProducts.length > 0;
    const topIthyaraaPicks = inhouseProducts.slice(0, 4);

    // Build final brands list for "Top Picks from Other Brands" / "Brands Available"
    let displayBrands = [...rawCategoryBrands];

    if (hasInhouseProducts) {
        const ithyaraaExists = displayBrands.some(
            (b) => b.uid === "ithyaraa-inhouse" || b.username?.toLowerCase() === "ithyaraa" || b.name?.toLowerCase() === "ithyaraa"
        );
        if (!ithyaraaExists) {
            displayBrands.unshift({
                uid: "ithyaraa-inhouse",
                username: "ithyaraa",
                name: "Ithyaraa",
                profilePhoto: "/ithyaraa-logo.png",
                verifiedEmail: 1
            });
        }
    }

    // Filter out external partner brands (excluding ithyaraa)
    const otherBrandsList = displayBrands.filter(
        (b) => b.uid !== "ithyaraa-inhouse" && b.username?.toLowerCase() !== "ithyaraa" && b.name?.toLowerCase() !== "ithyaraa"
    );

    // Helper to extract first image URL safely
    const getProductImageUrl = (val) => {
        if (!val) return null;
        try {
            if (Array.isArray(val)) return val[0]?.imgUrl || val[0] || null;
            if (typeof val === "string") {
                const parsed = JSON.parse(val);
                if (Array.isArray(parsed)) return parsed[0]?.imgUrl || parsed[0] || null;
                if (typeof parsed === "object" && parsed?.imgUrl) return parsed.imgUrl;
                if (val.startsWith("http") || val.startsWith("/")) return val;
            }
            return null;
        } catch {
            return typeof val === "string" && (val.startsWith("http") || val.startsWith("/")) ? val : null;
        }
    };

    return (
        <div className="absolute bg-transparent w-full top-full px-4 py-3 z-50 left-0">
            <div className="bg-white rounded-2xl p-5 shadow-2xl border border-gray-150 max-w-6xl mx-auto flex flex-col md:flex-row gap-5 items-stretch min-h-[480px]">
                
                {/* ================= LEFT COLUMN: Categories Sidebar ================= */}
                <div className="w-full md:w-[320px] shrink-0 border-b md:border-b-0 md:border-r border-gray-100 pr-0 md:pr-4 flex flex-col justify-between">
                    <div>
                        {/* Header */}
                        <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <span className="text-[#fb4a6f] text-sm">✦</span>
                                <h3 className="font-bold text-gray-900 text-sm md:text-base">Categories</h3>
                                <span className="bg-[#fff1f2] text-[#fb4a6f] text-[11px] font-semibold px-2 py-0.5 rounded-full">
                                    {categories.length}
                                </span>
                            </div>
                            <Link
                                href="/categories"
                                className="text-xs font-semibold text-[#fb4a6f] hover:underline flex items-center gap-0.5"
                            >
                                View All <span className="text-xs">&rarr;</span>
                            </Link>
                        </div>

                        {/* Loading Skeletons for Categories */}
                        {loading ? (
                            <div className="space-y-2 py-2">
                                {[...Array(7)].map((_, i) => (
                                    <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-gray-50 animate-pulse">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-gray-200 shrink-0" />
                                            <div className="h-4 w-28 bg-gray-200 rounded" />
                                        </div>
                                        <div className="h-3 w-4 bg-gray-200 rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : categories.length === 0 ? (
                            <p className="text-xs text-gray-500 py-6 text-center">No categories found.</p>
                        ) : (
                            /* Category Items List */
                            <div className="max-h-[360px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                {categories.map((category) => {
                                    const isSelected = activeCategory?.categoryID === category.categoryID;

                                    return (
                                        <div
                                            key={category.categoryID}
                                            onMouseEnter={() => setActiveCategory(category)}
                                            onClick={() => setActiveCategory(category)}
                                            className={`group flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all duration-150 ${
                                                isSelected
                                                    ? "bg-[#fff1f2] text-[#fb4a6f] font-bold border-l-4 border-[#fb4a6f] shadow-2xs"
                                                    : "hover:bg-gray-50 text-gray-700 font-medium border-l-4 border-transparent"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                {/* Category Image */}
                                                <div className={`relative w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center transition-transform ${isSelected ? "scale-105" : ""}`}>
                                                    {category.featuredImage ? (
                                                        <Image
                                                            src={category.featuredImage}
                                                            alt={category.categoryName || "Category"}
                                                            fill
                                                            sizes="36px"
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-rose-50 text-[#fb4a6f] font-bold text-xs flex items-center justify-center">
                                                            {(category.categoryName || "C").charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>

                                                <span className={`text-xs md:text-sm truncate ${isSelected ? "font-bold text-[#fb4a6f]" : "text-gray-800"}`}>
                                                    {category.categoryName}
                                                </span>
                                            </div>

                                            <svg
                                                width="14"
                                                height="14"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className={`transition-transform shrink-0 ${
                                                    isSelected ? "text-[#fb4a6f] translate-x-0.5" : "text-gray-300 opacity-0 group-hover:opacity-100"
                                                }`}
                                            >
                                                <polyline points="9 18 15 12 9 6" />
                                            </svg>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Bottom CTA for Left Sidebar */}
                    <div className="pt-3 border-t border-gray-100 mt-2">
                        <Link
                            href="/categories"
                            className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 py-2.5 px-4 rounded-xl text-xs font-semibold text-gray-700 transition-all shadow-2xs"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="7" height="7" rx="1" />
                                <rect x="14" y="3" width="7" height="7" rx="1" />
                                <rect x="14" y="14" width="7" height="7" rx="1" />
                                <rect x="3" y="14" width="7" height="7" rx="1" />
                            </svg>
                            <span>Browse All Categories</span>
                        </Link>
                    </div>
                </div>

                {/* ================= RIGHT COLUMN: Category Content & Products ================= */}
                <div className="flex-1 pl-0 md:pl-2 flex flex-col justify-between">
                    <div>
                        {/* Header for Active Category */}
                        <div className="mb-3">
                            <h4 className="font-bold text-gray-900 text-lg md:text-xl leading-tight">
                                {activeCategory ? activeCategory.categoryName : "Select a Category"}
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Explore {activeCategory ? activeCategory.categoryName.toLowerCase() : "products"} from Ithyaraa and our partner brands
                            </p>
                        </div>

                        {/* 1. TOP PICKS FROM ITHYARAA (Show if in-house products are available) */}
                        {hasInhouseProducts && (
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h5 className="text-xs font-bold text-[#fb4a6f] tracking-wide">
                                        Top Picks from ITHYARAA
                                    </h5>
                                    <Link
                                        href={`/shop?categoryID=${activeCategory.categoryID}`}
                                        className="text-xs font-semibold text-[#fb4a6f] hover:underline flex items-center gap-0.5"
                                    >
                                        View All ITHYARAA &rarr;
                                    </Link>
                                </div>

                                {loadingProducts && topIthyaraaPicks.length === 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {[...Array(4)].map((_, i) => (
                                            <div key={i} className="flex flex-col bg-gray-50 p-2 rounded-xl animate-pulse">
                                                <div className="w-full aspect-[4/4.5] bg-gray-200 rounded-lg mb-2" />
                                                <div className="h-3 w-20 bg-gray-200 rounded mb-1" />
                                                <div className="h-3 w-12 bg-gray-200 rounded" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {topIthyaraaPicks.map((product) => {
                                            const imgUrl = getProductImageUrl(product.featuredImage) || logo.src;
                                            const salePrice = Number(product.salePrice ?? product.regularPrice ?? 0);
                                            const isWishlisted = isInWishlist(product.productID);

                                            return (
                                                <div key={product.productID} className="group relative flex flex-col">
                                                    {/* Product Image Container */}
                                                    <Link
                                                        href={`/products/${product.productID}`}
                                                        className="relative w-full aspect-[4/4.5] rounded-xl overflow-hidden bg-gray-100 border border-gray-100 shadow-2xs group-hover:shadow-md transition-all block"
                                                    >
                                                        <Image
                                                            src={imgUrl}
                                                            alt={product.name || "Product"}
                                                            fill
                                                            sizes="(max-width: 768px) 50vw, 25vw"
                                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />

                                                        {/* Wishlist Icon */}
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                toggleWishlist(product);
                                                            }}
                                                            aria-label="Wishlist"
                                                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors shadow-2xs z-10"
                                                        >
                                                            {isWishlisted ? (
                                                                <FaHeart className="text-red-500 text-[11px]" />
                                                            ) : (
                                                                <FaRegHeart className="text-gray-500 hover:text-red-500 text-[11px]" />
                                                            )}
                                                        </button>
                                                    </Link>

                                                    {/* Product Details */}
                                                    <Link href={`/products/${product.productID}`} className="mt-1.5 block">
                                                        <h6 className="text-xs font-medium text-gray-800 truncate group-hover:text-[#fb4a6f] transition-colors">
                                                            {product.name}
                                                        </h6>
                                                        <p className="text-xs font-bold text-gray-900 mt-0.5">
                                                            ₹{salePrice.toLocaleString("en-IN")}
                                                        </p>
                                                    </Link>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 2. TOP PICKS FROM OTHER BRANDS / AVAILABLE BRANDS */}
                        <div className="mb-3">
                            <div className="flex items-center justify-between mb-2">
                                <h5 className="text-xs font-bold text-gray-900 tracking-wide">
                                    {otherBrandsList.length > 0 ? "Top Picks from Other Brands" : "Brands Available"}
                                </h5>
                                <Link
                                    href="/brands"
                                    className="text-xs font-semibold text-gray-600 hover:underline flex items-center gap-0.5"
                                >
                                    View All Brands &rarr;
                                </Link>
                            </div>

                            {displayBrands.length === 0 ? (
                                <p className="text-xs text-gray-400 py-3 italic">No brand partners currently listed for this category.</p>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {displayBrands.slice(0, 4).map((brand) => {
                                        const brandName = brand.name || brand.username || "Brand";
                                        const isIthyaraaInhouse = brand.uid === "ithyaraa-inhouse" || brand.username?.toLowerCase() === "ithyaraa";
                                        const brandHref = isIthyaraaInhouse
                                            ? `/shop?categoryID=${activeCategory?.categoryID}`
                                            : `/brands/${brand.uid}`;

                                        return (
                                            <Link
                                                key={brand.uid}
                                                href={brandHref}
                                                className="group flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-gray-150 shadow-2xs hover:border-pink-200 hover:shadow-sm transition-all text-center min-h-[72px]"
                                            >
                                                {brand.profilePhoto ? (
                                                    <div className="relative w-8 h-8 rounded-full overflow-hidden mb-1">
                                                        <Image
                                                            src={brand.profilePhoto}
                                                            alt={brandName}
                                                            fill
                                                            sizes="32px"
                                                            className="object-cover group-hover:scale-110 transition-transform"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-bold text-xs flex items-center justify-center mb-1">
                                                        {brandName.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <span className="text-[11px] font-semibold text-gray-800 group-hover:text-[#fb4a6f] transition-colors truncate w-full">
                                                    {brandName}
                                                </span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* 3. BOTTOM PROMO BANNER BOX */}
                        <div className="rounded-xl p-4 bg-[#fffbeb] border border-[#fef3c7] flex items-center justify-between relative overflow-hidden mt-3 shadow-2xs min-h-[100px]">
                            <div className="z-10 flex flex-col justify-center max-w-[65%]">
                                <h6 className="text-xs font-bold text-gray-900">
                                    No partner brands in this category?
                                </h6>
                                <p className="text-[11px] text-gray-600 mt-0.5 mb-2.5">
                                    Explore all ITHYARAA products in this category.
                                </p>
                                <Link
                                    href={`/shop?categoryID=${activeCategory?.categoryID}`}
                                    className="inline-flex items-center gap-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all shadow-2xs w-fit"
                                >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                        <line x1="3" y1="6" x2="21" y2="6" />
                                        <path d="M16 10a4 4 0 0 1-8 0" />
                                    </svg>
                                    <span>Shop ITHYARAA {activeCategory?.categoryName || "Products"} &rarr;</span>
                                </Link>
                            </div>

                            {/* Right side banner clothing rack image */}
                            <div className="absolute right-0 top-0 bottom-0 w-[35%] overflow-hidden pointer-events-none">
                                <Image
                                    src="/clothing_rack_banner.jpg"
                                    alt="Clothing Rack"
                                    fill
                                    sizes="250px"
                                    className="object-cover object-center"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer text notice */}
                    <div className="pt-2 text-[11px] text-gray-400 text-left">
                        Showing products from ITHYARAA and partner brands
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CategoriesDropdown;
