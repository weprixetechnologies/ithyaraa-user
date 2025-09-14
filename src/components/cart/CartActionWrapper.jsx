"use client";

import { useDispatch } from 'react-redux';
import { useAuthActions } from '@/hooks/useAuthActions';
import { addCartAsync, addCartComboAsync } from '@/redux/slices/cartSlice';
import { toast } from 'react-toastify';

const CartActionWrapper = ({ children }) => {
    const dispatch = useDispatch();
    const { requireAuth } = useAuthActions();

    const handleAddToCart = requireAuth(({ productID, quantity, variationName, variationID, referBy }) => {
        dispatch(addCartAsync({ productID, quantity, variationName, variationID, referBy }))
            .unwrap()
            .then(() => {
                toast.success('Added to cart successfully!');
            })
            .catch((error) => {
                console.error('Error adding to cart:', error);
                toast.error('Failed to add item to cart');
            });
    });

    const handleAddComboToCart = requireAuth(({ mainProductID, quantity, products }) => {
        dispatch(addCartComboAsync({ mainProductID, quantity, products }))
            .unwrap()
            .then(() => {
                toast.success('Combo added to cart successfully!');
            })
            .catch((error) => {
                console.error('Error adding combo to cart:', error);
                toast.error('Failed to add combo to cart');
            });
    });

    return children({ handleAddToCart, handleAddComboToCart });
};

export default CartActionWrapper;
