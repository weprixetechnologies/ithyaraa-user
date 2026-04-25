"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Slider({
    isMobile = false,
    imgClass = "object-cover",
    imgContainerClass = "",
    aspectratio = "aspect-[1470/489]",
    slideWidthPercent = 1,
    slidePadding = 8,
    slides = [],
    autoplay = false,
    autoplayInterval = 3000,
    showButtons = true, // new prop to show/hide navigation buttons
    showDots = true     // new prop to show/hide dots
}) {
    const [current, setCurrent] = useState(0);
    const [slideWidth, setSlideWidth] = useState(0);
    const [trackWidth, setTrackWidth] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);

    const trackRef = useRef(null);
    const startX = useRef(0);
    const isDragging = useRef(false);
    const autoplayRef = useRef(null);

    useEffect(() => {
        const measure = () => {
            if (trackRef.current) {
                const firstSlide = trackRef.current.querySelector(".slide");
                const slideW = firstSlide ? firstSlide.offsetWidth : 0;
                setSlideWidth(slideW);
                setTrackWidth(trackRef.current.scrollWidth);
                setContainerWidth(trackRef.current.parentElement.offsetWidth);
            }
        };
        measure();
        const raf = requestAnimationFrame(measure);
        const t = setTimeout(measure, 100);
        window.addEventListener("resize", measure);
        return () => {
            cancelAnimationFrame(raf);
            clearTimeout(t);
            window.removeEventListener("resize", measure);
        };
    }, [slides, slideWidthPercent]);

    useEffect(() => {
        if (!autoplay || !slides?.length) return;
        const id = setInterval(() => {
            setCurrent(prev => (prev < slides.length - 1 ? prev + 1 : 0));
        }, autoplayInterval);
        autoplayRef.current = id;
        return () => clearInterval(id);
    }, [autoplay, autoplayInterval, slides?.length]);

    const prevSlide = () => setCurrent(prev => (prev > 0 ? prev - 1 : 0));
    const nextSlide = () => setCurrent(prev => (prev < slides.length - 1 ? prev + 1 : prev));
    const goToSlide = (index) => setCurrent(index);

    const handleTouchStart = (e) => (startX.current = e.touches[0].clientX);
    const handleTouchMove = () => (isDragging.current = true);
    const handleTouchEnd = (e) => {
        if (!isDragging.current) return;
        const diff = startX.current - e.changedTouches[0].clientX;
        if (diff > 50) nextSlide();
        else if (diff < -50) prevSlide();
        isDragging.current = false;
    };

    const handleMouseDown = (e) => { startX.current = e.clientX; isDragging.current = true; };
    const handleMouseUp = (e) => {
        if (!isDragging.current) return;
        const diff = startX.current - e.clientX;
        if (diff > 50) nextSlide();
        else if (diff < -50) prevSlide();
        isDragging.current = false;
    };

    let translate = current * slideWidth;
    const maxTranslate = Math.max(trackWidth - containerWidth, 0);
    if (translate > maxTranslate) translate = maxTranslate;

    const getLink = (slide) => {
        if (!slide || typeof slide === "string") return null;
        if (slide.routeTo === 'shop') {
            const params = new URLSearchParams();
            if (slide.categoryID) params.append('categoryID', slide.categoryID);
            if (slide.minPrice) params.append('minPrice', slide.minPrice);
            if (slide.maxPrice) params.append('maxPrice', slide.maxPrice);
            if (slide.offerID) params.append('offerID', slide.offerID);
            const qs = params.toString();
            return `/shop${qs ? `?${qs}` : ''}`;
        }
        return null;
    };

    return (
        <div
            className="relative w-full overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => (isDragging.current = false)}
        >
            {/* Slider track */}
            <div
                ref={trackRef}
                className={`transition-transform duration-500 ${isMobile ? "flex md:hidden" : "hidden md:flex"}`}
                style={{ transform: `translateX(-${translate}px)` }}
            >
                {slides.map((slide, index) => {
                    const src = typeof slide === "string" ? slide : slide.src;
                    const href = getLink(slide);
                    const content = (
                        <div className={`relative w-full h-full ${aspectratio} ${imgContainerClass}`}>
                            <Image
                                src={src}
                                fill
                                className={imgClass}
                                alt={`Slide ${index + 1}`}
                                priority={index === 0}
                                loading={index === 0 ? "eager" : "lazy"}
                                fetchPriority={index === 0 ? "high" : undefined}
                                sizes="100vw"
                                quality={80}
                            />
                        </div>
                    );

                    return (
                        <div
                            key={index}
                            className={`slide relative ${aspectratio}`}
                            style={{
                                minWidth: `${slideWidthPercent * 100}%`,
                                padding: `${slidePadding}px`,
                            }}
                        >
                            {href ? (
                                <Link href={href} className="block w-full h-full">
                                    {content}
                                </Link>
                            ) : content}
                        </div>
                    );
                })}
            </div>

            {/* Buttons */}
            {showButtons && slides.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        disabled={current === 0}
                        className={`absolute top-1/2 left-4 -translate-y-1/2 p-2 rounded-full text-white 
                        ${current === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-black bg-opacity-50"}`}
                    >
                        ◀
                    </button>
                    <button
                        onClick={nextSlide}
                        disabled={current === slides.length - 1}
                        className={`absolute top-1/2 right-4 -translate-y-1/2 p-2 rounded-full text-white 
                        ${current === slides.length - 1 ? "bg-gray-400 cursor-not-allowed" : "bg-black bg-opacity-50"}`}
                    >
                        ▶
                    </button>
                </>
            )}

            {/* Dots */}
            {showDots && slides.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => goToSlide(index)}
                            aria-label={`Go to slide ${index + 1}`}
                            aria-current={current === index ? 'true' : undefined}
                            className="p-4 flex items-center justify-center"
                        >
                            <span className={`block w-3 h-3 rounded-full ${current === index ? 'bg-white' : 'bg-white/50'}`} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
