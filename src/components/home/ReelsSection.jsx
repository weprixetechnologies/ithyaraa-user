"use client";

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaInstagram } from 'react-icons/fa';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://backend.ithyaraa.com/api';

const ReelItem = ({ reel }) => {
    const videoRef = useRef(null);
    const [isIntersecting, setIsIntersecting] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsIntersecting(entry.isIntersecting);
            },
            { 
                threshold: 0.4, // Reduced threshold for better responsiveness
                rootMargin: '50px 0px' // Start loading slightly before it enters the viewport
            }
        );

        if (videoRef.current) {
            observer.observe(videoRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (isIntersecting) {
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    console.log("Autoplay prevented:", err);
                });
            }
        } else {
            video.pause();
        }
    }, [isIntersecting]);

    return (
        <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-black shadow-md group">
            <video
                ref={videoRef}
                src={reel.video_url}
                poster={reel.thumbnail_url}
                loop
                muted
                playsInline
                preload="metadata"
                className={`w-full h-full object-cover transition-opacity duration-500 ${isIntersecting ? 'opacity-100' : 'opacity-80'}`}
            />
            
            {/* Overlay if not intersecting - can be a placeholder if needed, 
                but let's trust video poster for now and just add a play icon overlay on hover */}
            {!isIntersecting && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/5 pointer-events-none">
                     <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1" />
                     </div>
                </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
    );
};

const ReelsSection = ({ heading = "Reels", subHeading = "Watch our latest stories" }) => {
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReels = async () => {
            try {
                const res = await axios.get(`${API_BASE}/reels/active`);
                if (res.data.success) {
                    setReels(res.data.data || []);
                }
            } catch (err) {
                console.error("Error fetching reels:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchReels();
    }, []);

    if (loading) {
        return (
            <div className="px-5 my-10">
                <div className="flex flex-col mb-6 md:items-center">
                    <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-2" />
                    <div className="h-4 w-64 bg-gray-100 animate-pulse rounded" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="aspect-[9/16] bg-gray-200 animate-pulse rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (reels.length === 0) return null;

    return (
        <section className="my-10">
            {/* Heading Style from ProductSection */}
            <div className="flex flex-row justify-between px-5 items-end mb-3 md:flex-col md:items-center">
                <div className="flex flex-col">
                    <p className="text-lg font-medium md:text-2xl">{heading}</p>
                    <p className="text-xs font-semibold text-secondary-text-deep md:text-center md:text-sm">{subHeading}</p>
                </div>
                {/* Instagram button for Mobile only */}
                <a
                    href="https://www.instagram.com/ithyaraa_official"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="md:hidden flex items-center gap-1.5 px-3 h-[30px] rounded text-white text-[10px] font-bold shadow-md bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045]"
                >
                    <FaInstagram size={14} />
                    <span>Follow Us</span>
                </a>
            </div>

            {/* Grid Layout: 2 cols mobile, 4 cols desktop */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 px-5">
                {reels.map(reel => (
                    <ReelItem key={reel.id} reel={reel} />
                ))}
            </div>

            {/* Instagram button for Desktop only */}
            <div className="hidden md:flex justify-center mt-8">
                <a
                    href="https://www.instagram.com/ithyaraa_official"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-8 py-3 rounded-full text-white text-base font-bold shadow-xl transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:shadow-purple-200/50"
                >
                    <FaInstagram size={22} />
                    <span>Follow Us on Instagram</span>
                </a>
            </div>
        </section>
    );
};

export default ReelsSection;
