"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import axiosInstance from "@/lib/axiosInstance";
import { RxCross2 } from "react-icons/rx";
import { CiSearch } from "react-icons/ci";

const parseJSON = (val) => {
    try { return typeof val === 'string' ? JSON.parse(val) : (val || []); } catch { return []; }
};

const getProductHref = (product) => {
    const id = product?.productID;
    const type = product?.type;
    if (!id) return "/products";
    switch (type) {
        case 'variable':
            return `/products/${id}`;
        case 'combo':
            return `/combo/${id}`;
        case 'make_combo':
            return `/make-combo/${id}`;
        case 'customproduct':
            return `/custom-product/${id}`;
        default:
            return `/products/${id}`;
    }
};

const SearchDrawer = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const debounceTimerRef = useRef(null);
    const inputRef = useRef(null);

    // Focus input when drawer opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    // Clear search when drawer closes
    useEffect(() => {
        if (!isOpen) {
            setQuery("");
            setResults([]);
        }
    }, [isOpen]);

    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Debounced search function
    const performSearch = useCallback(async (searchQuery) => {
        if (!searchQuery || searchQuery.trim().length === 0) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const { data } = await axiosInstance.get(`/products/search?q=${encodeURIComponent(searchQuery.trim())}`);
            
            if (data?.success) {
                // Parse JSON fields for each product
                const parsedResults = (data.data || []).map((product) => {
                    const parsed = { ...product };
                    const jsonFields = ["galleryImage", "featuredImage", "categories"];
                    jsonFields.forEach((field) => {
                        if (field in parsed && typeof parsed[field] === 'string') {
                            try {
                                parsed[field] = JSON.parse(parsed[field]);
                            } catch (e) {
                                // Keep original value if parsing fails
                            }
                        }
                    });
                    return parsed;
                });
                
                setResults(parsedResults);
            } else {
                setResults([]);
            }
        } catch (error) {
            console.error('Search error:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Handle input change with debouncing
    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);

        // Clear previous timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Set new timer for debounced search
        debounceTimerRef.current = setTimeout(() => {
            performSearch(value);
        }, 300); // 300ms debounce
    };

    // Handle form submission (Enter key)
    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            // Navigate to shop page with search query
            onClose();
            router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
        }
    };

    const handleProductClick = () => {
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-opacity-50 z-40 transition-opacity" 
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    onClick={onClose}
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed top-0 left-0 h-full w-full bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-y-0' : '-translate-y-full'
                }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <div className="flex items-center gap-2 flex-1">
                            <CiSearch size={24} className="text-gray-500" />
                            <form onSubmit={handleSubmit} className="flex-1">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={handleInputChange}
                                    placeholder="Search for products..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-base"
                                />
                            </form>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors ml-2"
                            aria-label="Close search"
                        >
                            <RxCross2 size={20} />
                        </button>
                    </div>

                    {/* Search Results */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                                    <p className="mt-4 text-gray-500">Searching...</p>
                                </div>
                            </div>
                        ) : results.length > 0 ? (
                            <div className="p-4 space-y-2">
                                {results.map((product) => {
                                    const images = parseJSON(product?.featuredImage);
                                    const imgUrl = images?.[0]?.imgUrl || "/placeholder-product.jpg";
                                    const salePrice = Number(product?.salePrice ?? product?.regularPrice ?? 0);
                                    const regularPrice = Number(product?.regularPrice ?? salePrice);
                                    const discount = regularPrice > salePrice 
                                        ? Math.round(((regularPrice - salePrice) / regularPrice) * 100) 
                                        : 0;

                                    return (
                                        <Link
                                            key={product.productID}
                                            href={getProductHref(product)}
                                            onClick={handleProductClick}
                                            className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="relative w-20 h-20 flex-shrink-0 rounded overflow-hidden">
                                                <Image
                                                    src={imgUrl}
                                                    alt={product.name || 'Product'}
                                                    fill
                                                    sizes="80px"
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                                                    {product.name}
                                                </h3>
                                                {product.brand && (
                                                    <p className="text-xs text-gray-500 mt-1">{product.brand}</p>
                                                )}
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        ₹{salePrice}
                                                    </span>
                                                    {discount > 0 && (
                                                        <>
                                                            <span className="text-xs text-gray-500 line-through">
                                                                ₹{regularPrice}
                                                            </span>
                                                            <span className="text-xs text-green-600 font-medium">
                                                                {discount}% OFF
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                                {query.trim() && (
                                    <div className="border-t border-gray-200 pt-4 mt-4">
                                        <Link
                                            href={`/shop?search=${encodeURIComponent(query.trim())}`}
                                            onClick={handleProductClick}
                                            className="block text-center text-sm text-primary font-medium hover:underline py-3 bg-gray-50 rounded-lg"
                                        >
                                            View all results for "{query}"
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ) : query.trim() ? (
                            <div className="flex flex-col items-center justify-center py-20 px-4">
                                <CiSearch size={48} className="text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">
                                    No products found
                                </h3>
                                <p className="mt-2 text-sm text-gray-500 text-center">
                                    Try a different search term or browse our categories.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 px-4">
                                <CiSearch size={48} className="text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">
                                    Start searching
                                </h3>
                                <p className="mt-2 text-sm text-gray-500 text-center">
                                    Enter a product name or keyword to find what you're looking for.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default SearchDrawer;

