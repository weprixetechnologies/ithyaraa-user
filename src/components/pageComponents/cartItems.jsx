"use client"
import React, { useState } from 'react'
import { RxCross2 } from "react-icons/rx";
import Image from 'next/image'

const CartItems = () => {

    const [variation, _setVariation] = useState(
        {
            variationValues: [
                { color: 'Blue' },
                { size: 'XS' }
            ]
        }
    )
    // 'https://images.bewakoof.com/t320/men-s-grey-oversized-joggers-646474-1736252675-1.jpg
    return (
        <div className='mt-5'>
            <p className='font-medium text-lg'>Your Cart Items</p>
            <div className="flex flex-col gap-3 py-3">
                <div className="border border-gray-200 p-3 rounded-lg relative">
                    <button className="absolute top-3 right-3 border rounded-full h-5 w-5 flex justify-center items-center text-gray-300"><RxCross2 size={12} /></button>
                    {/* aspect-[170/222] */}
                    <div className="flex gap-2 ">
                        <div className="block">
                            <div className="relative aspect-[170/222] md:w-[120px] md:min-w-[120px] w-[100px] min-w-[100px]">
                                <Image src={'https://images.bewakoof.com/t320/men-s-grey-oversized-joggers-646474-1736252675-1.jpg'} fill alt='Cart Item Image' className='rounded-lg' />
                            </div>
                        </div>
                        <div className="flex flex-col md:pl-3">
                            {/* //NAME//BRAND//VARIATION */}
                            <p className='text-xs font-medium text-secondary-text-deep'>ITHYARAA</p>
                            <p className='text-sm font-medium line-clamp-2 md:text-[16px]'>Men Exclusive Pant - Comfortable Wear Winter Fit </p>
                            <div className="cart-pricing flex gap-2 items-center">
                                <p className="text-sm md:text-lg font-medium">$ 799</p>
                                <p className="text-sm md:text-lg font-medium text-secondary-text-deep line-through">$ 999</p>
                                <p className="text-xs md:text-sm font-light text-green-500">(Saved 200)</p>
                            </div>
                            <p className='text-xs mt-2'>Selected Variation</p>
                            <div className="flex flex-row flex-wrap gap-2 mt-1">
                                {variation.variationValues.map((v, index) =>
                                    Object.keys(v).map((key) => (
                                        <span
                                            key={index + key}
                                            className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-700"
                                        >
                                            {key.charAt(0).toUpperCase() + key.slice(1)}: {v[key]}
                                        </span>
                                    ))
                                )}
                                <p className='text-xs px-2 py-1 bg-gray-100 rounded font-medium text-gray-700'>Quantity : 01</p>

                            </div>


                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default CartItems
