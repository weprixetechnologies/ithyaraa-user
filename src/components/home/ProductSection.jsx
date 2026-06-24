"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { TiStarFullOutline } from "react-icons/ti";
import dynamic from 'next/dynamic';
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useWishlist } from "@/contexts/WishlistContext";
import logo from "../../../public/ithyaraa-logo.png";

const AnimatedBlobs = dynamic(() => import('../homeComponents/AnimatedBlobs'), { ssr: false });

const ProductSection = ({ heading, subHeading, shopLink, buttonWant = false, products = [] }) => {
    const scrollRef = useRef(null)
    const { isInWishlist, toggleWishlist, loading } = useWishlist()

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


    // const products = [
    //     {
    //         productID: '1',
    //         name: 'Exclusive Launch Top By Yuthsy - You are Special',
    //         featuredImage: [
    //             { imgUrl: 'https://images.bewakoof.com/t320/men-s-grey-oversized-joggers-646474-1736252675-1.jpg' },
    //             { imgUrl: 'https://images.bewakoof.com/t320/men-s-black-super-loose-fit-joggers-617465-1737461061-1.jpg' },
    //         ],
    //         brand: 'ITHYARAA',
    //         regularPrice: 1099,
    //         salePrice: 899,
    //         discountValue: 18,
    //         rating: 4.8
    //     },
    //     {
    //         productID: '2',
    //         name: 'Classic Black Hoodie',
    //         featuredImage: [
    //             { imgUrl: 'https://images.bewakoof.com/t320/men-s-black-super-loose-fit-joggers-617465-1737461061-1.jpg' },
    //             { imgUrl: 'https://images.bewakoof.com/t320/men-s-blue-super-baggy-fit-mid-rise-jeans-624681-1751010116-1.jpg' },
    //         ],
    //         brand: 'BEWAKOOF',
    //         regularPrice: 1599,
    //         salePrice: 1299,
    //         discountValue: 19,
    //         rating: 4.6
    //     },
    //     {
    //         productID: '3',
    //         name: 'Premium White Sneakers',
    //         featuredImage: [
    //             { imgUrl: 'https://images.bewakoof.com/t320/men-s-blue-super-baggy-fit-mid-rise-jeans-624681-1751010116-1.jpg' },
    //             { imgUrl: 'https://images.bewakoof.com/t320/men-s-blue-baggy-fit-distressed-cargo-mid-rise-jeans-624259-1749102371-1.jpg' },
    //         ],
    //         brand: 'CAMPUS',
    //         regularPrice: 2499,
    //         salePrice: 1999,
    //         discountValue: 20,
    //         rating: 4.9
    //     },
    //     {
    //         productID: '4',
    //         name: 'Denim Jacket - Limited Edition',
    //         featuredImage: [
    //             { imgUrl: 'https://images.bewakoof.com/t320/men-s-blue-baggy-fit-distressed-cargo-mid-rise-jeans-624259-1749102371-1.jpg' },
    //             { imgUrl: 'https://images.bewakoof.com/t320/men-s-blue-super-baggy-fit-mid-rise-jeans-624681-1751010116-1.jpg' },
    //         ],
    //         brand: 'LEVIS',
    //         regularPrice: 3499,
    //         salePrice: 2999,
    //         discountValue: 14,
    //         rating: 4.7
    //     },
    //     {
    //         productID: '5',
    //         name: 'Everyday Joggers',
    //         featuredImage: [
    //             { imgUrl: 'https://images.bewakoof.com/t320/men-s-blue-baggy-fit-distressed-cargo-mid-rise-jeans-624259-1749102371-1.jpg' },
    //             { imgUrl: 'https://images.bewakoof.com/t320/men-s-grey-oversized-joggers-646474-1736252675-1.jpg' },
    //         ],
    //         brand: 'LEVIS',
    //         regularPrice: 3499,
    //         salePrice: 2999,
    //         discountValue: 14,
    //         rating: 4.7
    //     },
    //     {
    //         productID: '6',
    //         name: 'Street Denim',
    //         featuredImage: [
    //             { imgUrl: 'https://images.bewakoof.com/t320/men-s-blue-baggy-fit-distressed-cargo-mid-rise-jeans-624259-1749102371-1.jpg' },
    //             { imgUrl: 'https://images.bewakoof.com/t320/men-s-black-super-loose-fit-joggers-617465-1737461061-1.jpg' },
    //         ],
    //         brand: 'LEVIS',
    //         regularPrice: 3499,
    //         salePrice: 2999,
    //         discountValue: 14,
    //         rating: 4.7
    //     },
    // ];

    const handleToggleWishlist = async (productID) => {
        await toggleWishlist(productID);
    };

    const scrollLeft = () => {
        scrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
    };

    const scrollRight = () => {
        scrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' });
    };
    // console.log(products);

    return (
        <section className="relative overflow-x-clip w-full">
            <AnimatedBlobs />
            
            {/* Heading */}
            <div className="flex flex-col items-center justify-center max-w-[900px] mx-auto py-8 md:py-12 px-4 text-center animate-editorial-fade">
                {/* Eyebrow Label */}
                <div className="flex items-center justify-center gap-3 mb-3">
                    <span className="text-[#ff7aa2] text-[16px] md:text-[18px]">✦</span>
                    <span className="font-parisienne text-[#ff7aa2] text-[16px] md:text-[18px] font-normal leading-none pt-1">
                        Trending Now
                    </span>
                    <span className="text-[#ff7aa2] text-[16px] md:text-[18px]">✦</span>
                </div>
                
                {/* Main Title */}
                <h2 className="font-playfair font-medium text-[36px] md:text-[3rem] leading-[1] tracking-[-0.03em] text-[#111111] mb-[10px]">
                    {heading}
                </h2>
                
                {/* Subtitle */}
                {subHeading && (
                    <p className="font-medium text-[16px] md:text-[18px] lg:text-[20px] leading-[1.5] text-black max-w-[700px] mx-auto">
                        {subHeading}
                    </p>
                )}
                
                <button className="mt-6 bg-primary-yellow h-[30px] px-4 text-xs font-medium rounded md:hidden">
                    Shop Now
                </button>
            </div>

            {/* Scrollable Product Row with Arrows */}
            <div className="relative mb-5">
                {/* Left Arrow (Desktop Only) */}
                <button
                    type="button"
                    aria-label="Scroll left"
                    onClick={scrollLeft}
                    className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-30 
                    bg-white rounded-full shadow-md p-2 hover:shadow-lg transition"
                >
                    <IoIosArrowBack size={20} />
                </button>

                <div
                    ref={scrollRef}
                    className="flex flex-row gap-3 overflow-x-auto py-2 px-5 scroll-smooth"
                >
                    {products?.map((i) => (
                        <div className="flex-col flex gap-1" key={i.productID}>
                            {/* IMAGE CARD */}
                            <div className="h-auto aspect-[2/3] w-[40dvw] md:w-[18dvw] max-w-[40dvw] md:max-w-[18dvw] relative">
                                {/* hover group is on the rounded container */}
                                <div className="absolute inset-0 rounded-lg overflow-hidden group">
                                    {/* slider: 200% width (two slides), translate on hover */}
                                    <div className="absolute inset-0 flex w-[200%] h-full transition-transform duration-500 ease-out will-change-transform group-hover:-translate-x-1/2">
                                        {/* Slide 1 */}
                                        <div className="relative w-1/2 h-full">
                                            <a href={getProductHref(i)}>
                                                <Image
                                                    src={i.featuredImage?.[0]?.imgUrl || logo}
                                                    alt={i.name || 'Product image'}
                                                    fill
                                                    sizes="(max-width: 768px) 40vw, 18vw"
                                                    className="object-cover"
                                                    priority={false}
                                                />
                                            </a>
                                        </div>
                                        {/* Slide 2 */}

                                        <div className="relative w-1/2 h-full">
                                            <a href={getProductHref(i)}>
                                                <Image
                                                    src={i.featuredImage?.[1]?.imgUrl || i.featuredImage?.[0]?.imgUrl || logo}
                                                    alt={`${i.name || 'Product'} - alt`}
                                                    fill
                                                    sizes="(max-width: 768px) 40vw, 18vw"
                                                    className="object-cover"
                                                    priority={false}
                                                />
                                            </a>
                                        </div>


                                    </div>

                                    {/* WISHLIST BUTTON (float on top) */}
                                    <button
                                        onClick={() => handleToggleWishlist(i.productID)}
                                        disabled={loading}
                                        className={`absolute top-2 right-2 z-20 rounded-full p-2 
                               bg-gradient-to-b from-white to-gray-100 
                               border border-gray-200 shadow-md 
                               hover:shadow-sm active:shadow-inner 
                               transition-all duration-200 flex justify-center items-center ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                                            }`}
                                        aria-label={isInWishlist(i.productID) ? "Remove from wishlist" : "Add to wishlist"}
                                    >
                                        {isInWishlist(i.productID)
                                            ? <FaHeart size={16} color="red" />
                                            : <FaRegHeart size={16} color="grey" />}
                                    </button>

                                    {/* RATING */}
                                    <div className="absolute z-20 bottom-1 left-1 bg-white rounded-lg px-2 text-xs flex items-center gap-1 font-bold">
                                        <TiStarFullOutline color="#ffd232" size={12} /> {i.rating}
                                    </div>
                                </div>
                            </div>

                            {/* TEXT + PRICE (clickable) */}
                            <a href={getProductHref(i)}>
                                <div className="px-[5px]">
                                    <p className="text-xs font-normal uppercase">
                                        {(!i.brand && !i.brandID) ||
                                            i.brand?.trim().toLowerCase() === "inhouse"
                                            ? "Ithyaraa"
                                            : (i.brand || "Ithyaraa")}
                                    </p>
                                    <p className="text-ellipsis truncate w-[40dvw] md:w-[18dvw] text-sm font-medium">{i.name}</p>
                                </div>
                                <div className="pricing flex flex-row justify-start gap-2 items-center mt-1 px-[5px]">
                                    <span className="font-semibold text-sm">₹{i.salePrice}</span>
                                    <span className="font-medium text-sm text-gray-500 line-through">₹{i.regularPrice}</span>
                                    <span className="text-green-600 font-medium text-xs">{i.discountValue}% OFF</span>
                                </div>
                            </a>
                        </div>
                    ))}
                </div>

                {/* Right Arrow (Desktop Only) */}
                <button
                    type="button"
                    aria-label="Scroll right"
                    onClick={scrollRight}
                    className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-30 
                    bg-white rounded-full shadow-md p-2 hover:shadow-lg transition"
                >
                    <IoIosArrowForward size={20} />
                </button>
            </div>

            {/* Bottom CTA + Optional Arrows */}
            <div className={`justify-center items-center gap-4 pb-4 ${buttonWant ? 'flex' : 'hidden'}`}>
                <button type="button" aria-label="Scroll left" onClick={scrollLeft} className="p-2 rounded-full z-30 shadow-lg">
                    <IoIosArrowBack size={20} />
                </button>
                <button className="bg-primary-yellow h-[30px] px-4 text-xs font-medium rounded">
                    Explore All
                </button>
                <button type="button" aria-label="Scroll right" onClick={scrollRight} className="p-2 rounded-full z-30 shadow-lg">
                    <IoIosArrowForward size={20} />
                </button>
            </div>
        </section>
    );
};

export default ProductSection;
