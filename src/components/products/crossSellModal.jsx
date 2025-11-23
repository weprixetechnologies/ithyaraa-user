"use client";
import React, { memo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

function CrossSellModal({
    isOpen,
    onClose,
    products = [],
    loading = false,
}) {
    const router = useRouter();
    const [bgLoaded, setBgLoaded] = useState(false);

    // Load animated background once
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => setBgLoaded(true), 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Modal not open
    if (!isOpen) return null;

    const noProducts = !products || products.length === 0;

    return (
        <div
            className="fixed inset-0 flex items-center justify-center p-4 z-[9999] animate-fadeIn"
            style={{
                backdropFilter: "blur(8px)",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col relative overflow-hidden"
                style={{ animation: "slideUp 0.3s ease-out" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Animated background */}
                {bgLoaded && (
                    <div
                        className="absolute inset-0 opacity-[0.06] pointer-events-none"
                        style={{
                            background:
                                "linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)",
                            backgroundSize: "400% 400%",
                            animation: "gradientShift 15s ease infinite",
                        }}
                    />
                )}

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 relative z-10 bg-gradient-to-r from-gray-50 to-white">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">You May Also Like</h2>
                        <p className="text-xs text-gray-500">Recommended for you</p>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200"
                        aria-label="Close modal"
                    >
                        ✕
                    </button>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-10 text-center relative z-10">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                        </div>
                        <p className="text-gray-600 font-medium mt-4">Loading recommendations...</p>
                        <p className="text-sm text-gray-400 mt-1">Please wait</p>
                    </div>
                ) : noProducts ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-10 text-center relative z-10">
                        <div className="text-gray-400 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                            </svg>
                        </div>
                        <p className="text-gray-600 font-medium">No recommendations available</p>
                        <p className="text-sm text-gray-400">Try exploring more products</p>
                    </div>
                ) : (
                    <>
                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 relative z-10">

                            <div
                                className="flex gap-5 overflow-x-auto pb-4"
                                style={{ scrollbarWidth: "thin", scrollbarColor: "#cbd5e0 transparent" }}
                            >
                                {products.map((p) => {
                                    // Use imageUrl directly from backend (already extracted)
                                    const imgUrl = p.imageUrl || null;
                                    console.log('🖼️ Rendering product:', p.productID, 'Image URL:', imgUrl);
                                    const sale = p.salePrice || p.regularPrice;
                                    const hasDiscount = p.regularPrice > sale;
                                    const discount = hasDiscount
                                        ? Math.round(((p.regularPrice - sale) / p.regularPrice) * 100)
                                        : 0;

                                    // Get product route based on type
                                    const getProductRoute = (product) => {
                                        const id = product?.productID;
                                        const type = product?.type;
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

                                    return (
                                        <div
                                            key={p.productID}
                                            className="flex-shrink-0 w-56 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 cursor-pointer"
                                            onClick={() => {
                                                router.push(getProductRoute(p));
                                                onClose();
                                            }}
                                        >
                                            {/* Product Image */}
                                            <div className="relative w-full h-52 bg-gray-100 group overflow-hidden">

                                                {imgUrl ? (

                                                    <img
                                                        src={p.imageUrl} alt={p.name || "Product"}
                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                        style={{ display: 'block' }}
                                                        loading="lazy"
                                                        onLoad={() => {
                                                            console.log('✅ Image loaded successfully:', imgUrl);
                                                        }}
                                                        onError={(e) => {
                                                            console.error('❌ Image failed to load:', imgUrl);
                                                            e.currentTarget.style.display = 'none';
                                                            const placeholder = e.currentTarget.parentElement.querySelector('.image-placeholder');
                                                            if (placeholder) {
                                                                placeholder.style.display = 'flex';
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                )
                                                }
                                                <div
                                                    className="image-placeholder w-full h-full absolute inset-0 flex items-center justify-center bg-gray-200"
                                                    style={{ display: 'none' }}
                                                >
                                                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                {hasDiscount && (
                                                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                                                        {discount}% OFF
                                                    </div>
                                                )}

                                                {/* <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all"></div> */}
                                            </div>

                                            {/* Product Info */}
                                            <div className="p-4">
                                                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">
                                                    {p.name}
                                                </h3>

                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-bold text-gray-900">₹{sale}</span>
                                                    {hasDiscount && (
                                                        <>
                                                            <span className="text-xs text-gray-400 line-through">
                                                                ₹{p.regularPrice}
                                                            </span>
                                                            <span className="text-xs text-green-600 font-semibold">
                                                                Save ₹{p.regularPrice - sale}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )
                }

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white relative z-10">
                    {!noProducts && (
                        <p className="text-xs text-gray-500">{products.length} suggestions</p>
                    )}

                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold text-sm"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div >

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>
        </div >
    );
}

// Memoize the component for performance
const MemoizedCrossSellModal = memo(CrossSellModal);

// Set display name for better debugging
MemoizedCrossSellModal.displayName = 'CrossSellModal';

export default MemoizedCrossSellModal;
