"use client"

import { useEffect, useMemo, useState, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FaFilter, FaSort } from "react-icons/fa";
import PreBookingProductCard from "@/components/ui/prebookingProductCard";
import Pagination from "@/components/ui/Pagination";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://backend.ithyaraa.com/api";

const SORT_OPTIONS = [
    { id: "newest", label: "Newest First" },
    { id: "salePrice-ASC", label: "Price: Low to High" },
    { id: "salePrice-DESC", label: "Price: High to Low" },
    { id: "discount-DESC", label: "Best Discount" },
    { id: "name-ASC", label: "Name: A to Z" },
    { id: "name-DESC", label: "Name: Z to A" },
];

// ── Mobile Sort Sheet ─────────────────────────────────────────────────
function MobilePresaleSortSheet({ isOpen, onClose, selectedSort, onSortChange }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-end md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative w-full bg-white rounded-t-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Sort By</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-xl font-bold">×</button>
                </div>
                <div className="space-y-2">
                    {SORT_OPTIONS.map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => { onSortChange(opt.id); onClose(); }}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${selectedSort === opt.id ? "border-black bg-gray-50 font-semibold" : "border-gray-200 hover:border-gray-400"}`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── Mobile Filter Sheet ───────────────────────────────────────────────
function MobilePresaleFilterSheet({ isOpen, onClose, search, onSearchChange, status, onStatusChange, minPrice, maxPrice, onPriceChange }) {
    if (!isOpen) return null;

    // Helper to determine active price band based on min/max
    const activeBand = (minPrice === 0 && maxPrice === 500) ? 'u500'
        : (minPrice === 500 && maxPrice === 999) ? '500-999'
        : (minPrice === 1000 && maxPrice === 1999) ? '1000-1999'
        : (minPrice === 2000 && maxPrice === 10000) ? '2000+'
        : '';

    const handleBandClick = (band) => {
        if (activeBand === band) {
            onPriceChange(0, 10000); // clear
        } else {
            if (band === 'u500') onPriceChange(0, 500);
            if (band === '500-999') onPriceChange(500, 999);
            if (band === '1000-1999') onPriceChange(1000, 1999);
            if (band === '2000+') onPriceChange(2000, 10000);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative w-full bg-white rounded-t-2xl p-5 shadow-xl max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Filters</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-xl font-bold">×</button>
                </div>
                <div className="space-y-5">
                    {/* Search */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">Search</label>
                        <input
                            type="text"
                            value={search}
                            onChange={e => onSearchChange(e.target.value)}
                            placeholder="Search pre-booking products..."
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black"
                        />
                    </div>
                    
                    {/* Price Range */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">Price Range</label>
                        <div className="space-y-3">
                            {[
                                { id: 'u500', label: 'Under ₹500' },
                                { id: '500-999', label: '₹500 - ₹999' },
                                { id: '1000-1999', label: '₹1000 - ₹1999' },
                                { id: '2000+', label: '₹2000 and above' }
                            ].map(b => (
                                <label key={b.id} className="flex items-center gap-3 text-sm">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 accent-black"
                                        checked={activeBand === b.id}
                                        onChange={() => handleBandClick(b.id)}
                                    />
                                    <span>{b.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">Status</label>
                        {[
                            { value: "all", label: "All Products" },
                            { value: "active", label: "Active (Live Now)" },
                            { value: "upcoming", label: "Upcoming" },
                        ].map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => onStatusChange(opt.value)}
                                className={`w-full text-left px-4 py-2.5 rounded-lg mb-1.5 border transition-colors text-sm ${status === opt.value ? "border-black bg-gray-50 font-semibold" : "border-gray-200 hover:border-gray-400"}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="w-full mt-5 py-3 bg-black text-white rounded-xl font-semibold text-sm"
                >
                    Apply Filters
                </button>
            </div>
        </div>
    );
}

import { motion, AnimatePresence } from "framer-motion";
import { Filter, SlidersHorizontal, ArrowDownUp, Package, ChevronUp, Box } from "lucide-react";

const THEME_PINK = "#FF4B7E";
const BORDER_COLOR = "#FFE5EC";

const AccordionSection = ({ title, icon: Icon, defaultOpen = true, children }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="py-4 border-b" style={{ borderColor: BORDER_COLOR }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between group"
            >
                <div className="flex items-center gap-3">
                    <div style={{ color: THEME_PINK }}>
                        <Icon size={18} strokeWidth={2.5} />
                    </div>
                    <span className="font-semibold text-gray-800 text-[15px]">{title}</span>
                </div>
                <div className="text-gray-500 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)' }}>
                    <ChevronUp size={18} strokeWidth={2.5} />
                </div>
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="pt-4 pb-1">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const DualRangeSlider = ({ min, max, value, onChange }) => {
    const [minValue, setMinValue] = useState(value[0]);
    const [maxValue, setMaxValue] = useState(value[1]);

    useEffect(() => {
        setMinValue(value[0]);
        setMaxValue(value[1]);
    }, [value]);

    const handleMinChange = (e) => {
        const val = Math.min(Number(e.target.value), maxValue - 100);
        setMinValue(val);
        onChange([val, maxValue]);
    };

    const handleMaxChange = (e) => {
        const val = Math.max(Number(e.target.value), minValue + 100);
        setMaxValue(val);
        onChange([minValue, val]);
    };

    const minPercent = ((minValue - min) / (max - min)) * 100;
    const maxPercent = ((maxValue - min) / (max - min)) * 100;

    return (
        <div className="pt-4 pb-2 px-1">
            <div className="relative h-1 bg-gray-200 rounded-full mb-6">
                <div
                    className="absolute h-full rounded-full"
                    style={{
                        backgroundColor: THEME_PINK,
                        left: `${minPercent}%`,
                        right: `${100 - maxPercent}%`
                    }}
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={minValue}
                    onChange={handleMinChange}
                    className="absolute w-full -top-2 h-5 appearance-none bg-transparent pointer-events-none custom-range"
                    style={{ zIndex: minValue > max - 100 ? 5 : 3 }}
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={maxValue}
                    onChange={handleMaxChange}
                    className="absolute w-full -top-2 h-5 appearance-none bg-transparent pointer-events-none custom-range"
                />
            </div>
            <div className="flex items-center justify-between text-sm font-medium text-gray-600">
                <span>₹{minValue}</span>
                <span>₹{maxValue}{maxValue >= max ? '+' : ''}</span>
            </div>

            <style jsx>{`
                .custom-range::-webkit-slider-thumb {
                    pointer-events: auto;
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: white;
                    border: 2.5px solid ${THEME_PINK};
                    cursor: pointer;
                }
                .custom-range::-moz-range-thumb {
                    pointer-events: auto;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: white;
                    border: 2.5px solid ${THEME_PINK};
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
};

// ── Desktop Sidebar ────────────────────────────────────────────────────
function PresaleSidebar({ search, onSearchChange, status, onStatusChange, sort, onSortChange, minPrice, maxPrice, onPriceChange, onClear }) {
    return (
        <div className="w-full max-w-[280px] bg-white rounded-xl pr-4 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: BORDER_COLOR }}>
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                    <Filter size={18} style={{ color: THEME_PINK }} />
                </div>
                <button
                    onClick={onClear}
                    className="text-[14px] font-medium transition-opacity hover:opacity-80"
                    style={{ color: THEME_PINK }}
                >
                    Clear All
                </button>
            </div>

            {/* Search */}
            <div className="py-4 border-b" style={{ borderColor: BORDER_COLOR }}>
                <p className="text-sm font-bold text-gray-800 mb-3">Search</p>
                <input
                    type="text"
                    value={search}
                    onChange={e => onSearchChange(e.target.value)}
                    placeholder="Search products..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black transition-colors"
                />
            </div>

            {/* Price Range */}
            <AccordionSection title="Price Range" icon={SlidersHorizontal}>
                <DualRangeSlider
                    min={0}
                    max={10000}
                    value={[minPrice, maxPrice]}
                    onChange={(val) => {
                        onPriceChange(val[0], val[1]);
                    }}
                />
            </AccordionSection>

            {/* Sort By */}
            <AccordionSection title="Sort By" icon={ArrowDownUp}>
                <div className="flex flex-col gap-3.5">
                    {SORT_OPTIONS.map((opt) => {
                        const checked = sort === opt.id;
                        return (
                            <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center justify-center">
                                    <input
                                        type="radio"
                                        name="presale_sort_options"
                                        className="peer appearance-none w-[18px] h-[18px] border-2 rounded-full bg-white transition-all duration-200 cursor-pointer"
                                        style={{ borderColor: checked ? THEME_PINK : '#FFB3C6' }}
                                        checked={checked}
                                        onChange={() => onSortChange(opt.id)}
                                    />
                                    <div
                                        className={`absolute w-2 h-2 rounded-full transition-transform duration-200 pointer-events-none ${checked ? 'scale-100' : 'scale-0'}`}
                                        style={{ backgroundColor: THEME_PINK }}
                                    />
                                </div>
                                <span className={`text-[14.5px] transition-colors ${checked ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                    {opt.label}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </AccordionSection>

            {/* Status */}
            <AccordionSection title="Status" icon={Package}>
                <div className="flex flex-col gap-3.5">
                    {[
                        { value: "all", label: "All Products" },
                        { value: "active", label: "Active (Live Now)" },
                        { value: "upcoming", label: "Upcoming" },
                    ].map(opt => {
                        const checked = status === opt.value;
                        return (
                            <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center justify-center">
                                    <input
                                        type="radio"
                                        name="presale_status_options"
                                        className="peer appearance-none w-[18px] h-[18px] border-2 rounded-full bg-white transition-all duration-200 cursor-pointer"
                                        style={{ borderColor: checked ? THEME_PINK : '#FFB3C6' }}
                                        checked={checked}
                                        onChange={() => onStatusChange(opt.value)}
                                    />
                                    <div
                                        className={`absolute w-2 h-2 rounded-full transition-transform duration-200 pointer-events-none ${checked ? 'scale-100' : 'scale-0'}`}
                                        style={{ backgroundColor: THEME_PINK }}
                                    />
                                </div>
                                <span className={`text-[14.5px] transition-colors ${checked ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                    {opt.label}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </AccordionSection>
        </div>
    );
}

// ── Product Grid ───────────────────────────────────────────────────────
function PresaleProductGrid({ products, loading, pagination, sort, onSortChange }) {
    const now = new Date();

    const parseSafe = (d) => {
        if (!d) return null;
        try { const n = typeof d === "string" && d.includes(" ") ? d.replace(" ", "T") : d; const x = new Date(n); return isNaN(x) ? null : x; }
        catch { return null; }
    };

    const visible = (products || []).filter(p => {
        const end = parseSafe(p.preSaleEndDate);
        return !end || end > now;
    });

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 w-full">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="aspect-[2/3] bg-gray-200 animate-pulse" />
                        <div className="p-3">
                            <div className="h-3 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
                            <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!visible.length) {
        return (
            <div className="py-10 text-center">
                <p className="text-sm md:text-base font-medium text-gray-600">No pre-booking products found.</p>
                <p className="text-xs text-gray-400 mt-1">Check back soon for new drops!</p>
            </div>
        );
    }

    return (
        <>
            {/* Header row */}
            <div className="flex items-center justify-between mb-3">
                <p className="text-xs md:text-sm text-gray-700">
                    Showing {visible.length} of {pagination?.totalItems ?? visible.length} products
                </p>
                {/* Desktop sort */}
                <div className="hidden md:flex items-center gap-1 bg-white border rounded-lg p-1">
                    {SORT_OPTIONS.map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => onSortChange(opt.id)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${sort === opt.id ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"}`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {visible.map(product => (
                    <PreBookingProductCard key={product.presaleProductID} product={product} />
                ))}
            </div>

            <Pagination pagination={pagination} />
        </>
    );
}

// ── Main page content ──────────────────────────────────────────────────
const PresaleShopContent = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [showMobileSort, setShowMobileSort] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Read state from URL
    const status = searchParams.get("status") || "all";
    const sort = searchParams.get("sort") || "newest";
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "20");
    const searchParam = searchParams.get("search") || "";
    const minPriceParam = Number(searchParams.get("minPrice") || "0");
    const maxPriceParam = Number(searchParams.get("maxPrice") || "10000");

    // Local state for fast UI updates + debouncing
    const [localSearch, setLocalSearch] = useState(searchParam);
    const [localPrice, setLocalPrice] = useState([minPriceParam, maxPriceParam]);

    // Keep local state in sync if URL changes externally
    useEffect(() => { setLocalSearch(searchParam); }, [searchParam]);
    useEffect(() => { setLocalPrice([minPriceParam, maxPriceParam]); }, [minPriceParam, maxPriceParam]);

    const updateParams = (updates) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([k, v]) => {
            if (v === null || v === undefined || v === "" || v === "all") params.delete(k);
            // Don't clutter URL with default price range
            else if (k === 'minPrice' && v === 0) params.delete(k);
            else if (k === 'maxPrice' && v === 10000) params.delete(k);
            else params.set(k, String(v));
        });
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearch !== searchParam) {
                updateParams({ search: localSearch, page: 1 });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [localSearch, searchParam]);

    // Debounce price slider
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localPrice[0] !== minPriceParam || localPrice[1] !== maxPriceParam) {
                updateParams({ minPrice: localPrice[0], maxPrice: localPrice[1], page: 1 });
            }
        }, 600);
        return () => clearTimeout(timer);
    }, [localPrice, minPriceParam, maxPriceParam]);

    const queryString = useMemo(() => searchParams.toString(), [searchParams]);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const params = { page, limit };
                const res = await axios.get(`${API_BASE}/presale/products/paginated`, { params });
                if (res.data?.success) {
                    setProducts(res.data.data || []);
                    setPagination(res.data.pagination || null);
                } else {
                    setProducts([]); setPagination(null);
                }
            } catch {
                setProducts([]); setPagination(null);
            } finally {
                setLoading(false);
            }
        };
        fetch();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [queryString]);

    // Client-side filter + sort on top of the fetched page
    const now = new Date();
    const parseSafe = (d) => {
        if (!d) return null;
        try { const n = typeof d === "string" && d.includes(" ") ? d.replace(" ", "T") : d; const x = new Date(n); return isNaN(x) ? null : x; }
        catch { return null; }
    };

    const filtered = useMemo(() => {
        let list = [...products];
        // Status filter
        if (status === "active") list = list.filter(p => {
            const start = parseSafe(p.preSaleStartDate), end = parseSafe(p.preSaleEndDate);
            return (!start || start <= now) && (!end || end >= now);
        });
        if (status === "upcoming") list = list.filter(p => {
            const start = parseSafe(p.preSaleStartDate);
            return start && start > now;
        });
        // Search filter
        if (searchParam) list = list.filter(p => (p.name || "").toLowerCase().includes(searchParam.toLowerCase()));
        
        // Price filter
        list = list.filter(p => {
            const price = Number(p.salePrice || p.regularPrice || 0);
            return price >= minPriceParam && price <= maxPriceParam;
        });

        // Sort
        switch (sort) {
            case "salePrice-ASC": list.sort((a, b) => (a.salePrice || 0) - (b.salePrice || 0)); break;
            case "salePrice-DESC": list.sort((a, b) => (b.salePrice || 0) - (a.salePrice || 0)); break;
            case "discount-DESC": list.sort((a, b) => (b.discountValue || 0) - (a.discountValue || 0)); break;
            case "name-ASC": list.sort((a, b) => (a.name || "").localeCompare(b.name || "")); break;
            case "name-DESC": list.sort((a, b) => (b.name || "").localeCompare(a.name || "")); break;
            default: list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        }
        return list;
    }, [products, searchParam, status, sort, minPriceParam, maxPriceParam]);

    return (
        <div className="min-h-screen">
            <div className="md:py-2 flex justify-center flex-col items-center">
                {/* Breadcrumb */}
                <div className="hidden md:block md:w-[90%]">
                    <p className="text-xs text-[#c0c0c0] font-medium mb-2">
                        Home &gt; Pre-Booking Shop
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:w-[90%] px-2 w-full">
                    {/* Desktop Sidebar */}
                    <aside className="hidden md:block md:col-span-3 pr-2 py-3 border-black h-[calc(100vh-70px)] md:h-[calc(100dvh-170px)] overflow-y-auto">
                        <PresaleSidebar
                            search={localSearch}
                            onSearchChange={setLocalSearch}
                            status={status}
                            onStatusChange={v => updateParams({ status: v, page: 1 })}
                            sort={sort}
                            onSortChange={v => updateParams({ sort: v, page: 1 })}
                            minPrice={localPrice[0]}
                            maxPrice={localPrice[1]}
                            onPriceChange={(min, max) => setLocalPrice([min, max])}
                            onClear={() => router.replace(pathname, { scroll: false })}
                        />
                    </aside>

                    {/* Main Content */}
                    <main className="md:col-span-9 py-3 px-2 h-auto md:h-[calc(100dvh-170px)] md:overflow-y-auto">
                        <div className="pb-20 md:pb-3">
                            <PresaleProductGrid
                                products={filtered}
                                loading={loading}
                                pagination={pagination}
                                sort={sort}
                                onSortChange={v => updateParams({ sort: v, page: 1 })}
                            />
                        </div>
                    </main>
                </div>
            </div>

            {/* Mobile Bottom Buttons */}
            <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-b border-black z-50 shadow-2xl">
                <div className="grid grid-cols-2">
                    <button
                        onClick={() => setShowMobileSort(true)}
                        className="flex items-center justify-center gap-2 py-3 px-4 bg-white text-black font-medium"
                    >
                        <FaSort size={16} />
                        <span>Sort</span>
                    </button>
                    <button
                        onClick={() => setShowMobileFilters(true)}
                        className="flex items-center justify-center gap-2 py-3 px-4 bg-white text-black font-medium border-l border-black"
                    >
                        <FaFilter size={16} />
                        <span>Filters</span>
                    </button>
                </div>
            </div>

            {/* Mobile Sheets */}
            <MobilePresaleSortSheet
                isOpen={showMobileSort}
                onClose={() => setShowMobileSort(false)}
                selectedSort={sort}
                onSortChange={v => updateParams({ sort: v, page: 1 })}
            />
            <MobilePresaleFilterSheet
                isOpen={showMobileFilters}
                onClose={() => setShowMobileFilters(false)}
                search={localSearch}
                onSearchChange={setLocalSearch}
                status={status}
                onStatusChange={v => updateParams({ status: v, page: 1 })}
                minPrice={localPrice[0]}
                maxPrice={localPrice[1]}
                onPriceChange={(min, max) => setLocalPrice([min, max])}
            />
        </div>
    );
};

// Loading skeleton — matches shop page exactly
const PresaleShopLoading = () => (
    <div className="min-h-screen">
        <div className="py-2 flex justify-center flex-col items-center">
            <div className="md:w-[90%]">
                <p className="text-xs text-[#c0c0c0] font-medium mb-2">Home &gt; Pre-Booking Shop</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:w-[90%] px-2">
                <aside className="hidden md:block md:col-span-3 pr-2 py-3 h-[calc(100dvh-170px)] overflow-y-auto">
                    <div className="space-y-4 mt-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    </div>
                </aside>
                <main className="md:col-span-9 py-3 px-2 h-auto md:h-[calc(100dvh-170px)] md:overflow-y-auto">
                    <div className="pb-20 md:pb-3">
                        <div className="flex items-center justify-between mb-3">
                            <div className="h-3 bg-gray-200 rounded w-32 animate-pulse" />
                            <div className="h-8 bg-gray-200 rounded w-20 animate-pulse" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="aspect-[2/3] bg-gray-200 animate-pulse" />
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
    </div>
);

export default function PresaleShopPage() {
    return (
        <Suspense fallback={<PresaleShopLoading />}>
            <PresaleShopContent />
        </Suspense>
    );
}
