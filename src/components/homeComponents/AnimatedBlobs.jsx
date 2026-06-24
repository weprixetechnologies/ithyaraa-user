"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const AnimatedBlobs = () => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });
    
    // Subtle parallax effect tied to the component's scroll position
    const y1 = useTransform(scrollYProgress, [0, 1], [-60, 60]);
    const y2 = useTransform(scrollYProgress, [0, 1], [60, -60]);

    return (
        <div ref={ref} className="absolute inset-0 pointer-events-none -z-10">
            {/* Top Left Blob */}
            <motion.svg 
                viewBox="0 0 200 200" 
                xmlns="http://www.w3.org/2000/svg"
                style={{ y: y1 }}
                animate={{ 
                    x: [0, 30, 0],
                    scale: [1, 1.1, 1],
                    rotate: [0, 45, 0]
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-10%] -mt-[50px] left-[-5%] w-[250px] h-[250px] md:w-[450px] md:h-[450px] opacity-70 mix-blend-multiply"
            >
                <path fill="#ffe4e6" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,87.6,-1.3C85.2,13.7,77.8,27.4,68.6,39.1C59.4,50.8,48.4,60.6,35.4,67.6C22.4,74.6,7.4,78.9,-7.1,78.7C-21.6,78.5,-35.6,73.8,-48.2,65.8C-60.8,57.8,-72,46.5,-79.4,32.6C-86.8,18.7,-90.4,2.2,-87.3,-13.1C-84.2,-28.4,-74.4,-42.6,-61.7,-51.7C-49,-60.8,-33.5,-64.8,-19.9,-68.8C-6.3,-72.8,5.4,-76.8,18.6,-77.6C31.8,-78.4,46.5,-76,44.7,-76.4Z" transform="translate(100 100)" />
            </motion.svg>
            
            {/* Top Right Blob */}
            <motion.svg 
                viewBox="0 0 200 200" 
                xmlns="http://www.w3.org/2000/svg"
                style={{ y: y2 }}
                animate={{ 
                    x: [0, -30, 0],
                    scale: [1, 1.2, 1],
                    rotate: [0, -30, 0]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-[-5%] right-[-5%] w-[200px] h-[200px] md:w-[400px] md:h-[400px] opacity-70 mix-blend-multiply"
            >
                <path fill="#fbcfe8" d="M39.9,-65.7C53.7,-59.5,68.4,-52,78,-40C87.6,-28,92.1,-14,90.4,-0.9C88.7,12.2,80.8,24.4,71.6,34.9C62.4,45.4,51.9,54.2,40,60.2C28.1,66.2,14,69.4,0.1,69.2C-13.8,69,-27.6,65.4,-39.8,58.9C-52,52.4,-62.6,43,-69.8,31.4C-77,19.8,-80.8,6,-79.8,-7.4C-78.8,-20.8,-73,-33.8,-63.9,-43.6C-54.8,-53.4,-42.4,-60,-29.9,-65C-17.4,-70,-4.9,-73.4,6.5,-72.1C17.9,-70.8,35.8,-64.8,39.9,-65.7Z" transform="translate(100 100)" />
            </motion.svg>
            
            {/* Bottom Right Blob */}
            <motion.svg 
                viewBox="0 0 200 200" 
                xmlns="http://www.w3.org/2000/svg"
                style={{ y: y1 }}
                animate={{ 
                    x: [0, -25, 0],
                    scale: [1, 1.1, 1],
                    rotate: [0, -45, 0]
                }}
                transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-[-5%] right-[-5%] w-[280px] h-[280px] md:w-[450px] md:h-[450px] opacity-60 mix-blend-multiply"
            >
                <path fill="#fdf2f8" d="M38.8,-64.5C52.4,-57.4,67.1,-50.7,75,-39.1C82.9,-27.5,84,-11,81.1,4.2C78.2,19.4,71.3,33.3,61.4,44.5C51.5,55.7,38.6,64.2,24.4,68.9C10.2,73.6,-5.3,74.5,-19.9,71.4C-34.5,68.3,-48.2,61.2,-59.8,50.4C-71.4,39.6,-80.9,25.1,-83.4,9.6C-85.9,-5.9,-81.4,-22.4,-72.1,-35.1C-62.8,-47.8,-48.7,-56.7,-34.7,-63.3C-20.7,-69.9,-6.8,-74.2,6.1,-75.4C19,-76.6,38,-74.7,38.8,-64.5Z" transform="translate(100 100)" />
            </motion.svg>
        </div>
    );
};

export default AnimatedBlobs;
