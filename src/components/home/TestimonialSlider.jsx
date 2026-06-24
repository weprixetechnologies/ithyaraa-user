"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const testimonials = [
    {
        id: 1,
        name: "Priya Sharma",
        location: "Mumbai",
        rating: 5,
        text: "Absolutely love the quality of fabrics! The ethnic wear collection is stunning and I always get compliments.",
        product: "Silk Saree Collection",
    },
    {
        id: 2,
        name: "Ananya Reddy",
        location: "Hyderabad",
        rating: 5,
        text: "Ithyaraa has the most beautiful designs. The packaging was premium and delivery was super fast!",
        product: "Designer Kurti Set",
    },
    {
        id: 3,
        name: "Meera Krishnan",
        location: "Chennai",
        rating: 5,
        text: "I've been shopping here for months now. The pre-booking feature is amazing — I always get exclusive pieces!",
        product: "Bridal Lehenga",
    },
    {
        id: 4,
        name: "Sneha Patel",
        location: "Ahmedabad",
        rating: 4,
        text: "Great variety and affordable prices. The customer service team was really helpful with my order.",
        product: "Cotton Dress",
    },
    {
        id: 5,
        name: "Kavya Nair",
        location: "Kochi",
        rating: 5,
        text: "The best online fashion store I've ever shopped at. Every piece feels like it was curated just for me!",
        product: "Anarkali Suit",
    },
];

const AUTOPLAY_INTERVAL = 4000;

// Position configs for each slot
const POSITIONS = {
    "-2": { x: -520, scale: 0.55, rotateY: 40, zIndex: 1, opacity: 0.3, blur: 4 },
    "-1": { x: -280, scale: 0.75, rotateY: 25, zIndex: 2, opacity: 0.6, blur: 2 },
    "0":  { x: 0,    scale: 1,    rotateY: 0,  zIndex: 5, opacity: 1,   blur: 0 },
    "1":  { x: 280,  scale: 0.75, rotateY: -25, zIndex: 2, opacity: 0.6, blur: 2 },
    "2":  { x: 520,  scale: 0.55, rotateY: -40, zIndex: 1, opacity: 0.3, blur: 4 },
    "hidden": { x: 0, scale: 0.4, rotateY: 0, zIndex: 0, opacity: 0, blur: 6 },
};

const SPRING_CONFIG = { stiffness: 120, damping: 22, mass: 0.8 };

const renderStars = (count) => {
    return Array.from({ length: 5 }, (_, i) => (
        <svg
            key={i}
            className={`w-4 h-4 ${i < count ? "text-amber-400" : "text-gray-300"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
        >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
    ));
};

const TestimonialCard = ({ testimonial, position }) => {
    const pos = POSITIONS[position] || POSITIONS["hidden"];

    const x = useSpring(pos.x, SPRING_CONFIG);
    const scale = useSpring(pos.scale, SPRING_CONFIG);
    const rotateY = useSpring(pos.rotateY, SPRING_CONFIG);
    const opacity = useSpring(pos.opacity, SPRING_CONFIG);

    // Update spring targets when position changes
    React.useEffect(() => {
        const p = POSITIONS[position] || POSITIONS["hidden"];
        x.set(p.x);
        scale.set(p.scale);
        rotateY.set(p.rotateY);
        opacity.set(p.opacity);
    }, [position, x, scale, rotateY, opacity]);

    const pos2 = POSITIONS[position] || POSITIONS["hidden"];

    return (
        <motion.div
            className="absolute w-[280px] md:w-[340px]"
            style={{
                x,
                scale,
                rotateY,
                opacity,
                zIndex: pos2.zIndex,
                transformStyle: "preserve-3d",
                left: "50%",
                marginLeft: "-140px",
                filter: `blur(${pos2.blur}px)`,
            }}
        >
            <div className={`
                relative rounded-3xl overflow-hidden
                bg-white border border-gray-100
                ${position === "0" ? "shadow-[0_25px_80px_-15px_rgba(251,74,111,0.2)]" : "shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)]"}
                transition-shadow duration-500
            `}>
                {/* Top gradient bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-[#ff7aa2] via-[#fb4a6f] to-[#ff7aa2]" />

                <div className="p-6 md:p-8">
                    {/* Stars */}
                    <div className="flex gap-0.5 mb-4">
                        {renderStars(testimonial.rating)}
                    </div>

                    {/* Quote */}
                    <div className="relative mb-6">
                        <svg className="absolute -top-2 -left-1 w-8 h-8 text-rose-100" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11h4v10H0z" />
                        </svg>
                        <p className="text-gray-600 text-sm md:text-[15px] leading-relaxed pl-4 italic">
                            &ldquo;{testimonial.text}&rdquo;
                        </p>
                    </div>

                    {/* Product tag */}
                    <div className="mb-5">
                        <span className="inline-block text-xs font-medium text-[#fb4a6f] bg-rose-50 px-3 py-1 rounded-full">
                            {testimonial.product}
                        </span>
                    </div>

                    {/* Divider */}
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-5" />

                    {/* Author */}
                    <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#ff7aa2] to-[#fb4a6f] flex-shrink-0 flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                                {testimonial.name.charAt(0)}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">
                                {testimonial.name}
                            </p>
                            <p className="text-xs text-gray-400">
                                {testimonial.location}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const TestimonialSlider = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const total = testimonials.length;
    const autoplayRef = useRef(null);

    const getOffset = (cardIndex) => {
        let diff = cardIndex - currentIndex;
        // Wrap around for circular positioning
        if (diff > Math.floor(total / 2)) diff -= total;
        if (diff < -Math.floor(total / 2)) diff += total;
        // Only show cards within range [-2, 2]
        if (diff < -2 || diff > 2) return "hidden";
        return String(diff);
    };

    const navigate = useCallback(
        (dir) => {
            setCurrentIndex((prev) => (prev + dir + total) % total);
        },
        [total]
    );

    // Autoplay
    useEffect(() => {
        autoplayRef.current = setInterval(() => {
            navigate(1);
        }, AUTOPLAY_INTERVAL);
        return () => clearInterval(autoplayRef.current);
    }, [navigate]);

    const handleNavigate = (dir) => {
        clearInterval(autoplayRef.current);
        navigate(dir);
        autoplayRef.current = setInterval(() => {
            navigate(1);
        }, AUTOPLAY_INTERVAL);
    };

    const handleDotClick = (i) => {
        clearInterval(autoplayRef.current);
        setCurrentIndex(i);
        autoplayRef.current = setInterval(() => {
            navigate(1);
        }, AUTOPLAY_INTERVAL);
    };

    return (
        <section className="relative py-16 md:py-24 overflow-hidden bg-gradient-to-b from-[#fef7f8] via-white to-[#fef7f8]">
            {/* Background decorative elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-10 left-10 w-72 h-72 bg-rose-100/40 rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-100/30 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-50/50 rounded-full blur-3xl" />
            </div>

            {/* Heading */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6 }}
                className="flex flex-col items-center justify-center max-w-[900px] mx-auto px-4 text-center mb-12 md:mb-16 relative z-10"
            >
                <div className="flex items-center justify-center gap-3 mb-3">
                    <span className="text-[#ff7aa2] text-[16px] md:text-[18px]">✦</span>
                    <span className="font-parisienne text-[#ff7aa2] text-[16px] md:text-[18px] font-normal leading-none pt-1">
                        What They Say
                    </span>
                    <span className="text-[#ff7aa2] text-[16px] md:text-[18px]">✦</span>
                </div>
                <h2 className="font-playfair font-medium text-[36px] md:text-[3rem] leading-[1] tracking-[-0.03em] text-[#111111] mb-[10px]">
                    Words from Our Customers
                </h2>
                <p className="font-medium text-[16px] md:text-[18px] leading-[1.5] text-gray-500 max-w-[600px] mx-auto">
                    Real stories from women who love shopping with us
                </p>
            </motion.div>

            {/* 3D Carousel */}
            <div className="relative w-full max-w-6xl mx-auto px-4" style={{ perspective: "1200px" }}>
                <div className="relative h-[420px] md:h-[460px] flex items-center justify-center">
                    {testimonials.map((testimonial, idx) => (
                        <TestimonialCard
                            key={testimonial.id}
                            testimonial={testimonial}
                            position={getOffset(idx)}
                        />
                    ))}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-6 mt-8 relative z-10">
                <button
                    onClick={() => handleNavigate(-1)}
                    className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow-lg flex items-center justify-center hover:bg-rose-50 hover:border-[#fb4a6f]/30 transition-all duration-300 group"
                    aria-label="Previous testimonial"
                >
                    <svg className="w-5 h-5 text-gray-500 group-hover:text-[#fb4a6f] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* Dots */}
                <div className="flex gap-2">
                    {testimonials.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => handleDotClick(i)}
                            className={`transition-all duration-300 rounded-full ${
                                i === currentIndex
                                    ? "w-8 h-2.5 bg-gradient-to-r from-[#ff7aa2] to-[#fb4a6f]"
                                    : "w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400"
                            }`}
                            aria-label={`Go to testimonial ${i + 1}`}
                        />
                    ))}
                </div>

                <button
                    onClick={() => handleNavigate(1)}
                    className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow-lg flex items-center justify-center hover:bg-rose-50 hover:border-[#fb4a6f]/30 transition-all duration-300 group"
                    aria-label="Next testimonial"
                >
                    <svg className="w-5 h-5 text-gray-500 group-hover:text-[#fb4a6f] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </section>
    );
};

export default TestimonialSlider;
