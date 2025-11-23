"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import axiosInstance from "@/lib/axiosInstance";

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

const SearchNavbar = () => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [mounted, setMounted] = useState(false);
    const searchRef = useRef(null);
    const resultsRef = useRef(null);
    const router = useRouter();
    const debounceTimerRef = useRef(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Debounced search function
    const performSearch = useCallback(async (searchQuery) => {
        if (!searchQuery || searchQuery.trim().length === 0) {
            setResults([]);
            setShowResults(false);
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
                setShowResults(true);
            } else {
                setResults([]);
                setShowResults(false);
            }
        } catch (error) {
            console.error('Search error:', error);
            setResults([]);
            setShowResults(false);
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
            router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
            setShowResults(false);
        }
    };

    // Handle click outside to close results
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                searchRef.current && 
                !searchRef.current.contains(event.target) &&
                resultsRef.current &&
                !resultsRef.current.contains(event.target)
            ) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Handle Escape key to close results
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                setShowResults(false);
            }
        };

        if (showResults) {
            document.addEventListener('keydown', handleEscape);
            return () => {
                document.removeEventListener('keydown', handleEscape);
            };
        }
    }, [showResults]);

    if (!mounted) return null;

    return (
        <div className="relative w-[500px] max-w-[600px]" ref={searchRef}>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => query.trim() && setShowResults(true)}
                    placeholder="Search for products..."
                    className="w-full max-h-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </form>

            {/* Search Results Dropdown */}
            {showResults && (
                <div
                    ref={resultsRef}
                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-[500px] overflow-y-auto"
                >
                    {loading ? (
                        <div className="p-4 text-center text-gray-500">
                            Searching...
                        </div>
                    ) : results.length > 0 ? (
                        <div className="py-2">
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
                                        onClick={() => setShowResults(false)}
                                        className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden">
                                            <Image
                                                src={imgUrl}
                                                alt={product.name || 'Product'}
                                                fill
                                                sizes="64px"
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                                                {product.name}
                                            </h3>
                                            {product.brand && (
                                                <p className="text-xs text-gray-500 mt-0.5">{product.brand}</p>
                                            )}
                                            <div className="flex items-center gap-2 mt-1">
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
                                <div className="border-t border-gray-200 p-2">
                                    <Link
                                        href={`/shop?search=${encodeURIComponent(query.trim())}`}
                                        onClick={() => setShowResults(false)}
                                        className="block text-center text-sm text-primary font-medium hover:underline py-2"
                                    >
                                        View all results for "{query}"
                                    </Link>
                                </div>
                            )}
                        </div>
                    ) : query.trim() ? (
                        <div className="p-4 text-center text-gray-500">
                            No products found. Try a different search term.
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default SearchNavbar;
