"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaHeart, FaRegHeart, FaBolt } from "react-icons/fa";
import { TiStarFullOutline } from "react-icons/ti";
import { useWishlist } from "@/contexts/WishlistContext";
import logo from "../../../public/ithyaraa-logo.png";

const parseJSON = (val) => {
    try { return typeof val === 'string' ? JSON.parse(val) : (val || []); } catch { return []; }
};

const FlashSaleProductCard = ({ product }) => {
    const [hover, setHover] = useState(false);
    const { isInWishlist, toggleWishlist, loading } = useWishlist();

    const isWishlisted = isInWishlist(product?.productID);

    const images = parseJSON(product?.featuredImage);
    const img1 = images?.[0]?.imgUrl || logo;
    const img2 = images?.[1]?.imgUrl || images?.[0]?.imgUrl || logo;

    // Use regularPrice and flashSalePrice from the new endpoint
    const sale = Number(product?.flashSalePrice ?? product?.salePrice ?? product?.regularPrice ?? 0);
    const mrp = Number(product?.regularPrice ?? sale);
    const percent = mrp > 0 ? Math.max(0, Math.round(((mrp - sale) / mrp) * 100)) : 0;

    const getProductHref = (p) => {
        const id = p?.productID;
        const type = p?.type;
        if (!id) return "/products";
        switch (type) {
            case 'variable':
                return `/products/${id}`;
            case 'combo':
                return `/combo/${id}`;
            case 'make_combo':
                return `/make-combo/${id}`;
            case 'customproduct':
                return `/custom-product/${id}`;
            default:
                return `/products/${id}`;
        }
    };

    return (
        <Link href={getProductHref(product)} className="flex-col flex gap-2 group">
            <div
                className="h-auto aspect-[170/222] w-full relative rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-shadow duration-300"
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            >
                {/* Image Container */}
                <div className="absolute inset-0">
                    <div
                        className="absolute inset-0 flex w-[200%] h-full transition-transform duration-700 ease-in-out will-change-transform"
                        style={{ transform: hover ? 'translateX(-50%)' : 'translateX(0)' }}
                    >
                        {/* Slide 1 */}
                        <div className="relative w-1/2 h-full">
                            <Image
                                src={img1}
                                alt={product?.name || 'Product'}
                                fill
                                sizes="(max-width: 768px) 50vw, 25vw"
                                className="object-cover transition-scale duration-700 group-hover:scale-105"
                                priority={false}
                            />
                        </div>
                        {/* Slide 2 */}
                        <div className="relative w-1/2 h-full">
                            <Image
                                src={img2}
                                alt={`${product?.name || 'Product'} - alt`}
                                fill
                                sizes="(max-width: 768px) 50vw, 25vw"
                                className="object-cover"
                                priority={false}
                            />
                        </div>
                    </div>
                </div>

                {/* Overlays */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />

                {/* Flash Sale Badge */}
                <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg transform -rotate-1 origin-top-left">
                    <FaBolt size={8} className="animate-pulse" />
                    <span>FLASH DEAL</span>
                </div>

                {/* Discount Badge */}
                {percent > 0 && (
                    <div className="absolute bottom-2 right-2 z-10 bg-black text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg">
                        -{percent}%
                    </div>
                )}

                {/* Wishlist Button */}
                <button
                    onClick={async (e) => {
                        e.preventDefault();
                        await toggleWishlist(product?.productID);
                    }}
                    disabled={loading}
                    className={`absolute top-2 right-2 z-20 rounded-full p-2 bg-white/90 backdrop-blur-sm border border-gray-100 shadow-md hover:bg-white active:scale-95 transition-all duration-200 flex justify-center items-center ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                    {isWishlisted ? (
                        <FaHeart size={14} className="text-red-500" />
                    ) : (
                        <FaRegHeart size={14} className="text-gray-600" />
                    )}
                </button>

                {/* Rating */}
                <div className="absolute z-10 bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-0.5 text-[10px] flex items-center gap-1 font-bold shadow-sm">
                    <TiStarFullOutline className="text-yellow-400" size={12} /> 
                    <span>{product?.rating || 4.5}</span>
                </div>
            </div>

            {/* Content */}
            <div className="px-1 space-y-1">
                <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-red-600">{product?.brand || 'ITHYARAA'}</p>
                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-red-600 transition-colors duration-200">
                            {product?.name || product?.productName}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-gray-900">₹{sale}</span>
                    {mrp > sale && (
                        <span className="text-xs text-gray-400 line-through font-medium">₹{mrp}</span>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default FlashSaleProductCard;
