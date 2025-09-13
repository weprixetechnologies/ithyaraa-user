"use client";

import React, { useEffect, useRef } from 'react';
import { useWishlist } from '@/contexts/WishlistContext';
import ShopProductCard from '@/components/ui/ShopProductCard';
import Link from 'next/link';
import { FaHeart, FaSyncAlt } from 'react-icons/fa';

const WishlistPage = () => {
    const { wishlistItems, loading, initialized, refreshWishlist } = useWishlist();
    const hasRefreshed = useRef(false);

    // Refresh wishlist data only when user visits the wishlist page
    useEffect(() => {
        if (initialized && !hasRefreshed.current) {
            hasRefreshed.current = true;
            refreshWishlist();
        }
    }, [initialized, refreshWishlist]);

    if (!initialized || loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading your wishlist...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (wishlistItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-12">
                        <FaHeart size={64} color="#e5e7eb" className="mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h1>
                        <p className="text-gray-600 mb-8">Start adding items you love to your wishlist!</p>
                        <Link
                            href="/shop"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-900 hover:bg-gray-700 transition-colors duration-200"
                        >
                            Start Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 ">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className='flex flex-col items-center py-8'>
                    <p className="text-2xl">My Wishlist</p>
                    <p className="text-xs text-gray-400 font-medium">Home &gt;  My Wishlist</p>
                    {/* <p className=" text-gray-600">
                        {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} in your wishlist
                    </p> */}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {wishlistItems.map((item) => (
                        <ShopProductCard key={item.wishlistItemID} product={item} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WishlistPage;
