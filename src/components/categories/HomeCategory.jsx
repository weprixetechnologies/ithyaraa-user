"use client"

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const HomeCategory = ({ categories = [] }) => {
    return (
        <div className="py-10">
            <div className="flex flex-col items-center mb-10">
                <p className="text-lg font-medium md:text-xl md:text-center">Your Categories</p>
                <p className="text-xs font-medium text-secondary-text-deep md:text-center md:text-sm">Have fun with our extended collections</p>
            </div>

            <div className='grid md:grid-cols-5 gap-2 md:px-15 px-2 grid-cols-2'>

                {
                    categories.map((category, index) => (
                        <Link
                            key={category.categoryID ?? index}
                            href={`/shop?categoryID=${category.categoryID ?? ''}`}
                            className="col-span-1 border aspect-[1024/1536] w-full block overflow-hidden rounded-xl shadow-sm cursor-pointer hover:opacity-90 transition-opacity bg-white"
                        >
                            <Image
                                src={category.imageUrl}
                                alt={category.categoryName || 'Category'}
                                fill
                                sizes="(max-width: 768px) 30vw, 20vw"
                                className="w-full h-full object-cover"
                            />
                        </Link>
                    ))
                }
            </div>
        </div>
    )
}

export default HomeCategory
