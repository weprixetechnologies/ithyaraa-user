import React from 'react'

const FeaturingBlock = () => {
    return (
        <div className='my-10'>
            <div className="flex flex-col items-center mb-4">
                <h2 className="text-2xl font-semibold uppercase md:text-3xl">Featuring Block</h2>
                <p className='text-lg md:text-xl font-medium'>Found a perfect place</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
                <div className="w-[40%] md:w-[20%] h-[200px] md:h-[400px] bg-black rounded-2xl">

                </div>
                <div className="w-[40%] md:w-[20%] h-[200px] md:h-[400px] bg-black rounded-2xl">

                </div>
                <div className="w-[40%] md:w-[20%] h-[200px] md:h-[400px] bg-black rounded-2xl">

                </div>
                <div className="w-[40%] md:w-[20%] h-[200px] md:h-[400px] bg-black rounded-2xl">

                </div>
            </div>
        </div>
    )
}

export default FeaturingBlock
