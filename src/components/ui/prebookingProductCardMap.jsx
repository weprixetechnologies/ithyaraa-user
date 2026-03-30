import React from 'react'
import PreBookingProductCard from './prebookingProductCard'

const PreBookingProductCardMap = ({ products = [], pagination = {}, onLoadMore, loadingMore = false }) => {
    console.log("Presale Products Available");

    // Robust date parsing (handling YYYY-MM-DD HH:mm:ss and YYYY-MM-DD)
    const parseSafe = (dateStr) => {
        if (!dateStr) return null;
        try {
            // If it's YYYY-MM-DD HH:mm:ss, replace space with T for ISO compliance
            const normalized = typeof dateStr === 'string' && dateStr.includes(' ') 
                ? dateStr.replace(' ', 'T') 
                : dateStr;
            const d = new Date(normalized);
            return isNaN(d.getTime()) ? null : d;
        } catch {
            return null;
        }
    };

    // Filter out expired products (where current time > preSaleEndDate)
    // Keep products where sale has not ended yet (includes upcoming and currently active)
    const filteredProducts = Array.isArray(products)
        ? products.filter((product) => {
            const now = new Date();
            const saleEnd = parseSafe(product?.preSaleEndDate);
            
            // If no end date is set, keep it by default
            if (!saleEnd) return true;
            
            // Keep if it hasn't expired yet
            return saleEnd.getTime() > now.getTime();
        })
        : [];

    console.log(`Presale Products: Total=${products.length}, Filtered=${filteredProducts.length}`);

    const handleLoadMore = () => {
        if (onLoadMore && pagination?.hasNextPage && !loadingMore) {
            onLoadMore();
        }
    };

    return (
        <div className="w-full">
            {filteredProducts.length > 0 ? (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 md:gap-8 lg:gap-10 items-stretch">
                        {filteredProducts.map((product) => (
                            <PreBookingProductCard
                                key={product.presaleProductID}
                                product={product}
                            />
                        ))}
                    </div>
                    {pagination?.hasNextPage && (
                        <div className="flex justify-center w-full mt-6">
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="text-sm underline cursor-pointer hover:text-primary-yellow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loadingMore ? 'Loading...' : 'Load More'}
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex items-center justify-center p-4">
                    <p>No products found</p>
                </div>
            )}
        </div>
    )
}

export default PreBookingProductCardMap
