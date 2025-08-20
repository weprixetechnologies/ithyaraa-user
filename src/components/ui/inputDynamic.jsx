"use client";

const InputDynamic = ({ value, setState, icon, placeholder, disabled = false, type = 'text' }) => {
    return (
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden w-full">
            {/* Country code */}
            <span className="px-3 border-r-1 border-gray-200 text-gray-700 w-[50px]">{icon}</span>

            {/* Input field */}
            <input
                disabled={disabled}
                onChange={(e) => setState(e.target.value)}
                value={value}
                type={type}
                placeholder={placeholder}
                className="px-2 py-4 w-full outline-none"
            />
        </div>
    );
};

export default InputDynamic;
