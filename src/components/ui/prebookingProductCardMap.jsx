import React from 'react'
import PreBookingProductCard from './prebookingProductCard'

const PreBookingProductCardMap = ({ products = [], pagination = {}, onLoadMore, loadingMore = false }) => {
    console.log(products);

    // Filter out expired products based on preSaleEndDate
    const filteredProducts = Array.isArray(products)
        ? products.filter((product) => {
            const endDate = product?.preSaleEndDate;
            if (!endDate) return true; // keep if no end date
            const now = new Date();
            const saleEnd = new Date(endDate);
            return saleEnd.getTime() > now.getTime();
        })
        : [];

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
