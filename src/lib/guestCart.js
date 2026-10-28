import { getCookie } from './setCookie';
import axiosInstance from './axiosInstance';

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
        const newItem = {
            id: `guest_combo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            type: 'combo',
            mainProductID: cartItem.mainProductID,
            quantity: Number(cartItem.quantity) || 1,
            products: cartItem.products || [],
            addedAt: Date.now()
        };
        cart.push(newItem);
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
        } else {
            const newItem = {
                id: `guest_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                type: 'single',
                productID: cartItem.productID,
                quantity: Number(cartItem.quantity) || 1,
                variationName: cartItem.variationName || '',
                variationID: cartItem.variationID || null,
                referBy: cartItem.referBy || null,
                customInputs: cartItem.customInputs || null,
                selectedDressType: cartItem.selectedDressType || null,
                presaleProductID: cartItem.presaleProductID || null,
                addedAt: Date.now()
            };
            cart.push(newItem);
        }
    }

    saveGuestCart(cart);
    return cart;
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
