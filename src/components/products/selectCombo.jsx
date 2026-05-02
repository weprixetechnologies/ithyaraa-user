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
                                className="rounded-lg aspect-[460/568] w-[120px] min-w-[120px] h-auto"
                            />
                        </div>


                        <div>
                            <p className='text-md font-semibold line-clamp-1'>
                                {p.name}
                            </p>

                            <div className='mt-2'>
                                <div className="flex gap-2 items-center mb-2">

                                    <p className='text-xs font-medium text-secondary-text '>Select Attributes:</p>
                                    {getFilteredVariations(p.variations, index).map((variation, vIndex) => {
                                        const isSelected = selectedVariations[p.productID] === variation.variationID;
                                        return (
                                            <div key={vIndex} className={`text-xs px-2 py-1 rounded-sm ${isSelected
                                                ? 'bg-primary-logo-yellow text-white border-2 border-yellow-300'
                                                : variation.variationStock > 0
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-red-500 text-white'
                                                }`}>
                                                <p>{isSelected ? 'Selected' : (variation.variationStock > 0 ? 'In Stock' : 'Not in Stock')}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                                {p.productAttributes.map((attr, attrIndex) => (
                                    <div key={attrIndex} className='flex gap-2 mt-1'>
                                        <p className='text-sm'>{attr.name}:</p>
                                        {attr.values.map((value, valueIndex) => (
                                            <button
                                                key={valueIndex}
                                                type='button'
                                                className={`px-2 py-1 text-xs border rounded ${selectedAttributes[index] && selectedAttributes[index][attr.name] === value
                                                    ? 'bg-primary-logo-yellow text-white'
                                                    : 'bg-white text-black'
                                                    }`}
                                                onClick={() => handleSelectAttribute(index, attr.name, value)}
                                            >
                                                {value}
                                            </button>
                                        ))}
                                    </div>
                                ))}
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
