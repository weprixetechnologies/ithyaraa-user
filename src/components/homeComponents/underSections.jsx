"use client"
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

const links = [
    { href: "/shop?maxPrice=299", src: "/under299.png" },
    { href: "/shop?maxPrice=399", src: "/under399.png" },
    { href: "/shop?maxPrice=599", src: "/under599.png" },
    { href: "/shop?maxPrice=799", src: "/under799.png" },
    { href: "/shop?maxPrice=999", src: "/under999.png" },
    { href: "/offers", src: "/viewoffer.png" },
];

const UnderSections = () => {
    return (
        <>
            <style jsx>{`
                .ripple-container {
                    position: relative;
                    overflow: hidden;
                }
                .ripple-container::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 0;
                    height: 0;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.5);
                    transform: translate(-50%, -50%);
                    transition: width 0.6s, height 0.6s;
                    pointer-events: none;
                    z-index: 1;
                }
                .ripple-container:hover::before {
                    width: 300px;
                    height: 300px;
                }
                .ripple-container > * {
                    position: relative;
                    z-index: 2;
                }
            `}</style>
            <div className='my-10 px-4 md:px-10 overflow-x-clip'>
                <div className="flex flex-col items-center mb-6">
                    <h2 className="text-2xl font-semibold uppercase md:text-3xl">Special Sections for you</h2>
                    <p className='text-lg md:text-xl font-medium'>Found a perfect place</p>
                </div>
                <div className="w-full flex justify-center">
                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ staggerChildren: 0.15 }}
                        className="w-full md:w-4/5 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
                    >
                        {links.map((item, index) => {
                            const isEven = index % 2 === 0;
                            const itemVariants = {
                                hidden: { opacity: 0, x: isEven ? -100 : 100 },
                                visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 60, damping: 15 } }
                            };

                            return (
                                <motion.div key={index} variants={itemVariants}>
                                    <Link href={item.href} className='ripple-container relative transition-transform duration-300 hover:-translate-x-1 hover:-translate-y-1 cursor-pointer shadow-lg rounded-lg block'>
                                        <Image src={item.src} alt="Under this price" width={500} height={350} className='rounded-lg w-full h-auto' />
                                    </Link>
                                </motion.div>
                            )
                        })}
                    </motion.div>
                </div>
            </div>
        </>
    )
}

export default UnderSections
