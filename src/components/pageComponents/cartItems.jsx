"use client"
import React, { useState, useEffect, useRef } from 'react'
import { RxCross2 } from "react-icons/rx";
import Image from 'next/image'
import { useSelector, useDispatch } from 'react-redux';
import { removeCartItemAsync, getCartAsync } from '@/redux/slices/cartSlice';
import { toast } from 'react-toastify';
import axiosInstance from '@/lib/axiosInstance';
import { useRouter } from 'next/navigation';
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

const CartItems = ({ selectedItems = [], onSelectionChange }) => {
    const cartState = useSelector((state) => state.cart.cart)
    const dispatch = useDispatch();
    const router = useRouter();
    const [removingItems, setRemovingItems] = useState(new Set());
    const [localSelectedItems, setLocalSelectedItems] = useState(new Set());
    const [hasChanges, setHasChanges] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const prevCartDataLengthRef = useRef(0);

    // Get product route based on type
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

    // Handle product click navigation
    const handleProductClick = (e, product) => {
        // Don't navigate if clicking on checkbox, remove button, or their containers
        const clickedElement = e.target;
        if (
            clickedElement.closest('input[type="checkbox"]') ||
            clickedElement.closest('button') ||
            clickedElement.closest('[role="dialog"]') ||
            clickedElement.closest('[data-no-navigate]') ||
            clickedElement.tagName === 'INPUT' ||
            clickedElement.tagName === 'BUTTON'
        ) {
            return;
        }
        const route = getProductRoute(product);
        router.push(route);
    };

    // Normalize cartData - handle both array and object with items property
    const cartData = !cartState
        ? []
        : Array.isArray(cartState)
            ? cartState
            : (cartState?.items && Array.isArray(cartState.items)
                ? cartState.items
                : []);

    // Initialize selected items from cart data (items with selected = true) - only when cart data first loads
    useEffect(() => {
        if (cartData && cartData.length > 0 && !hasChanges) {
            // Only initialize if cart data length changed (new items added/removed) or not initialized yet
            const cartLengthChanged = prevCartDataLengthRef.current !== cartData.length;

            if (!isInitialized || cartLengthChanged) {
                const selectedIds = cartData
                    .filter(item => item.selected === true || item.selected === 1 || item.selected === null)
                    .map(item => item.cartItemID);
                setLocalSelectedItems(new Set(selectedIds));
                setIsInitialized(true);
                setHasChanges(false);
                prevCartDataLengthRef.current = cartData.length;
            }
        }
    }, [cartData, isInitialized, hasChanges]);

    // Sync with parent component's selectedItems if provided
    useEffect(() => {
        if (selectedItems && selectedItems.length > 0) {
            setLocalSelectedItems(new Set(selectedItems));
        }
    }, [selectedItems]);

    const handleItemToggle = (cartItemID) => {
        const newSelected = new Set(localSelectedItems);
        if (newSelected.has(cartItemID)) {
            newSelected.delete(cartItemID);
        } else {
            newSelected.add(cartItemID);
        }
        setLocalSelectedItems(newSelected);
        setHasChanges(true);
        if (onSelectionChange) {
            onSelectionChange(Array.from(newSelected));
        }
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            const allIds = cartData.map(item => item.cartItemID);
            const newSelected = new Set(allIds);
            setLocalSelectedItems(newSelected);
            setHasChanges(true);
            if (onSelectionChange) {
                onSelectionChange(Array.from(newSelected));
            }
        } else {
            setLocalSelectedItems(new Set());
            setHasChanges(true);
            if (onSelectionChange) {
                onSelectionChange([]);
            }
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
            }
            toast.success('Cart updated successfully');
        } catch (error) {
            console.error('Error updating cart:', error);
            toast.error(error.response?.data?.message || 'Failed to update cart');
        } finally {
            setIsUpdating(false);
        }
    };

    // Calculate selection state - always use localSelectedItems once initialized
    const allSelected = cartData.length > 0 && isInitialized && cartData.every(item => localSelectedItems.has(item.cartItemID));
    const someSelected = isInitialized && cartData.some(item => localSelectedItems.has(item.cartItemID));

    const handleRemoveItem = async (cartItemID, itemName) => {
        setRemovingItems(prev => new Set(prev).add(cartItemID));

        try {
            await dispatch(removeCartItemAsync(cartItemID)).unwrap();
            // toast.success('Item removed from cart');

            // Refresh cart data
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

    console.log(cartData);

    // Check if cart is empty
    if (!cartData || cartData.length === 0) {
        return (
            <div className='mt-5'>
                <p className='font-medium text-lg mb-4'>Your Cart Items</p>
                <div className='flex flex-col items-center justify-center py-20 px-4'>
                    <div className='text-center'>
                        <svg
                            className='mx-auto h-24 w-24 text-gray-400'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                            xmlns='http://www.w3.org/2000/svg'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth='1'
                                d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
                            />
                        </svg>
                        <h3 className='mt-6 text-lg font-medium text-gray-900'>No Cart Items Added</h3>
                        <p className='mt-2 text-sm text-gray-500'>
                            Your cart is empty. Start shopping to add items to your cart.
                        </p>
                        <div className='mt-6'>
                            <a
                                href='/shop'
                                className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-yellow hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-yellow'
                            >
                                Shop More
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='mt-5'>
            <div className="flex items-center justify-between mb-3">
                <p className='font-medium text-lg'>Your Cart Items</p>
                <div className="flex items-center gap-3">
                    {cartData && cartData.length > 0 && (
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
                    )}
                    {hasChanges && (
                        <button
                            onClick={handleUpdateCart}
                            disabled={isUpdating}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                            {isUpdating ? 'Updating...' : 'Update Cart'}
                        </button>
                    )}
                </div>
            </div>
            <div className="flex flex-col gap-3 py-3">
                {cartData?.map((i, index) => {
                    // Always use localSelectedItems once initialized, otherwise fall back to DB
                    const isSelected = isInitialized
                        ? localSelectedItems.has(i.cartItemID)
                        : (i.selected === true || i.selected === 1 || i.selected === null);
                    return (
                        <div key={index}>
                            <div
                                onClick={(e) => handleProductClick(e, i)}
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
                                        onChange={() => handleItemToggle(i.cartItemID)}
                                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                    />
                                </div>
                                <div className="absolute top-3 right-3 z-10" onClick={(e) => e.stopPropagation()} data-no-navigate>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <button
                                                disabled={removingItems.has(i.cartItemID)}
                                                className={`border rounded-full h-5 w-5 flex justify-center items-center transition-colors ${removingItems.has(i.cartItemID)
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
                                                    Are you sure you want to remove "{i.name}" from your cart? This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleRemoveItem(i.cartItemID, i.name)}
                                                    className="bg-red-600 hover:bg-red-700 text-white"
                                                >
                                                    Remove
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                                {/* aspect-[170/222] */}
                                <div className="flex gap-2 pl-7">
                                    <div className="block">
                                        <div className="relative aspect-[170/222] md:w-[120px] md:min-w-[120px] w-[100px] min-w-[100px]">
                                            <Image src={i.featuredImage[0].imgUrl} fill alt='Cart Item Image' className='rounded-lg' />
                                        </div>
                                    </div>
                                    <div className="flex flex-col md:pl-3 w-full">
                                        {/* //NAME//BRAND//VARIATION */}
                                        {/* <p className='text-xs font-medium text-secondary-text-deep'>{i.brand}</p> */}
                                        <p className='text-sm font-medium line-clamp-1 md:text-[16px]'>{i.name}</p>
                                        <div className="cart-pricing flex gap-2 items-center">
                                            <p className="text-sm md:text-lg font-medium"> ₹{i.lineTotalAfter}</p>
                                            {i.salePrice !== i.regularPrice && (
                                                <p className="text-sm md:text-lg font-medium text-secondary-text-deep line-through"> ₹{i.regularPrice * i.quantity}</p>
                                            )}
                                            {i.salePrice !== i.regularPrice && (
                                                <p className="text-xs md:text-sm font-light text-green-500">(Saved ₹{((i.regularPrice - i.salePrice) * i.quantity).toFixed(0)})</p>
                                            )}
                                        </div>
                                        <p className='text-xs mt-2'>Selected Variation</p>
                                        <div className="flex flex-row flex-wrap gap-2 mt-1">
                                            {i.variationValues?.map((v, index) =>
                                                Object.keys(v).map((key) => (
                                                    <span
                                                        key={index + key}
                                                        className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-700"
                                                    >
                                                        {key.charAt(0).toUpperCase() + key.slice(1)}: {v[key]}
                                                    </span>
                                                ))
                                            )}
                                            <p className='text-xs px-2 py-1 bg-gray-100 rounded font-medium text-gray-700'>Quantity : {i.quantity}</p>
                                        </div>
                                        {/* Custom Inputs Display */}
                                        {i.custom_inputs && i.custom_inputs !== null && Object.keys(i.custom_inputs).length > 0 && (
                                            <div className='mt-3 w-full'>
                                                <p className='text-xs font-medium text-gray-700 mb-2'>Custom Details:</p>
                                                <div className='flex flex-col gap-2 w-full'>
                                                    {Object.entries(i.custom_inputs).map(([key, value]) => {
                                                        // Check if value is an image URL
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
                                                                            onError={(e) => {
                                                                                e.target.style.display = 'none';
                                                                                e.target.nextSibling.style.display = 'block';
                                                                            }}
                                                                        />
                                                                        <span className="text-xs text-gray-500 hidden">Image failed to load</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                        {i.comboItems?.length > 0 && (
                                            <p className='text-xs mt-2 px-2 py-1 bg-gray-100 rounded font-medium text-gray-700'>Please Check the Below items, those are the selected combo items</p>

                                        )}


                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">

                                {i.comboItems?.length > 0 && (
                                    i.comboItems.map((p, index) => (
                                        <div className="border border-gray-200 pr-5 py-3 pl-3 rounded-lg relative mt-2" key={index}>

                                            <div className="flex gap-2 ">
                                                <div className="block">
                                                    <div className="relative aspect-[170/222] md:w-[80px] md:min-w-[80px] w-[80px] min-w-[80px]">
                                                        <Image src={p.featuredImage[0].imgUrl} fill alt='Cart Item Image' className='rounded-lg' />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col md:pl-3">
                                                    <p className='text-sm font-medium line-clamp-1 md:text-[14px]'>{p.name}</p>
                                                    <div className="cart-pricing flex gap-2 items-center">
                                                        <p className="text-sm md:text-lg font-medium"> ₹ 0</p>

                                                        <p className="text-xs md:text-sm font-light text-green-500">(Combo Items)</p>
                                                    </div>
                                                    <p className='text-xs mt-2'>Selected Variation</p>
                                                    <div className="flex flex-row flex-wrap gap-2 mt-1">
                                                        {p.variationValues?.map((v, vIndex) =>
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
                                                            Quantity : 1
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    )
}

export default CartItems