"use client"

import { useEffect, useMemo, useState, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import FilterComponent from "@/components/ui/filterComponent";
import ShopProductGrid from "@/components/ui/ShopProductGrid";
import MobileFilterSheet from "@/components/ui/MobileFilterSheet";
import MobileSortSheet from "@/components/ui/MobileSortSheet";
import axiosInstance from "@/lib/axiosInstance";
import { FaFilter, FaTimes, FaSort, FaChevronUp } from "react-icons/fa";

const ShopContent = () => {
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [showMobileSort, setShowMobileSort] = useState(false);


    const queryString = useMemo(() => searchParams.toString(), [searchParams]);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const { data } = await axiosInstance.get(`/products/shop?${queryString}`);
                if (data?.success) {
                    setProducts(data.data || []);
                    setPagination(data.pagination || null);
                } else {
                    setProducts([]);
                    setPagination(null);
                }
            } catch (e) {
                console.error('Failed to load products', e);
                setProducts([]);
                setPagination(null);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [queryString]);

    return (
        <div className="min-h-screen">
            <div className="md:py-2 flex justify-center flex-col items-center">
                <div className="hidden md:block md:w-[90%]">
                    <p className="text-xs text-[#c0c0c0] font-medium mb-2">
                        Home &gt; Shop
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:w-[90%] px-2  w-full">
                    {/* Desktop Sidebar */}
                    <aside className="hidden md:block md:col-span-3 pr-2 py-3 border-black h-[calc(100vh-70px)] md:h-[calc(100dvh-170px)] overflow-y-auto">
                        <p className="text-xl font-medium mb-2">Filters :</p>
                        <hr className="border-gray-200 mt-2" />
                        <FilterComponent />
                    </aside>

                    {/* Main Content */}

                    <main className="md:col-span-9 py-3 px-2 h-auto md:h-[calc(100dvh-170px)] md:overflow-y-auto">

                        <div className="pb-20 md:pb-3">
                            <ShopProductGrid products={products} loading={loading} pagination={pagination} />
                        </div>
                    </main>
                </div>
            </div>

            {/* Mobile Bottom Action Buttons */}
            <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-b border-black z-50 shadow-2xl" style={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}>
                {/* <div className="p-4 pb-6"> */}
                <div className="grid grid-cols-2 ">
                    <button
                        onClick={() => setShowMobileSort(true)}
                        className="flex items-center justify-center gap-2 py-3 px-4 bg-white text-black  font-medium transition-colors "
                    >
                        <FaSort size={16} />
                        <span>Sort</span>
                    </button>
                    <button
                        onClick={() => setShowMobileFilters(true)}
                        className="flex items-center justify-center gap-2 py-3 px-4 bg-white text-black font-medium transition-colors border-l border-black"
                    >
                        <FaFilter size={16} />
                        <span>Filters</span>
                    </button>
                </div>
                {/* </div> */}
            </div>

            {/* Mobile Bottom Sheets */}
            <MobileSortSheet
                isOpen={showMobileSort}
                onClose={() => setShowMobileSort(false)}
            />
            <MobileFilterSheet
                isOpen={showMobileFilters}
                onClose={() => setShowMobileFilters(false)}
            />
        </div>
    )
}

// Loading component for Suspense fallback
const ShopLoading = () => (
    <div className="min-h-screen">
        <div className="py-2 flex justify-center flex-col items-center">
            <div className="md:w-[90%]">
                <p className="text-xs text-[#c0c0c0] font-medium mb-2">
                    Home &gt; Shop
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:w-[90%] px-2">
                {/* Desktop Sidebar */}
                <aside className="hidden md:block md:col-span-3 pr-2 py-3 border-black h-[calc(100vh-70px)] md:h-[calc(100dvh-170px)] overflow-y-auto">
                    <p className="text-xl font-medium mb-2">Filters :</p>
                    <hr className="border-gray-200 mt-2" />
                    <div className="space-y-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    </div>
                </aside>
                {/* Main Content */}
                <main className="md:col-span-9 py-3 px-2 h-auto md:h-[calc(100dvh-170px)] md:overflow-y-auto">
                    <div className="pb-20 md:pb-3">
                        {/* Header skeleton */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="h-3 bg-gray-200 rounded w-32 animate-pulse" />
                            <div className="h-8 bg-gray-200 rounded w-20 animate-pulse" />
                        </div>

                        {/* Product grid skeleton - matches ShopProductGrid layout */}
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
                    </div>
                </main>
            </div>
        </div>

        {/* Mobile Bottom Action Buttons - Loading State */}
        <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-gray-200 z-50 shadow-2xl">
            <div className="p-4 pb-6">
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 rounded-lg">
                        <div className="h-4 w-4 bg-gray-300 rounded animate-pulse" />
                        <div className="h-4 w-8 bg-gray-300 rounded animate-pulse" />
                    </div>
                    <div className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 rounded-lg">
                        <div className="h-4 w-4 bg-gray-300 rounded animate-pulse" />
                        <div className="h-4 w-12 bg-gray-300 rounded animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// Main Shop component with Suspense wrapper
const Shop = () => {
    return (
        <Suspense fallback={<ShopLoading />}>
            <ShopContent />
        </Suspense>
    );
};

export default Shop
