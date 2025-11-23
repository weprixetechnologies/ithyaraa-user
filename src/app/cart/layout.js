// app/cart/layout.js
import React from "react";

export const metadata = {
    title: "Cart",
    description: "Standalone cart page",
};

// Use "children" for the page content
const CartLayout = ({ children }) => {
    return (
        <div className="cart-page min-h-screen bg-gray-50">
            {children}
        </div>
    );
};

export default CartLayout;
