import React, { useState } from 'react'

const RedeemGiftcard = () => {

    const [giftcode, setGiftcode] = useState('')
    return (
        <div>
            <div className="flex justify-between mb-3 mt-4 pt-4">
                <div className="flex flex-col">
                    <p className='text-lg font-medium'>Account Balance</p>
                </div>
                <div className="flex gap-2">
                    <p className='font-semibold text-lg'>100 INR</p>
                </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="flex flex-col pr-3 gap-3">
                    <div className="w-full ">

                        <p className='text-sm font-medium mb-2'>Enter Giftcard Code</p>
                        <input type="text" onChange={(e) => setGiftcode(e.target.value)} className='w-full text-sm border border-gray-200 h-[40px] px-3 rounded-lg outline-none ' placeholder='Enter Your Giftcard Code Here' />
                    </div>
                    <div className="w-full ">
                        <p className='text-sm font-medium mb-2'>Enter Pin (Received in email)</p>
                        <input type="text" className='w-full text-sm border border-gray-200 h-[40px] px-3 rounded-lg outline-none' placeholder='Enter Your PIN received via email' />
                    </div>
                    <div className="flex gap-2">
                        <button className='border w-[35%] py-2 rounded-lg text-sm border-primary-yellow cursor-pointer'>Purchase One</button>
                        <button className='border w-[65%] py-2 rounded-lg text-sm bg-primary-yellow cursor-pointer'>Redeem Card Now</button>
                    </div>
                </div>
                <div className="flex gap-2 justify-end">
                    <section
                        className="aspect-[525/275] w-full px-3 rounded-lg relative "
                        style={{
                            background: 'center/contain no-repeat url("https://ithyaraa.b-cdn.net/PROUDLY%20INDIAN-2.png")'
                        }}
                    >
                        <div className="absolute top-2 right-2">
                            <p className='text-white'>
                                11 / 12 / 2025
                            </p>
                        </div>
                        <div className="flex w-full justify-between items-center h-full">
                            <div className="text-white">

                                <p>Giftcard Code No</p>
                                <p className='text-lg text-white tracking-widest  font-bold'>{giftcode || 'XXXX XXXX XXXX XXXX'}</p>
                            </div>
                        </div>
                    </section>
                </div>
                <div className="col-span-2">

                </div>
            </div>
        </div>
    )
}

export default RedeemGiftcard
