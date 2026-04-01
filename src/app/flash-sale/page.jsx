"use client"

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import FilterComponent from "@/components/ui/filterComponent";
import MobileFilterSheet from "@/components/ui/MobileFilterSheet";
import MobileSortSheet from "@/components/ui/MobileSortSheet";
import axiosInstance from "@/lib/axiosInstance";
import { FaFilter, FaSort, FaBolt, FaChevronRight } from "react-icons/fa";
import FlashSaleProductCard from "@/components/ui/FlashSaleProductCard";
import Pagination from "@/components/ui/Pagination";
import CountdownTimer from "@/components/products/CountdownTimer";

const FlashSaleContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [showMobileSort, setShowMobileSort] = useState(false);

    const queryString = useMemo(() => searchParams.toString(), [searchParams]);
    const limit = useMemo(() => Number(searchParams.get('limit') || '12'), [searchParams]);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const { data } = await axiosInstance.get(`/flash-sale-products?${queryString}`);
                if (data?.success) {
                    setProducts(data.data || []);
                    setPagination(data.pagination || null);
                } else {
                    setProducts([]);
                    setPagination(null);
                }
            } catch (e) {
                console.error('Failed to load flash sale products', e);
                setProducts([]);
                setPagination(null);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [queryString]);

    const updateParams = (updates) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === undefined || value === '') params.delete(key);
            else params.set(key, String(value));
        });
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const maxEndTime = useMemo(() => {
        if (!products.length) return null;
        return products.reduce((max, p) => {
            if (!p.flashSaleEndTime) return max;
            const end = new Date(p.flashSaleEndTime).getTime();
            return !max || end > max ? end : max;
        }, null);
    }, [products]);

    return (
        <div className="min-h-screen bg-gray-50/30">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white py-8 md:py-12 px-4 shadow-xl mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-16 -mb-16 blur-2xl" />
                
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="text-center md:text-left space-y-2">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-white/30">
                            <FaBolt className="text-yellow-300 animate-pulse" />
                            <span>Extreme Flash Sale</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black italic tracking-tight drop-shadow-lg">
                            LIMITED TIME ONLY
                        </h1>
                        <p className="text-red-50 font-medium text-sm md:text-base opacity-90">
                            Unbeatable discounts on your favorite products. Grab them before they're gone!
                        </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl p-4 md:p-6 rounded-2xl border border-white/20 shadow-2xl flex flex-col items-center min-w-[280px]">
                       {maxEndTime && <div className="text-center space-y-2">
                            <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] opacity-80">Ending Soon</p>
                            <div className="flex items-center justify-center transform scale-110 md:scale-125">
                                <CountdownTimer 
                                    endTime={maxEndTime} 
                                    label=""
                                />
                            </div>
                        </div>}
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-400 font-medium mb-6">
                    <span className="hover:text-red-500 cursor-pointer transition-colors" onClick={() => router.push('/')}>Home</span>
                    <FaChevronRight size={8} />
                    <span className="text-gray-900">Flash Sale</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Desktop Sidebar */}
                    <aside className="hidden md:block md:col-span-3 lg:col-span-2 space-y-8">
                        <div className="sticky top-24">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-gray-900">Filter By</h2>
                                <button className="text-xs text-red-600 font-bold hover:underline" onClick={() => router.replace(pathname)}>Clear All</button>
                            </div>
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                <FilterComponent />
                            </div>
                        </div>
                    </aside>

                    {/* Main Grid */}
                    <main className="md:col-span-9 lg:col-span-10 space-y-6">
                        {/* Results Count & Limit */}
                        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-gray-100 shadow-sm">
                            <p className="text-xs md:text-sm font-medium text-gray-500">
                                Showing {products.length} {products.length === 1 ? 'Product' : 'Products'}
                                {pagination?.totalItems > 0 && ` of ${pagination.totalItems}`}
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="hidden md:inline text-xs text-gray-400 font-bold uppercase tracking-widest">Show:</span>
                                <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-100">
                                    {[12, 24, 48].map(n => (
                                        <button
                                            key={n}
                                            onClick={() => updateParams({ page: 1, limit: n })}
                                            className={`px-3 py-1 text-[10px] md:text-xs font-bold rounded-md transition-all ${
                                                limit === n ? 'bg-white text-red-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-800'
                                            }`}
                                        >
                                            {n}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {loading ? (
                           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                             {Array.from({ length: 12 }).map((_, i) => (
                               <div key={i} className="space-y-3">
                                 <div className="aspect-[170/222] bg-gray-200 rounded-2xl animate-pulse" />
                                 <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                                 <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                               </div>
                             ))}
                           </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                                {products.map(p => (
                                    <FlashSaleProductCard key={p.productID} product={p} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200 shadow-sm flex flex-col items-center">
                                <div className="bg-gray-100 p-4 rounded-full mb-4">
                                    <FaBolt className="text-gray-300" size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">No Flash Sale Products Found</h3>
                                <p className="text-gray-500 text-sm max-w-xs mx-auto mt-2">There's no live flash sale at the moment or no products match your filters.</p>
                                <button 
                                    onClick={() => router.replace(pathname)}
                                    className="mt-6 bg-black text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-gray-800 transition-colors shadow-lg"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}

                        <div className="mt-12 py-8 border-t border-gray-100 flex justify-center">
                            <Pagination pagination={pagination} />
                        </div>
                    </main>
                </div>
            </div>

            {/* Mobile Actions */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:hidden z-50 flex items-center gap-2 bg-black text-white p-2 rounded-full shadow-2xl border border-white/20">
                <button
                    onClick={() => setShowMobileSort(true)}
                    className="flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white/10 rounded-full transition-colors"
                >
                    <FaSort />
                    <span>Sort</span>
                </button>
                <div className="w-[1px] h-4 bg-white/20" />
                <button
                    onClick={() => setShowMobileFilters(true)}
                    className="flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white/10 rounded-full transition-colors"
                >
                    <FaFilter />
                    <span>Filter</span>
                </button>
            </div>

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

const FlashSalePage = () => {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <FlashSaleContent />
        </Suspense>
    );
};

export default FlashSalePage;
