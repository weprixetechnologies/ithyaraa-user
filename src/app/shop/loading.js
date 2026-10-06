import React from 'react';

const ShopLoading = () => (
    <div className="min-h-screen">
        <div className="md:py-2 flex justify-center flex-col items-center">
            <div className="hidden md:block md:w-[90%]">
                <p className="text-xs text-[#c0c0c0] font-medium mb-2">
                    Home &gt; Shop
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:w-[90%] px-2 w-full">
                {/* Desktop Sidebar Skeleton */}
                <aside className="hidden md:block md:col-span-3 pr-2 py-3 border-black h-[calc(100vh-70px)] md:h-[calc(100dvh-170px)] overflow-y-auto">
                    <div className="w-full max-w-[280px] bg-white rounded-xl pr-4 pb-10 space-y-6">
                        <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse" />
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-4 bg-gray-100 rounded w-full animate-pulse" />
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Content Skeleton */}
                <main className="md:col-span-9 py-3 px-2 h-auto md:h-[calc(100dvh-170px)] md:overflow-y-auto">
                    <div className="pb-20 md:pb-3">
                        {/* Header skeleton */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="h-4 bg-gray-200 rounded w-40 animate-pulse" />
                            <div className="h-7 bg-gray-200 rounded w-24 animate-pulse" />
                        </div>

                        {/* Product grid skeleton */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className="flex-col flex gap-1">
                                    <div className="h-auto aspect-[2/3] w-full relative bg-gray-200 rounded-lg animate-pulse" />
                                    <div className="px-[5px] mt-1 space-y-1">
                                        <div className="h-2.5 bg-gray-200 rounded w-1/3 animate-pulse" />
                                        <div className="h-3.5 bg-gray-200 rounded w-3/4 animate-pulse" />
                                    </div>
                                    <div className="flex items-center gap-2 mt-1 px-[5px]">
                                        <div className="h-4 bg-gray-200 rounded w-12 animate-pulse" />
                                        <div className="h-3 bg-gray-200 rounded w-10 animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>

        {/* Mobile Bottom Action Buttons Skeleton */}
        <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-b border-black z-50">
            <div className="grid grid-cols-2">
                <div className="py-3 px-4 bg-white text-center font-medium flex items-center justify-center gap-2">
                    <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="py-3 px-4 bg-white text-center font-medium border-l border-black flex items-center justify-center gap-2">
                    <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                </div>
            </div>
        </div>
    </div>
);

export default ShopLoading;
