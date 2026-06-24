"use client";

import React, { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion, useScroll, useTransform } from 'framer-motion'

const AnimatedBlobs = dynamic(() => import('./AnimatedBlobs'), { ssr: false })

const getCategoryImage = (category) => {
    if (category?.categoryBanner && category.categoryBanner !== 'https://ithyaraa.b-cdn.net/ithyaraa-logo.png') {
        return category.categoryBanner;
    }
    if (category?.featuredImage && category.featuredImage !== 'https://ithyaraa.b-cdn.net/ithyaraa-logo.png') {
        return category.featuredImage;
    }
    return null;
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, x: -100 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 60, damping: 15 } }
};

const CategoryCard = ({ category, idx, scrollYProgress, isDesktop }) => {
    const imageUrl = getCategoryImage(category);

    // Move Y up to -100px staggered by index when scrolling past 30% from top
    const yTransform = useTransform(scrollYProgress, [0, 1], [0, isDesktop ? (idx + 1) * -40 : 0]);

    return (
        <motion.div
            variants={itemVariants}
            style={{ y: yTransform }}
            className={`flex flex-col items-center justify-center ${isDesktop ? 'w-full' : ''}`}
        >
            <Link
                href={`/shop?categoryID=${category.categoryID}`}
                className="flex flex-col items-center justify-center w-full group"
            >
                <div className={`${isDesktop ? 'w-full' : 'w-[100px]'} aspect-[1024/1536] flex items-center justify-center`}>
                    <div className="w-full h-full rounded-2xl shadow-md cursor-pointer transition-transform group-hover:scale-105 overflow-hidden flex items-center justify-center bg-gray-50 border border-gray-100">
                        {imageUrl ? (
                            <div className="relative w-full h-full overflow-hidden">
                                <Image
                                    src={imageUrl}
                                    alt={category.categoryName || `Category ${idx + 1}`}
                                    fill
                                    sizes="(max-width: 768px) 30vw, 15vw"
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            </div>
                        ) : (
                            <div className="w-12 h-12 bg-white rounded flex items-center justify-center text-gray-300">
                                <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <rect x="5" y="3" width="14" height="18" rx="2" strokeWidth="1" />
                                    <path d="M5 14l3-3 3 3 3-3 2 2" strokeWidth="1" />
                                </svg>
                            </div>
                        )}
                    </div>
                </div>
                <span className={`mt-3 font-bold text-center text-gray-900 group-hover:text-[#fb4a6f] transition-colors tracking-tight ${isDesktop ? 'text-sm' : 'text-[10px] line-clamp-1'}`}>
                    {category.categoryName || `Category ${idx + 1}`}
                </span>
            </Link>
        </motion.div>
    );
};

const DesktopCategories = ({
    heading = "Our Latest Collections",
    subHeading,
    categories = []
}) => {
    const displayCategories = categories.slice(0, 6);
    const sectionRef = useRef(null);

    // Offset triggers when the bottom of the section reaches 50% from the top of the viewport
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["end 80%", "end start"]
    });

    return (
        <section ref={sectionRef} className="relative w-full py-8 overflow-x-clip">
            <AnimatedBlobs />
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="flex flex-col items-center justify-center max-w-[900px] mx-auto py-8 md:py-12 px-4 text-center"
            >
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
            </motion.div>

            <div className="w-full flex justify-center">
                <div className="w-full md:max-w-[90%] px-4">
                    {/* Mobile: horizontal slider with portrait rectangular tiles */}
                    <div className="md:hidden overflow-x-auto scrollbar-hide pb-4">
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                            className="flex gap-4"
                        >
                            {displayCategories.map((category, idx) => (
                                <CategoryCard key={category.categoryID || idx} category={category} idx={idx} scrollYProgress={scrollYProgress} isDesktop={false} />
                            ))}
                        </motion.div>
                    </div>

                    {/* Desktop: existing 6-column grid with portrait rectangular tiles */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        className="hidden md:grid grid-cols-6 gap-6 justify-items-center"
                    >
                        {displayCategories.map((category, idx) => (
                            <CategoryCard key={category.categoryID || idx} category={category} idx={idx} scrollYProgress={scrollYProgress} isDesktop={true} />
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

export default DesktopCategories
