"use client";
import { useState } from "react";
import { RiLockPasswordLine, RiEyeLine, RiEyeOffLine } from "react-icons/ri";

const InputPassword = ({ setState, value, placeholder }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [internalValue, setInternalValue] = useState(value ?? "");
    const isControlled = setState != null;
    const displayValue = isControlled ? (value ?? "") : internalValue;
    const handleChange = (e) => {
        const v = e.target.value;
        if (isControlled) setState(v);
        else setInternalValue(v);
    };

    return (
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden w-full">
            {/* Lock icon */}

            <span className="px-4 border-r-1 border-gray-200 text-gray-700 w-[50px]">
                <RiLockPasswordLine />

            </span>
            {/* Password input */}
            <input
                value={displayValue}
                onChange={handleChange}
                type={showPassword ? "text" : "password"}
                placeholder={placeholder}
                className="px-2 py-4 w-full outline-none"
            />

            {/* Eye toggle */}
            <button
                type="button"
                className="px-3 border-l border-gray-200 text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
            >
                {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
            </button>
        </div>
    );
};

export default InputPassword;
