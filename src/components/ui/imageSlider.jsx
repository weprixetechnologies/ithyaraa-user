"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

export default function Slider({
    isMobile = false,
    imgClass = "object-cover",
    imgContainerClass = "",
    aspectratio = "aspect-[1470/489]",
    slideWidthPercent = 1,
    slidePadding = 8,
    slides,
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
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, [slides, slideWidthPercent]);

    useEffect(() => {
        if (!autoplay) return;
        autoplayRef.current = setInterval(() => {
            setCurrent(prev => (prev < slides.length - 1 ? prev + 1 : 0));
        }, autoplayInterval);
        return () => clearInterval(autoplayRef.current);
    }, [autoplay, autoplayInterval, slides.length]);

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
                {slides.map((src, index) => (
                    <div
                        key={index}
                        className={`slide relative ${aspectratio}`}
                        style={{
                            minWidth: `${slideWidthPercent * 100}%`,
                            padding: `${slidePadding}px`,
                        }}
                    >
                        <div className={`relative w-full h-full ${aspectratio} ${imgContainerClass}`}>
                            <Image src={src} fill className={imgClass} alt={`Slide ${index + 1}`} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Buttons */}
            {showButtons && (
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
            {showDots && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`w-3 h-3 rounded-full ${current === index ? "bg-gray p-1 border-1 border-white" : "bg-white"}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
