"use client";

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaInstagram } from 'react-icons/fa';
import dynamic from 'next/dynamic';

const AnimatedBlobs = dynamic(() => import('../homeComponents/AnimatedBlobs'), { ssr: false });

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://backend.ithyaraa.com/api';

const ReelItem = ({ reel }) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Force all muted/playsinline attributes at DOM level for Safari
        video.muted = true;
        video.defaultMuted = true;
        video.setAttribute("muted", "");
        video.setAttribute("playsinline", "");
        video.setAttribute("autoplay", "");

        const tryPlay = () => {
            const promise = video.play();
            if (promise !== undefined) {
                promise.then(() => {
                    setIsPlaying(true);
                }).catch(() => {
                    // Safari fallback: retry once after a short delay
                    setTimeout(() => {
                        if (video) {
                            video.play().then(() => setIsPlaying(true)).catch((err) => {
                                console.warn("Safari play retry failed:", err.name);
                            });
                        }
                    }, 300);
                });
            }
        };

        if (video.readyState >= 2) {
            tryPlay();
        } else {
            video.addEventListener("loadeddata", tryPlay, { once: true });
        }

        return () => {
            if (video) {
                video.removeEventListener("loadeddata", tryPlay);
                video.pause();
            }
        };
    }, [reel.video_url]);

    return (
        <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-black shadow-md">
            {reel.thumbnail_url && !isPlaying && (
                <div
                    className="absolute inset-0 z-10 bg-cover bg-center transition-opacity duration-300"
                    style={{ backgroundImage: `url(${reel.thumbnail_url})` }}
                />
            )}
            <video
                ref={videoRef}
                key={reel.id}
                src={reel.video_url}
                loop
                muted
                autoPlay
                playsInline
                preload="auto"
                onPlay={() => setIsPlaying(true)}
                onPlaying={() => setIsPlaying(true)}
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-20" />
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
        <section className="relative overflow-hidden w-full my-10">
            <AnimatedBlobs />
            <div className="flex flex-col items-center justify-center max-w-[900px] mx-auto py-8 md:py-12 px-4 text-center animate-editorial-fade">
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
                
                {/* ✅ Fixed: restored opening <a tag */}
                <a
                    href="https://www.instagram.com/ithyaraa_official"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 md:hidden flex items-center justify-center gap-1.5 px-4 h-[30px] rounded text-white text-[12px] font-bold shadow-md bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045]"
                >
                    <FaInstagram size={14} />
                    <span>Follow Us</span>
                </a>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 px-5">
                {reels.map(reel => (
                    <ReelItem key={reel.id} reel={reel} />
                ))}
            </div>

            <div className="hidden md:flex justify-center mt-8">
                {/* ✅ Fixed: restored opening <a tag */}
                <a href="https://www.instagram.com/ithyaraa_official"
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