"use client";
import React, { useRef } from "react";
import Image from "next/image";
import { IoChevronDownSharp, IoChevronUpSharp } from "react-icons/io5";

const ProductGallery = ({ featuredImage, setFeaturedImage, galleryImages }) => {
    const galleryRef = useRef(null);

    const scrollUp = () => {
        if (galleryRef.current) galleryRef.current.scrollBy({ top: -100, behavior: "smooth" });
    };
    const scrollDown = () => {
        if (galleryRef.current) galleryRef.current.scrollBy({ top: 100, behavior: "smooth" });
    };

    return (
        <div className="relative md:flex w-full md:flex-row-reverse gap-4">
            {/* Main Image */}
            <div className="flex-1 px-3 py-2 md:py-0">
                <div className="relative w-full aspect-[437/540]">
                    <Image
                        src={featuredImage || "https://ithyaraa.b-cdn.net/239723c1-2c9c-40d4-811e-0138e30e5d78.JPG"}
                        alt="Featured Image"
                        fill
                        className="rounded-lg"
                    />
                </div>
            </div>

            {/* Desktop Vertical Gallery */}
            <div className="hidden md:flex flex-col gap-2 relative w-[80px]">
                <button
                    onClick={scrollUp}
                    className="bg-white flex justify-center items-center text-primary-logo-yellow border rounded-full p-1 shadow hover:bg-gray-100"
                >
                    <IoChevronUpSharp />
                </button>

                <div ref={galleryRef} className="flex flex-col gap-2 overflow-y-auto max-h-[437px]">
                    {galleryImages.map((i, index) => (
                        <div
                            key={index}
                            className="flex-shrink-0 relative w-full aspect-[437/540] cursor-pointer"
                            onClick={() => setFeaturedImage(i.imgUrl)}
                        >
                            <Image src={i.imgUrl} alt={i.imgAlt} fill className="rounded-lg" />
                        </div>
                    ))}
                </div>

                <button
                    onClick={scrollDown}
                    className="bg-white flex justify-center items-center text-primary-logo-yellow border rounded-full p-1 shadow hover:bg-gray-100"
                >
                    <IoChevronDownSharp />
                </button>
            </div>

            {/* Mobile Horizontal Gallery */}
            <div className="md:hidden flex gap-2 overflow-x-auto justify-center">
                {galleryImages.map((i, index) => (
                    <div
                        key={index}
                        className="flex-shrink-0 relative w-[70px] aspect-[437/540] cursor-pointer"
                        onClick={() => setFeaturedImage(i.imgUrl)}
                    >
                        <Image src={i.imgUrl} alt={i.imgAlt} fill className="rounded-lg" />

                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductGallery;
