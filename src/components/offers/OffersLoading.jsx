"use client";

import React from 'react';

const OffersLoading = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Skeleton */}
            <div className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                        <div>
                            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
                            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                {/* Filter Tabs Skeleton */}
                <div className="mb-8">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="h-10 w-24 bg-gray-200 rounded-full animate-pulse"
                            />
                        ))}
                    </div>
                </div>

                {/* Offers Count Skeleton */}
                <div className="mb-6">
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                </div>

                {/* Offers Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            {/* Image Skeleton */}
                            <div className="h-48 bg-gray-200 animate-pulse" />

                            {/* Content Skeleton */}
                            <div className="p-6">
                                <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse mb-3" />
                                <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-2" />
                                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mb-4" />
                                <div className="space-y-2 mb-6">
                                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                                    <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                                </div>
                                <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OffersLoading;
