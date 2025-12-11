import React from 'react'
import PreBookingProductCard from './preBookingProductCard'

const PreBookingProductCardMap = ({ products = [], pagination = {}, onLoadMore, loadingMore = false }) => {
    console.log(products);

    const handleLoadMore = () => {
        if (onLoadMore && pagination?.hasNextPage && !loadingMore) {
            onLoadMore();
        }
    };

    return (
        <div className="w-full">
            {products.length > 0 ? (
                <>
                    <div className="grid grid-cols-5 gap-10 items-center">
                        {products.map((product) => (
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
