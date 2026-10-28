import { getCookie } from './setCookie';
import axiosInstance from './axiosInstance';
export { GUEST_TOKEN_COOKIE, getOrCreateGuestToken, clearGuestToken } from './guestToken';

const GUEST_CART_STORAGE_KEY = 'ithyaraa_guest_cart';

/**
 * Check if the user is currently logged in based on client-side cookies
 */
export const isUserLoggedIn = () => {
    if (typeof window === 'undefined') return false;
    const accessToken = getCookie('_at');
    const isLoggedIn = getCookie('_iil');
    return !!(accessToken && (isLoggedIn === 'true' || isLoggedIn === true));
};

/**
 * Retrieve all items from the guest cart in localStorage
 */
export const getGuestCart = () => {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(GUEST_CART_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error('Error reading guest cart from localStorage:', e);
        return [];
    }
};

/**
 * Save array of cart items to localStorage
 */
export const saveGuestCart = (items) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(items));
        // Dispatch custom event for cross-component reactive updates
        window.dispatchEvent(new CustomEvent('guest-cart-updated', { detail: items }));
    } catch (e) {
        console.error('Error saving guest cart to localStorage:', e);
    }
};

/**
 * Calculate total quantity of items in guest cart
 */
export const getGuestCartCount = () => {
    const items = getGuestCart();
    return items.reduce((total, item) => total + (Number(item.quantity) || 1), 0);
};

/**
 * Add an item or combo to the guest cart in localStorage
 */
export const addGuestCartItem = (cartItem) => {
    const cart = getGuestCart();
    const itemType = cartItem.type || 'single';

    if (itemType === 'combo') {
        const existingComboIndex = cart.findIndex((item) =>
            item.type === 'combo' &&
            item.mainProductID === cartItem.mainProductID &&
            JSON.stringify(item.products || []) === JSON.stringify(cartItem.products || [])
        );

        if (existingComboIndex > -1) {
            cart[existingComboIndex].quantity = (Number(cart[existingComboIndex].quantity) || 1) + (Number(cartItem.quantity) || 1);
        } else {
            const newItem = {
                id: `guest_combo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                cartItemID: `guest_combo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                type: 'combo',
                mainProductID: cartItem.mainProductID,
                name: cartItem.name || 'Combo',
                salePrice: Number(cartItem.salePrice ?? cartItem.regularPrice ?? 0),
                regularPrice: Number(cartItem.regularPrice ?? 0),
                featuredImage: cartItem.featuredImage || [],
                slug: cartItem.slug || '',
                quantity: Number(cartItem.quantity) || 1,
                products: cartItem.products || [],
                selected: true,
                addedAt: Date.now()
            };
            cart.push(newItem);
        }
    } else {
        // Single product item
        const existingIndex = cart.findIndex((item) =>
            item.type !== 'combo' &&
            item.productID === cartItem.productID &&
            item.variationID === cartItem.variationID &&
            JSON.stringify(item.customInputs || {}) === JSON.stringify(cartItem.customInputs || {}) &&
            JSON.stringify(item.selectedDressType || {}) === JSON.stringify(cartItem.selectedDressType || {})
        );

        if (existingIndex > -1) {
            cart[existingIndex].quantity = (Number(cart[existingIndex].quantity) || 1) + (Number(cartItem.quantity) || 1);
            if (cartItem.name) cart[existingIndex].name = cartItem.name;
            if (cartItem.featuredImage) cart[existingIndex].featuredImage = cartItem.featuredImage;
            if (cartItem.salePrice !== undefined) cart[existingIndex].salePrice = cartItem.salePrice;
        } else {
            const newItem = {
                id: `guest_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                cartItemID: `guest_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                type: 'single',
                productID: cartItem.productID,
                name: cartItem.name || 'Product',
                featuredImage: cartItem.featuredImage || [],
                salePrice: Number(cartItem.salePrice ?? cartItem.regularPrice ?? 0),
                regularPrice: Number(cartItem.regularPrice ?? 0),
                quantity: Number(cartItem.quantity) || 1,
                variationName: cartItem.variationName || '',
                variationID: cartItem.variationID || null,
                selected: true,
                referBy: cartItem.referBy || null,
                customInputs: cartItem.customInputs || null,
                selectedDressType: cartItem.selectedDressType || null,
                presaleProductID: cartItem.presaleProductID || null,
                slug: cartItem.slug || '',
                brand: cartItem.brand || '',
                addedAt: Date.now()
            };
            cart.push(newItem);
        }
    }

    saveGuestCart(cart);
    return cart;
};

/**
 * Remove an item from guest cart
 */
export const removeGuestCartItem = (cartItemID) => {
    const cart = getGuestCart();
    const filtered = cart.filter(item => String(item.cartItemID) !== String(cartItemID) && String(item.id) !== String(cartItemID));
    saveGuestCart(filtered);
    return filtered;
};

/**
 * Update selection state of items in guest cart
 */
export const updateGuestCartSelected = (selectedIDs) => {
    const cart = getGuestCart();
    const selectedSet = new Set((selectedIDs || []).map(String));
    const updated = cart.map(item => ({
        ...item,
        selected: selectedSet.has(String(item.cartItemID)) || selectedSet.has(String(item.id))
    }));
    saveGuestCart(updated);
    return updated;
};

/**
 * Returns a formatted cart payload for Redux state when user is not logged in
 */
export const getFormattedGuestCart = () => {
    const items = getGuestCart();
    
    // Normalize image format so CartDrawer can render them safely
    const normalizedItems = items.map(item => {
        let featImg = item.featuredImage;
        if (typeof featImg === 'string') {
            try {
                const parsed = JSON.parse(featImg);
                featImg = Array.isArray(parsed) ? parsed : [{ imgUrl: featImg }];
            } catch {
                featImg = [{ imgUrl: featImg }];
            }
        } else if (!Array.isArray(featImg)) {
            featImg = featImg?.imgUrl ? [featImg] : [];
        }

        return {
            ...item,
            cartItemID: item.cartItemID || item.id,
            featuredImage: featImg,
            selected: item.selected !== false
        };
    });

    const selectedItems = normalizedItems.filter(item => item.selected !== false);
    const subtotal = selectedItems.reduce((acc, item) => {
        const p = Number(item.salePrice ?? item.regularPrice ?? 0);
        const q = Number(item.quantity) || 1;
        return acc + (p * q);
    }, 0);

    return {
        items: normalizedItems,
        summary: {
            subtotal,
            totalDiscount: 0,
            shipping: 0,
            total: subtotal
        }
    };
};

/**
 * Clear all guest cart items from localStorage
 */
export const clearGuestCart = () => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem(GUEST_CART_STORAGE_KEY);
        window.dispatchEvent(new CustomEvent('guest-cart-updated', { detail: [] }));
    } catch (e) {
        console.error('Error clearing guest cart:', e);
    }
};

/**
 * Synchronize guest cart items with backend once user logs in
 */
export const syncGuestCartToBackend = async (dispatch, getCartAsync) => {
    const items = getGuestCart();
    if (!items || items.length === 0) return { synced: 0 };

    console.log(`[GuestCart] Syncing ${items.length} guest cart item(s) to server...`);
    let successCount = 0;

    for (const item of items) {
        try {
            if (item.type === 'combo') {
                await axiosInstance.post('/cart/add-cart-combo', {
                    mainProductID: item.mainProductID,
                    quantity: item.quantity,
                    products: item.products
                });
                successCount++;
            } else {
                await axiosInstance.post('/cart/add-cart', {
                    productID: item.productID,
                    quantity: item.quantity,
                    variationName: item.variationName,
                    variationID: item.variationID,
                    referBy: item.referBy,
                    customInputs: item.customInputs,
                    selectedDressType: item.selectedDressType,
                    presaleProductID: item.presaleProductID
                });
                successCount++;
            }
        } catch (error) {
            console.error('[GuestCart] Failed to post guest cart item:', item, error);
        }
    }

    // Clear guest cart once synced
    clearGuestCart();

    // If dispatch and getCartAsync provided, refresh user's cart
    if (dispatch && getCartAsync) {
        try {
            await dispatch(getCartAsync()).unwrap();
        } catch (e) {
            console.error('[GuestCart] Error refreshing cart after sync:', e);
        }
    }

    console.log(`[GuestCart] Successfully synced ${successCount} item(s) to user cart`);
    return { synced: successCount };
};
