"use client";
import React, { useState } from "react";
import { FiFileText, FiTruck } from "react-icons/fi";
import { RiLeafLine } from "react-icons/ri";
import { TbHanger } from "react-icons/tb";
import { CiRuler } from "react-icons/ci";
import { BsShieldCheck } from "react-icons/bs";

const ProductTabs = ({ description, tab1, tab2, tab3 }) => {
    const [openTabs, setOpenTabs] = useState({
        descriptionTab: false,
        productTab1: false,
        productTab2: false,
        productTab3: false,
        shippingTab: false,
        returnsTab: false,
    });

    const toggleTab = (tab) => {
        setOpenTabs((prev) => ({ ...prev, [tab]: !prev[tab] }));
    };

    return (
        <div className="w-full max-w-3xl mx-auto mt-6 space-y-3">
            {/* Description Tab */}
            {description && (
                <div className="cursor-pointer">
                    <button
                        onClick={() => toggleTab("descriptionTab")}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#1e1b4b] bg-[#fff5f7] flex justify-between items-center rounded-xl cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-[#fff0f5] flex items-center justify-center text-[#e84393]">
                                <FiFileText size={16} />
                            </div>
                            DESCRIPTION
                        </div>
                        <span className="text-[#1e1b4b] text-lg leading-none">{openTabs.descriptionTab ? "-" : "+"}</span>
                    </button>
                    {openTabs.descriptionTab && (
                        <div className="px-4 py-3 bg-white rich-text text-sm">
                            <div dangerouslySetInnerHTML={{ __html: description }} />
                        </div>
                    )}
                </div>
            )}

            {/* Product Tab 1 - MATERIAL AND CARE */}
            {tab1 && (
                <div className="cursor-pointer">
                    <button
                        onClick={() => toggleTab("productTab1")}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#1e1b4b] bg-[#fff5f7] flex justify-between items-center rounded-xl cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-[#fff0f5] flex items-center justify-center text-[#e84393]">
                                <RiLeafLine size={16} />
                            </div>
                            MATERIAL AND CARE
                        </div>
                        <span className="text-[#1e1b4b] text-lg leading-none">{openTabs.productTab1 ? "-" : "+"}</span>
                    </button>
                    {openTabs.productTab1 && (
                        <div className="px-4 py-3 bg-white rich-text text-sm">
                            <div dangerouslySetInnerHTML={{ __html: tab1 }} />
                        </div>
                    )}
                </div>
            )}

            {/* Product Tab 2 - STYLING AND SUGGESTION */}
            {tab2 && (
                <div className="cursor-pointer">
                    <button
                        onClick={() => toggleTab("productTab2")}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#1e1b4b] bg-[#fff5f7] flex justify-between items-center rounded-xl cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-[#fff0f5] flex items-center justify-center text-[#e84393]">
                                <TbHanger size={16} />
                            </div>
                            STYLING AND SUGGESTION
                        </div>
                        <span className="text-[#1e1b4b] text-lg leading-none">{openTabs.productTab2 ? "-" : "+"}</span>
                    </button>
                    {openTabs.productTab2 && (
                        <div className="px-4 py-3 bg-white rich-text text-sm">
                            <div dangerouslySetInnerHTML={{ __html: tab2 }} />
                        </div>
                    )}
                </div>
            )}

            {/* Product Tab 3 - PRODUCT SPECIFICATIONS */}
            {tab3 && (
                <div className="cursor-pointer">
                    <button
                        onClick={() => toggleTab("productTab3")}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#1e1b4b] bg-[#fff5f7] flex justify-between items-center rounded-xl cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-[#fff0f5] flex items-center justify-center text-[#e84393]">
                                <CiRuler size={16} />
                            </div>
                            PRODUCT SPECIFICATIONS
                        </div>
                        <span className="text-[#1e1b4b] text-lg leading-none">{openTabs.productTab3 ? "-" : "+"}</span>
                    </button>
                    {openTabs.productTab3 && (
                        <div className="px-4 py-3 bg-white rich-text text-sm">
                            <div dangerouslySetInnerHTML={{ __html: tab3 }} />
                        </div>
                    )}
                </div>
            )}

            {/* Shipping & Delivery */}
            <div className="cursor-pointer">
                <button
                    onClick={() => toggleTab("shippingTab")}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#1e1b4b] bg-[#fff5f7] flex justify-between items-center rounded-xl cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#fff0f5] flex items-center justify-center text-[#e84393]">
                            <FiTruck size={16} />
                        </div>
                        SHIPPING & DELIVERY
                    </div>
                    <span className="text-[#1e1b4b] text-lg leading-none">{openTabs.shippingTab ? "-" : "+"}</span>
                </button>
                {openTabs.shippingTab && (
                    <div className="px-4 py-3 bg-white text-sm">
                        <p>
                            Standard shipping: 3-7 business days.<br />
                            Express shipping: 1-2 business days.<br />
                            Free shipping for orders over ₹999.
                        </p>
                    </div>
                )}
            </div>

            {/* Returns & Warranty */}
            <div className="cursor-pointer">
                <button
                    onClick={() => toggleTab("returnsTab")}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#1e1b4b] bg-[#fff5f7] flex justify-between items-center rounded-xl cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#fff0f5] flex items-center justify-center text-[#e84393]">
                            <BsShieldCheck size={16} />
                        </div>
                        RETURNS & WARRANTY
                    </div>
                    <span className="text-[#1e1b4b] text-lg leading-none">{openTabs.returnsTab ? "-" : "+"}</span>
                </button>
                {openTabs.returnsTab && (
                    <div className="px-4 py-3 bg-white text-sm">
                        <p>
                            7-day return policy.<br />
                            1-year warranty on manufacturing defects.
                        </p>
                    </div>
                )}
            </div>

            <style>{`
                .rich-text ul {
                    list-style-type: disc !important;
                    padding-left: 1.5rem !important;
                    margin-top: 0.5rem !important;
                    margin-bottom: 0.5rem !important;
                }
                .rich-text ol {
                    list-style-type: decimal !important;
                    padding-left: 1.5rem !important;
                    margin-top: 0.5rem !important;
                    margin-bottom: 0.5rem !important;
                }
                .rich-text li {
                    margin-bottom: 0.25rem !important;
                }
                .rich-text p {
                    margin-bottom: 0.5rem !important;
                }
                .rich-text strong, .rich-text b {
                    font-weight: 700 !important;
                }
                .rich-text em, .rich-text i {
                    font-style: italic !important;
                }
                .rich-text u {
                    text-decoration: underline !important;
                }
            `}</style>
        </div>
    );
};

export default ProductTabs;

