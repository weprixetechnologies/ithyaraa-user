"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaTag, FaGift, FaPercent, FaShoppingBag, FaArrowRight } from 'react-icons/fa';
import { IoIosArrowBack } from 'react-icons/io';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axiosInstance';
import Loading from '@/components/ui/loading';
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
        { id: 'buy-get', label: 'Buy & Get', icon: FaGift },
        { id: 'percentage', label: 'Percentage', icon: FaPercent },
        { id: 'combo', label: 'Combo', icon: FaShoppingBag },
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
                    case 'buy-get':
                        return offer.offerType === 'buy-get';
                    case 'percentage':
                        return offer.offerType === 'percentage';
                    case 'combo':
                        return offer.offerType === 'combo';
                    default:
                        return true;
                }
            });
            setFilteredOffers(filtered);
        }
    };

    const getOfferTypeIcon = (type) => {
        switch (type) {
            case 'buy-get':
                return <FaGift className="text-purple-500" />;
            case 'percentage':
                return <FaPercent className="text-green-500" />;
            case 'combo':
                return <FaShoppingBag className="text-blue-500" />;
            default:
                return <FaTag className="text-orange-500" />;
        }
    };

    const getOfferTypeColor = (type) => {
        switch (type) {
            case 'buy-get':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'percentage':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'combo':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-orange-100 text-orange-800 border-orange-200';
        }
    };

    const formatOfferDescription = (offer) => {
        if (offer.offerType === 'buy-get') {
            return `Buy ${offer.buyCount || 1} Get ${offer.getCount || 1}`;
        } else if (offer.offerType === 'percentage') {
            return `${offer.buyCount || 0}% Off`;
        } else if (offer.offerType === 'combo') {
            return 'Combo Package';
        }
        return 'Special Deal';
    };

    const getProductsCount = () => {
        try {
            const products = JSON.parse(offer.products || '[]');
            return Array.isArray(products) ? products.length : 0;
        } catch {
            return 0;
        }
    };

    const handleOfferClick = (offerID) => {
        router.push(`/shop?offerID=${offerID}`);
    };

    if (loading) {
        return <OffersLoading />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <div className="text-red-500 text-lg mb-4">{error}</div>
                        <button
                            onClick={fetchOffers}
                            className="bg-primary-yellow text-black px-6 py-2 rounded-lg font-medium hover:bg-yellow-400 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <IoIosArrowBack size={24} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Special Offers</h1>
                            <p className="text-gray-600">Discover amazing deals and discounts</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                {/* Filter Tabs */}
                <div className="mb-8">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {filters.map((filter) => {
                            const Icon = filter.icon;
                            return (
                                <button
                                    key={filter.id}
                                    onClick={() => setActiveFilter(filter.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${activeFilter === filter.id
                                        ? 'bg-primary-yellow text-black font-medium'
                                        : 'bg-white text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <Icon size={16} />
                                    {filter.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Offers Count */}
                <div className="mb-6">
                    <p className="text-gray-600">
                        Showing {filteredOffers.length} offer{filteredOffers.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Offers Grid */}
                {filteredOffers.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <FaTag size={48} className="mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No offers found</h3>
                        <p className="text-gray-600">
                            {activeFilter === 'all'
                                ? 'No offers available at the moment'
                                : `No ${filters.find(f => f.id === activeFilter)?.label.toLowerCase()} available`
                            }
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredOffers.map((offer) => (
                            <div
                                key={offer.offerID}
                                onClick={() => handleOfferClick(offer.offerID)}
                                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
                            >
                                {/* Offer Banner Image */}
                                <div className="relative h-48 overflow-hidden">
                                    {offer.offerBanner ? (
                                        <Image
                                            src={offer.offerBanner}
                                            alt={offer.offerName}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-primary-yellow to-orange-400 flex items-center justify-center">
                                            <div className="text-center text-white">
                                                {getOfferTypeIcon(offer.offerType)}
                                                <p className="text-sm font-medium mt-2">Special Offer</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Offer Type Badge */}
                                    <div className="absolute top-3 left-3">
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getOfferTypeColor(offer.offerType)}`}>
                                            {getOfferTypeIcon(offer.offerType)}
                                            {offer.offerType === 'buy-get' ? 'Buy & Get' :
                                                offer.offerType === 'percentage' ? 'Percentage Off' :
                                                    offer.offerType === 'combo' ? 'Combo Deal' : 'Special Offer'}
                                        </span>
                                    </div>

                                    {/* Products Count Badge */}
                                    {(() => {
                                        try {
                                            const products = JSON.parse(offer.products || '[]');
                                            const count = Array.isArray(products) ? products.length : 0;
                                            return count > 0 ? (
                                                <div className="absolute top-3 right-3">
                                                    <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs font-medium">
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
                                <div className="p-6">
                                    {/* Offer Name */}
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                                        {offer.offerName}
                                    </h3>

                                    {/* Offer Description */}
                                    <div className="mb-4">
                                        <p className="text-2xl font-bold text-primary-yellow mb-1">
                                            {formatOfferDescription(offer)}
                                        </p>
                                        {offer.buyAt && (
                                            <p className="text-sm text-gray-600">
                                                Valid on orders above ₹{offer.buyAt}
                                            </p>
                                        )}
                                    </div>

                                    {/* Action Button */}
                                    <div className="w-full bg-primary-yellow text-black py-3 px-4 rounded-lg font-medium hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 group">
                                        View Products
                                        <FaArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Call to Action */}
                {filteredOffers.length > 0 && (
                    <div className="mt-12 text-center">
                        <div className="bg-gradient-to-r from-primary-yellow to-yellow-400 rounded-2xl p-8">
                            <h3 className="text-2xl font-bold text-black mb-4">
                                Don't Miss Out on These Amazing Deals!
                            </h3>
                            <p className="text-gray-800 mb-6">
                                Shop now and save big with our exclusive offers
                            </p>
                            <Link
                                href="/shop"
                                className="inline-flex items-center gap-2 bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                            >
                                Start Shopping
                                <FaArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OffersPage;
