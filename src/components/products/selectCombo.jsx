import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const SelectCombo = ({ products, onVariationSelect, selectedVariations = {}, selectedAttributes: externalSelectedAttributes = [], onRemoveProduct }) => {
    const [selectedAttributes, setSelectedAttributes] = useState(() =>
        externalSelectedAttributes.length > 0 ? externalSelectedAttributes : products.map(() => ({}))
    );
    const lastSelected = useRef({}); // to prevent duplicate calls

    const handleSelectAttribute = (productIndex, attrName, value) => {
        setSelectedAttributes(prev => {
            const newAttributes = [...prev];
            // Ensure the array is long enough and initialize if needed
            while (newAttributes.length <= productIndex) {
                newAttributes.push({});
            }
            newAttributes[productIndex] = { ...newAttributes[productIndex], [attrName]: value };
            return newAttributes;
        });
    };

    const getFilteredVariations = (variations, productIndex) => {
        if (!variations || !Array.isArray(variations)) return [];
        return variations.filter(variation => {
            return variation.variationValues.every(attr => {
                const [key, val] = Object.entries(attr)[0];
                return selectedAttributes[productIndex] && selectedAttributes[productIndex][key] === val;
            });
        });
    };

    // Reset attributes if products change (avoid stale state)
    useEffect(() => {
        const newAttributes = externalSelectedAttributes.length > 0 ? externalSelectedAttributes : products.map(() => ({}));

        // Only update if the attributes are actually different
        setSelectedAttributes(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(newAttributes)) {
                return newAttributes;
            }
            return prev;
        });

        lastSelected.current = {};
    }, [products, externalSelectedAttributes]);

    // Trigger onVariationSelect ONLY when selectedAttributes change
    useEffect(() => {
        products.forEach((p, index) => {
            const matchingVariations = getFilteredVariations(p.variations, index);
            if (matchingVariations.length > 0 && matchingVariations[0].variationStock > 0) {
                const variationID = matchingVariations[0].variationID;
                // prevent duplicate calls if same variation already selected
                if (lastSelected.current[p.productID] !== variationID) {
                    lastSelected.current[p.productID] = variationID;
                    onVariationSelect(index, variationID);
                }
            }
        });
    }, [selectedAttributes]); // only run when user changes attributes

    return (
        <div className='w-full flex flex-col gap-2 rounded'>
            {products.map((p, index) => (
                <div key={p.productID} className='w-full shadow-sm py-3 px-3 rounded-lg relative' style={{
                    background: 'linear-gradient(90deg, rgba(56,130,126,1) 0%, rgba(255,210,50,1) 100%)'
                }}>
                    {/* Remove Button */}
                    {onRemoveProduct && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemoveProduct(p.productID);
                            }}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold transition-colors z-10"
                            title="Remove product"
                        >
                            ×
                        </button>
                    )}
                    <div className="flex gap-3">
                        <div>
                            <Image
                                src={p.featuredImage[0].imgUrl}
                                alt="Image"
                                width={0}          // required, but we override with CSS
                                height={0}
                                sizes="120px"       // tell Next.js what width to serve
                                className="rounded-lg aspect-[2/3] w-[120px] min-w-[120px] h-auto"
                            />
                        </div>


                        <div>
                            <p className='text-md font-semibold line-clamp-1'>
                                {p.name}
                            </p>

                            <div className='mt-2'>
                                <div className="grid grid-cols-2 gap-2 mt-3">
                                    {p.productAttributes.map((attr, attrIndex) => {
                                        const isLast = attrIndex === p.productAttributes.length - 1;
                                        const isOdd = p.productAttributes.length % 2 !== 0;
                                        const colSpan = (isLast && isOdd) ? 'col-span-2' : 'col-span-1';
                                        const selectedValue = selectedAttributes[index]?.[attr.name];

                                        return (
                                            <div key={attrIndex} className={`${colSpan} relative group`}>
                                                <div className="border border-black p-2 py-2.5 flex justify-between items-center cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                                                    <span className="text-[11px] truncate pr-1">
                                                        <span className="font-normal text-gray-600">{attr.name}: </span>
                                                        <span className="font-bold text-black uppercase">{selectedValue || 'Select'}</span>
                                                    </span>
                                                    <svg className="w-3 h-3 flex-shrink-0 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                                <select 
                                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full appearance-none"
                                                    value={selectedValue || ""}
                                                    onChange={(e) => handleSelectAttribute(index, attr.name, e.target.value)}
                                                >
                                                    <option value="" disabled>Select {attr.name}</option>
                                                    {attr.values.map((val, idx) => (
                                                        <option key={idx} value={val}>{val}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className='mt-2'>
                                {/* <p className='text-sm font-medium'>Availability:</p> */}

                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default SelectCombo;
