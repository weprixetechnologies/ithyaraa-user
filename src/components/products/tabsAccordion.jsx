"use client";
import React, { useState } from "react";

const ProductTabs = ({ tabHeading1, tabData1 }) => {
    const [openTabs, setOpenTabs] = useState({
        tab1: false,
        tab2: false,
        tab3: false,
    });

    const toggleTab = (tab) => {
        setOpenTabs((prev) => ({ ...prev, [tab]: !prev[tab] }));
    };

    return (
        <div className="w-full max-w-3xl mx-auto mt-6 space-y-2">
            {/* TAB 1 */}
            <div className="cursor-pointer rounded-lg">
                <button
                    onClick={() => toggleTab("tab1")}
                    className="w-full text-left px-4 py-3 font-medium bg-gray-100 flex justify-between items-center rounded-lg cursor-pointer"
                >
                    {tabHeading1}
                    <span>{openTabs.tab1 ? "-" : "+"}</span>
                </button>
                {openTabs.tab1 && (
                    <div className="px-4 py-3 bg-white">
                        {tabData1}
                    </div>
                )}
            </div>

            {/* TAB 2: Shipping & Delivery */}
            <div className="cursor-pointer rounded-lg">
                <button
                    onClick={() => toggleTab("tab2")}
                    className="w-full text-left px-4 py-3 font-medium bg-gray-100 flex justify-between items-center cursor-pointer rounded-lg"
                >
                    SHIPPING & DELIVERY
                    <span>{openTabs.tab2 ? "-" : "+"}</span>
                </button>
                {openTabs.tab2 && (
                    <div className="px-4 py-3 bg-white">
                        <p>
                            Standard shipping: 3-7 business days.<br />
                            Express shipping: 1-2 business days.<br />
                            Free shipping for orders over ₹999.
                        </p>
                    </div>
                )}
            </div>

            {/* TAB 3: Returns & Warranty */}
            <div className="cursor-pointer rounded-lg">
                <button
                    onClick={() => toggleTab("tab3")}
                    className="w-full text-left px-4 py-3 font-medium bg-gray-100 flex justify-between items-center cursor-pointer rounded-lg"
                >
                    RETURNS & WARRANTY
                    <span>{openTabs.tab3 ? "-" : "+"}</span>
                </button>
                {openTabs.tab3 && (
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
