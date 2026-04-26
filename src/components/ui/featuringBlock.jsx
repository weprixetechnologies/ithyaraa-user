import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const FeaturingBlock = ({ blocks = [] }) => {
    // If no blocks are provided, render the default black boxes
    const displayBlocks = blocks.length > 0 ? blocks : [{}, {}, {}, {}];

    const getFilterLink = (block) => {
        if (!block.routeTo) return '#';
        const params = new URLSearchParams();
        if (block.category) params.append('categoryID', block.category);
        if (block.minPrice) params.append('minPrice', block.minPrice);
        if (block.maxPrice) params.append('maxPrice', block.maxPrice);
        if (block.offer) params.append('offerID', block.offer);
        
        return `/products/shop?${params.toString()}`;
    };

    return (
        <div className='my-10'>
            <div className="flex flex-col items-center mb-4">
                <h2 className="text-2xl font-semibold uppercase md:text-3xl">Featuring Block</h2>
                <p className='text-lg md:text-xl font-medium'>Found a perfect place</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center px-4">
                {displayBlocks.map((block, idx) => (
                    <div 
                        key={block.id || idx} 
                        className="w-[45%] md:w-[22%] aspect-[1/2] rounded-2xl overflow-hidden relative group"
                    >
                        {block.image_url ? (
                            <Link href={getFilterLink(block)}>
                                <Image
                                    src={block.image_url}
                                    alt={`Featured ${idx + 1}`}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </Link>
                        ) : (
                            <div className="w-full h-full bg-black flex items-center justify-center text-white/20 text-xs font-bold uppercase tracking-widest">
                                Coming Soon
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default FeaturingBlock
