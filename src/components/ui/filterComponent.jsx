"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";

const FilterComponent = () => {
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

    return (
        <div className="space-y-6">
            {/* Categories */}
            <div>
                <p className="text-lg font-medium mb-2 mt-2">Categories</p>
                {loading ? (
                    <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 bg-gray-200 rounded animate-pulse" />
                    </div>
                ) : (
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                        {categories.map((c) => {
                            const checked = selectedCategoryIDs.includes(String(c.categoryID));
                            return (
                                <label key={c.categoryID} className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        className="accent-black"
                                        checked={checked}
                                        onChange={(e) => {
                                            const next = new Set(selectedCategoryIDs);
                                            if (e.target.checked) next.add(String(c.categoryID));
                                            else next.delete(String(c.categoryID));
                                            const value = Array.from(next).join(',');
                                            updateParams({ categoryID: value, page: 1 });
                                        }}
                                    />
                                    <span>{c.categoryName}</span>
                                </label>
                            );
                        })}
                        {categories.length === 0 && (
                            <p className="text-xs text-gray-500">No categories found</p>
                        )}
                    </div>
                )}
            </div>

            {/* Sort By (hardcoded) */}
            <div>
                <p className="text-lg font-medium mb-2 mt-2">Sort By</p>
                <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2">
                        <input
                            name="sort"
                            type="radio"
                            className="accent-black"
                            checked={selectedSort === 'createdAt-DESC'}
                            onChange={() => updateParams({ sortBy: 'createdAt', sortOrder: 'DESC', page: 1 })}
                        />
                        <span>Newest First</span>
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            name="sort"
                            type="radio"
                            className="accent-black"
                            checked={selectedSort === 'createdAt-ASC'}
                            onChange={() => updateParams({ sortBy: 'createdAt', sortOrder: 'ASC', page: 1 })}
                        />
                        <span>Oldest First</span>
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            name="sort"
                            type="radio"
                            className="accent-black"
                            checked={selectedSort === 'salePrice-ASC'}
                            onChange={() => updateParams({ sortBy: 'salePrice', sortOrder: 'ASC', page: 1 })}
                        />
                        <span>Price: Low to High</span>
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            name="sort"
                            type="radio"
                            className="accent-black"
                            checked={selectedSort === 'salePrice-DESC'}
                            onChange={() => updateParams({ sortBy: 'salePrice', sortOrder: 'DESC', page: 1 })}
                        />
                        <span>Price: High to Low</span>
                    </label>
                </div>
            </div>

            {/* Stock (hardcoded) */}
            <div>
                <p className="text-lg font-medium mb-2 mt-2">Stock</p>
                <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            className="accent-black"
                            checked={inChecked}
                            onChange={(e) => {
                                // Determine next stock state
                                const nowOut = outChecked; // current out checkbox state
                                if (e.target.checked && nowOut) {
                                    // both checked → no stock filter
                                    updateParams({ stock: '', page: 1 });
                                } else if (e.target.checked && !nowOut) {
                                    // only in checked
                                    updateParams({ stock: 'in', page: 1 });
                                } else if (!e.target.checked && nowOut) {
                                    // only out remains
                                    updateParams({ stock: 'out', page: 1 });
                                } else {
                                    // none checked → remove filter
                                    updateParams({ stock: '', page: 1 });
                                }
                            }}
                        />
                        <span>In Stock</span>
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            className="accent-black"
                            checked={outChecked}
                            onChange={(e) => {
                                const nowIn = inChecked; // current in checkbox state
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

            {/* Price Range (hardcoded) */}
            <div>
                <p className="text-lg font-medium mb-2 mt-2">Price Range</p>
                <div className="space-y-2 text-sm">
                    {[
                        { id: 'u500', label: 'Under ₹500' },
                        { id: '500-999', label: '₹500 - ₹999' },
                        { id: '1000-1999', label: '₹1000 - ₹1999' },
                        { id: '2000+', label: '₹2000 and above' }
                    ].map(b => (
                        <label key={b.id} className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                className="accent-black"
                                checked={selectedPriceBands.includes(b.id)}
                                onChange={(e) => {
                                    const next = new Set(selectedPriceBands);
                                    if (e.target.checked) next.add(b.id); else next.delete(b.id);
                                    const value = Array.from(next).join(',');
                                    // Clear single min/max when using bands
                                    updateParams({ priceBands: value, minPrice: '', maxPrice: '', page: 1 });
                                }}
                            />
                            <span>{b.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Pagination controls moved to product grid */}
        </div>
    );
};

export default FilterComponent;
