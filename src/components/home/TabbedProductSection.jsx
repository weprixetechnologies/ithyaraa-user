"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { TiStarFullOutline } from "react-icons/ti";
import { useWishlist } from "@/contexts/WishlistContext";
import axiosInstance from "@/lib/axiosInstance";
import logo from "../../../public/ithyaraa-logo.png";
import ShopProductCard from "@/components/ui/ShopProductCard";

const safeParseProduct = (product) => {
    const parsed = { ...product };
    const jsonFields = ["galleryImage", "featuredImage", "categories"];
    jsonFields.forEach((field) => {
        if (field in parsed && typeof parsed[field] === 'string') {
            try {
                parsed[field] = JSON.parse(parsed[field]);
            } catch {
                parsed[field] = parsed[field];
            }
        }
    });
    return parsed;
};

const TabbedProductSection = ({
    heading = "Featured Products",
    subHeading = "Discover amazing products",
    categories: categoriesProp = [],
    initialProducts = [],
    initialPagination = null,
    initialLimit = 12,
    loadMoreLimit = 8
}) => {
    const { isInWishlist, toggleWishlist, loading } = useWishlist();
    const [activeTab, setActiveTab] = useState('all');
    const [products, setProducts] = useState(() => (initialProducts?.length ? initialProducts.map(safeParseProduct) : []));
    const [categories, setCategories] = useState(categoriesProp?.length ? categoriesProp : []);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [pagination, setPagination] = useState(() => {
        if (initialPagination) {
            return { page: initialPagination.currentPage ?? 1, hasMore: initialPagination.hasNextPage ?? false };
        }
        return { page: 1, hasMore: true };
    });
    const [error, setError] = useState(null);
    const loadMoreRef = useRef(null);
    const isFetchingRef = useRef(false);

    // Refs for observer checking to avoid dependencies and recreation
    const paginationRef = useRef(pagination);
    const loadingProductsRef = useRef(loadingProducts);
    const loadingMoreRef = useRef(loadingMore);

    useEffect(() => {
        paginationRef.current = pagination;
        loadingProductsRef.current = loadingProducts;
        loadingMoreRef.current = loadingMore;
    }, [pagination, loadingProducts, loadingMore]);

    const fetchProducts = useCallback(async (categoryID = '', page = 1, isLoadMore = false) => {
        if (isFetchingRef.current) return;
        try {
            isFetchingRef.current = true;
            if (isLoadMore) {
                setLoadingMore(true);
            } else {
                setLoadingProducts(true);
                setError(null);
            }
            const params = new URLSearchParams();
            // Use consistent limit to maintain backend offset
            const activeLimit = isLoadMore ? (loadMoreLimit || initialLimit) : initialLimit;
            params.append('limit', String(activeLimit));
            params.append('page', String(page));
            params.append('stock', 'in'); // Filter for 'In Stock' products
            if (categoryID) params.append('categoryID', categoryID);
            const { data } = await axiosInstance.get(`/products/shop?${params.toString()}`);
            if (data?.success) {
                const parsedProducts = (data.data || []).map(safeParseProduct);
                if (isLoadMore) {
                    setProducts(prev => [...prev, ...parsedProducts]);
                } else {
                    setProducts(parsedProducts);
                }
                setPagination({
                    page: data.pagination?.currentPage || page,
                    hasMore: data.pagination?.hasNextPage || false
                });
            } else {
                setError('Failed to load products');
                if (!isLoadMore) setProducts([]);
            }
        } catch (err) {
            setError(`Failed to load products: ${err.message}`);
            if (!isLoadMore) setProducts([]);
        } finally {
            setLoadingProducts(false);
            setLoadingMore(false);
            isFetchingRef.current = false;
        }
    }, [initialLimit, loadMoreLimit]);

    const handleTabChange = (categoryID) => {
        setActiveTab(categoryID);
        setProducts([]);
        setPagination({ page: 1, hasMore: true });
        fetchProducts(categoryID === 'all' ? '' : categoryID, 1, false);
    };

    useEffect(() => {
        if (initialProducts?.length) return
        fetchProducts('', 1, false);
    }, []);

    // Stable Scroll-based load more functionality
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (
                    entry.isIntersecting &&
                    paginationRef.current.hasMore &&
                    !loadingMoreRef.current &&
                    !loadingProductsRef.current &&
                    !isFetchingRef.current
                ) {
                    // Calculate next page based on stable ref
                    const nextPage = paginationRef.current.page + 1;
                    fetchProducts(activeTab === 'all' ? '' : activeTab, nextPage, true);
                }
            },
            { threshold: 0.1, rootMargin: '100px' } // Trigger slightly before it reaches the view
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, [activeTab, fetchProducts]); // Only depend on tab and stable fetch function

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
                {categories.map((category) => (
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
                ))}
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
                        <ShopProductCard
                            key={product.productID}
                            product={product}
                            isInWishlist={isInWishlist}
                            onToggleWishlist={handleToggleWishlist}
                            loading={loading}
                        />
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
