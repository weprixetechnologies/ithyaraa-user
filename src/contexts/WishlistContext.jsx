"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import axiosInstance from '@/lib/axiosInstance';
import { toast } from 'react-toastify';

const WishlistContext = createContext();

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};

export const WishlistProvider = ({ children }) => {
    const pathname = usePathname();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [wishlistProductIds, setWishlistProductIds] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);

    // Fetch wishlist items
    const fetchWishlist = async () => {
        setLoading(true);
        try {
            const { data } = await axiosInstance.get('/wishlist/get-wishlist');
            if (data?.success) {
                const items = data.data?.items || [];
                setWishlistItems(items);
                const productIds = new Set(items.map(item => item.productID));
                setWishlistProductIds(productIds);
                return items;
            } else {
                setWishlistItems([]);
                setWishlistProductIds(new Set());
                return [];
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            setWishlistItems([]);
            setWishlistProductIds(new Set());
            return [];
        } finally {
            setLoading(false);
        }
    };

    // Add product to wishlist
    const addToWishlist = async (productID) => {
        if (!isUserAuthenticated()) {
            toast.error('Please login to add items to wishlist');
            return false;
        }

        try {
            const { data } = await axiosInstance.post('/wishlist/add-wishlist', {
                productID
            });

            if (data?.success) {
                // Add to local state
                setWishlistProductIds(prev => new Set([...prev, productID]));
                // toast.success('Added to wishlist!');
                return true;
            } else {
                if (data?.alreadyExists) {
                    toast.info('Product already in wishlist');
                } else {
                    toast.error(data?.message || 'Failed to add to wishlist');
                }
                return false;
            }
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            if (error.response?.status === 401) {
                toast.error('Please login to add items to wishlist');
            } else {
                toast.error('Failed to add to wishlist');
            }
            return false;
        }
    };

    // Remove product from wishlist
    const removeFromWishlist = async (productID) => {
        if (!isUserAuthenticated()) {
            toast.error('Please login to manage wishlist');
            return false;
        }

        try {
            const { data } = await axiosInstance.delete(`/wishlist/remove-product/${productID}`);

            if (data?.success) {
                // Remove from local state
                setWishlistProductIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(productID);
                    return newSet;
                });
                setWishlistItems(prev => prev.filter(item => item.productID !== productID));
                // toast.success('Removed from wishlist');
                return true;
            } else {
                toast.error(data?.message || 'Failed to remove from wishlist');
                return false;
            }
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            if (error.response?.status === 401) {
                toast.error('Please login to manage wishlist');
            } else {
                toast.error('Failed to remove from wishlist');
            }
            return false;
        }
    };

    // Toggle wishlist status
    const toggleWishlist = async (productID) => {
        if (wishlistProductIds.has(productID)) {
            return await removeFromWishlist(productID);
        } else {
            return await addToWishlist(productID);
        }
    };

    // Check if product is in wishlist
    const isInWishlist = (productID) => {
        return wishlistProductIds.has(productID);
    };

    // Check if user is authenticated
    const isUserAuthenticated = () => {
        if (typeof window === 'undefined') return false;
        try {
            const iil = document.cookie.split('; ').find(c => c.startsWith('_iil='))?.split('=')[1];
            const at = document.cookie.split('; ').find(c => c.startsWith('_at='))?.split('=')[1];
            const rt = document.cookie.split('; ').find(c => c.startsWith('_rt='))?.split('=')[1];
            return iil === 'true' && at && rt;
        } catch (error) {
            console.error('Error checking authentication:', error);
            return false;
        }
    };

    // Initialize wishlist on mount only if user is authenticated and not on login page
    useEffect(() => {
        if (!initialized && isUserAuthenticated() && pathname !== '/login') {
            fetchWishlist().finally(() => setInitialized(true));
        } else if (!isUserAuthenticated() || pathname === '/login') {
            // If user is not authenticated or on login page, mark as initialized to prevent further attempts
            setInitialized(true);
        }
    }, [pathname]);

    // Force refresh wishlist data
    const refreshWishlist = useCallback(async () => {
        if (isUserAuthenticated() && pathname !== '/login') {
            await fetchWishlist();
        }
    }, [pathname]);

    const value = {
        wishlistItems,
        wishlistProductIds,
        loading,
        initialized,
        fetchWishlist,
        refreshWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        wishlistCount: wishlistProductIds.size
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};
