"use client";

import React, { useState, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { TiStarFullOutline } from "react-icons/ti";
import { useWishlist } from "@/contexts/WishlistContext";
import { useProductBadges } from "@/contexts/ProductBadgesContext";
import logo from "../../../public/ithyaraa-logo.png";

const parseJSON = (val) => {
    try { return typeof val === 'string' ? JSON.parse(val) : (val || []); } catch { return []; }
};

const ImageWithFallback = ({ src, fallbackSrc, alt, priority = false, ...props }) => {
    const [imgSrc, setImgSrc] = useState(src);
    const [loading, setLoading] = useState(!priority);

    return (
        <>
            {loading && !priority && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg z-10" />
            )}
            <Image
                {...props}
                src={imgSrc}
                alt={alt}
                onError={() => {
                    setImgSrc(fallbackSrc);
                }}
                onLoad={() => setLoading(false)}
                priority={priority}
                loading={priority ? "eager" : "lazy"}
                className={`${props.className} ${loading && !priority ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
            />
        </>
    );
};

const ShopProductCard = ({ product, priority = false }) => {
    const [hover, setHover] = useState(false);
    const [hasHovered, setHasHovered] = useState(false);
    const [toggling, setToggling] = useState(false);
    const { isInWishlist, toggleWishlist } = useWishlist();
    const { getProductBadges } = useProductBadges();

    const productBadges = getProductBadges(product?.productID);
    const isWishlisted = isInWishlist(product?.productID);

    const images = parseJSON(product?.featuredImage);
    const img1 = images?.[0]?.imgUrl || logo;
    const img2 = images?.[1]?.imgUrl || images?.[0]?.imgUrl || logo;

    const sale = Number(product?.salePrice ?? product?.regularPrice ?? 0);
    const mrp = Number(product?.regularPrice ?? sale);
    const percent = mrp > 0 ? Math.max(0, Math.round(((mrp - sale) / mrp) * 100)) : 0;

    const getProductHref = (p) => {
        const identifier = p?.slug || p?.productID;
        const type = p?.type;
        if (!identifier) return "/shop";
        switch (type) {
            case 'combo':
                return `/combo/${identifier}`;
            case 'make_combo':
                return `/make-combo/${identifier}`;
            case 'customproduct':
                return `/custom-product/${identifier}`;
            case 'variable':
            default:
                return `/products/${identifier}`;
        }
    };

    const handleMouseEnter = () => {
        setHover(true);
        if (!hasHovered) setHasHovered(true);
    };

    return (
        <Link href={getProductHref(product)} className="flex-col flex gap-1 group" prefetch={true}>
            <div
                className="h-auto aspect-[2/3] w-full relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => setHover(false)}
            >
                <div className="absolute inset-0 rounded-lg overflow-hidden">
                    {/* slider */}
                    <div
                        className="absolute inset-0 flex w-[200%] h-full transition-transform duration-500 ease-out will-change-transform"
                        style={{ transform: hover ? 'translateX(-50%)' : 'translateX(0)' }}
                    >
                        {/* Slide 1 */}
                        <div className="relative w-1/2 h-full">
                            <ImageWithFallback
                                src={img1}
                                fallbackSrc={logo}
                                alt={product?.name || 'Product'}
                                fill
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                className="object-cover"
                                priority={priority}
                            />
                        </div>
                        {/* Slide 2 (mounted on hover or once hovered to save mobile bandwidth) */}
                        <div className="relative w-1/2 h-full">
                            {(hasHovered || hover) && (
                                <ImageWithFallback
                                    src={img2}
                                    fallbackSrc={logo}
                                    alt={`${product?.name || 'Product'} - alt`}
                                    fill
                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                    className="object-cover"
                                    priority={false}
                                />
                            )}
                        </div>
                    </div>

                    {/* Dynamic Product Badges */}
                    {productBadges && productBadges.length > 0 && (
                        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start pointer-events-none">
                            {productBadges.map((badge, idx) => (
                                <span
                                    key={badge.id || idx}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-md tracking-tight leading-none uppercase"
                                    style={{ backgroundColor: badge.bgColor, color: badge.textColor }}
                                >
                                    {badge.icon && <span>{badge.icon}</span>}
                                    <span>{badge.name}</span>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Wishlist */}
                    <button
                        onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (toggling) return;
                            setToggling(true);
                            try {
                                await toggleWishlist(product?.productID);
                            } finally {
                                setToggling(false);
                            }
                        }}
                        disabled={toggling}
                        className={`absolute top-2 right-2 z-2 rounded-full p-2 bg-gradient-to-b from-white to-gray-100 border border-gray-200 shadow-md hover:shadow-sm active:shadow-inner transition-all duration-200 flex justify-center items-center ${toggling ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
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
                <p className="text-[11px] font-normal uppercase text-gray-600">
                    {(!product?.brand && !product?.brandID) ||
                        product?.brand?.trim().toLowerCase() === "inhouse"
                        ? "ITHYARAA"
                        : (product?.brand || "ITHYARAA")}
                </p> <p className="text-ellipsis truncate text-sm font-medium">{product?.name || product?.productName}</p>
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

export default memo(ShopProductCard);
