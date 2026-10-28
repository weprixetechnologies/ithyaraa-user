import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/axiosInstance";
import { isUserLoggedIn, addGuestCartItem, getGuestCartCount } from "@/lib/guestCart";

// Add to cart
export const addCartAsync = createAsyncThunk(
    "cart/addCartAsync",
    async ({ productID, quantity, variationName, variationID, referBy, customInputs, selectedDressType, presaleProductID }) => {
        // If not logged in, store item in localStorage and return guest success
        if (!isUserLoggedIn()) {
            addGuestCartItem({
                productID,
                quantity: quantity || 1,
                variationName,
                variationID,
                referBy,
                customInputs,
                selectedDressType,
                presaleProductID
            });
            return {
                success: true,
                guest: true,
                message: "Item added to cart (guest)",
                crossSellProducts: []
            };
        }

        const response = await axiosInstance.post("/cart/add-cart", {
            productID,
            quantity,
            variationName,
            variationID,
            referBy,
            customInputs,
            selectedDressType,
            presaleProductID
        });
        return response.data; // available as action.payload
    }
);

export const addCartComboAsync = createAsyncThunk(
    "cart/addCartComboAsync",
    async ({ mainProductID, quantity, products }) => {
        // If not logged in, store combo in localStorage and return guest success
        if (!isUserLoggedIn()) {
            addGuestCartItem({
                type: 'combo',
                mainProductID,
                quantity: quantity || 1,
                products
            });
            return {
                success: true,
                guest: true,
                message: "Combo added to cart (guest)"
            };
        }

        const response = await axiosInstance.post("/cart/add-cart-combo", {
            products,
            mainProductID,
            quantity,
        });
        return response.data; // available as action.payload
    }
);


// Get cart
function deepParseJSON(obj) {
    if (typeof obj === "string") {
        try {
            return JSON.parse(obj);
        } catch {
            return obj;
        }
    } else if (Array.isArray(obj)) {
        return obj.map(deepParseJSON);
    } else if (obj && typeof obj === "object") {
        const parsed = {};
        for (const key in obj) {
            parsed[key] = deepParseJSON(obj[key]);
        }
        return parsed;
    }
    return obj;
}

export const getCartAsync = createAsyncThunk(
    "cart/getCartAsync",
    async () => {
        const response = await axiosInstance.post("/cart/get-cart");
        return deepParseJSON(response.data); // parses featuredImage automatically
    }
);

export const removeCartItemAsync = createAsyncThunk(
    "cart/removeCartItemAsync",
    async (cartItemID) => {
        const response = await axiosInstance.post("/cart/remove-cart", {
            cartItemID
        });
        return response.data;
    }
);


const initialState = {
    cartCount: 0,
    cart: [],
    cartDetail: {}
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        initGuestCart: (state) => {
            state.cartCount = getGuestCartCount();
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(addCartAsync.fulfilled, (state, action) => {
                if (action.payload?.guest) {
                    state.cartCount = getGuestCartCount();
                } else {
                    state.cartCount += 1;          // increment counter
                    state.cart = action.payload;   // set cart to API response
                }
            })
            .addCase(addCartComboAsync.fulfilled, (state, action) => {
                if (action.payload?.guest) {
                    state.cartCount = getGuestCartCount();
                } else {
                    state.cartCount += 1;          // increment counter
                    state.cart = action.payload;   // set cart to API response
                }
            })
            .addCase(getCartAsync.fulfilled, (state, action) => {
                // console.log(action.payload.items);

                state.cart = action.payload.items;
                state.cartDetail = action.payload.summary
                state.cartCount = action.payload?.items?.length || 0; // set count dynamically
            })
            .addCase(removeCartItemAsync.fulfilled, (state, action) => {
                if (action.payload.success) {
                    // Refresh cart data after successful removal
                    // The cart will be refreshed by calling getCartAsync
                    state.cartCount = Math.max(0, state.cartCount - 1);
                }
            });
    },
});

export const { initGuestCart } = cartSlice.actions;

export default cartSlice.reducer;
