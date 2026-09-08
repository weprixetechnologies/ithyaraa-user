"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getActiveProductBadges } from '@/lib/api/badgeApi';

const ProductBadgesContext = createContext();

export const useProductBadges = () => {
    const context = useContext(ProductBadgesContext);
    if (!context) {
        // Fallback safely if consumed outside provider
        return {
            badgesMap: {},
            getProductBadges: () => [],
            fetchBadges: () => {}
        };
    }
    return context;
};

export const ProductBadgesProvider = ({ children }) => {
    const [badgesMap, setBadgesMap] = useState({});
    const [loading, setLoading] = useState(false);

    const fetchBadges = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getActiveProductBadges();
            setBadgesMap(data || {});
        } catch (error) {
            console.error('Error in ProductBadgesProvider:', error);
            setBadgesMap({});
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBadges();
    }, [fetchBadges]);

    const getProductBadges = useCallback((productID) => {
        if (!productID) return [];
        return badgesMap[productID] || [];
    }, [badgesMap]);

    return (
        <ProductBadgesContext.Provider value={{ badgesMap, getProductBadges, fetchBadges, loading }}>
            {children}
        </ProductBadgesContext.Provider>
    );
};
