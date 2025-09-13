"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { TiStarFullOutline } from "react-icons/ti";
import { useWishlist } from "@/contexts/WishlistContext";

const parseJSON = (val) => {
    try { return typeof val === 'string' ? JSON.parse(val) : (val || []); } catch { return []; }
};

const ShopProductCard = ({ product }) => {
    const [hover, setHover] = useState(false);
    const { isInWishlist, toggleWishlist, loading } = useWishlist();

    const isWishlisted = isInWishlist(product?.productID);

    const images = parseJSON(product?.featuredImage);
    const img1 = images?.[0]?.imgUrl || "/placeholder-product.jpg";
    const img2 = images?.[1]?.imgUrl || images?.[0]?.imgUrl || "/placeholder-product.jpg";

    const sale = Number(product?.salePrice ?? product?.regularPrice ?? 0);
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
            default:
                return `/products/${id}`;
        }
    };



    return (
        <Link href={getProductHref(product)} className="flex-col flex gap-1">
            <div
                className="h-auto aspect-[170/222] w-full relative"
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            >
                <div className="absolute inset-0 rounded-lg overflow-hidden group">
                    {/* slider */}
                    <div
                        className="absolute inset-0 flex w-[200%] h-full transition-transform duration-500 ease-out will-change-transform"
                        style={{ transform: hover ? 'translateX(-50%)' : 'translateX(0)' }}
                    >
                        {/* Slide 1 */}
                        <div className="relative w-1/2 h-full">
                            <Image
                                src={img1}
                                alt={product?.name || 'Product'}
                                fill
                                sizes="(max-width: 768px) 50vw, 25vw"
                                className="object-cover"
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



                    {/* Wishlist */}
                    <button
                        onClick={async (e) => {
                            e.preventDefault();
                            await toggleWishlist(product?.productID);
                        }}
                        disabled={loading}
                        className={`absolute top-2 right-2 z-2 rounded-full p-2 bg-gradient-to-b from-white to-gray-100 border border-gray-200 shadow-md hover:shadow-sm active:shadow-inner transition-all duration-200 flex justify-center items-center ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                            }`}
                        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    >
                        {isWishlisted ? (
                            <FaHeart size={16} color="red" />
                        ) : (
                            <FaRegHeart size={16} color="grey" />
                        )}
                    </button>

                    {/* Rating */}
                    <div className="absolute z-2 bottom-1 left-1 bg-white rounded-lg px-2 text-xs flex items-center gap-1 font-bold">
                        <TiStarFullOutline color="#ffd232" size={12} /> {product?.rating || 4.5}
                    </div>
                </div>
            </div>

            {/* TEXT + PRICE */}
            <div className="px-[5px]">
                <p className="text-[11px] font-normal uppercase text-gray-600">{product?.brand || 'ITHYARAA'}</p>
                <p className="text-ellipsis truncate text-sm font-medium">{product?.name || product?.productName}</p>
            </div>
            <div className="pricing flex flex-row justify-start gap-2 items-center mt-1 px-[5px]">
                <span className="font-semibold text-sm">₹{sale}</span>
                {mrp > sale && (
                    <>
                        <span className="font-medium text-sm text-gray-500 line-through">₹{mrp}</span>
                        <span className="text-green-600 font-medium text-xs">{percent}% OFF</span>
                    </>
                )}
            </div>
        </Link>
    );
};

export default ShopProductCard;


