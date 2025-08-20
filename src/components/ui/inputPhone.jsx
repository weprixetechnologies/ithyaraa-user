"use client";

const InputPhone = ({ value, setState }) => {
    return (
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden w-full">
            {/* Country code */}
            <span className="px-3 border-r-1 border-gray-200 text-gray-700 w-[50px]">+91</span>

            {/* Input field */}
            <input
                onChange={(e) => setState(e.target.value)}
                value={value}
                type="tel"
                placeholder="Enter Phone Number"
                className="px-2 py-4 w-full outline-none"
            />
        </div>
    );
};

export default InputPhone;
