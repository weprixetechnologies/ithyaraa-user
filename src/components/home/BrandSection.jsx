"use client";

import React, { useRef } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const AnimatedBlobs = dynamic(() => import('../homeComponents/AnimatedBlobs'), { ssr: false });

const BrandSection = ({
  heading = "Brands We Partner With",
  subHeading = "Discover trusted fashion brands & creators",
  brands = []
}) => {
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' });
  };

  if (!brands || brands.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-x-clip w-full py-6 md:py-8">
      <AnimatedBlobs />

      {/* Heading */}
      <div className="flex flex-col items-center justify-center max-w-[900px] mx-auto py-4 md:py-5 px-4 text-center">
        {/* Eyebrow Label */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="text-[#ff7aa2] text-[16px] md:text-[18px]">✦</span>
          <span className="font-parisienne text-[#ff7aa2] text-[16px] md:text-[18px] font-normal leading-none pt-1">
            Featured Brands
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
      </div>

      {/* Scrollable Brands Row with Navigation Arrows */}
      <div className="relative mb-6 px-4 md:px-12">
        {/* Left Arrow (Desktop) */}
        <button
          type="button"
          aria-label="Scroll left"
          onClick={scrollLeft}
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-30 
                     bg-white rounded-full shadow-md p-2 hover:shadow-lg transition border border-gray-100 hover:scale-105"
        >
          <IoIosArrowBack size={22} className="text-gray-700" />
        </button>

        {/* Brands List (Horizontal Scroll with Portrait Category-style Tiles) */}
        <div
          ref={scrollRef}
          className="flex flex-row gap-4 md:gap-6 overflow-x-auto py-3 px-2 scroll-smooth scrollbar-hide"
        >
          {brands.map((brand, idx) => {
            const brandId = brand.uid || brand.id || idx;
            const brandName = brand.name || brand.username || "Brand";
            const initial = brandName.charAt(0).toUpperCase();

            return (
              <div key={brandId} className="flex-shrink-0">
                <a
                  href={`/brands/${brand.uid}`}
                  className="flex flex-col items-center justify-center w-[110px] sm:w-[130px] md:w-[150px] lg:w-[170px] group"
                >
                  {/* Portrait Tile Card (Same as Category Section) */}
                  <div className="w-full aspect-[1024/1536] flex items-center justify-center">
                    <div className="w-full h-full rounded-2xl shadow-md cursor-pointer transition-transform group-hover:scale-105 overflow-hidden flex items-center justify-center bg-gray-50 border border-gray-100 relative">
                      {brand.profilePhoto ? (
                        <div className="relative w-full h-full overflow-hidden">
                          <Image
                            src={brand.profilePhoto}
                            alt={brandName}
                            fill
                            sizes="(max-width: 768px) 30vw, 15vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-700 font-bold text-3xl sm:text-4xl">
                          {initial}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Brand Name */}
                  <span className="mt-3 font-bold text-center text-gray-900 group-hover:text-[#fb4a6f] transition-colors tracking-tight text-xs sm:text-sm line-clamp-1 w-full">
                    {brandName}
                  </span>
                </a>
              </div>
            );
          })}
        </div>

        {/* Right Arrow (Desktop) */}
        <button
          type="button"
          aria-label="Scroll right"
          onClick={scrollRight}
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-30 
                     bg-white rounded-full shadow-md p-2 hover:shadow-lg transition border border-gray-100 hover:scale-105"
        >
          <IoIosArrowForward size={22} className="text-gray-700" />
        </button>
      </div>

      {/* Explore All CTA */}
      <div className="flex justify-center items-center">
        <a
          href="/brands"
          className="inline-flex items-center justify-center bg-primary-yellow hover:bg-yellow-400 text-gray-900 font-medium px-6 py-2.5 rounded-full text-xs sm:text-sm shadow-sm hover:shadow transition-all duration-200"
        >
          Explore All Brands
        </a>
      </div>
    </section>
  );
};

export default BrandSection;
