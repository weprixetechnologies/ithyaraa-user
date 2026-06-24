"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaTag, FaGift, FaPercent, FaArrowRight } from 'react-icons/fa';
import { IoIosArrowBack } from 'react-icons/io';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import axiosInstance from '@/lib/axiosInstance';
import OffersLoading from '@/components/offers/OffersLoading';

const OffersPage = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filteredOffers, setFilteredOffers] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');
    const router = useRouter();

    const filters = [
        { id: 'all', label: 'All Offers', icon: FaTag },
        { id: 'buy_x_get_y', label: 'Buy & Get', icon: FaGift },
        { id: 'buy_x_at_x', label: 'Heavily Discounted', icon: FaPercent },
    ];

    useEffect(() => {
        fetchOffers();
    }, []);

    useEffect(() => {
        filterOffers();
    }, [offers, activeFilter]);

    const fetchOffers = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/offer/public');

            if (response.data.success) {
                setOffers(response.data.data || []);
            } else {
                setError('Failed to fetch offers');
            }
        } catch (error) {
            console.error('Error fetching offers:', error);
            setError('Failed to load offers. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const filterOffers = () => {
        if (activeFilter === 'all') {
            setFilteredOffers(offers);
        } else {
            const filtered = offers.filter(offer => {
                switch (activeFilter) {
                    case 'buy_x_get_y':
                        return offer.offerType === 'buy_x_get_y';
                    case 'buy_x_at_x':
                        return offer.offerType === 'buy_x_at_x';
                    default:
                        return true;
                }
            });
            setFilteredOffers(filtered);
        }
    };

    const getOfferTypeIcon = (type, className) => {
        switch (type) {
            case 'buy_x_get_y':
                return <FaGift className={className || "text-purple-500"} />;
            case 'buy_x_at_x':
                return <FaPercent className={className || "text-[#fb4a6f]"} />;
            default:
                return <FaTag className={className || "text-[#fb4a6f]"} />;
        }
    };

    const formatOfferDescription = (offer) => {
        if (offer.offerType === 'buy_x_get_y') {
            return `Buy ${offer.buyCount || 1} Get ${offer.getCount || 1}`;
        } else if (offer.offerType === 'buy_x_at_x') {
            return offer.buyAt ? `At ₹${offer.buyAt}` : 'Fixed Price';
        }
        return 'Special Deal';
    };

    const handleOfferClick = (offerID) => {
        router.push(`/shop?offerID=${offerID}`);
    };

    if (loading) {
        return <OffersLoading />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center p-8 bg-white rounded-2xl shadow-sm">
                    <div className="text-red-500 text-lg mb-4">{error}</div>
                    <button
                        onClick={fetchOffers}
                        className="bg-[#fb4a6f] text-white px-8 py-3 rounded-xl font-medium hover:bg-rose-600 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafafc]">
            {/* Header / Banner */}
            <div className="relative overflow-hidden py-12 border-b border-rose-50 flex flex-col items-center justify-center text-center bg-gradient-to-r from-[#fff5f7] via-[#fff0f5] to-[#fffafc]">
                
                {/* Background Moving Elements (Orbs & Rings) */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                    <motion.div 
                        className="absolute w-96 h-96 bg-rose-200/30 rounded-full blur-3xl"
                        animate={{ 
                            x: ['-20%', '20%', '-20%'], 
                            y: ['-20%', '20%', '-20%'] 
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        style={{ top: '-10%', left: '10%' }}
                    />
                    <motion.div 
                        className="absolute w-80 h-80 bg-pink-300/20 rounded-full blur-3xl"
                        animate={{ 
                            x: ['20%', '-20%', '20%'], 
                            y: ['20%', '-20%', '20%'] 
                        }}
                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                        style={{ bottom: '-10%', right: '10%' }}
                    />
                    {/* Rotating Ring 1 */}
                    <motion.div
                        className="absolute rounded-full border border-rose-300/30 border-dashed"
                        style={{ width: '600px', height: '600px', top: '50%', left: '50%', marginTop: '-300px', marginLeft: '-300px' }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    />
                    {/* Rotating Ring 2 */}
                    <motion.div
                        className="absolute rounded-full border border-pink-200/40"
                        style={{ width: '800px', height: '800px', top: '50%', left: '50%', marginTop: '-400px', marginLeft: '-400px' }}
                        animate={{ rotate: -360 }}
                        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                    />
                </div>

                {/* Back button */}
                <button
                    onClick={() => router.back()}
                    className="absolute top-6 left-6 z-[1] w-10 h-10 bg-white/80 backdrop-blur-md shadow-sm border border-rose-100 hover:bg-white hover:scale-105 rounded-full transition-all flex items-center justify-center text-gray-700"
                >
                    <IoIosArrowBack size={20} className="mr-1" />
                </button>

                {/* Left Flower */}
                <motion.div
                    className="absolute left-0 top-1/2 -translate-y-1/2 hidden sm:block opacity-85 pointer-events-none mix-blend-multiply z-[1]"
                    animate={{ y: ["-50%", "-55%", "-50%"] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Image 
                        src="/flowers-png/left-flower-offer.png" 
                        alt="Left Flower" 
                        width={240} 
                        height={240} 
                        className="object-contain"
                        priority
                    />
                </motion.div>
                
                {/* Right Flower */}
                <motion.div
                    className="absolute right-0 top-1/2 -translate-y-1/2 hidden sm:block opacity-85 pointer-events-none mix-blend-multiply z-[1]"
                    animate={{ y: ["-50%", "-45%", "-50%"] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                    <Image 
                        src="/flowers-png/right-flower-offer.png" 
                        alt="Right Flower" 
                        width={240} 
                        height={240} 
                        className="object-contain"
                        priority
                    />
                </motion.div>

                <div className="relative z-[2] flex flex-col items-center max-w-2xl mx-auto px-4">
                    <div className="flex items-center justify-center gap-4 mb-3 text-[#fb4a6f]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-80">
                            <path d="M12 0L13.7845 9.07106L22.8556 10.8556L13.7845 12.6401L12 21.7111L10.2155 12.6401L1.14441 10.8556L10.2155 9.07106L12 0Z" fill="currentColor"/>
                        </svg>
                        <span className="text-xl md:text-2xl font-medium tracking-wide" style={{ fontFamily: 'Dancing Script, cursive, serif' }}>Limited Time Only</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-80">
                            <path d="M12 0L13.7845 9.07106L22.8556 10.8556L13.7845 12.6401L12 21.7111L10.2155 12.6401L1.14441 10.8556L10.2155 9.07106L12 0Z" fill="currentColor"/>
                        </svg>
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight mb-6 drop-shadow-sm" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                        Special Offers
                    </h1>
                    
                    <div className="flex items-center justify-center mb-6 text-rose-300">
                        <svg width="40" height="12" viewBox="0 0 40 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 0L22.5 4.5L27.5 5L24 8.5L25 12L20 10L15 12L16 8.5L12.5 5L17.5 4.5L20 0Z" fill="#fb4a6f" fillOpacity="0.5"/>
                            <line x1="0" y1="6" x2="12" y2="6" stroke="#fb4a6f" strokeOpacity="0.3" strokeWidth="1"/>
                            <line x1="28" y1="6" x2="40" y2="6" stroke="#fb4a6f" strokeOpacity="0.3" strokeWidth="1"/>
                        </svg>
                    </div>

                    <p className="text-slate-500 text-sm md:text-base tracking-wide max-w-lg leading-relaxed">
                        Discover amazing deals and discounts on your favourite styles
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-10 max-w-7xl">
                {/* Filter Tabs */}
                <div className="mb-8">
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {filters.map((filter) => {
                            const Icon = filter.icon;
                            const isActive = activeFilter === filter.id;
                            return (
                                <button
                                    key={filter.id}
                                    onClick={() => setActiveFilter(filter.id)}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full whitespace-nowrap transition-all font-medium border shadow-sm ${isActive
                                        ? 'bg-[#fb4a6f] text-white border-[#fb4a6f]'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon size={14} className={isActive ? 'text-white' : 'text-[#fb4a6f]'} />
                                    {filter.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Offers Count */}
                <div className="mb-6">
                    <p className="text-gray-500 font-medium">
                        Showing {filteredOffers.length} offer{filteredOffers.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Offers Grid */}
                {filteredOffers.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="text-gray-300 mb-6 flex justify-center">
                            <FaTag size={64} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No offers found</h3>
                        <p className="text-gray-500">
                            {activeFilter === 'all'
                                ? 'No offers available at the moment'
                                : `No ${filters.find(f => f.id === activeFilter)?.label.toLowerCase()} available`
                            }
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredOffers.map((offer, index) => (
                            <motion.div
                                key={offer.offerID}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                onClick={() => handleOfferClick(offer.offerID)}
                                className="bg-transparent rounded-2xl transition-all duration-300 overflow-visible group cursor-pointer"
                            >
                                {/* Offer Banner Image */}
                                <div className="relative h-64 overflow-hidden rounded-t-2xl bg-gradient-to-br from-orange-200 to-rose-300 shadow-sm">
                                    {offer.offerBanner ? (
                                        <Image
                                            src={offer.offerBanner}
                                            alt={offer.offerName}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center">
                                            <div className="bg-white p-4 rounded-full mb-4 shadow-sm text-[#fb4a6f]">
                                                {getOfferTypeIcon(offer.offerType, "w-6 h-6")}
                                            </div>
                                            <h3 className="text-white text-3xl mb-1" style={{ fontFamily: 'Georgia, serif' }}>Special Offer</h3>
                                            <p className="text-white/90 text-sm font-medium">Limited time. Maximum savings.</p>
                                        </div>
                                    )}

                                    {/* Top Tags */}
                                    <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white bg-opacity-95 rounded-full text-xs font-bold text-purple-600 shadow-sm tracking-wide uppercase">
                                            {getOfferTypeIcon(offer.offerType, "text-purple-600")}
                                            {offer.offerType === 'buy_x_get_y' ? 'Buy & Get' :
                                                offer.offerType === 'buy_x_at_x' ? 'Fixed Price' : 'Special Offer'}
                                        </span>
                                    </div>

                                    {/* Products Count Badge */}
                                    {(() => {
                                        try {
                                            const products = JSON.parse(offer.products || '[]');
                                            const count = Array.isArray(products) ? products.length : 0;
                                            return count > 0 ? (
                                                <div className="absolute top-4 right-4 z-10">
                                                    <span className="bg-[#1e1e1e] text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm tracking-wide">
                                                        {count} Products
                                                    </span>
                                                </div>
                                            ) : null;
                                        } catch {
                                            return null;
                                        }
                                    })()}
                                </div>

                                {/* Offer Content */}
                                <div className="p-6 relative bg-white rounded-b-2xl shadow-sm border border-gray-100 border-t-0 group-hover:shadow-md transition-shadow">
                                    {/* Background Watermark */}
                                    <div className="absolute bottom-6 right-6 opacity-[0.03] pointer-events-none text-[#fb4a6f]">
                                        <FaGift size={120} />
                                    </div>
                                    
                                    {/* Offer Description (Small Top Text) */}
                                    <p className="text-sm font-semibold text-gray-500 mb-1">
                                        {formatOfferDescription(offer)}
                                    </p>

                                    {/* Main Title (Large Pink Text) */}
                                    <h3 className="text-[28px] leading-tight font-bold text-[#fb4a6f] mb-6">
                                        {formatOfferDescription(offer)}
                                    </h3>

                                    {offer.buyAt && (
                                        <p className="text-sm text-gray-500 mb-4 font-medium">
                                            Valid on orders above ₹{offer.buyAt}
                                        </p>
                                    )}

                                    {/* Action Button */}
                                    <div className="w-full bg-[#fb4a6f] text-white py-3.5 px-4 rounded-xl font-medium hover:bg-rose-600 transition-colors flex items-center justify-center gap-2 shadow-sm">
                                        View Products
                                        <FaArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OffersPage;
