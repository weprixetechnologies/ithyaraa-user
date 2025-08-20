"use client"


const totalRatings = 473;
const ratingBreakdown = [
    { rating: 5, count: 293 },
    { rating: 4, count: 100 },
    { rating: 3, count: 50 },
    { rating: 2, count: 20 },
    { rating: 1, count: 10 },
];
const ratings = [
    {
        comment: 'Amazing Product In this segment Amazing Product In this segment Amazing Product In this segment Amazing Product In this segment Amazing Product In this segment Amazing Product In this segment Amazing Product In this segment',
        stars: '5',
        name: 'Deepak Mutthuralu',
        featuredImage: 'https://images.bewakoof.com/uploads/grid/app/444x666-Desktop-Full-sleeve-T-shirts-Trending-Category-Icon-1747726914.jpg'
    }, {
        comment: 'Amazing Product In this segment',
        stars: '3',
        name: 'Deepak Mutthuralu',
        featuredImage: 'https://images.bewakoof.com/uploads/grid/app/444x666-Desktop-Full-sleeve-T-shirts-Trending-Category-Icon-1747726914.jpg'
    }, {
        comment: 'Amazing Product In this segmentAmazing Product In this segmentAmazing Product In this segmentAmazing Product In this segmentAmazing Product In this segmentAmazing Product In this segmentAmazing Product In this segmentAmazing Product In this segmentAmazing Product In this segmentAmazing Product In this segmentAmazing Product In this segmentAmazing Product In this segmentAmazing Product In this segmentAmazing Product In this segmentAmazing Product In this segmentAmazing Product In this segmentAmazing Product In this segmentAmazing Product In this segmentAmazing Product In this segmentAmazing Product In this segmentAmazing Product In this segmentAmazing Product In this segmentAmazing Product In this segmentAmazing Product In this segmentAmazing Product In this segmentAmazing Product In this segmentAmazing Product In this segmentAmazing Product In this segment',
        stars: '4',
        name: 'Deepak Mutthuralu',
        featuredImage: 'https://images.bewakoof.com/uploads/grid/app/444x666-Desktop-Full-sleeve-T-shirts-Trending-Category-Icon-1747726914.jpg'
    }, {
        comment: 'Amazing Product In this segment',
        stars: '3',
        name: 'Deepak Mutthuralu',
        featuredImage: 'https://images.bewakoof.com/uploads/grid/app/444x666-Desktop-Full-sleeve-T-shirts-Trending-Category-Icon-1747726914.jpg'
    }, {
        comment: 'Amazing Product In this segment',
        stars: '3',
        name: 'Deepak Mutthuralu',
        featuredImage: 'https://images.bewakoof.com/uploads/grid/app/444x666-Desktop-Full-sleeve-T-shirts-Trending-Category-Icon-1747726914.jpg'
    }, {
        comment: 'Amazing Product In this segment',
        stars: '3',
        name: 'Deepak Mutthuralu',
        featuredImage: 'https://images.bewakoof.com/uploads/grid/app/444x666-Desktop-Full-sleeve-T-shirts-Trending-Category-Icon-1747726914.jpg'
    }
]
import Image from "next/image";
import { FaStar } from "react-icons/fa6";
import React, { useState } from "react";
const Reviews = () => {

    const [expandedIndex, setExpandedIndex] = useState(null);

    const toggleReadMore = (index) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    return (
        <div>
            <div className="flex flex-col md:grid md:grid-cols-2 gap-2 p-2">
                <div className="w-full grid grid-cols-3 col-span-1 mb-5 md:mb-0">
                    <div className="col-span-1 flex flex-col justify-center items-center">
                        <span className='text-4xl'>4.5</span>
                        <p className='text-xs text-secondary-text-deep font-medium'>473 ratings</p>
                    </div>
                    <div className="col-span-2 flex flex-col gap-2 justify-center">
                        {ratingBreakdown.map(({ rating, count }) => {
                            const percentage = (count / totalRatings) * 100;
                            return (
                                <div key={rating} className="flex items-center gap-2">
                                    <span className="w-4 text-sm">{rating}</span>
                                    <div className="flex-1 h-2 bg-gray-200 rounded overflow-hidden">
                                        <div
                                            className="h-full bg-yellow-400"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="w-10 text-xs text-gray-500">({count})</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> */}
                {ratings.map((i, index) => (
                    <div
                        className="col-span-1 border-b border-gray-200 md:border md:border-gray-200 md:rounded-lg px-3 py-5"
                        key={index}
                    >
                        <div className="profileblock flex items-center font-medium gap-2">
                            <div className="relative aspect-[1/1] w-[45px] h-[45px]">
                                <Image
                                    src={i.featuredImage}
                                    alt={i.name}
                                    fill
                                    className="rounded-full object-cover"
                                />
                            </div>
                            <div className="nameandstars flex flex-col">
                                <p>{i.name}</p>
                                <div className="flex">
                                    {Array.from({ length: i.stars }, (_, idx) => (
                                        <FaStar key={idx} className="text-yellow-400" />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Comment with Read more */}
                        <p
                            className={`mt-2 text-sm ${expandedIndex === index ? "" : "line-clamp-5"
                                }`}
                        >
                            {i.comment}
                        </p>

                        {i.comment.length > 100 && ( // show toggle only for long comments
                            <button
                                onClick={() => toggleReadMore(index)}
                                className="text-blue-500 text-xs mt-1 font-medium"
                            >
                                {expandedIndex === index ? "Read less" : "Read more"}
                            </button>
                        )}
                    </div>
                ))}
                {/* </div> */}

            </div>
            <div className="flex justify-center">

                <button className="underline bg-transparent border-none text-xs mt-5">More Reviews</button>
            </div>
        </div>
    )
}

export default Reviews

