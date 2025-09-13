"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import ShopProductCard from "./ShopProductCard";
import Pagination from "./Pagination";

const ShopProductGrid = ({ products = [], loading = false, pagination = null }) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [suggested, setSuggested] = useState([]);

    const totalItems = pagination?.totalItems ?? products.length;
    const limit = useMemo(() => Number(searchParams.get('limit') || '12'), [searchParams]);

    const updateParams = (updates) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === undefined || value === '') params.delete(key);
            else params.set(key, String(value));
        });
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const clearFilters = () => {
        router.replace(pathname, { scroll: false });
    };

    // When no products and not loading, fetch default shop suggestions
    useEffect(() => {
        const fetchSuggested = async () => {
            try {
                const { data } = await axiosInstance.get(`/products/shop?limit=8&page=1`);
                if (data?.success) setSuggested(data.data || []);
            } catch (e) {
                setSuggested([]);
            }
        };
        if (!loading && (!products || products.length === 0)) fetchSuggested();
    }, [loading, products]);
    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="aspect-square bg-gray-200 animate-pulse" />
                        <div className="p-3">
                            <div className="h-3 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
                            <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!products?.length) {
        return (
            <div className="py-6">
                <div className="text-center">
                    <p className="text-sm md:text-base font-medium">No products found</p>
                    <button
                        onClick={clearFilters}
                        className="mt-3 inline-flex px-3 py-2 text-sm border rounded-md"
                    >
                        Clear Filters
                    </button>
                </div>
                <div className="mt-8">
                    <p className="text-sm font-semibold mb-3">You can check the following</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                        {suggested.map(p => (
                            <ShopProductCard key={p.productID} product={p} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Header with counts and limit selector */}
            <div className="flex items-center justify-between mb-3 border-none">
                <p className="text-xs md:text-sm text-gray-700">
                    Showing {products.length} products of {totalItems} products
                </p>
                {/* Elegant segmented limit selector */}
                <div className="hidden md:flex items-center gap-1 bg-white border rounded-lg p-1">
                    {[12, 24, 48].map(n => (
                        <button
                            key={n}
                            onClick={() => updateParams({ page: 1, limit: n })}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${Number(limit) === n
                                ? 'bg-black text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            aria-pressed={Number(limit) === n}
                        >
                            {n} / page
                        </button>
                    ))}
                </div>
                {/* Mobile dropdown fallback */}
                <div className="md:hidden">
                    <select
                        value={limit}
                        onChange={(e) => updateParams({ page: 1, limit: Number(e.target.value) })}
                        className="text-xs border rounded px-2 py-1 bg-white"
                    >
                        {[12, 24, 48].map(n => (
                            <option key={n} value={n}>{n} / page</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {products.map(p => (
                    <ShopProductCard key={p.productID} product={p} />
                ))}
            </div>
            <Pagination pagination={pagination} />
        </>
    );
};

export default ShopProductGrid;


