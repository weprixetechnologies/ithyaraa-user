import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const getCategoryImage = (category) => {
    if (category?.categoryBanner && category.categoryBanner !== 'https://ithyaraa.b-cdn.net/ithyaraa-logo.png') {
        return category.categoryBanner;
    }
    if (category?.featuredImage && category.featuredImage !== 'https://ithyaraa.b-cdn.net/ithyaraa-logo.png') {
        return category.featuredImage;
    }
    return null;
};

const DesktopCategories = ({
    heading = "Our Latest Collections",
    subHeading,
    categories = []
}) => {
    const displayCategories = categories.slice(0, 6);

    return (
        <section className="py-8">
            <div className="flex flex-row justify-between px-5 mt-2 items-end mb-4 md:flex-col md:items-center">
                <div className="flex flex-col items-start md:items-center">
                    <p className="text-lg font-medium md:text-2xl">{heading}</p>
                    {subHeading && (
                        <p className="text-xs font-semibold text-secondary-text-deep md:text-center md:text-sm">
                            {subHeading}
                        </p>
                    )}
                </div>
                <button className="bg-primary-yellow h-[30px] px-2 text-xs font-medium rounded md:hidden">
                    Shop Now
                </button>
            </div>

            <div className="w-full flex justify-center">
                <div className="w-full  md:max-w-[90%] px-4">
                    {/* Mobile: horizontal slider with 60x60 tiles */}
                    <div className="md:hidden overflow-x-auto scrollbar-hide">
                        <div className="flex gap-4">
                            {displayCategories.map((category, idx) => {
                                const imageUrl = getCategoryImage(category);

                                return (
                                    <Link
                                        key={category.categoryID || idx}
                                        href={`/shop?categoryID=${category.categoryID}`}
                                        className="flex flex-col items-center justify-center"
                                    >
                                        <div className="w-[100px] h-[100px] min-w-[100px] rounded-full shadow-md cursor-pointer transition-transform hover:scale-105 overflow-hidden flex items-center justify-center">
                                            {imageUrl ? (
                                                <div className="relative w-full h-full rounded-full overflow-hidden">
                                                    <Image
                                                        src={imageUrl}
                                                        alt={category.categoryName || `Category ${idx + 1}`}
                                                        fill
                                                        sizes="(max-width: 768px) 50vw, 25vw"
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                                    <svg width="24" height="24" fill="none" stroke="currentColor">
                                                        <circle cx="12" cy="12" r="9" strokeWidth="1" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <span className="mt-2 text-xs font-semibold text-center text-gray-800 line-clamp-1 ">
                                            {category.categoryName || `Category ${idx + 1}`}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Desktop: existing 6-column grid */}
                    <div className="hidden md:grid grid-cols-6 gap-4 justify-items-center">
                        {displayCategories.map((category, idx) => {
                            const imageUrl = getCategoryImage(category);

                            return (
                                <Link
                                    key={category.categoryID || idx}
                                    href={`/shop?categoryID=${category.categoryID}`}
                                    className="flex flex-col items-center justify-center w-full"
                                >
                                    <div
                                        className="w-full aspect-square flex items-center justify-center"
                                    >
                                        <div className="w-[90%] h-[90%] rounded-full shadow-md cursor-pointer transition-transform hover:scale-105 overflow-hidden flex items-center justify-center">
                                            {imageUrl ? (
                                                <div className="relative w-full h-full rounded-full overflow-hidden">
                                                    <Image
                                                        src={imageUrl}
                                                        alt={category.categoryName || `Category ${idx + 1}`}
                                                        fill
                                                        sizes="(max-width: 768px) 20vw, 8vw"
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                                    <svg width="24" height="24" fill="none" stroke="currentColor">
                                                        <circle cx="12" cy="12" r="9" strokeWidth="1" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <span className="mt-2 text-xs md:text-sm font-semibold text-center text-gray-800 line-clamp-1 ">
                                        {category.categoryName || `Category ${idx + 1}`}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default DesktopCategories
