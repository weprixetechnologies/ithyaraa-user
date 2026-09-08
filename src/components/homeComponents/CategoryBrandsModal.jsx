"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://backend.ithyaraa.com/api";

const CategoryBrandsModal = ({ isOpen, onClose, category, categoryBrandsMap = {} }) => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const categoryID = category?.categoryID ? String(category.categoryID) : null;
    const categoryName = category?.categoryName || "Category";

    useEffect(() => {
        if (!isOpen || !categoryID) {
            setBrands([]);
            return;
        }

        // Check if brands exist in pre-fetched categoryBrandsMap prop
        if (categoryBrandsMap && categoryBrandsMap[categoryID]) {
            setBrands(categoryBrandsMap[categoryID]);
            setLoading(false);
            setError(null);
            return;
        }

        // Fallback: fetch dynamically from API
        let isMounted = true;
        const fetchCategoryBrands = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch(`${API_BASE}/categories/${categoryID}/brands`);
                if (!res.ok) throw new Error("Failed to fetch brands");
                const json = await res.json();
                if (isMounted) {
                    if (json.success && Array.isArray(json.data)) {
                        setBrands(json.data);
                    } else {
                        setBrands([]);
                    }
                }
            } catch (err) {
                console.error("[CategoryBrandsModal] Error fetching brands:", err);
                if (isMounted) {
                    setError("Failed to load brands. Please try again.");
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchCategoryBrands();

        return () => {
            isMounted = false;
        };
    }, [isOpen, categoryID, categoryBrandsMap]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal Window */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: "spring", duration: 0.3, bounce: 0.1 }}
                    className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-10 flex flex-col max-h-[85vh]"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#ff7aa2]">
                                Partner Brands
                            </span>
                            <h3 className="text-lg font-bold text-gray-900 leading-snug">
                                {categoryName}
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
                            aria-label="Close modal"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content Body */}
                    <div className="p-6 overflow-y-auto flex-1">
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl animate-pulse">
                                        <div className="w-12 h-12 bg-gray-200 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-200 rounded w-1/3" />
                                            <div className="h-3 bg-gray-200 rounded w-1/4" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="py-8 text-center text-red-500 text-sm">
                                {error}
                            </div>
                        ) : brands.length === 0 ? (
                            <div className="py-12 text-center text-gray-500 flex flex-col items-center justify-center">
                                <div className="w-14 h-14 bg-pink-50 text-[#ff7aa2] rounded-full flex items-center justify-center mb-3">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0a2 2 0 012-2v-5a2 2 0 012-2h2a2 2 0 012 2v5a2 2 0 012 2m-6 0h6" />
                                    </svg>
                                </div>
                                <p className="font-semibold text-gray-800 text-base">No Brands Found</p>
                                <p className="text-xs text-gray-500 max-w-xs mt-1">
                                    There are currently no active partner brands registered under {categoryName}.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {brands.map((brand) => (
                                    <div
                                        key={brand.uid}
                                        className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 bg-white hover:bg-gray-50/80 hover:border-gray-200 transition-all group"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            {/* Profile Photo */}
                                            <div className="relative w-11 h-11 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                                                {brand.profilePhoto ? (
                                                    <Image
                                                        src={brand.profilePhoto}
                                                        alt={brand.name || "Brand logo"}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-[#ff7aa2]/10 text-[#ff7aa2] font-bold text-sm">
                                                        {(brand.name || "B").charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Brand Info */}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5">
                                                    <h4 className="font-semibold text-gray-900 text-sm truncate group-hover:text-[#fb4a6f] transition-colors">
                                                        {brand.name || "Brand"}
                                                    </h4>
                                                    {brand.verifiedEmail === 1 && (
                                                        <span className="text-blue-500 shrink-0" title="Verified Brand">
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 .723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                        </span>
                                                    )}
                                                </div>
                                                {brand.username && (
                                                    <p className="text-xs text-gray-500 truncate">
                                                        @{brand.username}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <a
                                            href={`/brands/${brand.uid}`}
                                            onClick={onClose}
                                            className="ml-3 shrink-0 text-xs font-semibold text-gray-800 bg-gray-100 hover:bg-[#fb4a6f] hover:text-white px-3.5 py-1.5 rounded-full transition-all shadow-sm flex items-center gap-1"
                                        >
                                            View Brand
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CategoryBrandsModal;
