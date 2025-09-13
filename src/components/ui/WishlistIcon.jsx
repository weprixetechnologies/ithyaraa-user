"use client";

import React from 'react';
import Link from 'next/link';
import { FaHeart } from 'react-icons/fa';
import { useWishlist } from '@/contexts/WishlistContext';

const WishlistIcon = () => {
    const { wishlistCount, loading } = useWishlist();

    return (
        <Link
            href="/wishlist"
            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            aria-label="Wishlist"
        >
            <FaHeart
                size={20}
                color="#ef4444"
            />
            {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
            )}
        </Link>
    );
};

export default WishlistIcon;
