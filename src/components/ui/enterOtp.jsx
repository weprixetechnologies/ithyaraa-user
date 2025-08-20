"use client"

import React, { useRef } from 'react';

const EnterOtp = ({ length = 6, onChange }) => {
    const inputs = useRef([]);

    const handleChange = (e, idx) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 1);
        e.target.value = value;
        if (value && idx < length - 1) {
            inputs.current[idx + 1].focus();
        }
        if (onChange) {
            const otp = inputs.current.map(input => input.value).join('');
            onChange(otp);
        }
    };

    const handleKeyDown = (e, idx) => {
        if (e.key === 'Backspace' && !e.target.value && idx > 0) {
            inputs.current[idx - 1].focus();
        }
    };

    return (
        <div className='grid grid-cols-6 gap-2 items-center overflow-hidden w-full md:max-w-[500px]'>
            {Array.from({ length }).map((_, idx) => (
                <input
                    key={idx}
                    type="tel"
                    maxLength={1}
                    className='w-full border border-gray-200 aspect-[1/1] text-center text-lg outline-none rounded-lg '
                    ref={el => inputs.current[idx] = el}
                    onChange={e => handleChange(e, idx)}
                    onKeyDown={e => handleKeyDown(e, idx)}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                />
            ))}
        </div>
    );
};

export default EnterOtp;