import React, { useState } from 'react';
import BuyNowModal from './BuyNowModal.jsx';

/**
 * Generic Buy Now button wrapper.
 *
 * Props:
 * - product           : full product object
 * - selectedVariation : variation object (for variable/custom products)
 * - selectedItems     : array for make_combo [{ productID, variationID }]
 * - customInputs      : object for customproduct { inputID: value }
 * - quantity          : number
 * - disabled          : boolean (e.g. out of stock)
 * - productType       : 'variable' | 'combo' | 'make_combo' | 'customproduct' | 'presale'
 */
const BuyNowButton = ({
    product,
    selectedVariation = null,
    selectedItems = [],
    customInputs = {},
    quantity = 1,
    disabled = false,
    productType,
}) => {
    const [open, setOpen] = useState(false);

    const handleClick = () => {
        if (disabled) {
            if (typeof window !== 'undefined') {
                // Lazy toast import pattern if global toast is available elsewhere
                try {
                    const { toast } = require('react-toastify');
                    toast.error('Out of stock');
                } catch {
                    alert('Out of stock');
                }
            }
            return;
        }
        setOpen(true);
    };

    if (!product) return null;

    return (
        <>
            <button
                type="button"
                onClick={handleClick}
                className="flex-1 py-2 rounded-lg bg-amber-500 text-white font-medium text-center cursor-pointer hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={disabled}
            >
                Buy Now
            </button>
            {open && (
                <BuyNowModal
                    isOpen={open}
                    onClose={() => setOpen(false)}
                    product={product}
                    productType={productType}
                    selectedVariation={selectedVariation}
                    selectedItems={selectedItems}
                    customInputs={customInputs}
                    initialQuantity={quantity}
                />
            )}
        </>
    );
};

export default BuyNowButton;

