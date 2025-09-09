"use client"
import React, { useState } from 'react'
import { RxCross2 } from "react-icons/rx";
import Image from 'next/image'
import { useSelector } from 'react-redux';

const CartItems = () => {
    const cartData = useSelector((state) => state.cart.cart)
    console.log(cartData);

    return (
        <div className='mt-5'>
            <p className='font-medium text-lg'>Your Cart Items</p>
            <div className="flex flex-col gap-3 py-3">
                {cartData?.map((i, index) => (
                    <div key={index}>
                        <div className="border border-gray-200 pr-5 py-3 pl-3 rounded-lg relative" >
                            <button className="absolute top-3 right-3 border rounded-full h-5 w-5 flex justify-center items-center text-gray-300"><RxCross2 size={12} /></button>
                            {/* aspect-[170/222] */}
                            <div className="flex gap-2 ">
                                <div className="block">
                                    <div className="relative aspect-[170/222] md:w-[120px] md:min-w-[120px] w-[100px] min-w-[100px]">
                                        <Image src={i.featuredImage[0].imgUrl} fill alt='Cart Item Image' className='rounded-lg' />
                                    </div>
                                </div>
                                <div className="flex flex-col md:pl-3">
                                    {/* //NAME//BRAND//VARIATION */}
                                    {/* <p className='text-xs font-medium text-secondary-text-deep'>{i.brand}</p> */}
                                    <p className='text-sm font-medium line-clamp-1 md:text-[16px]'>{i.name}</p>
                                    <div className="cart-pricing flex gap-2 items-center">
                                        <p className="text-sm md:text-lg font-medium"> ₹{i.lineTotalAfter}</p>
                                        <p className="text-sm md:text-lg font-medium text-secondary-text-deep line-through"> ₹{i.salePrice * i.quantity}</p>
                                        <p className="text-xs md:text-sm font-light text-green-500">(Saved 200)</p>
                                    </div>
                                    <p className='text-xs mt-2'>Selected Variation</p>
                                    <div className="flex flex-row flex-wrap gap-2 mt-1">
                                        {i.variationValues.map((v, index) =>
                                            Object.keys(v).map((key) => (
                                                <span
                                                    key={index + key}
                                                    className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-700"
                                                >
                                                    {key.charAt(0).toUpperCase() + key.slice(1)}: {v[key]}
                                                </span>
                                            ))
                                        )}
                                        <p className='text-xs px-2 py-1 bg-gray-100 rounded font-medium text-gray-700'>Quantity : {i.quantity}</p>
                                    </div>
                                    {i.comboItems?.length > 0 && (
                                        <p className='text-xs mt-2 px-2 py-1 bg-gray-100 rounded font-medium text-gray-700'>Please Check the Below items, those are the selected combo items</p>

                                    )}


                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">

                            {i.comboItems?.length > 0 && (
                                i.comboItems.map((p, index) => (
                                    <div className="border border-gray-200 pr-5 py-3 pl-3 rounded-lg relative mt-2" key={index}>

                                        <div className="flex gap-2 ">
                                            <div className="block">
                                                <div className="relative aspect-[170/222] md:w-[80px] md:min-w-[80px] w-[80px] min-w-[80px]">
                                                    <Image src={p.featuredImage[0].imgUrl} fill alt='Cart Item Image' className='rounded-lg' />
                                                </div>
                                            </div>
                                            <div className="flex flex-col md:pl-3">
                                                <p className='text-sm font-medium line-clamp-1 md:text-[14px]'>{p.name}</p>
                                                <div className="cart-pricing flex gap-2 items-center">
                                                    <p className="text-sm md:text-lg font-medium"> ₹ 0</p>

                                                    <p className="text-xs md:text-sm font-light text-green-500">(Combo Items)</p>
                                                </div>
                                                <p className='text-xs mt-2'>Selected Variation</p>
                                                <div className="flex flex-row flex-wrap gap-2 mt-1">
                                                    {p.variationValues?.map((v, vIndex) =>
                                                        Object.keys(v).map((key) => (
                                                            <span
                                                                key={`${vIndex}-${key}`}
                                                                className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-700"
                                                            >
                                                                {key.charAt(0).toUpperCase() + key.slice(1)}: {v[key]}
                                                            </span>
                                                        ))
                                                    )}
                                                    <p className='text-xs px-2 py-1 bg-gray-100 rounded font-medium text-gray-700'>
                                                        Quantity : 1
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                    </div>
                ))
                }
            </div>
        </div>
    )
}

export default CartItems
