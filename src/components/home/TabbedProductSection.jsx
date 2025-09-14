"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { TiStarFullOutline } from "react-icons/ti";
import { useWishlist } from "@/contexts/WishlistContext";
import axiosInstance from "@/lib/axiosInstance";

const TabbedProductSection = ({
    heading = "Featured Products",
    subHeading = "Discover amazing products",
    initialLimit = 12,
    loadMoreLimit = 8
}) => {
    const { isInWishlist, toggleWishlist, loading } = useWishlist();
    const [activeTab, setActiveTab] = useState('all');
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, hasMore: true });
    const [error, setError] = useState(null);
    const loadMoreRef = useRef(null);

    // Helper to safely JSON.parse any field
    const safeParse = (value) => {
        try {
            return typeof value === "string" ? JSON.parse(value) : value;
        } catch {
            return value;
        }
    };

    // Fetch categories from API
    const fetchCategories = useCallback(async () => {
        try {
            setLoadingCategories(true);
            const { data } = await axiosInstance.get('/categories/public');

            if (data?.success) {
                setCategories(data.data || []);
            } else {
                console.error('Failed to fetch categories');
                setCategories([]);
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
            setCategories([]);
        } finally {
            setLoadingCategories(false);
        }
    }, []);

    // Fetch products based on active tab
    const fetchProducts = useCallback(async (categoryID = '', page = 1, isLoadMore = false) => {
        try {
            if (isLoadMore) {
                setLoadingMore(true);
            } else {
                setLoadingProducts(true);
                setError(null);
            }

            const params = new URLSearchParams();
            params.append('limit', String(isLoadMore ? loadMoreLimit : initialLimit));
            params.append('page', String(page));
            if (categoryID) params.append('categoryID', categoryID);

            const { data } = await axiosInstance.get(`/products/shop?${params.toString()}`);

            if (data?.success) {
                const rawProducts = data.data || [];

                // Parse JSON fields like featuredImage, categories, etc.
                const parsedProducts = rawProducts.map((product) => {
                    const parsed = { ...product };

                    // Parse JSON fields
                    const jsonFields = ["galleryImage", "featuredImage", "categories"];
                    jsonFields.forEach((field) => {
                        if (field in parsed && typeof parsed[field] === 'string') {
                            try {
                                parsed[field] = JSON.parse(parsed[field]);
                            } catch (e) {
                                console.warn(`Failed to parse ${field}:`, e);
                                parsed[field] = parsed[field];
                            }
                        }
                    });

                    return parsed;
                });

                if (isLoadMore) {
                    setProducts(prev => [...prev, ...parsedProducts]);
                } else {
                    setProducts(parsedProducts);
                }

                // Use pagination from API response
                setPagination({
                    page: data.pagination?.currentPage || page,
                    hasMore: data.pagination?.hasNextPage || false
                });
            } else {
                setError('Failed to load products');
                if (!isLoadMore) {
                    setProducts([]);
                }
            }
        } catch (err) {
            console.error('Error fetching products:', err);
            setError(`Failed to load products: ${err.message}`);
            if (!isLoadMore) {
                setProducts([]);
            }
        } finally {
            setLoadingProducts(false);
            setLoadingMore(false);
        }
    }, [initialLimit, loadMoreLimit]);

    const loadMore = () => {
        if (pagination.hasMore && !loadingMore) {
            fetchProducts(activeTab === 'all' ? '' : activeTab, pagination.page + 1, true);
        }
    };

    const handleTabChange = (categoryID) => {
        setActiveTab(categoryID);
        setProducts([]);
        setPagination({ page: 1, hasMore: true });
        fetchProducts(categoryID === 'all' ? '' : categoryID, 1, false);
    };

    // Initial load - fetch categories first, then products
    useEffect(() => {
        fetchCategories();
        fetchProducts('', 1, false);
    }, [fetchCategories, fetchProducts]);

    // Scroll-based load more functionality
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && pagination.hasMore && !loadingMore && !loadingProducts) {
                    loadMore();
                }
            },
            { threshold: 0.5 }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => {
            if (loadMoreRef.current) {
                observer.unobserve(loadMoreRef.current);
            }
        };
    }, [pagination.hasMore, loadingMore, loadingProducts]);

    const handleToggleWishlist = async (productID) => {
        await toggleWishlist(productID);
    };

    return (
        <section className="py-8 px-4 md:px-6 lg:px-8">
            <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{heading}</h2>
                <p className="text-md text-gray-600">{subHeading}</p>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
                <button
                    onClick={() => handleTabChange('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === 'all'
                        ? 'bg-black text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    All Products
                </button>
                {loadingCategories ? (
                    <div className="flex items-center gap-2 text-gray-500">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                        <span className="text-sm">Loading categories...</span>
                    </div>
                ) : (
                    categories.map((category) => (
                        <button
                            key={category.categoryID}
                            onClick={() => handleTabChange(category.categoryID)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === category.categoryID
                                ? 'bg-black text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {category.categoryName}
                        </button>
                    ))
                )}
            </div>

            {/* Loading State */}
            {loadingProducts && (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                </div>
            )}

            {/* Error State */}
            {error && !loadingProducts && (
                <div className="text-center py-12">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => handleTabChange(activeTab)}
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Products Grid - Responsive Grid Layout */}
            {!loadingProducts && !error && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
                    {products.map((product) => (
                        <div key={product.productID} className="group">
                            <div className="relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
                                {/* Image Container */}
                                <div className="aspect-square relative overflow-hidden">
                                    <div className="absolute inset-0 flex w-[200%] h-full transition-transform duration-500 ease-out group-hover:-translate-x-1/2">
                                        {/* Main Image */}
                                        <div className="relative w-1/2 h-full">
                                            <Link href={`/products/${product.productID}`}>
                                                <Image
                                                    src={product.featuredImage?.[0]?.imgUrl || product.featuredImage?.[0] || '/placeholder.jpg'}
                                                    alt={product.name}
                                                    fill
                                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 16vw"
                                                    className="object-cover"
                                                    onError={(e) => {
                                                        console.warn('Image failed to load:', product.featuredImage?.[0]);
                                                        e.target.src = '/placeholder.jpg';
                                                    }}
                                                />
                                            </Link>
                                        </div>
                                        {/* Hover Image */}
                                        <div className="relative w-1/2 h-full">
                                            <Link href={`/products/${product.productID}`}>
                                                <Image
                                                    src={product.featuredImage?.[1]?.imgUrl || product.featuredImage?.[1] || product.featuredImage?.[0]?.imgUrl || product.featuredImage?.[0] || '/placeholder.jpg'}
                                                    alt={`${product.name} - alt`}
                                                    fill
                                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 16vw"
                                                    className="object-cover"
                                                    onError={(e) => {
                                                        console.warn('Hover image failed to load:', product.featuredImage?.[1]);
                                                        e.target.src = '/placeholder.jpg';
                                                    }}
                                                />
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Wishlist Button */}
                                    <button
                                        onClick={() => handleToggleWishlist(product.productID)}
                                        disabled={loading}
                                        className={`absolute top-2 right-2 z-20 rounded-full p-2 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-md hover:shadow-lg transition-all duration-200 flex justify-center items-center ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                                            }`}
                                        aria-label={isInWishlist(product.productID) ? "Remove from wishlist" : "Add to wishlist"}
                                    >
                                        {isInWishlist(product.productID) ? (
                                            <FaHeart size={14} color="red" />
                                        ) : (
                                            <FaRegHeart size={14} color="grey" />
                                        )}
                                    </button>

                                    {/* Rating */}
                                    {product.rating && (
                                        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 text-xs flex items-center gap-1 font-bold">
                                            <TiStarFullOutline color="#ffd232" size={10} />
                                            {product.rating}
                                        </div>
                                    )}
                                </div>

                                {/* Product Info */}
                                <div className="p-3">
                                    <Link href={`/products/${product.productID}`}>
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                {product.brand}
                                            </p>
                                            <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">
                                                {product.name}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-sm font-bold text-gray-900">
                                                ₹{product.salePrice}
                                            </span>
                                            {product.regularPrice && product.regularPrice > product.salePrice && (
                                                <>
                                                    <span className="text-xs text-gray-500 line-through">
                                                        ₹{product.regularPrice}
                                                    </span>
                                                    <span className="text-xs text-green-600 font-medium">
                                                        {Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100)}% OFF
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Scroll Load More Trigger */}
            {!loadingProducts && !error && pagination.hasMore && (
                <div ref={loadMoreRef} className="flex justify-center py-8">
                    {loadingMore ? (
                        <div className="flex items-center gap-2 text-gray-600">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                            <span className="text-sm">Loading more products...</span>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 text-sm">
                            Scroll down to load more products
                        </div>
                    )}
                </div>
            )}

            {/* No More Products */}
            {!loadingProducts && !error && !pagination.hasMore && products.length > 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                    You've seen all the products!
                </div>
            )}

            {/* No Products Found */}
            {!loadingProducts && !error && products.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <p className="text-lg font-medium mb-2">No products found for this category.</p>
                    <button
                        onClick={() => handleTabChange('all')}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                        View All Products
                    </button>
                </div>
            )}
        </section>
    );
};

export default TabbedProductSection;
