"use client";
import React, { useState } from "react";

const ProductTabs = ({ tabHeading1, tabData1, tab1, tab2 }) => {
    const [openTabs, setOpenTabs] = useState({
        descriptionTab: false,
        productTab1: false,
        productTab2: false,
        shippingTab: false,
        returnsTab: false,
    });

    const toggleTab = (tab) => {
        setOpenTabs((prev) => ({ ...prev, [tab]: !prev[tab] }));
    };

    return (
        <div className="w-full max-w-3xl mx-auto mt-6 space-y-2">
            {/* Description Tab */}
            {tabHeading1 && (
                <div className="cursor-pointer rounded-lg">
                    <button
                        onClick={() => toggleTab("descriptionTab")}
                        className="w-full text-left px-4 py-3 font-medium bg-gray-100 flex justify-between items-center rounded-lg cursor-pointer"
                    >
                        {tabHeading1}
                        <span>{openTabs.descriptionTab ? "-" : "+"}</span>
                    </button>
                    {openTabs.descriptionTab && (
                        <div className="px-4 py-3 bg-white">
                            {tabData1}
                        </div>
                    )}
                </div>
            )}

            {/* Product Tab 1 - Dynamic from API */}
            {tab1 && (
                <div className="cursor-pointer rounded-lg">
                    <button
                        onClick={() => toggleTab("productTab1")}
                        className="w-full text-left px-4 py-3 font-medium bg-gray-100 flex justify-between items-center rounded-lg cursor-pointer"
                    >
                        PRODUCT DETAILS
                        <span>{openTabs.productTab1 ? "-" : "+"}</span>
                    </button>
                    {openTabs.productTab1 && (
                        <div className="px-4 py-3 bg-white">
                            <div dangerouslySetInnerHTML={{ __html: tab1 }} />
                        </div>
                    )}
                </div>
            )}

            {/* Product Tab 2 - Dynamic from API */}
            {tab2 && (
                <div className="cursor-pointer rounded-lg">
                    <button
                        onClick={() => toggleTab("productTab2")}
                        className="w-full text-left px-4 py-3 font-medium bg-gray-100 flex justify-between items-center rounded-lg cursor-pointer"
                    >
                        ADDITIONAL INFORMATION
                        <span>{openTabs.productTab2 ? "-" : "+"}</span>
                    </button>
                    {openTabs.productTab2 && (
                        <div className="px-4 py-3 bg-white">
                            <div dangerouslySetInnerHTML={{ __html: tab2 }} />
                        </div>
                    )}
                </div>
            )}

            {/* Shipping & Delivery */}
            <div className="cursor-pointer rounded-lg">
                <button
                    onClick={() => toggleTab("shippingTab")}
                    className="w-full text-left px-4 py-3 font-medium bg-gray-100 flex justify-between items-center cursor-pointer rounded-lg"
                >
                    SHIPPING & DELIVERY
                    <span>{openTabs.shippingTab ? "-" : "+"}</span>
                </button>
                {openTabs.shippingTab && (
                    <div className="px-4 py-3 bg-white">
                        <p>
                            Standard shipping: 3-7 business days.<br />
                            Express shipping: 1-2 business days.<br />
                            Free shipping for orders over ₹999.
                        </p>
                    </div>
                )}
            </div>

            {/* Returns & Warranty */}
            <div className="cursor-pointer rounded-lg">
                <button
                    onClick={() => toggleTab("returnsTab")}
                    className="w-full text-left px-4 py-3 font-medium bg-gray-100 flex justify-between items-center cursor-pointer rounded-lg"
                >
                    RETURNS & WARRANTY
                    <span>{openTabs.returnsTab ? "-" : "+"}</span>
                </button>
                {openTabs.returnsTab && (
                    <div className="px-4 py-3 bg-white">
                        <p>
                            7-day return policy.<br />
                            1-year warranty on manufacturing defects.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductTabs;
