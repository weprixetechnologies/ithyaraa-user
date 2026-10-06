"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import { FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const MobileFilterSheet = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Local staged states so rapid checkbox taps do not trigger individual network calls
    const [tempCategoryIDs, setTempCategoryIDs] = useState([]);
    const [tempPriceBands, setTempPriceBands] = useState([]);
    const [tempStock, setTempStock] = useState('');
    const [tempMinPrice, setTempMinPrice] = useState('');
    const [tempMaxPrice, setTempMaxPrice] = useState('');

    useEffect(() => {
        if (isOpen) {
            const rawCats = searchParams.get('categoryID') || '';
            setTempCategoryIDs(rawCats.split(',').map(s => s.trim()).filter(Boolean));

            const rawBands = searchParams.get('priceBands') || '';
            setTempPriceBands(rawBands.split(',').map(s => s.trim()).filter(Boolean));

            setTempStock((searchParams.get('stock') || '').toLowerCase());
            setTempMinPrice(searchParams.get('minPrice') || '');
            setTempMaxPrice(searchParams.get('maxPrice') || '');
        }
    }, [isOpen, searchParams]);

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
    }, []);

    const updateParams = (updates) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === undefined || value === '') params.delete(key);
            else params.set(key, String(value));
        });
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const clearAllFilters = () => {
        setTempCategoryIDs([]);
        setTempPriceBands([]);
        setTempStock('');
        setTempMinPrice('');
        setTempMaxPrice('');

        updateParams({
            categoryID: '',
            priceBands: '',
            stock: '',
            minPrice: '',
            maxPrice: '',
            page: 1
        });
        onClose();
    };

    const applyFilters = () => {
        updateParams({
            categoryID: tempCategoryIDs.join(','),
            priceBands: tempPriceBands.join(','),
            stock: tempStock,
            minPrice: tempMinPrice,
            maxPrice: tempMaxPrice,
            page: 1
        });
        onClose();
    };

    const inChecked = tempStock === 'in' || tempStock === '';
    const outChecked = tempStock === 'out' || tempStock === '';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] md:hidden">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-black/60"
                        onClick={onClose}
                    />

                    {/* Sheet with 60FPS drag-to-close gesture */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 28, stiffness: 300 }}
                        drag="y"
                        dragConstraints={{ top: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 100 || info.velocity.y > 400) {
                                onClose();
                            }
                        }}
                        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden will-change-transform"
                    >
                        {/* Drag Handle Indicator */}
                        <div className="w-full flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
                            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={clearAllFilters}
                                    className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    Clear All
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                                    aria-label="Close"
                                >
                                    <FaTimes size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="p-4 space-y-6 overflow-y-auto max-h-[60vh] overscroll-contain">
                            {/* Categories */}
                            <div>
                                <p className="text-base font-semibold text-gray-900 mb-3">Categories</p>
                                {loading ? (
                                    <div className="space-y-2">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="h-5 bg-gray-100 rounded animate-pulse" />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {categories.map((c) => {
                                            const checked = tempCategoryIDs.includes(String(c.categoryID));
                                            return (
                                                <label key={c.categoryID} className="flex items-center gap-3 text-sm cursor-pointer select-none">
                                                    <input
                                                        type="checkbox"
                                                        className="w-5 h-5 accent-black rounded cursor-pointer"
                                                        checked={checked}
                                                        onChange={(e) => {
                                                            const next = new Set(tempCategoryIDs);
                                                            if (e.target.checked) next.add(String(c.categoryID));
                                                            else next.delete(String(c.categoryID));
                                                            setTempCategoryIDs(Array.from(next));
                                                        }}
                                                    />
                                                    <span className="flex-1 text-gray-800">{c.categoryName}</span>
                                                    {c.productCount ? (
                                                        <span className="text-xs text-gray-400">({c.productCount})</span>
                                                    ) : null}
                                                </label>
                                            );
                                        })}
                                        {categories.length === 0 && (
                                            <p className="text-sm text-gray-400">No categories found</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Stock */}
                            <div>
                                <p className="text-base font-semibold text-gray-900 mb-3">Availability</p>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 text-sm cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 accent-black rounded cursor-pointer"
                                            checked={inChecked}
                                            onChange={(e) => {
                                                const nowOut = outChecked;
                                                if (e.target.checked && nowOut) setTempStock('');
                                                else if (e.target.checked && !nowOut) setTempStock('in');
                                                else if (!e.target.checked && nowOut) setTempStock('out');
                                                else setTempStock('');
                                            }}
                                        />
                                        <span className="text-gray-800">In Stock</span>
                                    </label>
                                    <label className="flex items-center gap-3 text-sm cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 accent-black rounded cursor-pointer"
                                            checked={outChecked}
                                            onChange={(e) => {
                                                const nowIn = inChecked;
                                                if (e.target.checked && nowIn) setTempStock('');
                                                else if (e.target.checked && !nowIn) setTempStock('out');
                                                else if (!e.target.checked && nowIn) setTempStock('in');
                                                else setTempStock('');
                                            }}
                                        />
                                        <span className="text-gray-800">Out of Stock</span>
                                    </label>
                                </div>
                            </div>

                            {/* Price Range */}
                            <div>
                                <p className="text-base font-semibold text-gray-900 mb-3">Price Range</p>
                                <div className="space-y-3">
                                    {[
                                        { id: 'u500', label: 'Under ₹500' },
                                        { id: '500-999', label: '₹500 - ₹999' },
                                        { id: '1000-1999', label: '₹1000 - ₹1999' },
                                        { id: '2000+', label: '₹2000 and above' }
                                    ].map(b => (
                                        <label key={b.id} className="flex items-center gap-3 text-sm cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 accent-black rounded cursor-pointer"
                                                checked={tempPriceBands.includes(b.id)}
                                                onChange={(e) => {
                                                    const next = new Set(tempPriceBands);
                                                    if (e.target.checked) next.add(b.id);
                                                    else next.delete(b.id);
                                                    setTempPriceBands(Array.from(next));
                                                    setTempMinPrice('');
                                                    setTempMaxPrice('');
                                                }}
                                            />
                                            <span className="text-gray-800">{b.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Apply Button */}
                        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
                            <button
                                onClick={applyFilters}
                                className="w-full bg-black text-white py-3.5 px-4 rounded-xl font-semibold hover:bg-gray-800 active:scale-[0.99] transition-all"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default MobileFilterSheet;
