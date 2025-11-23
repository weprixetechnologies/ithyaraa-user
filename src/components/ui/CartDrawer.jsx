"use client";

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RxCross2 } from 'react-icons/rx';
import { LuShoppingCart } from 'react-icons/lu';
import Image from 'next/image';
import { getCartAsync, removeCartItemAsync } from '@/redux/slices/cartSlice';
import { toast } from 'react-toastify';
import Link from 'next/link';
import axiosInstance from '@/lib/axiosInstance';
import { useRef } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const CartDrawer = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const router = useRouter();
    const cartState = useSelector((state) => state.cart?.cart);
    // Ensure cart is always an array - handle null, undefined, or non-array values
    const cart = (Array.isArray(cartState) && cartState) || [];
    const cartDetail = useSelector((state) => state.cart?.cartDetail) || {};
    const cartCount = useSelector((state) => state.cart?.cartCount) || 0;
    const [removingItems, setRemovingItems] = useState(new Set());
    const [localSelectedItems, setLocalSelectedItems] = useState(new Set());
    const [hasChanges, setHasChanges] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const prevCartDataLengthRef = useRef(0);

    // Fetch cart when drawer opens
    useEffect(() => {
        if (isOpen) {
            dispatch(getCartAsync());
        }
    }, [isOpen, dispatch]);

    // Initialize selected items from cart data (items with selected = true) - only when cart data first loads
    useEffect(() => {
        if (cart && cart.length > 0 && !hasChanges) {
            // Only initialize if cart data length changed (new items added/removed) or not initialized yet
            const cartLengthChanged = prevCartDataLengthRef.current !== cart.length;

            if (!isInitialized || cartLengthChanged) {
                const selectedIds = cart
                    .filter(item => item.selected === true || item.selected === 1 || item.selected === null)
                    .map(item => item.cartItemID);
                setLocalSelectedItems(new Set(selectedIds));
                setIsInitialized(true);
                setHasChanges(false);
                prevCartDataLengthRef.current = cart.length;
            }
        }
    }, [cart, isInitialized, hasChanges]);

    // Reset when drawer closes
    useEffect(() => {
        if (!isOpen) {
            setHasChanges(false);
        }
    }, [isOpen]);

    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleRemoveItem = async (cartItemID, itemName) => {
        setRemovingItems(prev => new Set(prev).add(cartItemID));
        try {
            await dispatch(removeCartItemAsync(cartItemID)).unwrap();
            // Remove from selected items if it was selected
            setLocalSelectedItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(cartItemID);
                return newSet;
            });
            dispatch(getCartAsync());
        } catch (error) {
            console.error('Error removing item:', error);
            toast.error('Failed to remove item from cart');
        } finally {
            setRemovingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(cartItemID);
                return newSet;
            });
        }
    };

    const handleItemToggle = (cartItemID) => {
        const newSelected = new Set(localSelectedItems);
        if (newSelected.has(cartItemID)) {
            newSelected.delete(cartItemID);
        } else {
            newSelected.add(cartItemID);
        }
        setLocalSelectedItems(newSelected);
        setHasChanges(true);
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            const allIds = cart.map(item => item.cartItemID);
            const newSelected = new Set(allIds);
            setLocalSelectedItems(newSelected);
            setHasChanges(true);
        } else {
            setLocalSelectedItems(new Set());
            setHasChanges(true);
        }
    };

    const handleUpdateCart = async () => {
        setIsUpdating(true);
        try {
            await axiosInstance.post('/cart/update-cart-selected', {
                selectedItems: Array.from(localSelectedItems)
            });

            // Refresh cart data and reinitialize selection state
            const updatedCartData = await dispatch(getCartAsync()).unwrap();
            setHasChanges(false);
            // Reinitialize from updated cart data
            if (updatedCartData && updatedCartData.items) {
                const selectedIds = updatedCartData.items
                    .filter(item => item.selected === true || item.selected === 1 || item.selected === null)
                    .map(item => item.cartItemID);
                setLocalSelectedItems(new Set(selectedIds));
            } else if (updatedCartData && Array.isArray(updatedCartData)) {
                const selectedIds = updatedCartData
                    .filter(item => item.selected === true || item.selected === 1 || item.selected === null)
                    .map(item => item.cartItemID);
                setLocalSelectedItems(new Set(selectedIds));
            }
            toast.success('Cart updated successfully');
        } catch (error) {
            console.error('Error updating cart:', error);
            toast.error(error.response?.data?.message || 'Failed to update cart');
        } finally {
            setIsUpdating(false);
        }
    };

    // Calculate selection state
    const allSelected = cart.length > 0 && isInitialized && cart.every(item => localSelectedItems.has(item.cartItemID));
    const someSelected = isInitialized && cart.some(item => localSelectedItems.has(item.cartItemID));

    const getProductRoute = (product) => {
        const id = product?.productID;
        const type = product?.productType || product?.type;
        if (!id) return "/products";
        switch (type) {
            case 'variable':
                return `/products/${id}`;
            case 'combo':
                return `/combo/${id}`;
            case 'make_combo':
            case 'Make_combo':
                return `/make-combo/${id}`;
            case 'customproduct':
            case 'custom':
                return `/custom-product/${id}`;
            default:
                return `/products/${id}`;
        }
    };

    const handleProceedToCart = () => {
        onClose();
        router.push('/cart');
    };

    // Handle product click navigation
    const handleProductClick = (e, product) => {
        // Don't navigate if clicking on remove button or dialog
        const clickedElement = e.target;
        if (
            clickedElement.closest('button') ||
            clickedElement.closest('[role="dialog"]') ||
            clickedElement.closest('[data-no-navigate]') ||
            clickedElement.tagName === 'BUTTON'
        ) {
            return;
        }
        const route = getProductRoute(product);
        onClose();
        router.push(route);
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-opacity-50 z-40 transition-opacity" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    onClick={onClose}
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                            <LuShoppingCart size={24} />
                            <h2 className="text-lg font-semibold">
                                Your Cart ({cartCount})
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="Close cart"
                        >
                            <RxCross2 size={20} />
                        </button>
                    </div>

                    {/* Select All and Update Button */}
                    {cart.length > 0 && (
                        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    ref={(input) => {
                                        if (input) input.indeterminate = someSelected && !allSelected;
                                    }}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">
                                    {allSelected ? 'Deselect All' : 'Select All'}
                                </span>
                            </label>
                            {hasChanges && (
                                <button
                                    onClick={handleUpdateCart}
                                    disabled={isUpdating}
                                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                                >
                                    {isUpdating ? 'Updating...' : 'Update Cart'}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto">
                        {!Array.isArray(cart) || cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 px-4">
                                <div className="text-center">
                                    <svg
                                        className="mx-auto h-24 w-24 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="1"
                                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                        />
                                    </svg>
                                    <h3 className="mt-6 text-lg font-medium text-gray-900">
                                        Your cart is empty
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-500">
                                        Start shopping to add items to your cart.
                                    </p>
                                    <button
                                        onClick={onClose}
                                        className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-yellow hover:bg-yellow-500"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 space-y-3">
                                {Array.isArray(cart) && cart.map((item, index) => {
                                    const productRoute = getProductRoute(item);
                                    const featuredImage = Array.isArray(item?.featuredImage)
                                        ? item.featuredImage
                                        : (item?.featuredImage?.[0] ? item.featuredImage : []);
                                    const imgUrl = featuredImage?.[0]?.imgUrl || '/placeholder-product.jpg';

                                    // Check if item is selected
                                    const isSelected = isInitialized
                                        ? localSelectedItems.has(item.cartItemID)
                                        : (item.selected === true || item.selected === 1 || item.selected === null);

                                    return (
                                        <div key={item.cartItemID || index}>
                                            <div
                                                onClick={(e) => handleProductClick(e, item)}
                                                className={`border pr-5 py-3 pl-3 rounded-lg relative transition-all cursor-pointer ${isSelected
                                                    ? 'border-blue-500 bg-blue-50 shadow-md'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                {/* Checkbox */}
                                                <div className="absolute top-3 left-3 z-10" onClick={(e) => e.stopPropagation()} data-no-navigate>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleItemToggle(item.cartItemID)}
                                                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                                    />
                                                </div>

                                                {/* Remove Button */}
                                                <div className="absolute top-3 right-3 z-10" onClick={(e) => e.stopPropagation()} data-no-navigate>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <button
                                                                disabled={removingItems.has(item.cartItemID)}
                                                                className={`border rounded-full h-5 w-5 flex justify-center items-center transition-colors ${removingItems.has(item.cartItemID)
                                                                    ? 'text-gray-400 cursor-not-allowed'
                                                                    : 'text-gray-300 hover:text-red-500 hover:border-red-500'
                                                                    }`}
                                                            >
                                                                <RxCross2 size={12} />
                                                            </button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Remove Item from Cart</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to remove "{item.name}" from your cart? This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleRemoveItem(item.cartItemID, item.name)}
                                                                    className="bg-red-600 hover:bg-red-700 text-white"
                                                                >
                                                                    Remove
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>

                                                {/* Item Content */}
                                                <div className="flex gap-2 pl-7">
                                                    <div className="block">
                                                        <div className="relative aspect-[170/222] w-[100px] min-w-[100px]">
                                                            <Image
                                                                src={imgUrl}
                                                                fill
                                                                alt='Cart Item Image'
                                                                className='rounded-lg'
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col pl-3 w-full">
                                                        <p className='text-sm font-medium line-clamp-1'>{item.name}</p>
                                                        <div className="cart-pricing flex gap-2 items-center mt-1">
                                                            <p className="text-sm font-medium">₹{item.lineTotalAfter || 0}</p>
                                                            {item.salePrice !== item.regularPrice && (
                                                                <p className="text-sm font-medium text-gray-500 line-through">
                                                                    ₹{item.regularPrice * (item.quantity || 1)}
                                                                </p>
                                                            )}
                                                            {item.salePrice !== item.regularPrice && (
                                                                <p className="text-xs font-light text-green-500">
                                                                    (Saved ₹{((item.regularPrice - item.salePrice) * (item.quantity || 1)).toFixed(0)})
                                                                </p>
                                                            )}
                                                        </div>
                                                        <p className='text-xs mt-2'>Selected Variation</p>
                                                        <div className="flex flex-row flex-wrap gap-2 mt-1">
                                                            {item.variationValues?.map((v, vIndex) =>
                                                                Object.keys(v).map((key) => (
                                                                    <span
                                                                        key={`${vIndex}-${key}`}
                                                                        className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-700"
                                                                    >
                                                                        {key.charAt(0).toUpperCase() + key.slice(1)}: {v[key]}
                                                                    </span>
                                                                ))
                                                            )}
                                                            <p className='text-xs px-2 py-1 bg-gray-100 rounded font-medium text-gray-700'>
                                                                Quantity : {item.quantity || 1}
                                                            </p>
                                                        </div>
                                                        {/* Custom Inputs Display */}
                                                        {item.custom_inputs && item.custom_inputs !== null && Object.keys(item.custom_inputs).length > 0 && (
                                                            <div className='mt-3 w-full'>
                                                                <p className='text-xs font-medium text-gray-700 mb-2'>Custom Details:</p>
                                                                <div className='flex flex-col gap-2 w-full'>
                                                                    {Object.entries(item.custom_inputs).map(([key, value]) => {
                                                                        const isImageUrl = typeof value === 'string' && (
                                                                            value.startsWith('http://') ||
                                                                            value.startsWith('https://') ||
                                                                            value.includes('customer-upload') ||
                                                                            value.includes('.jpg') ||
                                                                            value.includes('.jpeg') ||
                                                                            value.includes('.png') ||
                                                                            value.includes('.webp')
                                                                        );
                                                                        return (
                                                                            <div key={key} className="w-full">
                                                                                <div className="text-xs px-2 py-1 bg-blue-50 border border-blue-200 rounded text-blue-700 break-words">
                                                                                    <span className="font-medium">{key}:</span>
                                                                                    {!isImageUrl && <span className="ml-1">{value}</span>}
                                                                                </div>
                                                                                {isImageUrl && (
                                                                                    <div className="mt-1">
                                                                                        <img
                                                                                            src={value}
                                                                                            alt={key}
                                                                                            className="w-24 h-24 object-cover rounded border border-gray-200"
                                                                                        />
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Combo Items */}
                                            {item.comboItems?.length > 0 && (
                                                <div className="flex flex-col gap-2 mt-2">
                                                    {item.comboItems.map((p, comboIndex) => (
                                                        <div className="border border-gray-200 pr-5 py-3 pl-3 rounded-lg relative" key={comboIndex}>
                                                            <div className="flex gap-2">
                                                                <div className="block">
                                                                    <div className="relative aspect-[170/222] w-[80px] min-w-[80px]">
                                                                        <Image
                                                                            src={p.featuredImage?.[0]?.imgUrl || '/placeholder-product.jpg'}
                                                                            fill
                                                                            alt='Combo Item Image'
                                                                            className='rounded-lg'
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col pl-3">
                                                                    <p className='text-sm font-medium line-clamp-1'>{p.name}</p>
                                                                    <div className="cart-pricing flex gap-2 items-center mt-1">
                                                                        <p className="text-sm font-medium">₹ 0</p>
                                                                        <p className="text-xs font-light text-green-500">(Combo Items)</p>
                                                                    </div>
                                                                    <p className='text-xs mt-2'>Selected Variation</p>
                                                                    <div className="flex flex-row flex-wrap gap-2 mt-1">
                                                                        {p.variationValues?.map((v, vIndex) =>
                                                                            Object.keys(v).map((key) => (
                                                                                <span
                                                                                    key={`${comboIndex}-${vIndex}-${key}`}
                                                                                    className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-700"
                                                                                >
                                                                                    {key.charAt(0).toUpperCase() + key.slice(1)}: {v[key]}
                                                                                </span>
                                                                            ))
                                                                        )}
                                                                        <p className='text-xs px-2 py-1 bg-gray-100 rounded font-medium text-gray-700'>
                                                                            Quantity : 1
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer with Breakdown and Proceed Button */}
                    {cart.length > 0 && (
                        <div className="border-t border-gray-200 p-4 bg-gray-50">
                            {/* Breakdown */}
                            <div className="mb-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">₹{cartDetail.subtotal || 0}</span>
                                </div>
                                {cartDetail.totalDiscount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Discount</span>
                                        <span className="font-medium text-green-600">
                                            -₹{cartDetail.totalDiscount || 0}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="font-medium">Free</span>
                                </div>
                                <div className="border-t border-gray-300 pt-2 mt-2">
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-lg">Total</span>
                                        <span className="font-semibold text-lg">
                                            ₹{cartDetail.total || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Proceed Button */}
                            <button
                                onClick={handleProceedToCart}
                                className="w-full bg-primary-yellow text-white py-3 px-4 rounded-lg font-medium hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
                            >
                                <LuShoppingCart size={20} />
                                Proceed to Cart
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default CartDrawer;

