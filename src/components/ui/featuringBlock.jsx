"use client";

import React, { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 60, damping: 15 } }
};

const FeatureCard = ({ block, idx, scrollYProgress }) => {
    // Move Y up staggered by index when scrolling past 78% from top
    const yTransform = useTransform(scrollYProgress, [0, 1], [0, (idx + 1) * -40]);

    const getFilterLink = (block) => {
        if (!block.routeTo) return '#';
        const params = new URLSearchParams();
        if (block.category) params.append('categoryID', block.category);
        if (block.minPrice) params.append('minPrice', block.minPrice);
        if (block.maxPrice) params.append('maxPrice', block.maxPrice);
        if (block.offer) params.append('offerID', block.offer);
        
        return `/products/shop?${params.toString()}`;
    };

    return (
        <motion.div 
            variants={itemVariants}
            style={{ y: yTransform }}
            className="w-[45%] md:w-[22%] aspect-[2/3] rounded-2xl overflow-hidden relative group"
        >
            {block.image_url ? (
                <Link href={getFilterLink(block)}>
                    <Image
                        src={block.image_url}
                        alt={`Featured ${idx + 1}`}
                        fill
                        sizes="(max-width: 768px) 45vw, 22vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                </Link>
            ) : (
                <div className="w-full h-full bg-black flex items-center justify-center text-white/20 text-xs font-bold uppercase tracking-widest">
                    Coming Soon
                </div>
            )}
        </motion.div>
    );
};

const FeaturingBlock = ({ blocks = [] }) => {
    // If no blocks are provided, render the default black boxes
    const displayBlocks = blocks.length > 0 ? blocks : [{}, {}, {}, {}];
    const sectionRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["end 78%", "end start"]
    });

    return (
        <div ref={sectionRef} className='my-10 overflow-x-clip'>
            <div className="flex flex-col items-center mb-6">
                <h2 className="text-2xl font-semibold uppercase md:text-3xl">Featuring Block</h2>
                <p className='text-lg md:text-xl font-medium'>Found a perfect place</p>
            </div>
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className="flex flex-wrap gap-2 justify-center px-4"
            >
                {displayBlocks.map((block, idx) => (
                    <FeatureCard key={block.id || idx} block={block} idx={idx} scrollYProgress={scrollYProgress} />
                ))}
            </motion.div>
        </div>
    )
}

export default FeaturingBlock
