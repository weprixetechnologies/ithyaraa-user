"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { TiStarFullOutline } from "react-icons/ti";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import Link from 'next/link';

const ProductSection = ({ heading, subHeading, shopLink, buttonWant = false, products = [] }) => {
    const [wishlist, setWishlist] = useState('')
    const scrollRef = useRef(null)

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

    const toggleWishlist = (productID) => {
        setWishlist(prev =>
            prev.includes(productID)
                ? prev.filter(id => id !== productID)
                : [...prev, productID]
        );
    };

    const scrollLeft = () => {
        scrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
    };

    const scrollRight = () => {
        scrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' });
    };
    // console.log(products);

    return (
        <>
            {/* Heading */}
            <div className="flex flex-row justify-between px-5 mt-5 items-end mb-3 md:flex-col md:items-center">
                <div className="flex flex-col">
                    <p className="text-lg font-medium md:text-xl">{heading}</p>
                    <p className="text-xs font-semibold text-secondary-text-deep md:text-center md:text-sm">{subHeading}</p>
                </div>
                <button className="bg-primary-yellow h-[30px] px-2 text-xs font-medium rounded md:hidden">
                    Shop Now
                </button>
            </div>

            {/* Scrollable Product Row with Arrows */}
            <div className="relative mb-5">
                {/* Left Arrow (Desktop Only) */}
                <button
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
                            <div className="h-auto aspect-[170/222] w-[40dvw] md:w-[18dvw] max-w-[40dvw] md:max-w-[18dvw] relative">
                                {/* hover group is on the rounded container */}
                                <div className="absolute inset-0 rounded-lg overflow-hidden group">
                                    {/* slider: 200% width (two slides), translate on hover */}
                                    <div className="absolute inset-0 flex w-[200%] h-full transition-transform duration-500 ease-out will-change-transform group-hover:-translate-x-1/2">
                                        {/* Slide 1 */}
                                        <div className="relative w-1/2 h-full">
                                            <Link href={`/products/${i.productID}`}>
                                                <Image
                                                    src={i.featuredImage[0].imgUrl}
                                                    alt={i.name}
                                                    fill
                                                    sizes="(max-width: 768px) 40vw, 18vw"
                                                    className="object-cover"
                                                    priority={false}
                                                />
                                            </Link>
                                        </div>
                                        {/* Slide 2 */}

                                        <div className="relative w-1/2 h-full">
                                            <Link href={`/products/${i.productID}`}>
                                                <Image
                                                    src={i.featuredImage[1].imgUrl}
                                                    alt={`${i.name} - alt`}
                                                    fill
                                                    sizes="(max-width: 768px) 40vw, 18vw"
                                                    className="object-cover"
                                                    priority={false}
                                                />
                                            </Link>
                                        </div>


                                    </div>

                                    {/* WISHLIST BUTTON (float on top) */}
                                    <button
                                        onClick={() => toggleWishlist(i.productID)}
                                        className="absolute top-2 right-2 z-20 rounded-full p-2 
                               bg-gradient-to-b from-white to-gray-100 
                               border border-gray-200 shadow-md 
                               hover:shadow-sm active:shadow-inner 
                               transition-all duration-200 flex justify-center items-center"
                                        aria-label="Toggle wishlist"
                                    >
                                        {wishlist.includes(i.productID)
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
                            <Link href={`/products/${i.productID}`}>
                                <div className="px-[5px]">
                                    <p className="text-xs font-normal uppercase">{i.brand}</p>
                                    <p className="text-ellipsis truncate w-[40dvw] md:w-[18dvw] text-sm font-medium">{i.name}</p>
                                </div>
                                <div className="pricing flex flex-row justify-start gap-2 items-center mt-1 px-[5px]">
                                    <span className="font-semibold text-sm">₹{i.salePrice}</span>
                                    <span className="font-medium text-sm text-gray-500 line-through">₹{i.regularPrice}</span>
                                    <span className="text-green-600 font-medium text-xs">{i.discountValue}% OFF</span>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Right Arrow (Desktop Only) */}
                <button
                    onClick={scrollRight}
                    className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-30 
                    bg-white rounded-full shadow-md p-2 hover:shadow-lg transition"
                >
                    <IoIosArrowForward size={20} />
                </button>
            </div>

            {/* Bottom CTA + Optional Arrows */}
            <div className={`justify-center items-center gap-4 pb-4 ${buttonWant ? 'flex' : 'hidden'}`}>
                <button onClick={scrollLeft} className="p-2 rounded-full z-30 shadow-lg">
                    <IoIosArrowBack size={20} />
                </button>
                <button className="bg-primary-yellow h-[30px] px-4 text-xs font-medium rounded">
                    Explore All
                </button>
                <button onClick={scrollRight} className="p-2 rounded-full z-30 shadow-lg">
                    <IoIosArrowForward size={20} />
                </button>
            </div>
        </>
    );
};

export default ProductSection;
