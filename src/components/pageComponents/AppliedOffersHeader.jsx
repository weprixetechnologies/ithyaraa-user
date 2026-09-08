import React from 'react';
import Image from 'next/image';
import { Tag, Sparkles } from 'lucide-react';
import logo from '../../../public/ithyaraa-logo.png';

const AppliedOffersHeader = ({ appliedOffers = [], cartItems = [] }) => {
    // Determine active offers list: prefer appliedOffers prop, fallback to computing from cartItems
    let activeOffers = [];

    if (Array.isArray(appliedOffers) && appliedOffers.length > 0) {
        activeOffers = appliedOffers;
    } else if (Array.isArray(cartItems) && cartItems.length > 0) {
        // Fallback computation from cart items
        const selectedItems = cartItems.filter(i => (i.selected === true || i.selected === 1 || i.selected === null) && i.offerApplied);
        const map = new Map();

        selectedItems.forEach(item => {
            const offerKey = item.offerID || item.offerName || 'Special Offer';
            const beforeTotal = Number(item.lineTotalBefore ?? ((Number(item.unitPriceBefore) || Number(item.regularPrice) || 0) * (Number(item.quantity) || 0))) || 0;
            const afterTotal = Number(item.lineTotalAfter ?? ((Number(item.unitPriceAfter) || Number(item.regularPrice) || 0) * (Number(item.quantity) || 0))) || 0;
            const disc = Math.max(0, beforeTotal - afterTotal);

            if (!map.has(offerKey)) {
                map.set(offerKey, {
                    offerID: item.offerID || offerKey,
                    offerName: item.offerName || 'Special Offer',
                    offerType: item.offerType || 'offer',
                    discountAmount: 0,
                    appliedProducts: []
                });
            }
            const entry = map.get(offerKey);
            entry.discountAmount += disc;
            entry.appliedProducts.push({
                cartItemID: item.cartItemID,
                productID: item.productID,
                name: item.name,
                quantity: item.quantity,
                featuredImage: item.featuredImage,
                discountAmount: disc
            });
        });

        activeOffers = Array.from(map.values()).filter(o => o.appliedProducts.length > 0);
    }

    if (!activeOffers || activeOffers.length === 0) {
        return null;
    }

    const totalOfferSavings = activeOffers.reduce((sum, o) => sum + (Number(o.discountAmount) || 0), 0);

    return (
        <div className="w-full bg-gradient-to-r from-amber-50 via-green-50 to-emerald-50 border border-green-200 rounded-xl p-3.5 mb-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-green-200/60 pb-2 mb-3">
                <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-green-500 text-white rounded-lg shadow-xs flex items-center justify-center">
                        <Sparkles size={16} />
                    </span>
                    <div>
                        <h3 className="font-bold text-sm md:text-base text-gray-800 flex items-center gap-1.5">
                            Offer Applied to Your Cart
                        </h3>
                        <p className="text-[11px] text-gray-500">The following offer(s) are active on selected products</p>
                    </div>
                </div>
                {totalOfferSavings > 0 && (
                    <div className="bg-green-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                        <span>Total Offer Savings: ₹{totalOfferSavings.toFixed(0)}</span>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-3">
                {activeOffers.map((offer, idx) => {
                    const offerSavings = Number(offer.discountAmount) || 0;
                    return (
                        <div
                            key={offer.offerID || idx}
                            className="bg-white/90 backdrop-blur-sm border border-green-100 rounded-lg p-2.5 shadow-xs flex flex-col gap-2"
                        >
                            <div className="flex items-center justify-between flex-wrap gap-1.5">
                                <div className="flex items-center gap-2">
                                    <Tag className="text-green-600" size={15} />
                                    <span className="font-semibold text-xs md:text-sm text-green-800">
                                        {offer.offerName || 'Special Offer'}
                                    </span>
                                </div>
                                {offerSavings > 0 && (
                                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                                        Saved ₹{offerSavings.toFixed(0)}
                                    </span>
                                )}
                            </div>

                            {/* Products under this offer */}
                            <div className="flex flex-wrap gap-2 mt-1 pt-1 border-t border-gray-100">
                                <span className="text-[11px] font-medium text-gray-500 self-center">Applied on:</span>
                                {offer.appliedProducts?.map((prod, pIdx) => {
                                    const imgSrc = Array.isArray(prod.featuredImage)
                                        ? (prod.featuredImage[0]?.imgUrl || logo)
                                        : (prod.featuredImage?.imgUrl || prod.featuredImage || logo);

                                    return (
                                        <div
                                            key={prod.cartItemID || pIdx}
                                            className="flex items-center gap-1.5 bg-gray-50 border border-gray-200/80 rounded-md px-2 py-1 text-xs text-gray-700"
                                        >
                                            <div className="relative w-5 h-5 min-w-[20px] rounded overflow-hidden bg-gray-200">
                                                <Image
                                                    src={imgSrc}
                                                    alt={prod.name || 'Product'}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <span className="font-medium line-clamp-1 max-w-[140px] md:max-w-[200px] text-[11px]">
                                                {prod.name}
                                            </span>
                                            {prod.quantity > 1 && (
                                                <span className="text-[10px] bg-green-100 text-green-700 font-bold px-1 rounded">
                                                    x{prod.quantity}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AppliedOffersHeader;
