import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/axiosInstance";

// Add to cart
export const addCartAsync = createAsyncThunk(
    "cart/addCartAsync",
    async ({ productID, quantity, variationName, variationID, referBy, customInputs, selectedDressType, presaleProductID }) => {
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
        const response = await axiosInstance.post("/cart/add-cart-combo", {
            products,
            mainProductID,
            quantity,
        });
        return response.data; // available as action.payload
    }
);

// Deep JSON parsing helper for attributes like featuredImage
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

// Get cart
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
        clearCartState: (state) => {
            state.cartCount = 0;
            state.cart = [];
            state.cartDetail = {};
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(addCartAsync.fulfilled, (state, action) => {
                state.cartCount += 1;
                if (action.payload?.cartDetail) {
                    state.cartDetail = action.payload.cartDetail;
                }
            })
            .addCase(addCartComboAsync.fulfilled, (state, action) => {
                state.cartCount += 1;
                if (action.payload?.cartDetail) {
                    state.cartDetail = action.payload.cartDetail;
                }
            })
            .addCase(getCartAsync.fulfilled, (state, action) => {
                state.cart = action.payload?.items || [];
                state.cartDetail = action.payload?.summary || {};
                state.cartCount = action.payload?.items?.length || 0; // set count dynamically
            })
            .addCase(removeCartItemAsync.fulfilled, (state, action) => {
                if (action.payload?.success) {
                    state.cartCount = Math.max(0, state.cartCount - 1);
                }
            });
    },
});

export const { clearCartState } = cartSlice.actions;

export default cartSlice.reducer;
