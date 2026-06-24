"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Filter, 
    Box, 
    ArrowDownUp, 
    Package, 
    SlidersHorizontal, 
    ChevronUp, 
    ChevronDown 
} from "lucide-react";

/* Custom Pink Color for this filter design */
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

/* Custom Dual Range Slider Component */
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

const FilterComponent = () => {
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    
    // State for local price range slider dragging
    const [priceRange, setPriceRange] = useState([0, 2000]);

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const selectedCategoryIDs = useMemo(() => {
        const raw = searchParams.get('categoryID') || '';
        return raw.split(',').map(s => s.trim()).filter(Boolean);
    }, [searchParams]);

    const stockParam = useMemo(() => (searchParams.get('stock') || '').toLowerCase(), [searchParams]);
    const inChecked = stockParam === 'in' || stockParam === '';
    const outChecked = stockParam === 'out' || stockParam === '';

    const selectedSort = useMemo(() => {
        const sb = searchParams.get('sortBy') || 'createdAt';
        const so = (searchParams.get('sortOrder') || 'DESC').toUpperCase();
        return `${sb}-${so}`;
    }, [searchParams]);

    const updateParams = (updates) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === undefined || value === '') params.delete(key);
            else params.set(key, String(value));
        });
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const clearAllFilters = () => {
        router.replace(pathname, { scroll: false });
        setPriceRange([0, 2000]);
    };

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const { data } = await axiosInstance.get('/filters');
                if (data?.success) {
                    setCategories(data.data?.categories || []);
                }
            } catch (e) {
                console.error('Failed to load filters', e);
            } finally {
                setLoading(false);
            }
        };
        fetchFilters();
        
        // Init price range from URL
        const minP = searchParams.get('minPrice');
        const maxP = searchParams.get('maxPrice');
        if (minP || maxP) {
            setPriceRange([Number(minP) || 0, Number(maxP) || 2000]);
        }
    }, [searchParams]);

    // Debounce price slider updates to URL
    useEffect(() => {
        const timer = setTimeout(() => {
            if (priceRange[0] !== 0 || priceRange[1] !== 2000) {
                updateParams({ 
                    minPrice: priceRange[0], 
                    maxPrice: priceRange[1] === 2000 ? '' : priceRange[1], 
                    priceBands: '', 
                    page: 1 
                });
            } else if (searchParams.has('minPrice') || searchParams.has('maxPrice')) {
                updateParams({ minPrice: '', maxPrice: '', page: 1 });
            }
        }, 600);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [priceRange]);

    return (
        <div className="w-full max-w-[280px] bg-white rounded-xl pr-4 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: BORDER_COLOR }}>
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                    <Filter size={18} style={{ color: THEME_PINK }} />
                </div>
                <button 
                    onClick={clearAllFilters}
                    className="text-[14px] font-medium transition-opacity hover:opacity-80"
                    style={{ color: THEME_PINK }}
                >
                    Clear All
                </button>
            </div>

            {/* Categories */}
            <AccordionSection title="Categories" icon={Box}>
                {loading ? (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-4 bg-gray-100 rounded w-full animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-3.5 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                        {categories.map((c) => {
                            const checked = selectedCategoryIDs.includes(String(c.categoryID));
                            return (
                                <label key={c.categoryID} className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            className="peer appearance-none w-[18px] h-[18px] border-2 rounded-[4px] bg-white checked:bg-theme-pink checked:border-theme-pink transition-all duration-200 cursor-pointer"
                                            style={{ 
                                                borderColor: checked ? THEME_PINK : '#FFB3C6',
                                                backgroundColor: checked ? THEME_PINK : 'white'
                                            }}
                                            checked={checked}
                                            onChange={(e) => {
                                                const next = new Set(selectedCategoryIDs);
                                                if (e.target.checked) next.add(String(c.categoryID));
                                                else next.delete(String(c.categoryID));
                                                const value = Array.from(next).join(',');
                                                updateParams({ categoryID: value, page: 1 });
                                            }}
                                        />
                                        <svg 
                                            className={`absolute w-3 h-3 text-white pointer-events-none transition-transform duration-200 ${checked ? 'scale-100' : 'scale-0'}`} 
                                            fill="none" 
                                            viewBox="0 0 24 24" 
                                            stroke="currentColor" 
                                            strokeWidth={3}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-[14.5px] text-gray-600 group-hover:text-gray-900 transition-colors">
                                        {c.categoryName} {c.productCount ? <span className="text-gray-400">({c.productCount})</span> : ''}
                                    </span>
                                </label>
                            );
                        })}
                        {categories.length === 0 && (
                            <p className="text-sm text-gray-400">No categories found</p>
                        )}
                    </div>
                )}
            </AccordionSection>

            {/* Sort By */}
            <AccordionSection title="Sort By" icon={ArrowDownUp}>
                <div className="flex flex-col gap-3.5">
                    {[
                        { id: 'createdAt-DESC', label: 'Newest First' },
                        { id: 'createdAt-ASC', label: 'Oldest First' },
                        { id: 'salePrice-ASC', label: 'Price: Low to High' },
                        { id: 'salePrice-DESC', label: 'Price: High to Low' },
                    ].map((sort) => {
                        const checked = selectedSort === sort.id;
                        return (
                            <label key={sort.id} className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center justify-center">
                                    <input
                                        type="radio"
                                        name="sort_options"
                                        className="peer appearance-none w-[18px] h-[18px] border-2 rounded-full bg-white transition-all duration-200 cursor-pointer"
                                        style={{ 
                                            borderColor: checked ? THEME_PINK : '#FFB3C6'
                                        }}
                                        checked={checked}
                                        onChange={() => {
                                            const [sb, so] = sort.id.split('-');
                                            updateParams({ sortBy: sb, sortOrder: so, page: 1 });
                                        }}
                                    />
                                    <div 
                                        className={`absolute w-2 h-2 rounded-full transition-transform duration-200 pointer-events-none ${checked ? 'scale-100' : 'scale-0'}`}
                                        style={{ backgroundColor: THEME_PINK }}
                                    />
                                </div>
                                <span className={`text-[14.5px] transition-colors ${checked ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                    {sort.label}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </AccordionSection>

            {/* Stock */}
            <AccordionSection title="Stock" icon={Package}>
                <div className="flex flex-col gap-3.5">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                            <input
                                type="checkbox"
                                className="peer appearance-none w-[18px] h-[18px] border-2 rounded-[4px] bg-white transition-all duration-200 cursor-pointer"
                                style={{ 
                                    borderColor: inChecked ? THEME_PINK : '#FFB3C6',
                                    backgroundColor: inChecked ? THEME_PINK : 'white'
                                }}
                                checked={inChecked}
                                onChange={(e) => {
                                    const nowOut = outChecked;
                                    if (e.target.checked && nowOut) updateParams({ stock: '', page: 1 });
                                    else if (e.target.checked && !nowOut) updateParams({ stock: 'in', page: 1 });
                                    else if (!e.target.checked && nowOut) updateParams({ stock: 'out', page: 1 });
                                    else updateParams({ stock: '', page: 1 });
                                }}
                            />
                            <svg 
                                className={`absolute w-3 h-3 text-white pointer-events-none transition-transform duration-200 ${inChecked ? 'scale-100' : 'scale-0'}`} 
                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <span className="text-[14.5px] text-gray-600 group-hover:text-gray-900 transition-colors">
                            In Stock
                        </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                            <input
                                type="checkbox"
                                className="peer appearance-none w-[18px] h-[18px] border-2 rounded-[4px] bg-white transition-all duration-200 cursor-pointer"
                                style={{ 
                                    borderColor: outChecked ? THEME_PINK : '#FFB3C6',
                                    backgroundColor: outChecked ? THEME_PINK : 'white'
                                }}
                                checked={outChecked}
                                onChange={(e) => {
                                    const nowIn = inChecked;
                                    if (e.target.checked && nowIn) updateParams({ stock: '', page: 1 });
                                    else if (e.target.checked && !nowIn) updateParams({ stock: 'out', page: 1 });
                                    else if (!e.target.checked && nowIn) updateParams({ stock: 'in', page: 1 });
                                    else updateParams({ stock: '', page: 1 });
                                }}
                            />
                            <svg 
                                className={`absolute w-3 h-3 text-white pointer-events-none transition-transform duration-200 ${outChecked ? 'scale-100' : 'scale-0'}`} 
                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <span className="text-[14.5px] text-gray-600 group-hover:text-gray-900 transition-colors">
                            Out of Stock
                        </span>
                    </label>
                </div>
            </AccordionSection>

            {/* Price Range */}
            <AccordionSection title="Price Range" icon={SlidersHorizontal}>
                <DualRangeSlider 
                    min={0} 
                    max={2000} 
                    value={priceRange} 
                    onChange={setPriceRange} 
                />
            </AccordionSection>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #FFE5EC;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
};

export default FilterComponent;
