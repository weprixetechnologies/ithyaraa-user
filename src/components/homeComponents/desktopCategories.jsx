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
                    {/* Mobile: horizontal slider with portrait rectangular tiles */}
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
                                        <div className="w-[100px] aspect-[1024/1536] rounded-xl shadow-md cursor-pointer transition-transform hover:scale-105 overflow-hidden flex items-center justify-center bg-gray-50 border border-gray-100">
                                            {imageUrl ? (
                                                <div className="relative w-full h-full rounded-xl overflow-hidden">
                                                    <Image
                                                        src={imageUrl}
                                                        alt={category.categoryName || `Category ${idx + 1}`}
                                                        fill
                                                        sizes="(max-width: 768px) 30vw, 20vw"
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 bg-white rounded flex items-center justify-center text-gray-300">
                                                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <rect x="5" y="3" width="14" height="18" rx="2" strokeWidth="1" />
                                                        <path d="M5 14l3-3 3 3 3-3 2 2" strokeWidth="1" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <span className="mt-2 text-[10px] font-bold text-center text-gray-800 line-clamp-1 ">
                                            {category.categoryName || `Category ${idx + 1}`}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Desktop: existing 6-column grid with portrait rectangular tiles */}
                    <div className="hidden md:grid grid-cols-6 gap-6 justify-items-center">
                        {displayCategories.map((category, idx) => {
                            const imageUrl = getCategoryImage(category);

                            return (
                                <Link
                                    key={category.categoryID || idx}
                                    href={`/shop?categoryID=${category.categoryID}`}
                                    className="flex flex-col items-center justify-center w-full"
                                >
                                    <div
                                        className="w-full aspect-[1024/1536] flex items-center justify-center"
                                    >
                                        <div className="w-full h-full rounded-2xl shadow-md cursor-pointer transition-transform hover:scale-105 overflow-hidden flex items-center justify-center bg-white border border-gray-100">
                                            {imageUrl ? (
                                                <div className="relative w-full h-full rounded-2xl overflow-hidden">
                                                    <Image
                                                        src={imageUrl}
                                                        alt={category.categoryName || `Category ${idx + 1}`}
                                                        fill
                                                        sizes="(max-width: 768px) 20vw, 15vw"
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 bg-white rounded flex items-center justify-center text-gray-300">
                                                    <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <rect x="5" y="3" width="14" height="18" rx="2" strokeWidth="1" />
                                                        <path d="M5 14l3-3 3 3 3-3 2 2" strokeWidth="1" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <span className="mt-3 text-sm font-bold text-center text-gray-900 group-hover:text-primary transition-colors tracking-tight">
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
