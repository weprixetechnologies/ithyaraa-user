"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

    // Initialize wishlist on mount
    useEffect(() => {
        if (!initialized) {
            fetchWishlist().finally(() => setInitialized(true));
        }
    }, [initialized]);

    // Force refresh wishlist data
    const refreshWishlist = useCallback(async () => {
        await fetchWishlist();
    }, []);

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
