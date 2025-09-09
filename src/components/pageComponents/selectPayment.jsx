import React, { useState } from 'react'
import Image from 'next/image'
import phonepelogo from './../../../public/logophonepe.svg'

const SelectPayment = ({ onSelect }) => {
    const [paymentMethod, setPaymentMethod] = useState('cod'); // default selection

    const handleSelect = (mode) => {
        setPaymentMethod(mode);
        onSelect?.(mode);
    };

    return (
        <div className="w-full bg-white">
            <p className="text-lg font-medium mb-3">Suggested For You</p>

            <div className="flex flex-col gap-3">
                {/* Cash on Delivery */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <label className="flex items-center px-3 py-2 cursor-pointer">
                        <input
                            type="radio"
                            name="payment"
                            value="cod"
                            checked={paymentMethod === 'cod'}
                            onChange={() => handleSelect('cod')}
                            className="accent-primary-yellow"
                        />
                        <span className="ml-2 text-sm font-medium">Cash on Delivery</span>
                    </label>
                    <p className="text-xs bg-gray-100 px-3 py-1">
                        Nominal handling fee applicable: ₹8
                    </p>
                </div>

                {/* PhonePe */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <label className="flex items-center justify-between px-3 py-2 cursor-pointer">
                        <div className="flex items-center">
                            <input
                                type="radio"
                                name="payment"
                                value="phonepe"
                                checked={paymentMethod === 'phonepe'}
                                onChange={() => handleSelect('phonepe')}
                                className="accent-primary-yellow"
                            />
                            <span className="ml-2 text-sm font-medium">Pay with PhonePe</span>
                        </div>
                        <div className="relative h-[30px] w-[100px]">
                            <Image src={phonepelogo} alt="PhonePe" fill className="object-contain" />
                        </div>
                    </label>
                    <p className="text-xs bg-green-100 text-green-700 font-medium px-3 py-1">
                        Enjoy a flat discount of ₹20
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SelectPayment;
