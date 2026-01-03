"use client"
import React from 'react'
import Image from 'next/image'

const UnderSections = () => {
    return (
        <>
            <style jsx>{`
                .ripple-container {
                    position: relative;
                    overflow: hidden;
                }
                .ripple-container::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 0;
                    height: 0;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.5);
                    transform: translate(-50%, -50%);
                    transition: width 0.6s, height 0.6s;
                    pointer-events: none;
                    z-index: 1;
                }
                .ripple-container:hover::before {
                    width: 300px;
                    height: 300px;
                }
                .ripple-container > * {
                    position: relative;
                    z-index: 2;
                }
            `}</style>
            <div className='my-10 px-4 md:px-10'>
                <div className="flex flex-col items-center mb-4">
                    <h2 className="text-2xl font-semibold uppercase md:text-3xl">Special Sections for you</h2>
                    <p className='text-lg md:text-xl font-medium'>Found a perfect place</p>
                </div>
                <div
                    className="grid grid-cols-2 md:flex md:flex-wrap w-full gap-4 md:gap-10 min-h-[350px] md:h-[350px] rounded-2xl p-2 justify-items-center md:justify-center items-center"
                    style={{
                        backgroundImage: "url('/offers-prebooking.png')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                >
                    <div className='ripple-container relative transition-transform duration-300 hover:-translate-x-1 hover:-translate-y-1 cursor-pointer shadow-lg rounded-lg w-full max-w-[250px] md:w-auto'>
                        <Image src="/UNDER.png" alt="Under this price" width={250} height={175} className='rounded-lg w-full h-auto md:w-auto' />
                    </div>
                    <div className='ripple-container relative transition-transform duration-300 hover:-translate-x-1 hover:-translate-y-1 cursor-pointer shadow-lg rounded-lg w-full max-w-[250px] md:w-auto'>
                        <Image src="/UNDER.png" alt="Under this price" width={250} height={175} className='rounded-lg w-full h-auto md:w-auto' />
                    </div>
                    <div className='ripple-container relative transition-transform duration-300 hover:-translate-x-1 hover:-translate-y-1 cursor-pointer shadow-lg rounded-lg w-full max-w-[250px] md:w-auto'>
                        <Image src="/UNDER.png" alt="Under this price" width={250} height={175} className='rounded-lg w-full h-auto md:w-auto' />
                    </div>
                    <div className='ripple-container relative transition-transform duration-300 hover:-translate-x-1 hover:-translate-y-1 cursor-pointer shadow-lg rounded-lg w-full max-w-[250px] md:w-auto'>
                        <Image src="/UNDER.png" alt="Under this price" width={250} height={175} className='rounded-lg w-full h-auto md:w-auto' />
                    </div>
                    <div className='ripple-container relative transition-transform duration-300 hover:-translate-x-1 hover:-translate-y-1 cursor-pointer shadow-lg rounded-lg w-full max-w-[250px] md:w-auto'>
                        <Image src="/UNDER.png" alt="Under this price" width={250} height={175} className='rounded-lg w-full h-auto md:w-auto' />
                    </div>
                    <div className='ripple-container relative transition-transform duration-300 hover:-translate-x-1 hover:-translate-y-1 cursor-pointer shadow-lg rounded-lg w-full max-w-[250px] md:w-auto'>
                        <Image src="/UNDER.png" alt="Under this price" width={250} height={175} className='rounded-lg w-full h-auto md:w-auto' />
                    </div>
                </div>
            </div>
        </>
    )
}

export default UnderSections
