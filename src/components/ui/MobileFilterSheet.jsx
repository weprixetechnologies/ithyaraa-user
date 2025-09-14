"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import { FaTimes } from "react-icons/fa";

const MobileFilterSheet = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const selectedCategoryIDs = useMemo(() => {
        const raw = searchParams.get('categoryID') || '';
        return raw.split(',').map(s => s.trim()).filter(Boolean);
    }, [searchParams]);

    const selectedPriceBands = useMemo(() => {
        const raw = searchParams.get('priceBands') || '';
        return raw.split(',').map(s => s.trim()).filter(Boolean);
    }, [searchParams]);

    const stockParam = useMemo(() => (searchParams.get('stock') || '').toLowerCase(), [searchParams]);
    const inChecked = stockParam === 'in' || stockParam === '';
    const outChecked = stockParam === 'out' || stockParam === '';

    const updateParams = (updates) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === undefined || value === '') params.delete(key);
            else params.set(key, String(value));
        });
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
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
    }, []);

    const clearAllFilters = () => {
        updateParams({
            categoryID: '',
            priceBands: '',
            stock: '',
            minPrice: '',
            maxPrice: '',
            page: 1
        });
    };

    const applyFilters = () => {
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] md:hidden">
            <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }} onClick={onClose} />
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl max-h-[80vh] overflow-hidden transform translate-y-0">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Filters</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={clearAllFilters}
                            className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-100"
                        >
                            Clear All
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <FaTimes size={18} />
                        </button>
                    </div>
                </div>
                <div className="p-4 space-y-6 max-h-[60vh] overflow-y-auto">
                    {/* Categories */}
                    <div>
                        <p className="text-lg font-medium mb-3">Categories</p>
                        {loading ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {categories.map((c) => {
                                    const checked = selectedCategoryIDs.includes(String(c.categoryID));
                                    return (
                                        <label key={c.categoryID} className="flex items-center gap-3 text-sm">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 accent-primary-yellow"
                                                checked={checked}
                                                onChange={(e) => {
                                                    const next = new Set(selectedCategoryIDs);
                                                    if (e.target.checked) next.add(String(c.categoryID));
                                                    else next.delete(String(c.categoryID));
                                                    const value = Array.from(next).join(',');
                                                    updateParams({ categoryID: value, page: 1 });
                                                }}
                                            />
                                            <span className="flex-1">{c.categoryName}</span>
                                        </label>
                                    );
                                })}
                                {categories.length === 0 && (
                                    <p className="text-sm text-gray-500">No categories found</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Stock */}
                    <div>
                        <p className="text-lg font-medium mb-3">Stock</p>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 text-sm">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 accent-primary-yellow"
                                    checked={inChecked}
                                    onChange={(e) => {
                                        const nowOut = outChecked;
                                        if (e.target.checked && nowOut) {
                                            updateParams({ stock: '', page: 1 });
                                        } else if (e.target.checked && !nowOut) {
                                            updateParams({ stock: 'in', page: 1 });
                                        } else if (!e.target.checked && nowOut) {
                                            updateParams({ stock: 'out', page: 1 });
                                        } else {
                                            updateParams({ stock: '', page: 1 });
                                        }
                                    }}
                                />
                                <span>In Stock</span>
                            </label>
                            <label className="flex items-center gap-3 text-sm">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 accent-primary-yellow"
                                    checked={outChecked}
                                    onChange={(e) => {
                                        const nowIn = inChecked;
                                        if (e.target.checked && nowIn) {
                                            updateParams({ stock: '', page: 1 });
                                        } else if (e.target.checked && !nowIn) {
                                            updateParams({ stock: 'out', page: 1 });
                                        } else if (!e.target.checked && nowIn) {
                                            updateParams({ stock: 'in', page: 1 });
                                        } else {
                                            updateParams({ stock: '', page: 1 });
                                        }
                                    }}
                                />
                                <span>Out of Stock</span>
                            </label>
                        </div>
                    </div>

                    {/* Price Range */}
                    <div>
                        <p className="text-lg font-medium mb-3">Price Range</p>
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
                                        className="w-5 h-5 accent-primary-yellow"
                                        checked={selectedPriceBands.includes(b.id)}
                                        onChange={(e) => {
                                            const next = new Set(selectedPriceBands);
                                            if (e.target.checked) next.add(b.id);
                                            else next.delete(b.id);
                                            const value = Array.from(next).join(',');
                                            updateParams({ priceBands: value, minPrice: '', maxPrice: '', page: 1 });
                                        }}
                                    />
                                    <span>{b.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Apply Button */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
                    <button
                        onClick={applyFilters}
                        className="w-full bg-primary-yellow text-black py-3 px-4 rounded-lg font-medium hover:bg-yellow-400 transition-colors"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MobileFilterSheet;
